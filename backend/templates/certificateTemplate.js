import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const generateCertificatePDF = async (studentName, courseTitle, dateText) => {
  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

  const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const { width, height } = page.getSize();

  // Draw background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.95, 0.98, 0.99),
  });

  // Draw outer border
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: rgb(0.2, 0.6, 0.6),
    borderWidth: 5,
  });

  // Draw inner border
  page.drawRectangle({
    x: 50,
    y: 50,
    width: width - 100,
    height: height - 100,
    borderColor: rgb(0.2, 0.6, 0.6),
    borderWidth: 1,
  });

  // Draw content
  const titleText = "CERTIFICATE OF COMPLETION";
  const titleWidth = fontTitle.widthOfTextAtSize(titleText, 36);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 120,
    size: 36,
    font: fontTitle,
    color: rgb(0.1, 0.3, 0.4),
  });

  const presentText = "This is to certify that";
  const presentWidth = fontRegular.widthOfTextAtSize(presentText, 18);
  page.drawText(presentText, {
    x: (width - presentWidth) / 2,
    y: height - 180,
    size: 18,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  const nameWidth = fontTitle.widthOfTextAtSize(studentName, 42);
  page.drawText(studentName, {
    x: (width - nameWidth) / 2,
    y: height - 260,
    size: 42,
    font: fontTitle,
    color: rgb(0.1, 0.4, 0.4),
  });

  page.drawLine({
    start: { x: width / 2 - 150, y: height - 280 },
    end: { x: width / 2 + 150, y: height - 280 },
    thickness: 2,
    color: rgb(0.8, 0.8, 0.8),
  });

  const completeText = "has successfully completed the course";
  const completeWidth = fontRegular.widthOfTextAtSize(completeText, 16);
  page.drawText(completeText, {
    x: (width - completeWidth) / 2,
    y: height - 330,
    size: 16,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Truncate course title if too long to prevent overflowing
  let displayTitle = courseTitle;
  if (displayTitle.length > 50) {
    displayTitle = displayTitle.substring(0, 47) + "...";
  }

  const courseWidth = fontTitle.widthOfTextAtSize(displayTitle, 28);
  page.drawText(displayTitle, {
    x: (width - courseWidth) / 2,
    y: height - 390,
    size: 28,
    font: fontTitle,
    color: rgb(0.2, 0.6, 0.6),
  });

  // Bottom signatures
  const dateBoxX = 150;
  const bottomY = 120;

  page.drawText(dateText, {
    x: dateBoxX,
    y: bottomY + 20,
    size: 14,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawLine({
    start: { x: dateBoxX - 20, y: bottomY + 10 },
    end: { x: dateBoxX + 160, y: bottomY + 10 },
    thickness: 1,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText("Date", {
    x: dateBoxX + 50,
    y: bottomY - 10,
    size: 12,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  const sigText = "AI-Mentor";
  const sigBoxX = width - 300;
  page.drawText(sigText, {
    x: sigBoxX + 40,
    y: bottomY + 20,
    size: 24,
    font: fontOblique,
    color: rgb(0.1, 0.3, 0.4),
  });
  page.drawLine({
    start: { x: sigBoxX, y: bottomY + 10 },
    end: { x: sigBoxX + 200, y: bottomY + 10 },
    thickness: 1,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText("Authorized Signature", {
    x: sigBoxX + 30,
    y: bottomY - 10,
    size: 12,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  return await pdfDoc.save();
};
