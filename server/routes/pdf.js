import express from "express";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const router = express.Router();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: 'cxmxgzruokkc cjso'.replace(/\s/g, '') 
    }
});



const generateBookingPDF = (booking) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // --- HEADER ---
    doc.fontSize(22).fillColor("green").text("✅ Confirmed", { align: "center" });
    doc.moveDown();
    doc.fontSize(18).fillColor("black").text("Your booking details", { align: "center" });
    doc.moveDown(2);

    // --- Reference Section ---
    doc.rect(40, doc.y, 520, 60).fill("#F9FAFB").stroke();
    doc.fillColor("black").fontSize(12).text(`Customer reference: ${booking.id}`, 50, doc.y - 50);
    doc.text(`Booking reference: ${booking.provider_ref || "N/A"}`, 50, doc.y + 5);
    doc.moveDown(3);

    // --- Flight Section ---
    doc.fontSize(16).fillColor("black")
      .text(`${booking.origin_city || "Origin"} (${booking.origin_code || "XXX"}) → ${booking.destination_city || "Destination"} (${booking.destination_code || "YYY"})`);
    doc.moveDown();

    doc.rect(40, doc.y, 520, 80).fill("#F3F4F6").stroke();
    doc.fillColor("black").fontSize(12).text(
      `${booking.departureDate || ""} ${booking.departureTime || ""} - ${booking.arrivalDate || ""} ${booking.arrivalTime || ""}`,
      50,
      doc.y - 70
    );
    doc.text(`${booking.stops || "Direct"} · ${booking.duration || ""} · ${booking.cabinClass || "Economy"}`, 50, doc.y + 10);
    doc.text(`${booking.airline || ""} · ${booking.flightNumber || ""}`, 50, doc.y + 25);
    doc.moveDown(6);

    // --- Traveler Details ---
    doc.fontSize(14).fillColor("black").text("Traveler details", { underline: true });
    booking.passengers?.forEach((p, i) => {
      doc.moveDown(0.5);
      doc.fontSize(12).text(`${i + 1}. ${p.first_name} ${p.last_name}`);
    });
    doc.moveDown();

    // --- Luggage ---
    doc.fontSize(14).fillColor("black").text("Luggage", { underline: true });
    doc.fontSize(12).fillColor("gray").text("Total number of bags included for all travelers");
    doc.moveDown();
    doc.fillColor("black").text("Personal item: 1 (fits under the seat)");
    doc.text("Carry-on: Not included");
    doc.text("Checked bags: Not included");
    doc.moveDown();

    // --- Payment ---
    doc.fontSize(14).fillColor("black").text("Payment", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Ticket: ${booking.total_price} EUR`);
    doc.moveDown();
    doc.fontSize(14).text(`Total: ${booking.total_price} EUR`, { underline: true });
    doc.moveDown(2);

    // --- Contact ---
    doc.fontSize(14).fillColor("black").text("Contact details", { underline: true });
    doc.fontSize(12).text(`Email: ${booking.email}`);
    if (booking.passengers?.[0]?.phone) {
      doc.text(`Phone: ${booking.passengers[0].phone}`);
    }
    doc.moveDown(2);

    // --- Footer Warning ---
    doc.fillColor("red").fontSize(10).text(
      "⚠ Important: This is your agency confirmation.\nPlease visit the airline's website to complete your online check-in using your airline reference."
    );

    doc.end();
  });
};


// ✅ API endpoint to send confirmation email
router.post("/send-confirmation", async (req, res) => {
  try {
    const booking = req.body; // Get booking data from frontend

    const pdfBuffer = await generateBookingPDF(booking);

    // Send email with attachment
    await transporter.sendMail({
      from: `"My Travel Agency" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: "Your Booking Confirmation",
      text: `Dear ${booking.travelerName}, your booking is confirmed.`,
      attachments: [
        {
          filename: `booking-${booking.agencyRef}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    res.json({ success: true, message: "Confirmation email sent!" });
  } catch (err) {
    console.error("❌ Error sending confirmation:", err);
    res.status(500).json({ error: "Failed to send confirmation email" });
  }
});

export default router;

