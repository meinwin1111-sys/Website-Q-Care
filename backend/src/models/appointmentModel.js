const { sql, getPool } = require("../config/db");

async function findCustomerAppointments(customerId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("customerId", sql.Int, customerId)
    .query(`
      SELECT
        appointment_id,
        customer_name,
        service,
        pet,
        pet_type,
        appointment_date,
        slot_time,
        status,
        price,
        address,
        vet_name,
        cancel_reason
      FROM v_customer_appointments
      WHERE customer_id = @customerId
      ORDER BY appointment_date DESC, slot_time DESC
    `);
  return result.recordset;
}

async function findAdminAppointments() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      a.appointment_id,
      u.full_name AS customer,
      u.full_name AS customer_name,
      u.phone AS customer_phone,
      a.address AS customer_address,
      p.name AS pet,
      s.title AS service,
      a.appointment_date AS date,
      t.slot_time AS time,
      a.status,
      a.price,
      a.vet_name,
      a.cancel_reason
    FROM appointments a
    JOIN users u ON u.user_id = a.customer_id
    JOIN pets p ON p.pet_id = a.pet_id
    JOIN services s ON s.service_id = a.service_id
    JOIN time_slots t ON t.slot_id = a.slot_id
    ORDER BY CAST(a.appointment_date AS DATETIME) + CAST(t.slot_time AS DATETIME) ASC
  `);
  return result.recordset;
}

async function findBookedSlotsByDate(date) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("appointmentDate", sql.Date, date)
    .query(`
      SELECT
        CONVERT(VARCHAR(10), a.appointment_date, 23) AS date,
        CONVERT(VARCHAR(5), t.slot_time, 108) AS time
      FROM appointments a
      JOIN time_slots t ON t.slot_id = a.slot_id
      WHERE a.appointment_date = @appointmentDate
        AND a.status <> N'cancelled'
      ORDER BY t.slot_time
    `);
  return result.recordset;
}

async function idExists(appointmentId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("appointmentId", sql.VarChar(10), appointmentId)
    .query(`SELECT 1 AS ok FROM appointments WHERE appointment_id = @appointmentId`);
  return result.recordset.length > 0;
}

async function createAppointment(data) {
  const pool = await getPool();
  await pool
    .request()
    .input("appointmentId", sql.VarChar(10), data.appointmentId)
    .input("customerId", sql.Int, data.customerId)
    .input("petId", sql.Int, data.petId)
    .input("serviceId", sql.Int, data.serviceId)
    .input("appointmentDate", sql.Date, data.appointmentDate)
    .input("slotId", sql.Int, data.slotId)
    .input("price", sql.Decimal(10, 0), data.price)
    .input("address", sql.NVarChar(255), data.address)
    .input("vetName", sql.NVarChar(150), data.vetName ?? null)
    .query(`
      INSERT INTO appointments (
        appointment_id, customer_id, pet_id, service_id,
        appointment_date, slot_id, status, price, address, vet_name
      )
      VALUES (
        @appointmentId, @customerId, @petId, @serviceId,
        @appointmentDate, @slotId, N'success', @price, @address, @vetName
      )
    `);
}

async function findById(appointmentId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("appointmentId", sql.VarChar(10), appointmentId)
    .query(`
      SELECT appointment_id, customer_id, status
      FROM appointments
      WHERE appointment_id = @appointmentId
    `);
  return result.recordset[0] ?? null;
}

async function cancelAppointment(appointmentId, cancelReason) {
  const pool = await getPool();
  await pool
    .request()
    .input("appointmentId", sql.VarChar(10), appointmentId)
    .input("cancelReason", sql.NVarChar(255), cancelReason)
    .query(`
      UPDATE appointments
      SET status = N'cancelled', cancel_reason = @cancelReason, updated_at = SYSDATETIME()
      WHERE appointment_id = @appointmentId
    `);
}

module.exports = {
  findCustomerAppointments,
  findAdminAppointments,
  findBookedSlotsByDate,
  idExists,
  createAppointment,
  findById,
  cancelAppointment,
};
