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
  if (!invoice) return 'https://photobo-invoice-app.vercel.app';

  // Base URL: Use current origin in browser if not localhost, otherwise production Vercel
  const baseUrl =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
      ? `${window.location.origin}/`
      : 'https://photobo-invoice-app.vercel.app/';

  const isLunas =
    invoice.docType === 'BUKTI_LUNAS' ||
    (invoice.summary?.remainingBalance !== undefined && Number(invoice.summary?.remainingBalance) === 0);

  const payload = {
    id: invoice.id || '',
    c: invoice.invoiceCode || '',
    n: invoice.client?.name || '',
    p: invoice.client?.phone || '',
    l: invoice.client?.location || '',
    d: invoice.event?.date || '',
    pkg: invoice.event?.packageName || '',
    tot: invoice.summary?.grandTotal || 0,
    paid: invoice.summary?.totalPaidSoFar || 0,
    rem: invoice.summary?.remainingBalance || 0,
    st: isLunas ? 'LUNAS' : invoice.docType || 'TAGIHAN_PELUNASAN',
    acc: invoice.accountNumber || 'BCA 7045166686',
    dt: invoice.invoiceDate || '',
  };

  const encoded = encodeBase64Url(JSON.stringify(payload));
  return `${baseUrl}?verify=1&v=${encoded}`;
};

export const parseVerificationData = (searchParams) => {
  const v = searchParams.get('v');
  if (v) {
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
        grandTotal: Number(parsed.tot) || 0,
        totalPaid: Number(parsed.paid) || 0,
        remainingBalance: Number(parsed.rem) || 0,
        status: parsed.st,
        accountNumber: parsed.acc,
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
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#160C10',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return null;
  }
};
