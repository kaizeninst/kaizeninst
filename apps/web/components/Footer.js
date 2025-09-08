"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-300 bg-gray-50 py-12 text-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 pb-8 md:grid-cols-3">
          <div className="flex flex-col items-start">
            <button className="rounded-md bg-red-600 px-6 py-2 font-bold text-white shadow-lg transition-all duration-300 hover:bg-red-700">
              LOGO
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Link</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="transition-colors hover:text-red-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-red-600">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="transition-colors hover:text-red-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-red-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact With Us</h3>
            <ul className="space-y-2">
              <li>Email: admin@kaizeninst.com</li>
              <li>Phone: (+66) 84-123-1234</li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 border-t border-gray-300 pt-4 text-center text-sm">
          &copy; 2028 Kaizeninst. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
