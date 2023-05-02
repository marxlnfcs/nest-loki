const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// ignore packages
const ignorePackages = [];

// read package.json
const packageJson = path.join(__dirname, '../package.json');
const packageJsonContent = JSON.parse(fs.readFileSync(packageJson).toString());

// set packages
const dependencies = Object.keys(packageJsonContent?.dependencies || {}).filter(p => !ignorePackages.includes(p));
const devDependencies = Object.keys(packageJsonContent?.devDependencies || {}).filter(p => !ignorePackages.includes(p));

// update packages
childProcess.execSync(`npm install ${dependencies.map(d => `${d}@latest`).join(' ')} --legacy-peer-deps`);
childProcess.execSync(`npm install -D ${devDependencies.map(d => `${d}@latest`).join(' ')} --legacy-peer-deps`);