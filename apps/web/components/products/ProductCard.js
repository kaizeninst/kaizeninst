"use client";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-background group overflow-hidden rounded-xl border shadow transition hover:shadow-lg">
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>
        <div className="flex flex-col space-y-2 p-4">
          <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-base font-semibold transition">
            {product.name}
          </h3>
          <p className="text-primary text-lg font-bold">฿{product.price}</p>
        </div>
      </div>
    </Link>
  );
}
