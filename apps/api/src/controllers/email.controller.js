// ============================================================
//  RESEND EMAIL CONTROLLER
// ============================================================

import { Resend } from "resend";

/**
 * SEND CONTACT EMAIL
 * POST /api/email/contact
 */
export const sendContactEmail = async (req, res) => {
  try {
    const { fullName, email, subject, message, hp } = req.body || {};

    // Honeypot (bot protection)
    if (hp) {
      return res.json({ ok: true });
    }

    // Basic validation
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Init Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Build HTML email
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.6;color:#111">
        <h2>New Contact Message</h2>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;background:#fafafa;">
          <tr>
            <td style="font-weight:600;white-space:nowrap;">Full Name</td>
            <td>${String(fullName)}</td>
          </tr>
          <tr>
            <td style="font-weight:600;white-space:nowrap;">Email</td>
            <td>${String(email)}</td>
          </tr>
          <tr>
            <td style="font-weight:600;white-space:nowrap;">Subject</td>
            <td>${String(subject)}</td>
          </tr>
          <tr>
            <td style="font-weight:600;white-space:nowrap;">Message</td>
            <td style="white-space:pre-wrap">${String(message)}</td>
          </tr>
        </table>
      </div>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: `Kaizeninst Website <${process.env.RESEND_FROM}>`,
      to: [process.env.ADMIN_EMAIL ?? "delivered@resend.dev"],
      subject: `[Contact] ${subject}`,
      html,
    });

    if (error) {
      console.error("Resend API error:", error);
      return res.status(500).json({ error: "Email sending failed" });
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error("POST /api/email/contact error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
