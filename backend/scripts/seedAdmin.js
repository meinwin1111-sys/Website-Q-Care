/**
 * Tạo hoặc cập nhật admin (admin@gmail.com) bằng bcrypt.
 * Chạy: npm run seed:admin
 * Đặt ADMIN_PASSWORD trong backend/.env trước khi chạy.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const { getPool, sql } = require("../src/config/db");

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function seedAdmin() {
  if (!ADMIN_PASSWORD) {
    throw new Error("Vui lòng cấu hình ADMIN_PASSWORD trong backend/.env.");
  }

  const pool = await getPool();
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await pool
    .request()
    .input("email", sql.NVarChar(150), ADMIN_EMAIL)
    .query(`
      SELECT user_id FROM users WHERE email = @email AND role = N'admin'
    `);

  if (existing.recordset[0]) {
    await pool
      .request()
      .input("email", sql.NVarChar(150), ADMIN_EMAIL)
      .input("password", sql.NVarChar(255), hash)
      .query(`
        UPDATE users SET password = @password, updated_at = SYSDATETIME()
        WHERE email = @email AND role = N'admin'
      `);
  } else {
    await pool
      .request()
      .input("fullName", sql.NVarChar(150), "Quản Trị Viên")
      .input("email", sql.NVarChar(150), ADMIN_EMAIL)
      .input("password", sql.NVarChar(255), hash)
      .input("role", sql.NVarChar(20), "admin")
      .query(`
        INSERT INTO users (full_name, email, phone, password, role)
        VALUES (@fullName, @email, NULL, @password, @role)
      `);
  }

  console.log(`Đã cập nhật mật khẩu bcrypt cho ${ADMIN_EMAIL}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("seedAdmin failed:", err.message);
  process.exit(1);
});
