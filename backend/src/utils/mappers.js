const { getPetDisplay, getPetOption } = require("./petHelpers");
const { formatDateOnly, formatSlotTime, toNumber } = require("./formatters");

function mapServiceRow(row, extras = {}) {
  return {
    id: row.service_id,
    name: row.title,
    category: row.category_code,
    title: row.title,
    subtitle: row.subtitle ?? "",
    price: toNumber(row.price),
    duration: row.duration ?? "",
    image: row.image ?? "",
    description: row.description ?? "",
    priceBreakdown: extras.priceBreakdown ?? [],
    steps: extras.steps ?? [],
  };
}

function mapPriceBreakdownRow(row) {
  return { label: row.label, price: toNumber(row.price) };
}

function mapStepRow(row) {
  return {
    step: row.step_number,
    title: row.title,
    desc: row.description ?? "",
  };
}

function mapCategoryRow(row) {
  return { id: row.code, label: row.name };
}

function mapCustomerAppointmentRow(row) {
  const petType = row.pet_type;
  const opt = getPetOption(petType);
  return {
    id: row.appointment_id,
    service: row.service,
    pet: row.pet,
    petName: row.pet,
    petType,
    petDisplay: getPetDisplay(petType, row.custom_type),
    petEmoji: opt.emoji,
    date: formatDateOnly(row.appointment_date),
    time: formatSlotTime(row.slot_time),
    status: row.status,
    price: toNumber(row.price),
    address: row.address,
    vet: row.vet_name ?? "",
    customerName: row.customer_name,
    cancelReason: row.cancel_reason ?? null,
  };
}

function mapAdminAppointmentRow(row) {
  return {
    id: row.appointment_id,
    customer: row.customer,
    customerName: row.customer_name ?? row.customer ?? "",
    pet: row.pet,
    petName: row.pet ?? "",
    service: row.service,
    date: formatDateOnly(row.date),
    time: formatSlotTime(row.time),
    status: row.status,
    price: toNumber(row.price),
    address: row.customer_address ?? row.address ?? "",
    customer_phone: row.customer_phone ?? "",
    customer_address: row.customer_address ?? row.address ?? "",
    vet: row.vet_name ?? "",
    cancelReason: row.cancel_reason ?? null,
  };
}

function mapPetRow(row) {
  const opt = getPetOption(row.pet_type);
  return {
    id: row.pet_id,
    name: row.name,
    petType: row.pet_type,
    customType: row.custom_type,
    value: row.pet_type,
    label: row.name,
    emoji: opt.emoji,
  };
}

module.exports = {
  mapServiceRow,
  mapPriceBreakdownRow,
  mapStepRow,
  mapCategoryRow,
  mapCustomerAppointmentRow,
  mapAdminAppointmentRow,
  mapPetRow,
};
