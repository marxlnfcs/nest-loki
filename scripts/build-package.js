const fs = require('fs');
const path = require('path');

// copy files to dist folder
for(let file of ['README.md', 'package.json', 'LICENSE', '.npmignore']){
    fs.copyFileSync(path.join(__dirname, '../', file), path.join(__dirname, '../dist', file));
}

// read package.json
const packageJson = path.join(__dirname, '../dist/package.json');
const packageJsonContent = JSON.parse(fs.readFileSync(packageJson).toString());

// copy all dependencies to peerDependencies
if(packageJsonContent['dependencies']){
    packageJsonContent['peerDependencies'] = packageJsonContent['peerDependencies'] || {};
    Object.keys(packageJsonContent['dependencies']).map(p => {
       if(!Object.keys(packageJsonContent['peerDependencies']).includes(p)){
           packageJsonContent['peerDependencies'][p] = packageJsonContent['dependencies'][p];
       }
    });
}

// remove all unwanted properties
delete packageJsonContent['scripts'];
delete packageJsonContent['directories'];
delete packageJsonContent['dependencies'];

// remove all devDependencies that are not starting with @types/*
if(packageJsonContent['devDependencies']){
    Object.keys(packageJsonContent['devDependencies']).map(p => {
        if(!p.startsWith('@types/')){
            delete packageJsonContent['devDependencies'][p];
        }
    });
}

// save package.json
fs.writeFileSync(packageJson, JSON.stringify(packageJsonContent, null, 3));