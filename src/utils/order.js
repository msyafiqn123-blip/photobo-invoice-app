import { generateInvoiceCode, PACKAGE_OPTIONS } from './invoiceCode';
import { formatDateIndo, formatRupiah, MONTH_NAMES_ID } from './formatters';

/**
 * Calculates promo discount details:
 * Rp 200.000 discount with deadline automatically set to end of H+1 month.
 * e.g. In September 2026 -> deadline is 31 Oktober 2026.
 * In October 2026 -> deadline is 30 November 2026, and so on.
 */
export const getPromoDetails = (refDate = new Date()) => {
  const current = new Date(refDate);
  const year = current.getFullYear();
  const month = current.getMonth(); // 0 to 11

  // End of next month is day 0 of month + 2
  const deadlineDate = new Date(year, month + 2, 0);
  const day = deadlineDate.getDate();
  const monthName = MONTH_NAMES_ID[deadlineDate.getMonth()];
  const deadlineYear = deadlineDate.getFullYear();

  const deadlineText = `${day} ${monthName} ${deadlineYear}`;
  const discountAmount = 200000;

  return {
    discountAmount,
    deadlineDate,
    deadlineDay: day,
    deadlineMonthName: monthName,
    deadlineYear,
    deadlineText,
    promoLabel: `s.d. ${deadlineText}`,
  };
};

export const encodeOrderData = (order) => {
  const fields = [
    order.name || '',
    order.phone || '',
    order.location || '',
    order.date || '',
    order.timeStart || '10.00',
    order.timeEnd || '14.00',
    order.packageCode || '03',
    order.notes || '',
  ];

  return fields
    .map((s) => encodeURIComponent(String(s ?? '').replace(/~/g, '-')))
    .join('~');
};

export const parseOrderData = (searchParams) => {
  const raw = searchParams.get('orderData');
  if (!raw) return null;

  try {
    const parts = raw.split('~');
    return {
      name: decodeURIComponent(parts[0] || '').trim(),
      phone: decodeURIComponent(parts[1] || '').trim(),
      location: decodeURIComponent(parts[2] || '').trim(),
      date: decodeURIComponent(parts[3] || '').trim(),
      timeStart: decodeURIComponent(parts[4] || '10.00').trim(),
      timeEnd: decodeURIComponent(parts[5] || '14.00').trim(),
      packageCode: decodeURIComponent(parts[6] || '03').trim(),
      notes: decodeURIComponent(parts[7] || '').trim(),
    };
  } catch (err) {
    console.error('Failed to parse orderData:', err);
    return null;
  }
};

export const createInvoiceFromOrderData = (orderData, currentPackages = PACKAGE_OPTIONS, seq = '08', settings = {}) => {
  const today = new Date().toISOString().split('T')[0];
  const pkgCode = orderData.packageCode || '03';
  const selectedPkg =
    (currentPackages && currentPackages.find((p) => p.code === pkgCode)) ||
    currentPackages?.[0] || {
      code: '03',
      name: '4 Jam 2R',
      durationHours: 4,
      printType: 'Unlimited 2R',
      defaultPrice: 2500000,
    };

  const promo = getPromoDetails();
  const pkgPrice = Number(selectedPkg.defaultPrice) || 2500000;
  const discountAmount = promo.discountAmount || 200000;
  const grandTotal = Math.max(0, pkgPrice - discountAmount);
  const dpAmount = Math.round(grandTotal * 0.2); // 20% standard DP of net grand total
  const eventDate = orderData.date || today;
  const timeStart = orderData.timeStart || '10.00';
  const timeEnd = orderData.timeEnd || '14.00';

  const initialCode = generateInvoiceCode({
    stageCode: '01', // Stage 01: DP for incoming new bookings
    sequenceNumber: seq,
    invoiceDate: today,
    packageCode: selectedPkg.code,
  });

  const pkgNameClean = selectedPkg.name?.startsWith('Photobooth')
    ? selectedPkg.name
    : `Photobooth ${selectedPkg.name || `${selectedPkg.durationHours} Jam`}`;

  return {
    id: `inv-${Date.now()}`,
    invoiceCode: initialCode,
    invoiceDate: today,
    docType: 'TAGIHAN_DP',
    stageCode: '01',
    sequenceNumber: seq,
    packageCode: selectedPkg.code,
    client: {
      name: (orderData.name || '').toUpperCase(),
      phone: orderData.phone || '',
      location: orderData.location || '',
    },
    event: {
      date: eventDate,
      timeStart,
      timeEnd,
      durationHours: selectedPkg.durationHours || 4,
      printType: selectedPkg.printType || 'Unlimited 2R',
      packageName: pkgNameClean,
    },
    items: [
      {
        id: 'item-1',
        description: `${pkgNameClean}\n${selectedPkg.printType || 'Unlimited 2R'}\n${formatDateIndo(eventDate)}\n${timeStart} - ${timeEnd}`,
        price: pkgPrice,
        paymentType: 'DOWN PAYMENT',
        amountPaid: dpAmount,
      },
      {
        id: 'item-2',
        description: `Promo Diskon Booking\ns.d. ${promo.deadlineText}`,
        price: discountAmount,
        paymentType: 'DISCOUNT',
        amountPaid: -discountAmount,
      },
    ],
    summary: {
      totalPackagePrice: pkgPrice,
      totalAdditionals: 0,
      totalDiscounts: discountAmount,
      grandTotal: grandTotal,
      downPaymentPaid: dpAmount,
      totalPaidSoFar: 0,
      remainingBalance: grandTotal,
    },
    paymentMethod: `${settings.bankName || 'BCA'} TRANSFER`,
    accountNumber: `${settings.bankName || 'BCA'} ${settings.bankAccountNumber || '7045166686'}`,
    accountHolder: settings.bankAccountHolder || 'Sasiera Diva P',
    hasStamp: false,
    notes: orderData.notes || '',
  };
};

export const buildOrderWhatsAppMessage = (order, pkg, studioWhatsapp = '0811-1332-931') => {
  const adminOrderUrl = `https://photobo.pics/?orderData=${encodeOrderData(order)}`;
  const originalPrice = Number(pkg?.defaultPrice) || 2500000;
  const promo = getPromoDetails();
  const finalPrice = Math.max(0, originalPrice - promo.discountAmount);

  return `*FORM ORDER PHOTOBO STUDIO*
----------------------------------------
👤 *Nama Klien:* ${order.name || '-'}
📱 *No. WhatsApp:* ${order.phone || '-'}
📍 *Lokasi Acara:* ${order.location || '-'}
📅 *Tanggal Acara:* ${order.date ? formatDateIndo(order.date) : '-'}
⏰ *Jam Acara:* ${order.timeStart || '10.00'} - ${order.timeEnd || '14.00'}
📸 *Paket Layanan:* [${pkg?.code || '03'}] ${pkg?.name || 'Photobooth'} (${pkg?.printType || 'Unlimited 2R'})
💰 *Harga Normal:* ~${formatRupiah(originalPrice)}~
🏷️ *Diskon Promo:* -${formatRupiah(promo.discountAmount, true)} (s.d. ${promo.deadlineText})
✨ *Total Tarif Paket:* ${formatRupiah(finalPrice)}
${order.notes ? `📝 *Catatan Tambahan:* ${order.notes}\n` : ''}----------------------------------------
Halo Photobo Studio, saya telah mengisi formulir pemesanan di atas. Mohon konfirmasi ketersediaan jadwal dan penerbitan invoice resmi. Terima kasih!

🔗 *Link Pembuatan Invoice (Admin):*
${adminOrderUrl}`;
};
