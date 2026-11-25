const timeSlotModel = require("../models/timeSlotModel");
const { formatSlotTime } = require("../utils/formatters");

const PERIOD_LABELS = {
  morning: "Sáng",
  afternoon: "Chiều",
  evening: "Tối",
};

async function listTimeSlots(req, res) {
  try {
    const rows = await timeSlotModel.findAll();
    const grouped = new Map();

    for (const row of rows) {
      const label = PERIOD_LABELS[row.period] ?? row.period;
      if (!grouped.has(label)) {
        grouped.set(label, { label, slots: [], times: [] });
      }
      const slotValue = {
        id: row.slot_id,
        time: formatSlotTime(row.slot_time),
      };
      grouped.get(label).slots.push(slotValue);
      grouped.get(label).times.push(slotValue);
    }

    const flat = rows.map((row) => ({
      slotId: row.slot_id,
      period: row.period,
      time: formatSlotTime(row.slot_time),
    }));

    return res.json({ grouped: [...grouped.values()], slots: flat });
  } catch (err) {
    console.error("listTimeSlots error:", err);
    return res.status(500).json({ message: "Không thể tải khung giờ." });
  }
}

module.exports = { listTimeSlots };
