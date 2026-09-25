import { generateInvoiceCode, PACKAGE_OPTIONS } from './invoiceCode';
import { formatDateIndo, formatRupiah } from './formatters';

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

  const pkgPrice = Number(selectedPkg.defaultPrice) || 2500000;
  const dpAmount = Math.round(pkgPrice * 0.2); // 20% standard DP
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
    ],
    summary: {
      totalPackagePrice: pkgPrice,
      totalAdditionals: 0,
      totalDiscounts: 0,
      grandTotal: pkgPrice,
      downPaymentPaid: dpAmount,
      totalPaidSoFar: 0,
      remainingBalance: pkgPrice,
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

  return `*FORM ORDER PHOTOBO STUDIO*
----------------------------------------
👤 *Nama Klien:* ${order.name || '-'}
📱 *No. WhatsApp:* ${order.phone || '-'}
📍 *Lokasi Acara:* ${order.location || '-'}
📅 *Tanggal Acara:* ${order.date ? formatDateIndo(order.date) : '-'}
⏰ *Jam Acara:* ${order.timeStart || '10.00'} - ${order.timeEnd || '14.00'}
📸 *Paket Layanan:* [${pkg?.code || '03'}] ${pkg?.name || 'Photobooth'} (${pkg?.printType || 'Unlimited 2R'})
💰 *Harga Paket:* ${formatRupiah(pkg?.defaultPrice || 2500000)}
${order.notes ? `📝 *Catatan Tambahan:* ${order.notes}\n` : ''}----------------------------------------
Halo Photobo Studio, saya telah mengisi formulir pemesanan di atas. Mohon konfirmasi ketersediaan jadwal dan penerbitan invoice resmi. Terima kasih!

🔗 *Link Pembuatan Invoice (Admin):*
${adminOrderUrl}`;
};
