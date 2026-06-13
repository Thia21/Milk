export function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function roundMoney(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

export function calculateEntryTotals(entry) {
  const morningLiters = toNumber(entry.morning?.liters);
  const eveningLiters = toNumber(entry.evening?.liters);
  const morningAmount = morningLiters * toNumber(entry.morning?.rate);
  const eveningAmount = eveningLiters * toNumber(entry.evening?.rate);

  return {
    totalLiters: roundMoney(morningLiters + eveningLiters),
    totalAmount: roundMoney(morningAmount + eveningAmount),
  };
}

export function normalizeMilkEntry(entry) {
  const totals = calculateEntryTotals(entry);

  return {
    ...entry,
    morning: {
      liters: toNumber(entry.morning?.liters),
      rate: toNumber(entry.morning?.rate),
    },
    evening: {
      liters: toNumber(entry.evening?.liters),
      rate: toNumber(entry.evening?.rate),
    },
    ...totals,
  };
}

export function getPaymentStatus(totalAmount, paidAmount) {
  const total = toNumber(totalAmount);
  const paid = toNumber(paidAmount);
  const balance = Math.max(total - paid, 0);

  if (balance <= 0) {
    return "Paid";
  }

  return paid > 0 ? "Partial" : "Pending";
}

export function normalizePayment(payment) {
  const totalAmount = roundMoney(payment.totalAmount);
  const paidAmount = Math.min(roundMoney(payment.paidAmount), totalAmount);
  const balanceAmount = roundMoney(Math.max(totalAmount - paidAmount, 0));

  return {
    ...payment,
    totalAmount,
    paidAmount,
    balanceAmount,
    status: getPaymentStatus(totalAmount, paidAmount),
  };
}

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getCenterName(centers, centerId) {
  return centers.find((center) => center.id === centerId)?.centerName || "Unknown Center";
}

export function sumBy(rows, selector) {
  return rows.reduce((total, row) => total + toNumber(selector(row)), 0);
}
