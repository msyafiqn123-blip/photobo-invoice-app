import QRCode from 'qrcode';

// Helper to encode string to UTF-8 base64url
export const encodeBase64Url = (str) => {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    return encodeURIComponent(str);
  }
};

// Helper to decode UTF-8 base64url
export const decodeBase64Url = (base64url) => {
  try {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return decodeURIComponent(base64url);
  }
};

export const getVerificationUrl = (invoice) => {
  if (!invoice) return 'https://photobo.pics/';

  // Use the ultra-short custom domain photobo.pics for minimal QR density
  const baseUrl = 'https://photobo.pics/';

  const isLunas =
    invoice.docType === 'BUKTI_LUNAS' ||
    (invoice.summary?.remainingBalance !== undefined && Number(invoice.summary?.remainingBalance) === 0);

  // Compact code: e.g. "INV 01.08/I/03/26" -> "01.08-I-03-26"
  const rawCode = (invoice.invoiceCode || '').trim();
  const cleanCode = rawCode.replace(/^INV\s*/i, '').replace(/\//g, '-');

  const name = (invoice.client?.name || '').trim();
  const phone = (invoice.client?.phone || '').replace(/\D/g, '');
  const loc = (invoice.client?.location || '').trim();
  const date = (invoice.event?.date || '').trim();

  // Shorten package name: "Photobooth 4 Jam" -> "4 Jam"
  const rawPkg = invoice.event?.packageName || 'Photobooth';
  const pkg = rawPkg.replace(/^Photobooth\s*/i, '').trim();

  // Shorten print type: "Unlimited 2R" -> "2R"
  const rawPt =
    invoice.event?.printType ||
    invoice.items?.[0]?.description?.split('\n')?.[1] ||
    'Unlimited 2R';
  const pt = rawPt.replace(/^Unlimited\s*/i, '').trim();

  // Prices in thousands (k) to drastically reduce digits: 2500000 -> 2500
  const packagePrice =
    Number(invoice.summary?.totalPackagePrice) ||
    Number(invoice.items?.[0]?.price) ||
    0;
  const prK = Math.round(packagePrice / 1000);
  const dcK = Math.round((Number(invoice.summary?.totalDiscounts) || 0) / 1000);
  const adK = Math.round((Number(invoice.summary?.totalAdditionals) || 0) / 1000);
  const paidK = Math.round((Number(invoice.summary?.totalPaidSoFar) || 0) / 1000);
  const isLun = isLunas ? 1 : 0;

  const fields = [
    cleanCode,
    name,
    phone,
    loc,
    date,
    pkg,
    pt,
    prK,
    dcK,
    adK,
    paidK,
    isLun,
  ];

  // Encode each component and delimit with ~ (tilde is unreserved in URLs)
  const compactPayload = fields
    .map((s) => encodeURIComponent(String(s ?? '').replace(/~/g, '-')))
    .join('~');

  return `${baseUrl}?v=${compactPayload}`;
};

export const parseVerificationData = (searchParams) => {
  const v = searchParams.get('v');
  if (v) {
    // 1. New ultra-compact format delimited by '~'
    if (v.includes('~')) {
      try {
        const parts = v.split('~');
        const rawCode = decodeURIComponent(parts[0] || '').trim();
        // Restore formatted code e.g. "01.08-I-03-26" -> "INV 01.08/I/03/26"
        let invoiceCode = rawCode;
        if (invoiceCode && !invoiceCode.toUpperCase().startsWith('INV')) {
          invoiceCode = `INV ${invoiceCode.replace(/-/g, '/')}`;
        }

        const clientName = decodeURIComponent(parts[1] || '').trim() || 'Klien';
        const clientPhone = decodeURIComponent(parts[2] || '').trim();
        const clientLocation = decodeURIComponent(parts[3] || '').trim();
        const eventDate = decodeURIComponent(parts[4] || '').trim();

        // Restore package name
        let rawPkg = decodeURIComponent(parts[5] || '').trim();
        const packageName = rawPkg
          ? (rawPkg.toLowerCase().startsWith('photobooth') ? rawPkg : `Photobooth ${rawPkg}`)
          : 'Photobooth';

        // Restore print type
        let rawPt = decodeURIComponent(parts[6] || '').trim();
        const printType = rawPt
          ? (rawPt.toLowerCase().startsWith('unlimited') ? rawPt : `Unlimited ${rawPt}`)
          : 'Unlimited 2R';

        // Multiply thousands back to Rupiah
        const packagePrice = (Number(parts[7]) || 0) * 1000;
        const discounts = (Number(parts[8]) || 0) * 1000;
        const additionals = (Number(parts[9]) || 0) * 1000;
        let totalPaid = (Number(parts[10]) || 0) * 1000;
        const isLunas = parts[11] === '1';

        const grandTotal = Math.max(0, packagePrice + additionals - discounts);
        if (isLunas && totalPaid === 0) {
          totalPaid = grandTotal;
        }
        const remainingBalance = isLunas ? 0 : Math.max(0, grandTotal - totalPaid);

        return {
          id: `inv-${rawCode}`,
          invoiceCode,
          clientName,
          clientPhone,
          clientLocation,
          eventDate,
          packageName,
          printType,
          packagePrice,
          discounts,
          additionals,
          grandTotal,
          totalPaid,
          remainingBalance,
          status: isLunas ? 'LUNAS' : (totalPaid > 0 ? 'DP_DITERIMA' : 'TAGIHAN_PELUNASAN'),
          accountNumber: 'BCA 7045166686 a.n. Sasiera Diva P',
          invoiceDate: eventDate,
          isLunas,
        };
      } catch (err) {
        console.warn('Error parsing compact verification payload:', err);
      }
    }

    // 2. Legacy Base64 JSON fallback for older invoices
    try {
      const decodedJson = decodeBase64Url(v);
      const parsed = JSON.parse(decodedJson);
      return {
        id: parsed.id,
        invoiceCode: parsed.c,
        clientName: parsed.n,
        clientPhone: parsed.p,
        clientLocation: parsed.l,
        eventDate: parsed.d,
        packageName: parsed.pkg,
        printType: parsed.pt || 'Unlimited 2R',
        packagePrice: Number(parsed.pr) || 0,
        discounts: Number(parsed.dc) || 0,
        additionals: Number(parsed.ad) || 0,
        grandTotal: Number(parsed.tot) || 0,
        totalPaid: Number(parsed.paid) || 0,
        remainingBalance: Number(parsed.rem) || 0,
        status: parsed.st,
        accountNumber: parsed.acc || 'BCA 7045166686 a.n. Sasiera Diva P',
        invoiceDate: parsed.dt,
        isLunas: parsed.st === 'LUNAS' || Number(parsed.rem) === 0,
      };
    } catch (err) {
      console.warn('Error parsing base64url verification payload:', err);
    }
  }

  // Fallback direct params
  const code = searchParams.get('code') || 'INV 01.08/I/03/26';
  const client = searchParams.get('client') || 'Klien';
  const rem = Number(searchParams.get('rem') || 0);
  const total = Number(searchParams.get('total') || 0);
  const status = searchParams.get('status') || (rem === 0 ? 'LUNAS' : 'BELUM_LUNAS');

  return {
    invoiceCode: code,
    clientName: client,
    remainingBalance: rem,
    grandTotal: total,
    status,
    isLunas: status === 'LUNAS' || rem === 0,
  };
};

export const generateQrDataUrl = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: 'L',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return null;
  }
};
