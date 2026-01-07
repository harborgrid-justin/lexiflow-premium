const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to database");

    const res = await client.query(
      "SELECT id, email, role FROM users WHERE email = 'admin@lexiflow.com'"
    );

    if (res.rows.length === 0) {
      console.log("User not found");
    } else {
      console.log("User found:", res.rows[0]);
    }
  } catch (err) {
    console.error("Error executing query", err.stack);
  } finally {
    await client.end();
  }
}

run();
