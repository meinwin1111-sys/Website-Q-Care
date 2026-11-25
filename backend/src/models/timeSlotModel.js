const { sql, getPool } = require("../config/db");

async function findAll() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT slot_id, period, slot_time
    FROM time_slots
    ORDER BY slot_time
  `);
  return result.recordset;
}

async function findByTime(time) {
  const pool = await getPool();
  const normalized = String(time).slice(0, 5);
  const result = await pool
    .request()
    .input("slotTime", sql.VarChar(5), normalized)
    .query(`
      SELECT slot_id, period, slot_time
      FROM time_slots
      WHERE CONVERT(VARCHAR(5), slot_time, 108) = @slotTime
    `);
  return result.recordset[0] ?? null;
}

async function findById(slotId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("slotId", sql.Int, slotId)
    .query(`
      SELECT slot_id, period, CONVERT(VARCHAR(8), slot_time, 108) AS slot_time
      FROM time_slots
      WHERE slot_id = @slotId
    `);
  return result.recordset[0] ?? null;
}

module.exports = { findAll, findByTime, findById };
