const { sql, getPool } = require("../config/db");

async function findByEmail(email) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("email", sql.NVarChar(150), email)
    .query(`
      SELECT user_id, full_name, email, phone, password, role
      FROM users
      WHERE email = @email
    `);
  return result.recordset[0] ?? null;
}

async function createUser({ fullName, email, phone, passwordHash, role = "customer" }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("fullName", sql.NVarChar(150), fullName)
    .input("email", sql.NVarChar(150), email)
    .input("phone", sql.NVarChar(15), phone || null)
    .input("password", sql.NVarChar(255), passwordHash)
    .input("role", sql.NVarChar(20), role)
    .query(`
      INSERT INTO users (full_name, email, phone, password, role)
      OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.phone, INSERTED.role
      VALUES (@fullName, @email, @phone, @password, @role)
    `);
  return result.recordset[0];
}

async function findById(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(`
      SELECT user_id, full_name, email, phone, password, role
      FROM users
      WHERE user_id = @userId
    `);
  return result.recordset[0] ?? null;
}

async function updatePassword(userId, passwordHash) {
  const pool = await getPool();
  await pool
    .request()
    .input("password", sql.NVarChar(255), passwordHash)
    .input("userId", sql.Int, userId)
    .query(`
      UPDATE users
      SET password = @password,
          updated_at = GETDATE()
      WHERE user_id = @userId
    `);
}

module.exports = { findByEmail, createUser, findById, updatePassword };
