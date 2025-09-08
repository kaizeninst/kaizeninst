"use client";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submissionStatus, setSubmissionStatus] =
    (useState < "idle") | "success" | ("error" > "idle");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);

    setTimeout(() => {
      setSubmissionStatus("success");
      setFormData({ fullName: "", email: "", subject: "", message: "" });
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="p-6 sm:p-8 md:p-12 lg:p-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Contact Us</h1>
          <p className="text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>

          {submissionStatus === "success" && (
            <div className="rounded-lg bg-green-100 p-4 text-center font-medium text-green-700">
              Thank you for your message! We will get back to you soon.
            </div>
          )}

          {/* Two-column layout (stacked on mobile) */}
          <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-8">
            {/* Left: Form */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-2xl font-bold">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-red-600 px-6 py-3 text-white shadow transition-colors hover:bg-red-700"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Right: Contact Info */}
            <div className="rounded-lg bg-gray-50 p-6 shadow-md">
              <h2 className="mb-4 text-2xl font-bold">Get in touch</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Email</h3>
                  <p className="text-gray-600">support@store.com</p>
                  <p className="text-gray-600">sales@store.com</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Phone</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-gray-600">Mon-Fri 9am-6pm EST</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Address</h3>
                  <p className="text-gray-600">123 Business Street</p>
                  <p className="text-gray-600">Suite 100</p>
                  <p className="text-gray-600">New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
