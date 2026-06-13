import { addDays, toInputDate } from "../utils/dateUtils.js";
import { roundMoney } from "../utils/calculations.js";

const CUSTOMER_DATA = [
  { name: "K. Rajendran",     address: "14, Anna Street",           phone: "9876501001" },
  { name: "P. Murugesan",     address: "22, Gandhi Road",           phone: "9843502002" },
  { name: "S. Lakshmi Devi", address: "5, Temple Lane",            phone: "9790503003" },
  { name: "T. Selvam",        address: "31, Market Street",         phone: "9443504004" },
  { name: "V. Kamala",        address: "8, Old Bus Stand Road",     phone: "9360505005" },
  { name: "N. Rajan",         address: "17, School Road",           phone: "9789506006" },
  { name: "A. Meenakshi",     address: "42, Cross Street",          phone: "9655507007" },
  { name: "G. Suresh",        address: "3, New Colony",             phone: "9444508008" },
  { name: "R. Vijayalakshmi", address: "26, East Street",          phone: "9092509009" },
  { name: "M. Kannan",        address: "11, River View Road",       phone: "9384510010" },
  { name: "D. Saraswathi",    address: "38, West Lane",             phone: "9876511011" },
  { name: "L. Arumugam",      address: "7, Pillayar Koil Street",   phone: "9843512012" },
  { name: "B. Kavitha",       address: "19, South Street",          phone: "9790513013" },
  { name: "C. Pandian",       address: "55, North Main Road",       phone: "9443514014" },
  { name: "E. Thilaga",       address: "2, Panchayat Road",         phone: "9360515015" },
  { name: "F. Ramu",          address: "44, Flower Garden Street",  phone: "9789516016" },
  { name: "H. Geetha",        address: "29, Station Road",          phone: "9655517017" },
  { name: "I. Palaniswamy",   address: "13, New Extension",         phone: "9444518018" },
  { name: "J. Sumathi",       address: "61, College Road",          phone: "9092519019" },
  { name: "O. Karuppasamy",   address: "9, Main Bazaar",            phone: "9384520020" },
];

export const initialDeliveryCustomers = CUSTOMER_DATA.map((customer, i) => ({
  id: `dcust-${String(i + 1).padStart(3, "0")}`,
  clientId: `CS-${String(i + 1).padStart(3, "0")}`,
  name: customer.name,
  address: customer.address,
  phone: customer.phone,
  morningLitres: 0.5,
  eveningLitres: 0.5,
  subscriptionAmount: 4000,
  isActive: true,
  createdAt: new Date().toISOString(),
}));

// Generate entries for last 5 days so the dashboard has data
const ENTRY_DAYS = 5;
export const initialDeliveryEntries = initialDeliveryCustomers.flatMap((customer, ci) =>
  Array.from({ length: ENTRY_DAYS }, (_, di) => {
    const date = toInputDate(addDays(new Date(), -di));
    const morningDelivered = ci % 7 !== 0 || di > 0;
    const eveningDelivered = ci % 11 !== 0 || di > 0;
    return {
      id: `dentry-${ci + 1}-${di}`,
      customerId: customer.id,
      date,
      morning: {
        litres: morningDelivered ? customer.morningLitres : 0,
        delivered: morningDelivered,
      },
      evening: {
        litres: eveningDelivered ? customer.eveningLitres : 0,
        delivered: eveningDelivered,
      },
      totalLitres: roundMoney(
        (morningDelivered ? customer.morningLitres : 0) +
        (eveningDelivered ? customer.eveningLitres : 0)
      ),
      createdAt: new Date().toISOString(),
    };
  })
);

const PAID_AMOUNTS = [4000, 4000, 1500, 2000, 0, 4000, 1200, 4000, 0, 4000, 3000, 4000, 0, 4000, 4000, 1800, 4000, 0, 4000, 2500];

const currentMonth = toInputDate().slice(0, 7);

export const initialDeliverySubscriptions = initialDeliveryCustomers.map((customer, i) => {
  const totalDue = customer.subscriptionAmount;
  const paidAmount = PAID_AMOUNTS[i];
  const balance = Math.max(totalDue - paidAmount, 0);
  let status = "Unpaid";
  if (paidAmount >= totalDue) status = "Paid";
  else if (paidAmount > 0) status = "Partial";

  return {
    id: `dsub-${String(i + 1).padStart(3, "0")}`,
    customerId: customer.id,
    month: currentMonth,
    totalDue,
    paidAmount,
    balance,
    status,
    history:
      paidAmount > 0
        ? [
            {
              id: `dsubh-${i + 1}-1`,
              date: toInputDate(addDays(new Date(), -(i % 8 + 1))),
              amount: paidAmount,
              note: paidAmount >= totalDue ? "Full payment received" : "Partial payment received",
            },
          ]
        : [],
  };
});
