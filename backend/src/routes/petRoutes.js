const express = require("express");
const petController = require("../controllers/petController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/my-pets", petController.getMyPets);
router.post("/", petController.createPet);

module.exports = router;
