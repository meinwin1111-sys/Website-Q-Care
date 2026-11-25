const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", appointmentController.createAppointment);
router.get("/my-appointments", appointmentController.getMyAppointments);
router.get("/booked-slots", appointmentController.getBookedSlots);
router.get("/admin", adminMiddleware, appointmentController.getAdminAppointments);
router.put("/:id/cancel", appointmentController.cancelAppointment);

module.exports = router;
