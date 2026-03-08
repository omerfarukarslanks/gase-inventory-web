export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getRelativeDate(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
}

export function getCurrentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

export function getDefaultReportDateRange(daysAgo = 30) {
  return {
    startDate: getRelativeDate(daysAgo),
    endDate: getTodayDate(),
  };
}
