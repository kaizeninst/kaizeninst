"use client";
import { useState, useMemo } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    hp: "", // honeypot
  });
  const [status, setStatus] = useState({ state: "idle", msg: "" }); // idle | loading | success | error

  const isValid = useMemo(() => {
    const { fullName, email, subject, message } = formData;
    return fullName.trim() && /\S+@\S+\.\S+/.test(email) && subject.trim() && message.trim();
  }, [formData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setStatus({ state: "loading", msg: "" });

    try {
      const res = await fetch("/api/email/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to send message");

      setStatus({
        state: "success",
        msg: "Your message has been sent. We'll get back to you shortly.",
      });
      setFormData({ fullName: "", email: "", subject: "", message: "", hp: "" });
    } catch (err) {
      setStatus({ state: "error", msg: err.message || "Something went wrong" });
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 md:px-12 lg:px-16">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Contact Us
          </h1>
          <p className="text-[color:color-mix(in srgb,var(--secondary) 85%,white)] mt-3">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        {/* Status banners */}
        {status.state === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 shadow-sm"
            style={{ background: "color-mix(in srgb, #22c55e 15%, white)", color: "#166534" }}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">{status.msg}</span>
          </motion.div>
        )}
        {status.state === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 shadow-sm"
            style={{
              background: "color-mix(in srgb, var(--primary) 10%, white)",
              color: "var(--primary)",
            }}
          >
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{status.msg}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 shadow-sm backdrop-blur-md"
            style={{
              background: "color-mix(in srgb, var(--background) 86%, white)",
              border: "1px solid color-mix(in srgb, var(--secondary) 12%, transparent)",
            }}
          >
            <h2 className="mb-5 text-2xl font-semibold text-[var(--foreground)]">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot (hidden) */}
              <input
                type="text"
                name="hp"
                value={formData.hp}
                onChange={handleChange}
                className="hidden"
                autoComplete="off"
                tabIndex={-1}
              />

              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-[var(--secondary)]"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border bg-white px-3 py-2 shadow-sm outline-none transition"
                  style={{
                    borderColor: "color-mix(in srgb, var(--secondary) 30%, transparent)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--secondary)]"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border bg-white px-3 py-2 shadow-sm outline-none transition"
                  style={{ borderColor: "color-mix(in srgb, var(--secondary) 30%, transparent)" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-[var(--secondary)]"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border bg-white px-3 py-2 shadow-sm outline-none transition"
                  style={{ borderColor: "color-mix(in srgb, var(--secondary) 30%, transparent)" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-[var(--secondary)]"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full resize-y rounded-xl border bg-white px-3 py-2 shadow-sm outline-none transition"
                  style={{ borderColor: "color-mix(in srgb, var(--secondary) 30%, transparent)" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  required
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                disabled={!isValid || status.state === "loading"}
                type="submit"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "var(--primary)",
                  boxShadow:
                    "0 10px 20px -10px color-mix(in srgb, var(--primary) 60%, transparent)",
                }}
              >
                {status.state === "loading" ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 transition group-hover:translate-x-0.5" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-2xl p-6 shadow-sm backdrop-blur-md"
            style={{
              background: "color-mix(in srgb, var(--background) 90%, white)",
              border: "1px solid color-mix(in srgb, var(--secondary) 12%, transparent)",
            }}
          >
            <h2 className="mb-5 text-2xl font-semibold text-[var(--foreground)]">Get in touch</h2>

            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm"
                style={{
                  border: "1px solid color-mix(in srgb, var(--secondary) 10%, transparent)",
                }}
              >
                <div className="bg-[var(--accent)]/20 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Mail className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Email</h3>
                  <p className="text-[var(--secondary)]">admin@kaizeninst.com</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm"
                style={{
                  border: "1px solid color-mix(in srgb, var(--secondary) 10%, transparent)",
                }}
              >
                <div className="bg-[var(--accent)]/20 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Phone className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Phone</h3>
                  <p className="text-[var(--secondary)]">+66 (0) 891882788</p>
                  <p className="text-[var(--secondary)]">Mon–Fri 9:00–18:00 ICT</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm"
                style={{
                  border: "1px solid color-mix(in srgb, var(--secondary) 10%, transparent)",
                }}
              >
                <div className="bg-[var(--accent)]/20 flex h-12 w-12 items-center justify-center rounded-lg">
                  <MapPin className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Address</h3>
                  <p className="text-[var(--secondary)]">
                    56/2 Moo 21, Nimitmai Rd, Tambol Lam Lukka, Lam Lukka,
                  </p>
                  <p className="text-[var(--secondary)]">Pathumthani 12150, Thailand</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
