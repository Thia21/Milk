import { addDays, toInputDate } from "../utils/dateUtils.js";
import { normalizeMilkEntry, normalizePayment, roundMoney } from "../utils/calculations.js";

export const initialCenters = [
  {
    id: "center-001",
    centerName: "Aaroor Dairy Farms",
    ownerName: "R. Rajendran",
    mobileNumber: "9876543210",
    village: "Thiruvarur",
    address: "South Street, Thiruvarur",
    status: "Active",
  },
  {
    id: "center-002",
    centerName: "Cauvery Milk Collection Centre",
    ownerName: "S. Murugan",
    mobileNumber: "9843012345",
    village: "Mannargudi",
    address: "East Main Road, Mannargudi",
    status: "Active",
  },
  {
    id: "center-003",
    centerName: "Annapoorna Dairy",
    ownerName: "K. Balasubramanian",
    mobileNumber: "9790011223",
    village: "Nannilam",
    address: "Market Street, Nannilam",
    status: "Active",
  },
  {
    id: "center-004",
    centerName: "Sri Amman Milk Centre",
    ownerName: "P. Lakshmi",
    mobileNumber: "9443123456",
    village: "Kumbakonam",
    address: "Temple Road, Kumbakonam",
    status: "Active",
  },
  {
    id: "center-005",
    centerName: "Velan Dairy Products",
    ownerName: "M. Aravind",
    mobileNumber: "9360017890",
    village: "Needamangalam",
    address: "Bus Stand Road, Needamangalam",
    status: "Active",
  },
  {
    id: "center-006",
    centerName: "Aavin Partner Collection Point",
    ownerName: "T. Senthil Kumar",
    mobileNumber: "9789012345",
    village: "Valangaiman",
    address: "West Street, Valangaiman",
    status: "Active",
  },
  {
    id: "center-007",
    centerName: "Sakthi Dairy Farms",
    ownerName: "A. Ramesh",
    mobileNumber: "9655123456",
    village: "Kodavasal",
    address: "Main Road, Kodavasal",
    status: "Active",
  },
  {
    id: "center-008",
    centerName: "Murugan Milk Suppliers",
    ownerName: "V. Mahalakshmi",
    mobileNumber: "9444012345",
    village: "Thiruthuraipoondi",
    address: "North Street, Thiruthuraipoondi",
    status: "Active",
  },
  {
    id: "center-009",
    centerName: "Golden Cow Dairy",
    ownerName: "D. Prakash",
    mobileNumber: "9092012345",
    village: "Muthupettai",
    address: "Bazaar Road, Muthupettai",
    status: "Active",
  },
  {
    id: "center-010",
    centerName: "Thendral Milk Collection Centre",
    ownerName: "N. Ganesan",
    mobileNumber: "9384012345",
    village: "Koradachery",
    address: "Middle Street, Koradachery",
    status: "Active",
  }
];

function buildEntry(index) {
  const center = initialCenters[index % initialCenters.length];
  const date = toInputDate(addDays(new Date(), -index));
  const morningLiters = 86 + ((index * 7) % 34);
  const eveningLiters = 68 + ((index * 5) % 28);
  const baseRate = 38 + (index % 5);

  return normalizeMilkEntry({
    id: `entry-${String(index + 1).padStart(3, "0")}`,
    date,
    centerId: center.id,
    morning: {
      liters: morningLiters,
      rate: baseRate,
    },
    evening: {
      liters: eveningLiters,
      rate: baseRate + 1,
    },
    createdAt: new Date().toISOString(),
  });
}

export const initialEntries = Array.from({ length: 30 }, (_, index) => buildEntry(index));

function buildPayment(center, index) {
  const centerEntries = initialEntries.filter((entry) => entry.centerId === center.id);
  const totalAmount = roundMoney(
    centerEntries.reduce((total, entry) => total + entry.totalAmount, 0)
  );
  const paidRatios = [0.7, 0.45, 1, 0, 0.85];
  const paidAmount = roundMoney(totalAmount * paidRatios[index]);
  const paymentDate = toInputDate(addDays(new Date(), -(index + 1) * 2));

  return normalizePayment({
    id: `payment-${String(index + 1).padStart(3, "0")}`,
    centerId: center.id,
    totalAmount,
    paidAmount,
    paymentDate,
    history:
      paidAmount > 0
        ? [
            {
              id: `history-${String(index + 1).padStart(3, "0")}-1`,
              date: paymentDate,
              amount: paidAmount,
              note: paidAmount >= totalAmount ? "Full settlement" : "Initial payment",
            },
          ]
        : [],
  });
}

export const initialPayments = initialCenters.map((center, index) => buildPayment(center, index));

export const initialSettings = {
  companyName: "Sekar Milk Collection System",
  companyAddress: "12 Dairy Road, Thottiyam, Tiruchirappalli, Tamil Nadu",
  defaultMilkRate: 40,
};
