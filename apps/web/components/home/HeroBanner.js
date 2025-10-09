"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   HERO IMAGE SOURCES
   ============================================================ */
const heroImagesDesktop = [
  "https://placehold.co/1600x800/png?text=Desktop+1",
  "https://placehold.co/1600x800/png?text=Desktop+2",
  "https://placehold.co/1600x800/png?text=Desktop+3",
];

const heroImagesMobile = [
  "https://placehold.co/800x1200/png?text=Mobile+1",
  "https://placehold.co/800x1200/png?text=Mobile+2",
  "https://placehold.co/800x1200/png?text=Mobile+3",
];

/* ============================================================
   HERO BANNER COMPONENT
   ============================================================ */
export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = next, -1 = previous
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const autoSlideRef = useRef(null);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto slide
  const startAutoSlide = () => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setSlideDirection(1);
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(autoSlideRef.current);
  }, [isMobileScreen]);

  // Handle indicator click
  const handleIndicatorClick = (targetIndex) => {
    const newDirection = targetIndex > currentIndex ? 1 : -1;
    setSlideDirection(newDirection);
    setCurrentIndex(targetIndex);
    startAutoSlide(); // reset timer
  };

  // Animation for slide transitions
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%" }),
    center: { x: 0 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%" }),
  };

  // Select correct image set
  const activeSlides = isMobileScreen ? heroImagesMobile : heroImagesDesktop;

  return (
    <div className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden">
      {/* Slides */}
      <AnimatePresence custom={slideDirection} mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          custom={slideDirection}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 120, damping: 20 },
            duration: 0.8,
          }}
          className="absolute inset-0"
        >
          <Image
            src={activeSlides[currentIndex]}
            alt={`Hero Slide ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleIndicatorClick(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              index === currentIndex ? "scale-125 bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
