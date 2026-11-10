import { getSupabase } from './supabase';
import { PACKAGE_OPTIONS } from '../utils/invoiceCode';

export const DEFAULT_STUDIO_SETTINGS = {
  studioName: 'Photobo Studio',
  tagline: 'PHOTOBOOTH SPECIALIST',
  instagram: '@Photobo_Studio',
  whatsapp: '0811-1332-931',
  bankName: 'BCA',
  bankMethodLabel: 'BCA TRANSFER',
  bankAccountNumber: '7045166686',
  bankAccountHolder: 'Sasiera Diva P',
  terms: [
    'Down Payment minimal 20% dari Harga untuk booking jadwal',
    'Pelunasan Maksimal H-1 Tanggal Pelaksanaan',
  ],
  validityNote: 'Invoice ini adalah bukti pembayaran yang sah',
  packages: PACKAGE_OPTIONS,
};

export const INITIAL_SAMPLE_INVOICES = [
  {
    id: 'inv-nova-yogi-01',
    invoiceCode: 'INV 01.09/X/01/26',
    invoiceDate: '2026-11-07',
    docType: 'TAGIHAN_DP',
    stageCode: '01',
    sequenceNumber: '09',
    packageCode: 'X',
    client: {
      name: 'NOVA/YOGI',
      phone: '087736883306',
      location: 'Bale dan Resto Panghegar Purwakarta',
    },
    event: {
      date: '2026-12-19',
      timeStart: '12.15',
      timeEnd: '14.15',
      durationHours: 2,
      printType: 'Unlimited 2R',
      packageName: 'Photobooth 2 Jam 2R',
    },
    items: [
      {
        id: 'item-1',
        description: 'Photobooth 2 Jam 2R\nUnlimited 2R\n19 Desember 2026\n12.15 - 14.15',
        price: 1600000,
        paymentType: 'DOWN PAYMENT',
        amountPaid: 260000,
      },
      {
        id: 'item-2',
        description: 'Promo Diskon Booking\ns.d. 31 Desember 2026',
        price: 300000,
        paymentType: 'DISCOUNT',
        amountPaid: -300000,
      },
    ],
    summary: {
      totalPackagePrice: 1600000,
      totalAdditionals: 0,
      totalDiscounts: 300000,
      grandTotal: 1300000,
      downPaymentPaid: 260000,
      totalPaidSoFar: 260000,
      remainingBalance: 1040000,
    },
    paymentMethod: 'BCA TRANSFER',
    accountNumber: 'BCA 7045166686',
    accountHolder: 'Sasiera Diva P',
    hasStamp: false,
    notes: '',
  },
  {
    id: 'inv-vira-01',
    invoiceCode: 'INV 01.08/I/03/26',
    invoiceDate: '2026-01-11',
    docType: 'BUKTI_DP', // TAGIHAN_DP | BUKTI_DP | TAGIHAN_PELUNASAN | BUKTI_LUNAS
    stageCode: '01',
    sequenceNumber: '08',
    packageCode: '03',
    client: {
      name: 'VIRA APRILIANII',
      phone: '0857-2489-4972',
      location: 'Purwakarta, Jawa Barat',
    },
    event: {
      date: '2026-05-10',
      timeStart: '10.00',
      timeEnd: '14.00',
      durationHours: 4,
      printType: 'Unlimited 2R',
      packageName: 'Photobooth 4 Hours',
    },
    items: [
      {
        id: 'item-1',
        description: 'Photobooth 4 Hours\nUnlimited 2R\n10 Mei 2026\n10.00 - 14.00',
        price: 2500000,
        paymentType: 'DOWN PAYMENT',
        amountPaid: 500000,
      },
      {
        id: 'item-2',
        description: 'Transportasi',
        price: 1500000 ? 150000 : 150000,
        paymentType: 'ADDITIONAL',
        amountPaid: 150000,
      },
      {
        id: 'item-3',
        description: 'Promo 2026\nBooking s.d 31 Jan 2026',
        price: -300000,
        paymentType: 'DISCOUNT',
        amountPaid: -300000,
      },
    ],
    summary: {
      totalPackagePrice: 2500000,
      totalAdditionals: 150000,
      totalDiscounts: 300000,
      grandTotal: 2350000,
      downPaymentPaid: 500000,
      totalPaidSoFar: 800000,
      remainingBalance: 1550000,
    },
    paymentMethod: 'BCA TRANSFER',
    accountNumber: 'BCA 7045166686',
    accountHolder: 'Sasiera Diva P',
    hasStamp: true,
    createdAt: '2026-01-11T10:00:00.000Z',
  },
  {
    id: 'inv-eka-02',
    invoiceCode: 'INV 01.02/III/03/26',
    invoiceDate: '2026-03-07',
    docType: 'BUKTI_DP',
    stageCode: '01',
    sequenceNumber: '02',
    packageCode: '03',
    client: {
      name: 'EKA APRIYANI',
      phone: '0857-2489-4972',
      location: 'Purwakarta, Jawa Barat',
    },
    event: {
      date: '2026-04-04',
      timeStart: '10.00',
      timeEnd: '14.00',
      durationHours: 4,
      printType: 'Unlimited 2R',
      packageName: 'Photobooth 4 Hours',
    },
    items: [
      {
        id: 'item-1',
        description: 'Photobooth 4 Hours\nUnlimited 2R\n4 April 2026\n10.00 - 14.00',
        price: 2500000,
        paymentType: 'DOWN PAYMENT',
        amountPaid: 1000000,
      },
      {
        id: 'item-2',
        description: 'Promo 2026\nBooking s.d 31 Mar 2026',
        price: 300000,
        paymentType: 'DISCOUNT',
        amountPaid: -300000,
      },
      {
        id: 'item-3',
        description: 'Voucher THR',
        price: 200000,
        paymentType: 'DISCOUNT',
        amountPaid: -200000,
      },
    ],
    summary: {
      totalPackagePrice: 2500000,
      totalAdditionals: 0,
      totalDiscounts: 500000,
      grandTotal: 2000000,
      downPaymentPaid: 1000000,
      totalPaidSoFar: 1500000,
      remainingBalance: 1000000,
    },
    paymentMethod: 'BCA TRANSFER',
    accountNumber: 'BCA 7045166686',
    accountHolder: 'Sasiera Diva P',
    hasStamp: true,
    createdAt: '2026-03-07T10:00:00.000Z',
  },
  {
    id: 'inv-despiana-03',
    invoiceCode: 'INV 02.03/I/11/26',
    invoiceDate: '2026-02-18',
    docType: 'BUKTI_DP',
    stageCode: '02',
    sequenceNumber: '03',
    packageCode: '11',
    client: {
      name: 'DESPIANA NURSYIFA K',
      phone: '0821-2331-4026',
      location: 'Karawang, Jawa Barat',
    },
    event: {
      date: '2026-04-25',
      timeStart: '11.00',
      timeEnd: '14.00',
      durationHours: 3,
      printType: 'Unlimited 2R',
      packageName: 'Photobooth 3 Hours',
    },
    items: [
      {
        id: 'item-1',
        description: 'Photobooth 3 Hours\nUnlimited 2R\n25 April 2026\n11.00 - 14.00',
        price: 2000000,
        paymentType: 'DOWN PAYMENT',
        amountPaid: 400000,
      },
      {
        id: 'item-2',
        description: 'Promo 2026\nBooking s.d 28 Feb 2026',
        price: 300000,
        paymentType: 'DISCOUNT',
        amountPaid: 300000,
      },
    ],
    summary: {
      totalPackagePrice: 2000000,
      totalAdditionals: 0,
      totalDiscounts: 300000,
      grandTotal: 1700000,
      downPaymentPaid: 400000,
      totalPaidSoFar: 700000,
      remainingBalance: 1300000,
    },
    paymentMethod: 'BCA TRANSFER',
    accountNumber: 'BCA 7045166686',
    accountHolder: 'Sasiera Diva P',
    hasStamp: true,
    createdAt: '2026-02-18T10:00:00.000Z',
  },
];

