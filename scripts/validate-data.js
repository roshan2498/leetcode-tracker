#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to validate LeetCode CSV data integrity
 * Usage: node validate-data.js <data-directory>
 */

class DataValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      companies: 0,
      files: 0,
      problems: 0,
      validProblems: 0
    };
  }

  validateCSVStructure(filePath) {
    const requiredColumns = ['Difficulty', 'Title', 'Frequency', 'Acceptance Rate', 'Link', 'Topics'];
    const errors = [];

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        errors.push('File is empty');
        return errors;
      }

      // Check header
      const header = lines[0].split(',');
      const missingColumns = requiredColumns.filter(col => !header.includes(col));
      
      if (missingColumns.length > 0) {
        errors.push(`Missing columns: ${missingColumns.join(', ')}`);
      }

      // Validate data rows
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        
        if (row.length !== header.length) {
          errors.push(`Row ${i + 1}: Column count mismatch (expected ${header.length}, got ${row.length})`);
        }

        // Validate difficulty
        const difficulty = row[header.indexOf('Difficulty')]?.trim();
        if (difficulty && !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
          errors.push(`Row ${i + 1}: Invalid difficulty "${difficulty}"`);
        }

        // Validate frequency
        const frequency = row[header.indexOf('Frequency')];
        if (frequency && (isNaN(parseFloat(frequency)) || parseFloat(frequency) < 0 || parseFloat(frequency) > 100)) {
          errors.push(`Row ${i + 1}: Invalid frequency "${frequency}"`);
        }

        // Validate acceptance rate
        const acceptanceRate = row[header.indexOf('Acceptance Rate')];
        if (acceptanceRate && (isNaN(parseFloat(acceptanceRate)) || parseFloat(acceptanceRate) < 0 || parseFloat(acceptanceRate) > 1)) {
          errors.push(`Row ${i + 1}: Invalid acceptance rate "${acceptanceRate}"`);
        }

        // Check for empty title
        const title = row[header.indexOf('Title')]?.trim();
        if (!title) {
          errors.push(`Row ${i + 1}: Empty title`);
        }

        this.stats.problems++;
        if (errors.length === 0) {
          this.stats.validProblems++;
        }
      }

    } catch (error) {
      errors.push(`Failed to read file: ${error.message}`);
    }

    return errors;
  }

  validateCompanyDirectory(companyPath, companyName) {
    const requiredFiles = [
      '1. Thirty Days.csv',
      '2. Three Months.csv', 
      '3. Six Months.csv',
      '4. More Than Six Months.csv',
      '5. All.csv'
    ];

    const companyErrors = [];
    const companyWarnings = [];

    // Check if directory exists
    if (!fs.existsSync(companyPath)) {
      companyErrors.push(`Company directory does not exist: ${companyPath}`);
      return { errors: companyErrors, warnings: companyWarnings };
    }

    // Check for required files
    const existingFiles = fs.readdirSync(companyPath).filter(file => file.endsWith('.csv'));
    
    for (const requiredFile of requiredFiles) {
      const filePath = path.join(companyPath, requiredFile);
      
      if (!fs.existsSync(filePath)) {
        companyWarnings.push(`Missing file: ${requiredFile}`);
        continue;
      }

      // Validate individual file
      const fileErrors = this.validateCSVStructure(filePath);
      if (fileErrors.length > 0) {
        companyErrors.push(`${requiredFile}: ${fileErrors.join(', ')}`);
      }

      this.stats.files++;
    }

    // Check for unexpected files
    const unexpectedFiles = existingFiles.filter(file => !requiredFiles.includes(file));
    if (unexpectedFiles.length > 0) {
      companyWarnings.push(`Unexpected files found: ${unexpectedFiles.join(', ')}`);
    }

    return { errors: companyErrors, warnings: companyWarnings };
  }

  async validate(dataDirectory) {
    console.log(`🔍 Validating data in: ${dataDirectory}\n`);

    if (!fs.existsSync(dataDirectory)) {
      this.errors.push(`Data directory does not exist: ${dataDirectory}`);
      return false;
    }

    // Get all company directories
    const companies = fs.readdirSync(dataDirectory, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map(dirent => dirent.name)
      .sort();

    if (companies.length === 0) {
      this.errors.push('No company directories found');
      return false;
    }

    console.log(`📊 Found ${companies.length} companies to validate`);
    this.stats.companies = companies.length;

    // Validate each company
    for (const companyName of companies) {
      console.log(`\n🏢 Validating: ${companyName}`);
      
      const companyPath = path.join(dataDirectory, companyName);
      const { errors, warnings } = this.validateCompanyDirectory(companyPath, companyName);

      if (errors.length > 0) {
        console.log(`  ❌ Errors: ${errors.length}`);
        errors.forEach(error => {
          this.errors.push(`${companyName}: ${error}`);
          console.log(`    • ${error}`);
        });
      }

      if (warnings.length > 0) {
        console.log(`  ⚠️  Warnings: ${warnings.length}`);
        warnings.forEach(warning => {
          this.warnings.push(`${companyName}: ${warning}`);
          console.log(`    • ${warning}`);
        });
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log(`  ✅ Valid`);
      }
    }

    return this.errors.length === 0;
  }

  printSummary() {
    console.log('\n📋 Validation Summary:');
    console.log(`   • Companies: ${this.stats.companies}`);
    console.log(`   • CSV Files: ${this.stats.files}`);
    console.log(`   • Total Problems: ${this.stats.problems}`);
    console.log(`   • Valid Problems: ${this.stats.validProblems}`);
    console.log(`   • Errors: ${this.errors.length}`);
    console.log(`   • Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    const isValid = this.errors.length === 0;
    console.log(`\n${isValid ? '✅' : '❌'} Validation ${isValid ? 'PASSED' : 'FAILED'}`);
    
    return isValid;
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.error('Usage: node validate-data.js <data-directory>');
    process.exit(1);
  }

  const dataDirectory = args[0];
  const validator = new DataValidator();

  validator.validate(dataDirectory)
    .then(() => {
      const isValid = validator.printSummary();
      process.exit(isValid ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { DataValidator }; 