import { exec } from 'child_process';
import { randomUUID } from 'crypto';

export async function runAsync({ task, workspace }) {
  const taskId = randomUUID();

  exec(task, { cwd: `./${workspace}` }, (error, stdout, stderr) => {
    console.log(`[${taskId}] STDOUT:`, stdout);
    if (error) {
      console.error(`[${taskId}] STDERR:`, stderr);
    }
  });

  return taskId;
}

