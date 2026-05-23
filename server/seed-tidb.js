const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Connecting to TiDB...');
  const connection = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    port: 4000,
    user: 'KkVuprqCyBz9WhB.root',
    password: 'HUQv2emkqGeZc8Iy',
    multipleStatements: true,
    ssl: { rejectUnauthorized: true }
  });

  console.log('Dropping old database...');
  await connection.query('DROP DATABASE IF EXISTS nexasestate; CREATE DATABASE nexasestate; USE nexasestate;');

  console.log('Connected! Reading schema.sql...');
  const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
  console.log('Executing schema.sql...');
  await connection.query(schema);

  console.log('Reading seed.sql...');
  const seed = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
  console.log('Executing seed.sql...');
  await connection.query(seed);

  console.log('Database seeded successfully on TiDB!');
  await connection.end();
}

run().catch(err => {
  console.error('Error seeding TiDB:', err.message);
  process.exit(1);
});
