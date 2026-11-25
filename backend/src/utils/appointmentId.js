const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateAppointmentId() {
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `QC-${suffix}`;
}

module.exports = { generateAppointmentId };
