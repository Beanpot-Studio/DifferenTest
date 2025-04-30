import { spawn, ChildProcess, execSync } from 'child_process';
import { FullConfig } from '@playwright/test';
import fetch from 'node-fetch'; // Need to install node-fetch: npm install --save-dev node-fetch

// Make emulatorProcess global
declare global {
  var emulatorProcess: ChildProcess | undefined;
}

// Function to forcefully kill processes on specified ports
const killProcessesOnPorts = (ports: number[]) => {
  const portsString = ports.join(' ');
  console.log(`Attempting to find and kill processes on ports: ${portsString}`);
  try {
    // List PIDs using the ports
    const pids = execSync(`lsof -t -i tcp:${ports.join(' -i tcp:')}`).toString().split('\n').filter(pid => pid.trim() !== '');
    if (pids.length > 0) {
      const uniquePids = [...new Set(pids)]; // Get unique PIDs
      console.log(`Found PIDs: ${uniquePids.join(', ')}. Sending kill -9...`);
      execSync(`kill -9 ${uniquePids.join(' ')}`);
      console.log(`Kill signal sent to PIDs: ${uniquePids.join(', ')}.`);
      // Wait a moment after killing
      return new Promise(resolve => setTimeout(resolve, 1500)); 
    } else {
      console.log('No processes found on specified ports.');
    }
  } catch (error) {
    // Ignore errors (e.g., lsof returning non-zero if nothing is found)
    console.log('No processes found on specified ports or error during kill (safe to ignore).');
  }
  return Promise.resolve();
};

const EMULATOR_PORTS = [8080, 9099, 9199, 4000, 4400, 9150]; // Common emulator ports

async function globalSetup(config: FullConfig) {
  console.log('Starting global setup...');

  // --- Force kill any lingering emulators first ---
  await killProcessesOnPorts(EMULATOR_PORTS);

  // --- Attempt graceful stop (might fail if already killed) ---
  console.log('Attempting graceful stop via firebase emulators:stop...');
  try {
    execSync('npx firebase emulators:stop', { stdio: 'ignore' });
    console.log('Graceful stop command executed (if any emulators were running).');
  } catch (error) {
    console.warn('Graceful stop failed (likely none were running): ', error.message);
  }
  await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause

  // --- Data Clearing Removed for Sequential Tests ---
  /* 
  // --- Clear existing emulator data --- 
  const firestorePort = 8080;
  const authPort = 9099; // Auth emulator port
  const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID || 'differentest-2fda9';
  const firestoreClearUrl = `http://localhost:${firestorePort}/emulator/v1/projects/${projectId}/databases/(default)/documents`;
  const authClearUrl = `http://localhost:${authPort}/emulator/v1/projects/${projectId}/accounts`; // Auth clear URL
  
  // Clear Firestore
  console.log(`Attempting to clear Firestore emulator at: ${firestoreClearUrl}`);
  try {
    await fetch(`http://localhost:${firestorePort}`); 
    const response = await fetch(firestoreClearUrl, { method: 'DELETE' });
    if (response.ok) {
      console.log('Successfully cleared Firestore emulator data.');
    } else {
      console.warn(`Failed to clear Firestore emulator data (Status: ${response.status}).`);
    }
  } catch (error) {
    console.log('Firestore emulator likely not running, skipping initial clear.', error.code);
  }

  // Clear Auth
  console.log(`Attempting to clear Auth emulator at: ${authClearUrl}`);
  try {
    await fetch(`http://localhost:${authPort}/`); // Check if auth emulator is running
    const response = await fetch(authClearUrl, { method: 'DELETE' });
    if (response.ok) {
      console.log('Successfully cleared Auth emulator accounts.');
    } else {
      console.warn(`Failed to clear Auth emulator accounts (Status: ${response.status}).`);
    }
  } catch (error) {
    console.log('Auth emulator likely not running, skipping initial clear.', error.code);
  }

  // Add similar DELETE requests for Storage if needed
  */
  console.log('Skipping data clearing for sequential tests.');

  // --- Start emulators --- 
  console.log('Starting Firebase emulators with explicit JAVA_HOME...');
  const javaHome = execSync('/usr/libexec/java_home').toString().trim(); // Get JAVA_HOME path
  
  global.emulatorProcess = spawn('npx', ['firebase', 'emulators:start', '--only', 'auth,firestore,storage'], {
    stdio: 'inherit',
    shell: true, 
    env: { ...process.env, JAVA_HOME: javaHome } // Set JAVA_HOME for the child process
  });

  global.emulatorProcess.on('error', (err) => {
    console.error('Failed to start emulator process:', err);
    process.exit(1);
  });

  // Wait for emulators to be ready - simple delay, could be improved with polling
  console.log('Waiting for emulators to initialize (15 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 15000)); 
  console.log('Emulators assumed ready.');

  console.log('Finished global setup.');
}

export default globalSetup; 