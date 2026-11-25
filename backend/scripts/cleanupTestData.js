require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { getPool, sql } = require("../src/config/db");

async function main() {
  const pool = await getPool();

  const selectTestUsers = await pool.request().query(`
    SELECT user_id, full_name, email, created_at
    FROM users
    WHERE role = N'customer'
      AND (
        email LIKE N'%@test.local'
        OR full_name LIKE N'Verify %'
        OR full_name LIKE N'Smoke User%'
      )
    ORDER BY user_id;
  `);

  const targetUsers = selectTestUsers.recordset;

  if (targetUsers.length === 0) {
    console.log("Không tìm thấy user test nào để dọn. Không có thay đổi nào được thực hiện.");
    process.exit(0);
  }

  const userIds = targetUsers.map((row) => row.user_id);

  const appointmentPreview = await pool
    .request()
    .query(`
      SELECT a.appointment_id, a.customer_id, a.pet_id, u.full_name, u.email, a.created_at
      FROM appointments a
      JOIN users u ON u.user_id = a.customer_id
      WHERE a.customer_id IN (${userIds.join(",")})
      ORDER BY a.created_at DESC;
    `);

  const petPreview = await pool
    .request()
    .query(`
      SELECT p.pet_id, p.owner_id, p.name, u.email, p.created_at
      FROM pets p
      JOIN users u ON u.user_id = p.owner_id
      WHERE p.owner_id IN (${userIds.join(",")})
      ORDER BY p.pet_id DESC;
    `);

  console.log("\nDanh sách user test sẽ xóa:");
  for (const user of targetUsers) {
    console.log(`- user_id=${user.user_id}, full_name=${user.full_name}, email=${user.email}, created_at=${user.created_at}`);
  }

  console.log("\nAppointment test sẽ xóa:");
  if (appointmentPreview.recordset.length === 0) {
    console.log("- Không có appointment nào thuộc user test.");
  } else {
    for (const row of appointmentPreview.recordset) {
      console.log(`- appointment_id=${row.appointment_id}, customer_id=${row.customer_id}, pet_id=${row.pet_id}, email=${row.email}, created_at=${row.created_at}`);
    }
  }

  console.log("\nPet test sẽ xóa:");
  if (petPreview.recordset.length === 0) {
    console.log("- Không có pet nào thuộc user test.");
  } else {
    for (const row of petPreview.recordset) {
      console.log(`- pet_id=${row.pet_id}, owner_id=${row.owner_id}, name=${row.name}, email=${row.email}, created_at=${row.created_at}`);
    }
  }

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const deleteAppointments = transaction.request();
    await deleteAppointments.query(`
      DELETE a
      FROM appointments a
      JOIN users u ON u.user_id = a.customer_id
      WHERE u.user_id IN (${userIds.join(",")});
    `);

    const deletePets = transaction.request();
    await deletePets.query(`
      DELETE p
      FROM pets p
      JOIN users u ON u.user_id = p.owner_id
      WHERE u.user_id IN (${userIds.join(",")});
    `);

    const deleteUsers = transaction.request();
    await deleteUsers.query(`
      DELETE FROM users
      WHERE user_id IN (${userIds.join(",")});
    `);

    await transaction.commit();

    console.log(`\nĐã xoá thành công ${targetUsers.length} user test, ${appointmentPreview.recordset.length} appointment test, ${petPreview.recordset.length} pet test.`);
    process.exit(0);
  } catch (err) {
    await transaction.rollback();
    console.error("cleanupTestData failed:", err.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("cleanupTestData failed:", err.message);
  process.exit(1);
});
