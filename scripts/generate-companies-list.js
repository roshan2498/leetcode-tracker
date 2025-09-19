#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to generate companies list from data directory
 * Usage: node generate-companies-list.js <data-directory>
 */

function generateCompaniesList(dataDirectory) {
  if (!fs.existsSync(dataDirectory)) {
    throw new Error(`Data directory does not exist: ${dataDirectory}`);
  }

  // Get all company directories
  const companies = fs.readdirSync(dataDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .map(dirent => {
      const companyPath = path.join(dataDirectory, dirent.name);
      const csvFiles = fs.readdirSync(companyPath)
        .filter(file => file.endsWith('.csv'))
        .length;

      return {
        name: dirent.name,
        slug: dirent.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        fileCount: csvFiles,
        lastModified: fs.statSync(companyPath).mtime.toISOString()
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const companiesData = {
    companies: companies,
    metadata: {
      totalCompanies: companies.length,
      generated: new Date().toISOString(),
      source: 'LeetCode Questions CompanyWise Repository'
    }
  };

  return companiesData;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.error('Usage: node generate-companies-list.js <data-directory>');
    process.exit(1);
  }

  const dataDirectory = args[0];

  try {
    const companiesData = generateCompaniesList(dataDirectory);
    console.log(JSON.stringify(companiesData, null, 2));
  } catch (error) {
    console.error('Error generating companies list:', error.message);
    process.exit(1);
  }
}

module.exports = { generateCompaniesList }; 