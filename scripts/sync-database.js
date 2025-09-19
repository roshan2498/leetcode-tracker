#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * Script to sync LeetCode CSV data to the database
 * This script will:
 * 1. Read all CSV files from the data directory
 * 2. Parse and validate the data
 * 3. Update the database with new problems
 * 4. Track synchronization metadata
 */

const prisma = new PrismaClient();

// Timeframe mapping
const TIMEFRAME_MAPPING = {
  '1. Thirty Days.csv': 'THIRTY_DAYS',
  '2. Three Months.csv': 'THREE_MONTHS',
  '3. Six Months.csv': 'SIX_MONTHS',
  '4. More Than Six Months.csv': 'MORE_THAN_SIX_MONTHS',
  '5. All.csv': 'ALL'
};

// Difficulty mapping
const DIFFICULTY_MAPPING = {
  'Easy': 'EASY',
  'Medium': 'MEDIUM',
  'Hard': 'HARD'
};

class DatabaseSyncer {
  constructor() {
    this.stats = {
      companies_processed: 0,
      problems_added: 0,
      problems_updated: 0,
      problems_skipped: 0,
      errors: 0
    };
    this.errors = [];
  }

  async parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      if (!fs.existsSync(filePath)) {
        resolve(results);
        return;
      }

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          try {
            // Validate and clean the data
            const problem = {
              difficulty: data.Difficulty?.trim() || '',
              title: data.Title?.trim() || '',
              frequency: parseFloat(data.Frequency) || 0,
              acceptanceRate: parseFloat(data['Acceptance Rate']) || 0,
              link: data.Link?.trim() || '',
              topics: data.Topics?.trim() || ''
            };

            // Skip invalid records
            if (!problem.title || !problem.difficulty) {
              console.warn(`Skipping invalid record in ${filePath}:`, problem);
              return;
            }

            results.push(problem);
          } catch (error) {
            console.error(`Error parsing row in ${filePath}:`, error.message);
            this.errors.push(`CSV Parse Error in ${filePath}: ${error.message}`);
          }
        })
        .on('end', () => {
          console.log(`✅ Parsed ${results.length} problems from ${filePath}`);
          resolve(results);
        })
        .on('error', reject);
    });
  }

  async processCompany(companyName, companyPath) {
    console.log(`\n🏢 Processing company: ${companyName}`);
    
    try {
      // Ensure company exists in database
      const company = await prisma.company.upsert({
        where: { name: companyName },
        update: { 
          updatedAt: new Date(),
          isActive: true
        },
        create: { 
          name: companyName,
          isActive: true
        }
      });

      // Process each timeframe file
      for (const [fileName, timeframe] of Object.entries(TIMEFRAME_MAPPING)) {
        const filePath = path.join(companyPath, fileName);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  File not found: ${fileName} for ${companyName}`);
          continue;
        }

        const problems = await this.parseCSVFile(filePath);
        
        for (const problemData of problems) {
          await this.upsertProblem(company.id, problemData, timeframe);
        }
      }

      this.stats.companies_processed++;
      console.log(`✅ Completed processing ${companyName}`);

    } catch (error) {
      console.error(`❌ Error processing company ${companyName}:`, error.message);
      this.errors.push(`Company Processing Error (${companyName}): ${error.message}`);
      this.stats.errors++;
    }
  }

  async upsertProblem(companyId, problemData, timeframe) {
    try {
      // Create unique identifier for the problem within company/timeframe
      const uniqueKey = `${companyId}-${problemData.title}-${timeframe}`;
      
      const existingProblem = await prisma.problem.findFirst({
        where: {
          companyId: companyId,
          title: problemData.title,
          timeframe: timeframe
        }
      });

      const problemRecord = {
        companyId: companyId,
        title: problemData.title,
        difficulty: DIFFICULTY_MAPPING[problemData.difficulty] || 'MEDIUM',
        frequency: problemData.frequency,
        acceptanceRate: problemData.acceptanceRate,
        link: problemData.link,
        topics: problemData.topics,
        timeframe: timeframe,
        updatedAt: new Date()
      };

      if (existingProblem) {
        // Check if update is needed
        const needsUpdate = (
          existingProblem.frequency !== problemRecord.frequency ||
          existingProblem.acceptanceRate !== problemRecord.acceptanceRate ||
          existingProblem.link !== problemRecord.link ||
          existingProblem.topics !== problemRecord.topics ||
          existingProblem.difficulty !== problemRecord.difficulty
        );

        if (needsUpdate) {
          await prisma.problem.update({
            where: { id: existingProblem.id },
            data: problemRecord
          });
          this.stats.problems_updated++;
        } else {
          this.stats.problems_skipped++;
        }
      } else {
        await prisma.problem.create({
          data: {
            ...problemRecord,
            createdAt: new Date()
          }
        });
        this.stats.problems_added++;
      }

    } catch (error) {
      console.error(`❌ Error upserting problem ${problemData.title}:`, error.message);
      this.errors.push(`Problem Upsert Error (${problemData.title}): ${error.message}`);
      this.stats.errors++;
    }
  }

  async cleanupOldData() {
    console.log('\n🧹 Cleaning up old data...');
    
    try {
      // Mark companies as inactive if they don't exist in the source anymore
      const activeCompanies = await prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true }
      });

      const dataPath = path.join(process.cwd(), 'public', 'data');
      const currentCompanies = fs.readdirSync(dataPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

      for (const company of activeCompanies) {
        if (!currentCompanies.includes(company.name)) {
          await prisma.company.update({
            where: { id: company.id },
            data: { isActive: false }
          });
          console.log(`🗑️  Marked company as inactive: ${company.name}`);
        }
      }

      // Optionally clean up very old sync records
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const deletedSyncs = await prisma.syncLog.deleteMany({
        where: {
          createdAt: { lt: oneMonthAgo }
        }
      });

      console.log(`🗑️  Cleaned up ${deletedSyncs.count} old sync records`);

    } catch (error) {
      console.error('❌ Error during cleanup:', error.message);
      this.errors.push(`Cleanup Error: ${error.message}`);
    }
  }

  async recordSyncMetadata() {
    console.log('\n📝 Recording sync metadata...');
    
    try {
      await prisma.syncLog.create({
        data: {
          companiesProcessed: this.stats.companies_processed,
          problemsAdded: this.stats.problems_added,
          problemsUpdated: this.stats.problems_updated,
          problemsSkipped: this.stats.problems_skipped,
          errorsCount: this.stats.errors,
          status: this.errors.length > 0 ? 'COMPLETED_WITH_ERRORS' : 'SUCCESS',
          details: {
            errors: this.errors,
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            platform: process.platform
          }
        }
      });

      console.log('✅ Sync metadata recorded successfully');

    } catch (error) {
      console.error('❌ Error recording sync metadata:', error.message);
    }
  }

  async run() {
    console.log('🚀 Starting LeetCode data synchronization...\n');
    const startTime = Date.now();

    try {
      const dataPath = path.join(process.cwd(), 'public', 'data');
      
      if (!fs.existsSync(dataPath)) {
        throw new Error(`Data directory not found: ${dataPath}`);
      }

      // Get all company directories
      const companies = fs.readdirSync(dataPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name)
        .sort();

      console.log(`📊 Found ${companies.length} companies to process`);

      // Process each company
      for (const companyName of companies) {
        const companyPath = path.join(dataPath, companyName);
        await this.processCompany(companyName, companyPath);
      }

      // Cleanup old data
      await this.cleanupOldData();

      // Record sync metadata
      await this.recordSyncMetadata();

      const duration = (Date.now() - startTime) / 1000;

      console.log('\n🎉 Synchronization completed!');
      console.log('📊 Final Statistics:');
      console.log(`   • Companies Processed: ${this.stats.companies_processed}`);
      console.log(`   • Problems Added: ${this.stats.problems_added}`);
      console.log(`   • Problems Updated: ${this.stats.problems_updated}`);
      console.log(`   • Problems Skipped: ${this.stats.problems_skipped}`);
      console.log(`   • Errors: ${this.stats.errors}`);
      console.log(`   • Duration: ${duration.toFixed(2)}s`);

      if (this.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        this.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }

    } catch (error) {
      console.error('💥 Synchronization failed:', error.message);
      
      // Still try to record the failure
      try {
        await prisma.syncLog.create({
          data: {
            companiesProcessed: this.stats.companies_processed,
            problemsAdded: this.stats.problems_added,
            problemsUpdated: this.stats.problems_updated,
            problemsSkipped: this.stats.problems_skipped,
            errorsCount: this.stats.errors + 1,
            status: 'FAILED',
            details: {
              errors: [...this.errors, error.message],
              timestamp: new Date().toISOString()
            }
          }
        });
      } catch (metadataError) {
        console.error('Failed to record failure metadata:', metadataError.message);
      }

      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Main execution
if (require.main === module) {
  const syncer = new DatabaseSyncer();
  syncer.run().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { DatabaseSyncer }; 