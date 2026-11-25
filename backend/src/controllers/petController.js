const petModel = require("../models/petModel");
const { mapPetRow } = require("../utils/mappers");

const VALID_PET_TYPES = new Set(["dog", "cat", "bird", "hamster", "rabbit", "other"]);

async function getMyPets(req, res) {
  try {
    const rows = await petModel.findByOwner(req.user.userId);
    return res.json(rows.map(mapPetRow));
  } catch (err) {
    console.error("getMyPets error:", err);
    return res.status(500).json({ message: "Không thể tải danh sách thú cưng." });
  }
}

async function createPet(req, res) {
  try {
    const { name, petType, customType } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập tên thú cưng." });
    }
    if (!petType || !VALID_PET_TYPES.has(petType)) {
      return res.status(400).json({ message: "Loại thú cưng không hợp lệ." });
    }
    if (petType === "other" && !customType?.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập loại thú cưng (Khác)." });
    }

    const created = await petModel.createPet({
      ownerId: req.user.userId,
      name: name.trim(),
      petType,
      customType: petType === "other" ? customType.trim() : null,
    });

    return res.status(201).json(mapPetRow(created));
  } catch (err) {
    console.error("createPet error:", err);
    return res.status(500).json({ message: "Không thể thêm thú cưng." });
  }
}

module.exports = { getMyPets, createPet };
