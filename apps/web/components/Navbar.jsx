"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to toggle the mobile menu state
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to close the mobile menu after clicking a link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="w-full border-b-2 border-red-500 bg-white shadow-md">
      <div className="container relative mx-auto flex items-center justify-between px-4 py-4 md:py-6">
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="rounded-md bg-red-600 px-4 py-2 font-bold text-white shadow-lg transition-all duration-300 hover:bg-red-700 md:px-6 md:py-2"
          >
            LOGO
          </Link>
        </div>

        {/* Navigation Links - Hidden on mobile, visible on desktop */}
        <div className="hidden flex-grow justify-center space-x-4 md:flex md:space-x-8">
          <Link href="/" className="nav-link">
            HOME
          </Link>
          <Link href="/products" className="nav-link">
            PRODUCT
          </Link>
          <Link href="/about-us" className="nav-link">
            ABOUT US
          </Link>
          <Link href="/contact" className="nav-link">
            CONTACT
          </Link>
        </div>

        {/* Hamburger Menu & Cart Icon */}
        <div className="flex items-center space-x-4">
          <Link
            href="/cart"
            className="text-lg font-medium text-black transition-colors duration-300 hover:text-red-400"
          >
            <ShoppingCart className="h-7 w-7 cursor-pointer text-black transition-colors duration-300 hover:text-red-400" />
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="rounded-md p-2 text-black transition-colors duration-300 hover:text-red-400 md:hidden"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay*/}
      <div
        className={`fixed inset-0 z-50 transform transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? "pointer-events-auto bg-black/50 opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeMobileMenu}
      >
        <div
          className={`fixed inset-y-0 right-0 w-3/4 max-w-sm transform border-l-2 border-red-500 bg-white p-6 shadow-lg transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()} // This prevents closing the menu when clicking inside it
        >
          <div className="flex justify-end">
            <button
              onClick={closeMobileMenu}
              className="text-black transition-colors duration-300 hover:text-red-400"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex flex-col items-end space-y-6 pt-10">
            <Link href="/" onClick={closeMobileMenu} className="mobile-link">
              HOME
            </Link>
            <Link href="/products" onClick={closeMobileMenu} className="mobile-link">
              PRODUCT
            </Link>
            <Link href="/about-us" onClick={closeMobileMenu} className="mobile-link">
              ABOUT US
            </Link>
            <Link href="/contact" onClick={closeMobileMenu} className="mobile-link">
              CONTACT
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
