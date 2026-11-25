const DOUBLE_BOOKING_PATTERN = /Khung gio nay da co khach hang khac dat lich/i;

function getSqlErrorMessage(err) {
  return (
    err?.precedingErrors?.[0]?.message
    ?? err?.originalError?.info?.message
    ?? err?.message
    ?? ""
  );
}

function mapSqlError(err) {
  const message = getSqlErrorMessage(err);

  if (DOUBLE_BOOKING_PATTERN.test(message) || err?.number === 50000 || err?.precedingErrors?.[0]?.number === 50000) {
    return {
      status: 409,
      message: "Khung giờ này đã có khách hàng khác đặt lịch. Vui lòng chọn ngày/giờ khác.",
    };
  }

  if (err?.number === 2627 || err?.number === 2601) {
    const msg = getSqlErrorMessage(err);
    if (/appointment_id|appointments/i.test(msg)) {
      return { status: 409, message: "Mã lịch hẹn bị trùng. Vui lòng thử lại." };
    }
    return { status: 409, message: "Dữ liệu đã tồn tại (trùng khóa duy nhất)." };
  }

  return { status: 500, message: "Lỗi hệ thống. Vui lòng thử lại sau." };
}

module.exports = { mapSqlError, getSqlErrorMessage };
