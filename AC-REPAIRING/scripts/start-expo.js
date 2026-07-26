const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.unref();
    server.on('error', () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findOpenPort(startPort, endPort) {
  for (let port = startPort; port <= endPort; port += 1) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No open port found between ${startPort} and ${endPort}.`);
}

async function main() {
  const port = await findOpenPort(8081, 8090);
  const cliPath = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'bin', 'cli');

  const child = spawn(process.execPath, [cliPath, 'start', '--port', String(port), '--clear'], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
