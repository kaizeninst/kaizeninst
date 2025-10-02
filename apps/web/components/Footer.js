"use client";
import Link from "next/link";

export default function Footer() {
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about-us", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="w-full border-t border-gray-300 bg-gray-50 py-12 text-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 pb-8 md:grid-cols-3">
          {/* Logo */}
          <div className="flex flex-col items-start">
            <button className="bg-primary cursor-pointer rounded-md px-6 py-2 font-bold text-white shadow-lg">
              LOGO
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact With Us</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: admin@kaizeninst.com</li>
              <li>Phone: (+66) 84-123-1234</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-300 pt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Kaizeninst. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
