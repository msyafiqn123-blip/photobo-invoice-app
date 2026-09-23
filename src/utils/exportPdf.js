import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Render invoice DOM element to high-res jsPDF instance & Blob
 */
export const getInvoicePdfBlob = async (elementId, paperSize = 'a5') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  // Create an unconstrained fixed wrapper outside the React DOM hierarchy
  // to completely eliminate any clipping from parent containers with overflow: hidden or transform scale
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '794px';
  wrapper.style.height = '1123px';
  wrapper.style.zIndex = '-99999';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.overflow = 'visible';
  wrapper.style.opacity = '1';
  wrapper.style.margin = '0';
  wrapper.style.padding = '0';
  wrapper.style.background = '#C1B6A4';

  const clone = element.cloneNode(true);
  clone.id = 'invoice-document-capture-clone';
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.maxWidth = '794px';
  clone.style.height = '1123px';
  clone.style.minHeight = '1123px';
  clone.style.maxHeight = '1123px';
  clone.style.boxSizing = 'border-box';
  clone.style.overflow = 'hidden';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Wait for clone images & fonts to settle
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const canvas = await html2canvas(clone, {
      scale: 2.5, // 2.5x yields ~2000x2800 (300+ DPI print quality for A5)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#C1B6A4',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const isA5 = paperSize.toLowerCase() === 'a5';
    const pdfWidth = isA5 ? 148 : 210;
    const pdfHeight = isA5 ? 210 : 297;

    // A5 dimensions in mm: 148 x 210
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isA5 ? 'a5' : 'a4',
      compress: true,
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    const blob = pdf.output('blob');
    return { blob, pdf };
  } catch (error) {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
    console.error('Error generating PDF blob:', error);
    throw error;
  }
};

/**
 * Export invoice element to high-res PDF and trigger file download
 */
export const downloadInvoicePdf = async (elementId, filename = 'invoice.pdf', paperSize = 'a5') => {
  const result = await getInvoicePdfBlob(elementId, paperSize);
  if (!result) return false;
  result.pdf.save(filename);
  return true;
};

/**
 * Trigger native browser print for 100% pure vector rendering
 */
export const printInvoice = () => {
  window.print();
};
