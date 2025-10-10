// ============================================================
//  CONTACT EMAIL CONTROLLER
// ============================================================

import nodemailer from "nodemailer";

/* ============================================================
   SEND CONTACT EMAIL (POST /api/email/contact)
   - Validate required fields
   - Use honeypot to prevent bot submissions
   - Send email via SMTP (config from environment variables)
   ============================================================ */
export const sendContactEmail = async (req, res) => {
  try {
    const { fullName, email, subject, message, hp } = req.body || {};

    // Honeypot: if filled, treat as bot and return success silently
    if (hp) {
      return res.json({ ok: true });
    }

    // Basic validation
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Optional: minimal email pattern check (defensive)
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g. smtp.gmail.com
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true", // true for 465 (SSL), false for 587 (TLS)
      auth: {
        user: process.env.SMTP_USER, // e.g. admin@kaizeninst.com
        pass: process.env.SMTP_PASS, // 16-char app password
      },
    });

    // Build email HTML content (no emoji)
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.6;color:#111">
        <h2>New Contact Message</h2>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;background:#fafafa;">
          <tr>
            <td style="font-weight:600;vertical-align:top;white-space:nowrap;">Full Name</td>
            <td>${String(fullName)}</td>
          </tr>
          <tr>
            <td style="font-weight:600;vertical-align:top;white-space:nowrap;">Email</td>
            <td>${String(email)}</td>
          </tr>
          <tr>
            <td style="font-weight:600;vertical-align:top;white-space:nowrap;">Subject</td>
            <td>${String(subject)}</td>
          </tr>
          <tr>
            <td style="font-weight:600;vertical-align:top;white-space:nowrap;">Message</td>
            <td style="white-space:pre-wrap">${String(message)}</td>
          </tr>
        </table>
      </div>
    `;

    // Send email to admin
    await transporter.sendMail({
      from: `"Kaizeninst Website" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `[Contact] ${subject}`,
      replyTo: email,
      html,
    });

    return res.json({ ok: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("POST /api/email/contact error:", error);
    return res.status(500).json({ error: "Email sending failed" });
  }
};
