"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const count = storedCart.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  return (
    <nav className="w-full border-b-2 border-red-500 bg-white shadow-md">
      <div className="container relative mx-auto flex items-center justify-between px-4 py-4 md:py-6">
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="rounded-md bg-red-600 px-4 py-2 font-bold text-white shadow-lg transition-all duration-300 md:px-6 md:py-2"
          >
            LOGOs
          </Link>
        </div>

        <div className="hidden flex-grow justify-center space-x-4 md:flex md:space-x-8">
          <Link href="/" className="nav-link hover:text-[#A90000]">
            HOME
          </Link>
          <Link href="/products" className="nav-link hover:text-[#A90000]">
            PRODUCT
          </Link>
          <Link href="/about-us" className="nav-link hover:text-[#A90000]">
            ABOUT US
          </Link>
          <Link href="/contact" className="nav-link hover:text-[#A90000]">
            CONTACT
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-7 w-7 cursor-pointer text-black hover:text-red-400" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-black hover:text-red-400 md:hidden"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 transform transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto bg-black/50 opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`fixed inset-y-0 right-0 w-3/4 max-w-sm transform border-l-2 border-red-500 bg-white p-6 shadow-lg transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-black hover:text-red-400"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex flex-col items-end space-y-6 pt-10">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link">
              HOME
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-link"
            >
              PRODUCT
            </Link>
            <Link
              href="/about-us"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-link"
            >
              ABOUT US
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-link"
            >
              CONTACT
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
