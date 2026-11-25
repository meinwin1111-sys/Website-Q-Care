function getAppointmentTimestamp(date, time) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,7}))?)?$/.exec(time);
  if (!dateMatch || !timeMatch) return null;

  const [, yearText, monthText, dayText] = dateMatch;
  const [, hoursText, minutesText, secondsText = "0", fractionText = ""] = timeMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  const seconds = Number(secondsText);
  const milliseconds = Number((fractionText + "000").slice(0, 3));
  const dateCheck = new Date(0);
  dateCheck.setUTCFullYear(year, month - 1, day);
  dateCheck.setUTCHours(hours, minutes, seconds, milliseconds);
  const timestamp = dateCheck.getTime();

  if (
    dateCheck.getUTCFullYear() !== year ||
    dateCheck.getUTCMonth() !== month - 1 ||
    dateCheck.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp - 7 * 60 * 60 * 1000;
}

module.exports = { getAppointmentTimestamp };
