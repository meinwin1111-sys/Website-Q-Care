const { sql, getPool } = require("../config/db");

async function findAllActive() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT s.service_id, s.title, s.subtitle, s.price, s.duration, s.image, s.description,
           c.code AS category_code
    FROM services s
    JOIN service_categories c ON c.category_id = s.category_id
    WHERE s.is_active = 1
    ORDER BY s.service_id
  `);
  return result.recordset;
}

async function findById(serviceId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("serviceId", sql.Int, serviceId)
    .query(`
      SELECT s.service_id, s.title, s.subtitle, s.price, s.duration, s.image, s.description,
             c.code AS category_code
      FROM services s
      JOIN service_categories c ON c.category_id = s.category_id
      WHERE s.service_id = @serviceId AND s.is_active = 1
    `);
  return result.recordset[0] ?? null;
}

async function findPriceBreakdown(serviceId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("serviceId", sql.Int, serviceId)
    .query(`
      SELECT label, price FROM service_price_breakdown
      WHERE service_id = @serviceId
      ORDER BY id
    `);
  return result.recordset;
}

async function findSteps(serviceId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("serviceId", sql.Int, serviceId)
    .query(`
      SELECT step_number, title, description FROM service_steps
      WHERE service_id = @serviceId
      ORDER BY step_number
    `);
  return result.recordset;
}

async function findAllCategories() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT code, name FROM service_categories ORDER BY category_id
  `);
  return result.recordset;
}

async function getCategoryIdByCode(code) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("code", sql.NVarChar(30), code)
    .query(`SELECT category_id FROM service_categories WHERE code = @code`);
  return result.recordset[0]?.category_id ?? null;
}

async function createService(data) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const req = new sql.Request(tx);
    const inserted = await req
      .input("categoryId", sql.Int, data.categoryId)
      .input("title", sql.NVarChar(150), data.title)
      .input("subtitle", sql.NVarChar(255), data.subtitle ?? null)
      .input("price", sql.Decimal(10, 0), data.price)
      .input("duration", sql.NVarChar(50), data.duration ?? null)
      .input("image", sql.NVarChar(500), data.image ?? null)
      .input("description", sql.NVarChar(sql.MAX), data.description ?? null)
      .query(`
        INSERT INTO services (category_id, title, subtitle, price, duration, image, description)
        OUTPUT INSERTED.service_id
        VALUES (@categoryId, @title, @subtitle, @price, @duration, @image, @description)
      `);
    const serviceId = inserted.recordset[0].service_id;

    for (const item of data.priceBreakdown ?? []) {
      await new sql.Request(tx)
        .input("serviceId", sql.Int, serviceId)
        .input("label", sql.NVarChar(150), item.label)
        .input("price", sql.Decimal(10, 0), item.price)
        .query(`
          INSERT INTO service_price_breakdown (service_id, label, price)
          VALUES (@serviceId, @label, @price)
        `);
    }

    for (const step of data.steps ?? []) {
      await new sql.Request(tx)
        .input("serviceId", sql.Int, serviceId)
        .input("stepNumber", sql.Int, step.step)
        .input("title", sql.NVarChar(150), step.title)
        .input("description", sql.NVarChar(500), step.desc ?? null)
        .query(`
          INSERT INTO service_steps (service_id, step_number, title, description)
          VALUES (@serviceId, @stepNumber, @title, @description)
        `);
    }

    await tx.commit();
    return serviceId;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

async function updateService(serviceId, data) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    await new sql.Request(tx)
      .input("serviceId", sql.Int, serviceId)
      .input("categoryId", sql.Int, data.categoryId)
      .input("title", sql.NVarChar(150), data.title)
      .input("subtitle", sql.NVarChar(255), data.subtitle ?? null)
      .input("price", sql.Decimal(10, 0), data.price)
      .input("duration", sql.NVarChar(50), data.duration ?? null)
      .input("image", sql.NVarChar(500), data.image ?? null)
      .input("description", sql.NVarChar(sql.MAX), data.description ?? null)
      .query(`
        UPDATE services SET
          category_id = @categoryId,
          title = @title,
          subtitle = @subtitle,
          price = @price,
          duration = @duration,
          image = @image,
          description = @description,
          updated_at = SYSDATETIME()
        WHERE service_id = @serviceId
      `);

    if (data.priceBreakdown !== undefined) {
      await new sql.Request(tx)
        .input("serviceId", sql.Int, serviceId)
        .query(`DELETE FROM service_price_breakdown WHERE service_id = @serviceId`);
      for (const item of data.priceBreakdown) {
        await new sql.Request(tx)
          .input("serviceId", sql.Int, serviceId)
          .input("label", sql.NVarChar(150), item.label)
          .input("price", sql.Decimal(10, 0), item.price)
          .query(`
            INSERT INTO service_price_breakdown (service_id, label, price)
            VALUES (@serviceId, @label, @price)
          `);
      }
    }

    if (data.steps !== undefined) {
      await new sql.Request(tx)
        .input("serviceId", sql.Int, serviceId)
        .query(`DELETE FROM service_steps WHERE service_id = @serviceId`);
      for (const step of data.steps) {
        await new sql.Request(tx)
          .input("serviceId", sql.Int, serviceId)
          .input("stepNumber", sql.Int, step.step)
          .input("title", sql.NVarChar(150), step.title)
          .input("description", sql.NVarChar(500), step.desc ?? null)
          .query(`
            INSERT INTO service_steps (service_id, step_number, title, description)
            VALUES (@serviceId, @stepNumber, @title, @description)
          `);
      }
    }

    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

async function hasLinkedAppointments(serviceId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("serviceId", sql.Int, serviceId)
    .query(`
      SELECT TOP 1 appointment_id
      FROM appointments
      WHERE service_id = @serviceId
    `);
  return result.recordset.length > 0;
}

async function softDeleteService(serviceId) {
  const pool = await getPool();
  await pool
    .request()
    .input("serviceId", sql.Int, serviceId)
    .query(`
      UPDATE services SET is_active = 0, updated_at = SYSDATETIME()
      WHERE service_id = @serviceId
    `);
}

async function serviceExists(serviceId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("serviceId", sql.Int, serviceId)
    .query(`SELECT 1 AS ok FROM services WHERE service_id = @serviceId AND is_active = 1`);
  return result.recordset.length > 0;
}

module.exports = {
  findAllActive,
  findById,
  findPriceBreakdown,
  findSteps,
  findAllCategories,
  getCategoryIdByCode,
  createService,
  updateService,
  hasLinkedAppointments,
  softDeleteService,
  serviceExists,
};
