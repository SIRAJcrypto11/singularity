const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  console.log(`\n\x1b[36m>> Running: ${command}\x1b[0m\n`);
  execSync(command, { stdio: 'inherit' });
}

try {
  console.log('\n\x1b[32m=== Singularity Elite V7 - EXE Compilation ===\x1b[0m\n');
  
  // Step 1: Build Next.js
  runCommand('npm run build');

  // Step 2: Prepare Standalone Directory
  console.log('\n\x1b[36m>> Preparing standalone payload...\x1b[0m');
  
  const standaloneDir = path.join(__dirname, '.next', 'standalone');
  
  // Copy static folders
  if (fs.existsSync(path.join(__dirname, 'public'))) {
    fs.cpSync(path.join(__dirname, 'public'), path.join(standaloneDir, 'public'), { recursive: true });
  }
  if (fs.existsSync(path.join(__dirname, '.next', 'static'))) {
    fs.cpSync(path.join(__dirname, '.next', 'static'), path.join(standaloneDir, '.next', 'static'), { recursive: true });
  }

  // Copy electron engine into standalone
  fs.copyFileSync(path.join(__dirname, 'electron', 'main.js'), path.join(standaloneDir, 'main.js'));

  // Create minimal package.json for electron-packager
  const pkgConfig = {
    name: "singularity-elite-v7",
    productName: "Singularity Elite V7",
    version: "1.0.0",
    main: "main.js"
  };
  fs.writeFileSync(path.join(standaloneDir, 'package.json'), JSON.stringify(pkgConfig, null, 2));

  console.log('\x1b[32m>> Payload prepared successfully.\x1b[0m\n');

  // Step 3: Run Electron Packager
  // This will read the standalone directory, wrap it with Electron, and output to /dist
  runCommand('npx electron-packager .next/standalone "Singularity Elite V7" --platform=win32 --arch=x64 --out=dist --overwrite');

  console.log('\n\x1b[32m=== Compilation COMPLETE! Check the /dist folder for the EXE ===\x1b[0m\n');

} catch (error) {
  console.error('\x1b[31mCompilation failed:\x1b[0m', error);
  process.exit(1);
}
