const appointmentModel = require("../models/appointmentModel");
const serviceModel = require("../models/serviceModel");
const petModel = require("../models/petModel");
const timeSlotModel = require("../models/timeSlotModel");
const { generateAppointmentId } = require("../utils/appointmentId");
const {
  mapCustomerAppointmentRow,
  mapAdminAppointmentRow,
} = require("../utils/mappers");
const { mapSqlError } = require("../utils/sqlErrors");
const { getAppointmentTimestamp } = require("../utils/appointmentTime");

async function generateUniqueAppointmentId() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const id = generateAppointmentId();
    const exists = await appointmentModel.idExists(id);
    if (!exists) return id;
  }
  throw new Error("Không thể sinh mã lịch hẹn duy nhất.");
}

async function createAppointment(req, res) {
  try {
    const {
      serviceId,
      petId,
      date,
      time,
      slotId,
      address,
      vetName,
    } = req.body;

    if (!serviceId || !petId || !date || !address?.trim()) {
      return res.status(400).json({ message: "Thiếu thông tin đặt lịch (dịch vụ, thú cưng, ngày, địa chỉ)." });
    }

    const pet = await petModel.findOwnedPet(Number(petId), req.user.userId);
    if (!pet) {
      return res.status(404).json({ message: "Không tìm thấy thú cưng của bạn." });
    }

    const service = await serviceModel.findById(Number(serviceId));
    if (!service) {
      return res.status(404).json({ message: "Dịch vụ không tồn tại." });
    }

    let resolvedSlotId = slotId ? Number(slotId) : null;
    if (!resolvedSlotId && time) {
      const slot = await timeSlotModel.findByTime(time);
      if (!slot) {
        return res.status(400).json({ message: "Khung giờ không hợp lệ." });
      }
      resolvedSlotId = slot.slot_id;
    }
    if (!resolvedSlotId) {
      return res.status(400).json({ message: "Vui lòng chọn khung giờ (time hoặc slotId)." });
    }

    const slotRow = await timeSlotModel.findById(resolvedSlotId);
    if (!slotRow) {
      return res.status(400).json({ message: "Khung giờ không tồn tại." });
    }

    const appointmentTimestamp = getAppointmentTimestamp(date, slotRow.slot_time);
    if (appointmentTimestamp === null) {
      return res.status(400).json({ message: "Ngày hoặc khung giờ không hợp lệ." });
    }
    if (appointmentTimestamp < Date.now()) {
      return res.status(400).json({ message: "Không thể đặt lịch cho khung giờ đã trôi qua." });
    }

    const appointmentId = await generateUniqueAppointmentId();
    if (appointmentTimestamp < Date.now()) {
      return res.status(400).json({ message: "Không thể đặt lịch cho khung giờ đã trôi qua." });
    }

    await appointmentModel.createAppointment({
      appointmentId,
      customerId: req.user.userId,
      petId: pet.pet_id,
      serviceId: Number(serviceId),
      appointmentDate: date,
      slotId: resolvedSlotId,
      price: Number(service.price),
      address: address.trim(),
      vetName: vetName?.trim() || null,
    });

    const rows = await appointmentModel.findCustomerAppointments(req.user.userId);
    const created = rows.find((row) => row.appointment_id === appointmentId);
    if (!created) {
      return res.status(500).json({ message: "Đặt lịch thành công nhưng không thể tải lại dữ liệu." });
    }
    return res.status(201).json(mapCustomerAppointmentRow(created));
  } catch (err) {
    console.error("createAppointment error:", err);
    const mapped = mapSqlError(err);
    return res.status(mapped.status).json({ message: mapped.message });
  }
}

async function getMyAppointments(req, res) {
  try {
    const rows = await appointmentModel.findCustomerAppointments(req.user.userId);
    return res.json(rows.map(mapCustomerAppointmentRow));
  } catch (err) {
    console.error("getMyAppointments error:", err);
    return res.status(500).json({ message: "Không thể tải lịch hẹn." });
  }
}

async function getAdminAppointments(req, res) {
  try {
    const rows = await appointmentModel.findAdminAppointments();
    return res.json(rows.map(mapAdminAppointmentRow));
  } catch (err) {
    console.error("getAdminAppointments error:", err);
    return res.status(500).json({ message: "Không thể tải lịch hẹn admin." });
  }
}

async function getBookedSlots(req, res) {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      return res.status(400).json({ message: "Thiếu hoặc định dạng ngày không hợp lệ." });
    }

    const rows = await appointmentModel.findBookedSlotsByDate(date.trim());
    return res.json(rows);
  } catch (err) {
    console.error("getBookedSlots error:", err);
    return res.status(500).json({ message: "Không thể tải khung giờ đã đặt." });
  }
}

async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (!cancelReason?.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập lý do hủy." });
    }

    const appt = await appointmentModel.findById(id);
    if (!appt) {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn." });
    }

    const isOwner = appt.customer_id === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền hủy lịch hẹn này." });
    }

    if (appt.status === "cancelled") {
      return res.status(400).json({ message: "Lịch hẹn đã được hủy trước đó." });
    }

    await appointmentModel.cancelAppointment(id, cancelReason.trim());

    if (isAdmin) {
      const rows = await appointmentModel.findAdminAppointments();
      const updated = rows.find((row) => row.appointment_id === id);
      return res.json(updated ? mapAdminAppointmentRow(updated) : { id, status: "cancelled" });
    }

    const rows = await appointmentModel.findCustomerAppointments(req.user.userId);
    const updated = rows.find((row) => row.appointment_id === id);
    return res.json(updated ? mapCustomerAppointmentRow(updated) : { id, status: "cancelled" });
  } catch (err) {
    console.error("cancelAppointment error:", err);
    const mapped = mapSqlError(err);
    return res.status(mapped.status).json({ message: mapped.message });
  }
}

module.exports = {
  createAppointment,
  getMyAppointments,
  getAdminAppointments,
  getBookedSlots,
  cancelAppointment,
};
