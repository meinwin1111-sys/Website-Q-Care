const { sql, getPool } = require("../config/db");

async function findByOwner(ownerId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("ownerId", sql.Int, ownerId)
    .query(`
      SELECT pet_id, owner_id, name, pet_type, custom_type
      FROM pets
      WHERE owner_id = @ownerId
      ORDER BY pet_id DESC
    `);
  return result.recordset;
}

async function createPet({ ownerId, name, petType, customType }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("ownerId", sql.Int, ownerId)
    .input("name", sql.NVarChar(100), name)
    .input("petType", sql.NVarChar(20), petType)
    .input("customType", sql.NVarChar(100), customType || null)
    .query(`
      INSERT INTO pets (owner_id, name, pet_type, custom_type)
      OUTPUT INSERTED.pet_id, INSERTED.owner_id, INSERTED.name, INSERTED.pet_type, INSERTED.custom_type
      VALUES (@ownerId, @name, @petType, @customType)
    `);
  return result.recordset[0];
}

async function findOwnedPet(petId, ownerId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("petId", sql.Int, petId)
    .input("ownerId", sql.Int, ownerId)
    .query(`
      SELECT pet_id, owner_id, name, pet_type, custom_type
      FROM pets
      WHERE pet_id = @petId AND owner_id = @ownerId
    `);
  return result.recordset[0] ?? null;
}

module.exports = { findByOwner, createPet, findOwnedPet };
