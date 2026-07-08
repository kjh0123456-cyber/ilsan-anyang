"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductImageGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        이미지 없음
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
        <Image
          src={images[selected]}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden ${
                selected === i ? "border-gold" : "border-gray-200"
              }`}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
