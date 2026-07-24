// File: test-conn.js

const net = require('net');

const hosts = [
  'db.yjbwzpnslvimejtrbhsk.supabase.co',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
];

const ports = [5432, 6543];

async function check() {
  for (const host of hosts) {
    for (const port of ports) {
      await new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.on('connect', () => {
          console.log(`[OPEN] ${host}:${port}`);
          socket.destroy();
          resolve();
        });
        socket.on('timeout', () => {
          socket.destroy();
          resolve();
        });
        socket.on('error', (err) => {
          socket.destroy();
          resolve();
        });
        socket.connect(port, host);
      });
    }
  }
}

check();
