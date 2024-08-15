
const { Pool } = require('pg');
require("dotenv").config()

let pool;
const initialize = async () => {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.CONTAINER_DB_NAME || process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  let retries = 5;
  while (retries) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connected successfully');
      break;
    } catch (err) {
      console.log(err, "err")
      console.log('Database connection failed. Retrying...');
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  return pool;
};

const query = (text, params) => {
  if (!pool) throw new Error('Database connection not initialized');
  return pool.query(text, params);
};

module.exports = { query, initialize };