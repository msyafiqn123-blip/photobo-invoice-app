import { toRomanMonth, getTwoDigitYear } from './formatters';

export const PACKAGE_OPTIONS = [
  {
    code: '01',
    name: '2 Jam 2R',
    description: 'Photobooth 2 Hours\nUnlimited 2R',
    durationHours: 2,
    printType: 'Unlimited 2R',
    defaultPrice: 1500000,
  },
  {
    code: '02',
    name: '3 Jam 2R',
    description: 'Photobooth 3 Hours\nUnlimited 2R',
    durationHours: 3,
    printType: 'Unlimited 2R',
    defaultPrice: 2000000,
  },
  {
    code: '03',
    name: '4 Jam 2R',
    description: 'Photobooth 4 Hours\nUnlimited 2R',
    durationHours: 4,
    printType: 'Unlimited 2R',
    defaultPrice: 2500000,
  },
  {
    code: '11',
    name: '2 Jam 4R',
    description: 'Photobooth 2 Hours\nUnlimited 4R',
    durationHours: 2,
    printType: 'Unlimited 4R',
    defaultPrice: 1800000,
  },
  {
    code: '12',
    name: '3 Jam 4R',
    description: 'Photobooth 3 Hours\nUnlimited 4R',
    durationHours: 3,
    printType: 'Unlimited 4R',
    defaultPrice: 2300000,
  },
  {
    code: '13',
    name: '4 Jam 4R',
    description: 'Photobooth 4 Hours\nUnlimited 4R',
    durationHours: 4,
    printType: 'Unlimited 4R',
    defaultPrice: 2800000,
  },
];

export const PAYMENT_METHODS = [
  { code: '02', id: 'BCA', label: 'BCA Transfer', displayText: 'BCA TRANSFER' },
  { code: '01', id: 'EMPTY', label: 'Masih Kosong / Tagihan (Belum Bayar)', displayText: 'BCA TRANSFER' },
];

export const PAYMENT_STAGES = [
  { code: '01', id: 'DP', label: 'Down Payment (DP)' },
  { code: '02', id: 'LUNAS', label: 'Pelunasan / Lunas' },
];

/**
 * Generate Invoice Code based on Photobo standard:
 * Format: INV AA.BB/CC/DD/YY
 * AA: Pembayaran ke (01: DP, 02: Lunas)
 * BB: Nomor Urut Invoice dari awal tahun (2 digit: 01, 02, ... 08, dst)
 * CC: Bulan Pembayaran Romawi (I - XII)
 * DD: Jenis Paket (01, 02, 03, 11, 12, 13)
 * YY: 2 digit tahun
 */
export const generateInvoiceCode = ({
  stageCode = '01',          // 01: DP, 02: Lunas
  sequenceNumber = '08',     // BB: Nomor Urut Invoice
  methodCode,                // fallback support
  invoiceDate = new Date(),
  packageCode = '03',        // 01, 02, 03, 11, 12, 13
}) => {
  const dateObj = invoiceDate instanceof Date ? invoiceDate : new Date(invoiceDate);
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  
  const AA = stageCode || '01';
  const rawNum = sequenceNumber ?? methodCode ?? '08';
  const num = parseInt(rawNum, 10);
  const BB = isNaN(num) ? '08' : String(num).padStart(2, '0');
  const CC = toRomanMonth(validDate.getMonth());
  const DD = packageCode || '03';
  const YY = getTwoDigitYear(validDate);

  return `INV ${AA}.${BB}/${CC}/${DD}/${YY}`;
};
