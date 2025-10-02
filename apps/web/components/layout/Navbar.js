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
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/products", label: "PRODUCT" },
    { href: "/about-us", label: "ABOUT US" },
    { href: "/contact", label: "CONTACT" },
  ];

  return (
    <nav className="bg-background w-full shadow-md">
      <div className="container relative mx-auto flex items-center justify-between px-4 py-4 md:py-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="bg-primary rounded-[5px] px-6 py-5 font-bold text-white md:px-6 md:py-2"
          >
            LOGO
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden flex-grow justify-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-secondary hover:text-primary font-medium transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Cart + Mobile Toggle */}
        <div className="flex items-center">
          <Link href="/cart" className="relative">
            <ShoppingCart className="text-foreground hover:text-primary h-7 w-7 cursor-pointer" />
            {cartCount > 0 && (
              <span className="bg-primary absolute -right-2 -top-2 rounded-full px-1.5 py-0.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground hover:text-primary rounded-md p-2 md:hidden"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 transform transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto bg-black/50 opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`bg-background border-primary fixed inset-y-0 right-0 w-3/4 max-w-sm transform border-l-2 p-6 shadow-lg transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground hover:text-primary"
            >
              <X size={28} />
            </button>
          </div>

          {/* Mobile Links */}
          <div className="flex flex-col items-end space-y-6 pt-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-secondary hover:text-primary font-medium transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
