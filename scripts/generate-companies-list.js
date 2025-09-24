#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateCompaniesList() {
  try {
    console.log('🔍 Generating companies list...');
    
    const dataPath = path.join(process.cwd(), 'public', 'data');
    const outputPath = path.join(process.cwd(), 'public', 'companies.json');
    
    console.log('📂 Data path:', dataPath);
    console.log('📄 Output path:', outputPath);
    
    // Check if data directory exists
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Data directory not found:', dataPath);
      process.exit(1);
    }
    
    // Read companies from data directory
    const companies = fs.readdirSync(dataPath, { withFileTypes: true })
      .filter(dirent => {
        // Only include directories and exclude hidden folders
        const isValid = dirent.isDirectory() && !dirent.name.startsWith('.');
        if (!isValid) {
          console.log('⏭️  Skipping:', dirent.name, '(not a valid company directory)');
        }
        return isValid;
      })
      .map(dirent => dirent.name)
      .sort();
    
    console.log(`✅ Found ${companies.length} companies`);
    console.log('📋 Companies:', companies.slice(0, 5).join(', ') + (companies.length > 5 ? '...' : ''));
    
    // Write companies.json
    fs.writeFileSync(outputPath, JSON.stringify(companies, null, 2));
    
    console.log('✅ Successfully generated companies.json');
    console.log('📊 Total companies:', companies.length);
    
  } catch (error) {
    console.error('❌ Error generating companies list:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateCompaniesList();
}

module.exports = { generateCompaniesList }; 