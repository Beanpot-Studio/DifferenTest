import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

// Function to forcefully kill processes on specified ports (copied from setup)
const killProcessesOnPorts = (ports: number[]) => {
  const portsString = ports.join(' ');
  console.log(`Teardown: Attempting to find and kill processes on ports: ${portsString}`);
  try {
    const pids = execSync(`lsof -t -i tcp:${ports.join(' -i tcp:')}`).toString().split('\n').filter(pid => pid.trim() !== '');
    if (pids.length > 0) {
      const uniquePids = [...new Set(pids)];
      console.log(`Teardown: Found PIDs: ${uniquePids.join(', ')}. Sending kill -9...`);
      execSync(`kill -9 ${uniquePids.join(' ')}`);
      console.log(`Teardown: Kill signal sent to PIDs: ${uniquePids.join(', ')}.`);
    } else {
      console.log('Teardown: No processes found on specified ports.');
    }
  } catch (error) {
    console.log('Teardown: No processes found or error during kill (safe to ignore).');
  }
};

const EMULATOR_PORTS = [8080, 9099, 9199, 4000, 4400, 9150];

async function globalTeardown(config: FullConfig) {
  console.log('Starting global teardown...');
  
  // Force kill emulator processes using specific ports
  killProcessesOnPorts(EMULATOR_PORTS);

  console.log('Finished global teardown.');
}

export default globalTeardown; 