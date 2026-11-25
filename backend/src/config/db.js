const sql = require("mssql");
require("dotenv").config();

const config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "qcare_db",
  options: {
    encrypt: process.env.DB_ENCRYPT !== "false",
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

if (process.env.DB_AUTH_MODE === "windows" || (!process.env.DB_USER && !process.env.DB_PASSWORD)) {
  config.authentication = {
    type: "ntlm",
    options: {
      domain: process.env.DB_DOMAIN || process.env.USERDOMAIN || "",
      userName: process.env.DB_USER || "",
      password: process.env.DB_PASSWORD || "",
    },
  };
} else {
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
}

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

module.exports = { sql, getPool };
