/**
 * Smoke test — chạy khi server đang listen (npm run dev).
 * Usage: node scripts/smokeTest.js [baseUrl]
 */
const BASE = process.argv[2] || "http://localhost:5000";

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, body: json };
}

function print(label, result) {
  console.log(`\n=== ${label} (${result.status}) ===`);
  console.log(JSON.stringify(result.body, null, 2));
}

async function main() {
  print("GET /api/health", await request("GET", "/api/health"));

  print("GET /api/services", await request("GET", "/api/services"));

  print("GET /api/categories", await request("GET", "/api/categories"));

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("Set ADMIN_PASSWORD in backend/.env before running the smoke test.");
  }

  const login = await request("POST", "/api/auth/login", {
    email: process.env.ADMIN_EMAIL || "admin@gmail.com",
    password: adminPassword,
  });
  print("POST /api/auth/login (admin)", login);

  if (login.status !== 200 || !login.body?.token) {
    console.error("\nLogin failed — dừng test (chạy npm run seed:admin nếu DB cũ còn plaintext).");
    process.exit(1);
  }

  const token = login.body.token;
  print("GET /api/appointments/admin", await request("GET", "/api/appointments/admin", null, token));

  // Customer token — register temp user or use existing
  const regEmail = `smoke_${Date.now()}@test.local`;
  const reg = await request("POST", "/api/auth/register", {
    name: "Smoke Test User",
    email: regEmail,
    password: "testpass123",
  });
  print("POST /api/auth/register (customer)", reg);

  const customerToken = reg.body?.token;
  if (customerToken) {
    const forbidden = await request("GET", "/api/appointments/admin", null, customerToken);
    print("GET /api/appointments/admin (customer → expect 403)", forbidden);

    const cancelNoReason = await request("PUT", "/api/appointments/QC-NONE/cancel", {}, customerToken);
    print("PUT cancel without cancelReason (expect 400)", cancelNoReason);
  }

  console.log("\n=== Smoke test done ===");
}

main().catch((err) => {
  console.error("Smoke test error:", err.message);
  process.exit(1);
});
