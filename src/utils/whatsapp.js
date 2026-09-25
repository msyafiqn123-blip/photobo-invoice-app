import { formatRupiah, formatDateIndo } from './formatters';

export const generateWhatsAppMessage = ({ invoice, settings }) => {
  if (!invoice) return '';

  const clientName = invoice.client?.name || 'Kak';
  const invoiceCode = invoice.invoiceCode || '';
  const eventDate = invoice.event?.date ? formatDateIndo(invoice.event.date) : 'hari H';
  const packageName = invoice.event?.packageName || 'Photobooth Package';
  const bankAcc = invoice.accountNumber || settings?.bankAccountNumber || 'BCA 7045166686';
  const bankHolder = invoice.accountHolder || settings?.bankAccountHolder || 'Sasiera Diva P';

  const total = formatRupiah(invoice.summary?.grandTotal, true);
  const dpPaid = formatRupiah(invoice.summary?.downPaymentPaid, true);
  const remaining = formatRupiah(invoice.summary?.remainingBalance, true);

  switch (invoice.docType) {
    case 'TAGIHAN_DP':
      return `Halo Kak *${clientName}*, salam hangat dari *Photobo Studio*! 👋📸

Berikut adalah rincian *Tagihan Booking Fee* untuk penguncian jadwal Photobooth acara Kakak:
📄 *No. Invoice:* ${invoiceCode}
📅 *Tanggal Acara:* ${eventDate}
📦 *Paket:* ${packageName}
💰 *Total Biaya:* ${total}
💳 *DP yang Perlu Ditransfer:* ${dpPaid}

Pembayaran dapat ditransfer melalui:
🏦 *${bankAcc}*
a.n *${bankHolder}*

Mohon konfirmasi bukti transfer ke nomor WhatsApp ini ya kak agar jadwal tanggal langsung kami lock. Terima kasih banyak! ✨`;

    case 'TAGIHAN_PELUNASAN':
      return `Halo Kak *${clientName}*, salam dari *Photobo Studio*! 👋📸

Mengingatkan kembali menjelang hari pelaksanaan Photobooth pada *${eventDate}*, berikut adalah rincian *Tagihan Pelunasan*:
📄 *No. Invoice:* ${invoiceCode}
📦 *Paket:* ${packageName}
💰 *Total Biaya:* ${total}
💵 *DP Terbayar:* ${dpPaid}
💳 *Sisa Pembayaran yang Perlu Dilunasi:* ${remaining}

Pelunasan dapat ditransfer ke:
🏦 *${bankAcc}*
a.n *${bankHolder}*
*(Maksimal H-1 tanggal pelaksanaan)*

Terima kasih atas kerjasamanya, sampai jumpa di lokasi acara! 🎉`;

    case 'BUKTI_LUNAS':
      return `Halo Kak *${clientName}*! 🎉

Terima kasih banyak, pembayaran pelunasan Photobooth untuk acara tanggal *${eventDate}* telah kami terima dengan status *LUNAS*:
📄 *No. Invoice:* ${invoiceCode}
💰 *Total:* ${total}
✨ *Sisa Pembayaran:* Rp0 (LUNAS)

Terlampir dokumen resmi bukti pelunasan sah dari Photobo Studio. Senang sekali bisa menjadi bagian dari momen spesial Kakak! 📸💖`;

    case 'BUKTI_DP':
    default:
      return `Halo Kak *${clientName}*! ✨

Terima kasih banyak! Pembayaran *Down Payment (DP)* untuk acara bersama Photobo Studio tanggal *${eventDate}* telah kami terima:
📄 *No. Invoice:* ${invoiceCode}
📦 *Paket:* ${packageName}
💵 *DP Diterima:* ${dpPaid}
💳 *Sisa Pembayaran:* ${remaining} *(Pelunasan maksimal H-1 acara)*

Jadwal acara Kakak sudah terkonfirmasi resmi di agenda tim Photobo Studio. Terlampir nota pembayaran sah dari kami. Terima kasih! 📸✨`;
  }
};

export const getWhatsAppLink = (phoneNumber, text) => {
  if (!phoneNumber) return '';
  // Normalize phone number to international format 62xxx
  let clean = phoneNumber.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (!clean.startsWith('62')) {
    clean = '62' + clean;
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
};
