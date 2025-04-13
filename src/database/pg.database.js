require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  max: 20, // Maksimum koneksi dalam pool
  idleTimeoutMillis: 30000, // Waktu idle sebelum koneksi ditutup
  connectionTimeoutMillis: 2000, // Timeout untuk koneksi baru
  ssl: {
    rejectUnauthorized: false
  }
});

const connect = async () => {
  try {
    await pool.connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database", error);
  }
}

connect();

const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error("Error executing query", error);
  }
}

module.exports = {
  query
};