const ALL_STORAGE_KEYS = [
  'photobo_invoices_v4',
  'photobo_invoices_v3',
  'photobo_invoices_v2',
  'photobo_invoices_v1',
  'photobo_invoices',
];

const ALL_SETTINGS_KEYS = [
  'photobo_settings_v4',
  'photobo_settings_v3',
  'photobo_settings_v2',
  'photobo_settings_v1',
  'photobo_settings',
];

export const loadInvoices = async () => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase fetch error, fallback to local:', err);
    }
  }

  // Scan and gather invoices from all previous storage versions to guarantee 0 data loss
  const invoiceMap = new Map();

  // 1. First add initial sample invoices as baseline
  INITIAL_SAMPLE_INVOICES.forEach((inv) => {
    const key = inv.invoiceCode || inv.id;
    if (key) invoiceMap.set(key, inv);
  });

  // 2. Then load from all localStorage keys (newer keys override older ones)
  // We read from oldest to newest so newest edits take precedence
  const reversedKeys = [...ALL_STORAGE_KEYS].reverse();
  reversedKeys.forEach((storageKey) => {
    try {
      const local = localStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          parsed.forEach((inv) => {
            const key = inv.invoiceCode || inv.id;
            if (key) {
              invoiceMap.set(key, inv);
            }
          });
        }
      }
    } catch (_) {}
  });

  const mergedInvoices = Array.from(invoiceMap.values());

  // Re-save merged result to all keys to keep storage synchronized
  ALL_STORAGE_KEYS.forEach((k) => {
    try {
      localStorage.setItem(k, JSON.stringify(mergedInvoices));
    } catch (_) {}
  });

  return mergedInvoices;
};

