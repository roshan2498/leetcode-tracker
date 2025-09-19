#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to detect changes between source LeetCode data and current data
 * Usage: node detect-changes.js <source-dir> <current-dir>
 */

function getCompaniesFromDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map(dirent => dirent.name)
      .sort();
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
    return [];
  }
}

function getFileStats(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Count lines and get file hash for comparison
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const hash = require('crypto').createHash('md5').update(content).digest('hex');
    
    return {
      size: stats.size,
      modified: stats.mtime.toISOString(),
      lines: lines.length,
      hash: hash
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

function compareCompanyData(sourceDir, currentDir, companyName) {
  const sourcePath = path.join(sourceDir, companyName);
  const currentPath = path.join(currentDir, companyName);
  
  if (!fs.existsSync(sourcePath)) {
    return { status: 'removed', changes: [] };
  }
  
  if (!fs.existsSync(currentPath)) {
    return { status: 'new', changes: ['Company directory created'] };
  }
  
  const changes = [];
  const csvFiles = ['1. Thirty Days.csv', '2. Three Months.csv', '3. Six Months.csv', '4. More Than Six Months.csv', '5. All.csv'];
  
  for (const fileName of csvFiles) {
    const sourceFile = path.join(sourcePath, fileName);
    const currentFile = path.join(currentPath, fileName);
    
    const sourceStats = getFileStats(sourceFile);
    const currentStats = getFileStats(currentFile);
    
    if (sourceStats && !currentStats) {
      changes.push(`Added: ${fileName}`);
    } else if (!sourceStats && currentStats) {
      changes.push(`Removed: ${fileName}`);
    } else if (sourceStats && currentStats) {
      if (sourceStats.hash !== currentStats.hash) {
        const lineDiff = sourceStats.lines - currentStats.lines;
        changes.push(`Modified: ${fileName} (${lineDiff > 0 ? '+' : ''}${lineDiff} lines)`);
      }
    }
  }
  
  return {
    status: changes.length > 0 ? 'updated' : 'unchanged',
    changes: changes
  };
}

function detectChanges(sourceDir, currentDir) {
  const sourceCompanies = getCompaniesFromDirectory(sourceDir);
  const currentCompanies = getCompaniesFromDirectory(currentDir);
  
  const allCompanies = [...new Set([...sourceCompanies, ...currentCompanies])].sort();
  
  const newCompanies = [];
  const updatedCompanies = [];
  const removedCompanies = [];
  const unchangedCompanies = [];
  
  const detailedChanges = {};
  
  for (const company of allCompanies) {
    const comparison = compareCompanyData(sourceDir, currentDir, company);
    
    detailedChanges[company] = comparison;
    
    switch (comparison.status) {
      case 'new':
        newCompanies.push(company);
        break;
      case 'updated':
        updatedCompanies.push(company);
        break;
      case 'removed':
        removedCompanies.push(company);
        break;
      case 'unchanged':
        unchangedCompanies.push(company);
        break;
    }
  }
  
  return {
    summary: {
      total_companies: allCompanies.length,
      new_companies: newCompanies,
      updated_companies: updatedCompanies,
      removed_companies: removedCompanies,
      unchanged_companies: unchangedCompanies
    },
    detailed_changes: detailedChanges,
    statistics: {
      new_count: newCompanies.length,
      updated_count: updatedCompanies.length,
      removed_count: removedCompanies.length,
      unchanged_count: unchangedCompanies.length
    }
  };
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: node detect-changes.js <source-dir> <current-dir>');
    process.exit(1);
  }
  
  const [sourceDir, currentDir] = args;
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory does not exist: ${sourceDir}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(currentDir)) {
    console.error(`Current directory does not exist: ${currentDir}`);
    process.exit(1);
  }
  
  try {
    const changes = detectChanges(sourceDir, currentDir);
    
    // Output JSON for GitHub Actions
    console.log(JSON.stringify(changes, null, 2));
    
    // Log summary to stderr for debugging
    console.error('\n📊 Change Detection Summary:');
    console.error(`New Companies: ${changes.statistics.new_count}`);
    console.error(`Updated Companies: ${changes.statistics.updated_count}`);
    console.error(`Removed Companies: ${changes.statistics.removed_count}`);
    console.error(`Unchanged Companies: ${changes.statistics.unchanged_count}`);
    
    if (changes.statistics.new_count > 0) {
      console.error('\n🆕 New Companies:');
      changes.summary.new_companies.forEach(company => console.error(`  - ${company}`));
    }
    
    if (changes.statistics.updated_count > 0) {
      console.error('\n🔄 Updated Companies:');
      changes.summary.updated_companies.forEach(company => {
        console.error(`  - ${company}:`);
        changes.detailed_changes[company].changes.forEach(change => 
          console.error(`    • ${change}`)
        );
      });
    }
    
  } catch (error) {
    console.error('Error detecting changes:', error.message);
    process.exit(1);
  }
} 