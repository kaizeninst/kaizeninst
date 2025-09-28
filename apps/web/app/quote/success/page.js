"use client";

import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Phone, Mail, Clock, Check } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-grow px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-8 py-8">
          {/* Checkmark */}
          <div className="flex justify-center">
            <div className="h-30 w-30 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-500">
              <Check color="white" className="h-20 w-20" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-2xl font-bold text-gray-800 sm:text-4xl">
            Quote Request Submitted Successfully!
          </h1>
          <p className="text-center text-base text-gray-600 sm:text-lg">
            Thank you for your interest. We'll review your requirements and get back to you soon.
          </p>

          {/* Reference card */}
          <div className="rounded-lg bg-white pt-4 shadow-md">
            <div className="text-center font-semibold">
              <h1 className="text-2xl">Reference Number</h1>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="inline-block w-full border bg-[#F9FAFC] px-4 py-2 text-2xl font-bold">
                <h1 className="text-[#FF0000]">QR-123AGV25</h1>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Please save this reference number for your records.
              </p>
            </div>
          </div>

          {/* Steps card */}
          <div className="rounded-lg bg-white pt-4 shadow-md">
            <div className="text-center text-2xl font-semibold">
              <h1 className="">What happens next?</h1>
            </div>
            <div className="space-y-6 p-6">
              {[
                {
                  step: 1,
                  title: "Review & Analysis",
                  desc: "Our team will review your requirements and analyze your needs.",
                },
                {
                  step: 2,
                  title: "Custom Quote Preparation",
                  desc: "We’ll prepare a detailed quote tailored to your specific needs.",
                },
                {
                  step: 3,
                  title: "Response & Follow-up",
                  desc: "You’ll receive our quote via email within 24 hours.",
                },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FFB8B8] font-bold text-white">
                    <h1 className="text-[#A80000]">{s.step}</h1>
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="text-gray-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="mx-auto rounded-lg bg-blue-50 p-6 text-center shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-blue-800 sm:text-2xl">
              Need immediate assistance?
            </h2>
            <div className="flex flex-col items-center justify-around gap-6 sm:flex-row sm:gap-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <Phone className="h-6 w-6" />
                <span>+66 12-123-1234</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <Mail className="h-6 w-6" />
                <span>admin@kaizeninst.com</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <Clock className="h-6 w-6" />
                <span>Mon-Fri 9AM-6PM</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="w-full rounded-lg bg-[#f80000] px-6 py-3 text-center text-white shadow transition-colors hover:bg-[#A80000] sm:w-auto"
            >
              Return to Home
            </Link>
            <Link
              href="/products"
              className="w-full rounded-lg border border-red-600 px-6 py-3 text-center text-red-600 shadow transition-colors hover:bg-blue-50 sm:w-auto"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
