import nodemailer from "nodemailer";

export const sendContactEmail = async (req, res) => {
  try {
    const { fullName, email, subject, message, hp } = req.body || {};

    // ✅ honeypot (กันบอท)
    if (hp) return res.json({ ok: true });

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ สร้าง transporter (ใช้ SMTP ของ Gmail)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.gmail.com
      port: Number(process.env.SMTP_PORT || 587), // 587 = TLS
      secure: process.env.SMTP_SECURE === "true", // false = TLS, true = SSL(465)
      auth: {
        user: process.env.SMTP_USER, // admin@kaizeninst.com
        pass: process.env.SMTP_PASS, // app password 16 ตัว
      },
    });

    // ✅ เตรียมเนื้อหาอีเมล
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial;">
        <h2>📩 New Contact Message</h2>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;background:#fafafa;">
          <tr><td><strong>Full Name</strong></td><td>${fullName}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Subject</strong></td><td>${subject}</td></tr>
          <tr><td style="vertical-align:top"><strong>Message</strong></td><td style="white-space:pre-wrap">${message}</td></tr>
        </table>
      </div>
    `;

    // ✅ ส่งอีเมลไปยัง admin
    await transporter.sendMail({
      from: `"Kaizeninst Website" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `[Contact] ${subject}`,
      replyTo: email,
      html,
    });

    res.json({ ok: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("POST /api/email/contact error:", err);
    res.status(500).json({ error: "Email sending failed" });
  }
};
