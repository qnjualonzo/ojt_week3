const pool = require("../config/db");

exports.createUser = (username, hashedPassword) =>
  pool.query(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
    [username, hashedPassword]
  );

exports.findByUsername = (username) =>
  pool.query("SELECT * FROM users WHERE username = $1", [username]);
