// File: test-auth.js

const { Client } = require('pg');

const project = 'yjbwzpnslvimejtrbhsk';
const pwd = 'Kevin110810@@@@?';

const hosts = [
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-[#].pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-[#].pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-[#]-ap-southeast-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
];

const users = [
  `postgres.${project}`,
  `postgres`,
];

async function run() {
  for (const host of ['aws-0-ap-southeast-1.pooler.supabase.com', 'aws-0-us-east-1.pooler.supabase.com', 'aws-0-ap-northeast-1.pooler.supabase.com', 'aws-0-eu-central-1.pooler.supabase.com', 'aws-0-us-west-1.pooler.supabase.com']) {
    for (const user of users) {
      for (const port of [6543, 5432]) {
        const conn = `postgres://${user}:${encodeURIComponent(pwd)}@${host}:${port}/postgres`;
        const client = new Client({ connectionString: conn, connectionTimeoutMillis: 3000, ssl: { rejectUnauthorized: false } });
        try {
          await client.connect();
          console.log('\n=============================================');
          console.log('SUCCESSFUL SUPABASE CONNECTION FOUND!');
          console.log('URL:', conn);
          console.log('=============================================\n');
          await client.end();
          process.exit(0);
        } catch (e) {
          console.log(`Failed [${user} @ ${host}:${port}]: ${e.message}`);
        }
      }
    }
  }
}

run();
