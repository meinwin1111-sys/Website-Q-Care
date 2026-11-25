const PET_OPTIONS = [
  { value: "dog", label: "Chó", emoji: "🐶" },
  { value: "cat", label: "Mèo", emoji: "🐱" },
  { value: "bird", label: "Chim", emoji: "🐦" },
  { value: "hamster", label: "Chuột Hamster", emoji: "🐹" },
  { value: "rabbit", label: "Thỏ", emoji: "🐰" },
  { value: "other", label: "Khác...", emoji: "🐾" },
];

function getPetOption(petType) {
  return PET_OPTIONS.find((p) => p.value === petType) ?? PET_OPTIONS[5];
}

function getPetDisplay(petType, customType) {
  if (petType === "other" && customType) return customType;
  return getPetOption(petType).label;
}

module.exports = { PET_OPTIONS, getPetOption, getPetDisplay };