export const saveInvoice = async (invoice) => {
  const current = await loadInvoices();
  const existsIndex = current.findIndex(
    (item) => item.id === invoice.id || item.invoiceCode === invoice.invoiceCode
  );
  let updated;
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...invoice, createdAt: new Date().toISOString() }, ...current];
  }

  ALL_STORAGE_KEYS.forEach((k) => {
    try {
      localStorage.setItem(k, JSON.stringify(updated));
    } catch (_) {}
  });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('invoices').upsert(invoice);
    } catch (err) {
      console.warn('Supabase sync error:', err);
    }
  }

  return updated;
};

export const deleteInvoice = async (id) => {
  const current = await loadInvoices();
  const updated = current.filter((item) => item.id !== id && item.invoiceCode !== id);

  ALL_STORAGE_KEYS.forEach((k) => {
    try {
      localStorage.setItem(k, JSON.stringify(updated));
    } catch (_) {}
  });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('invoices').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return updated;
};

export const loadSettings = () => {
  let foundSettings = null;
  for (const k of ALL_SETTINGS_KEYS) {
    try {
      const local = localStorage.getItem(k);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          foundSettings = parsed;
          break;
        }
      }
    } catch (_) {}
  }

  const merged = {
    ...DEFAULT_STUDIO_SETTINGS,
    ...(foundSettings || {}),
    packages: Array.isArray(foundSettings?.packages) && foundSettings.packages.length > 0
      ? foundSettings.packages
      : DEFAULT_STUDIO_SETTINGS.packages,
  };

  ALL_SETTINGS_KEYS.forEach((k) => {
    try {
      localStorage.setItem(k, JSON.stringify(merged));
    } catch (_) {}
  });

  return merged;
};

export const saveSettings = (newSettings) => {
  const merged = { ...DEFAULT_STUDIO_SETTINGS, ...newSettings };
  ALL_SETTINGS_KEYS.forEach((k) => {
    try {
      localStorage.setItem(k, JSON.stringify(merged));
    } catch (_) {}
  });
  return merged;
};
