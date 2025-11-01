"use client";

import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

export default function NewFolderModal() {
    const router = useRouter();

    const [selectedColor, setSelectedColor] = useState<number | null>(null);
  
    const colors = [
        { id: 1, value: 'var(--color-purple)' },
        { id: 2, value: 'var(--color-pink)' },
        { id: 3, value: 'var(--color-lime)' },
        { id: 4, value: 'var(--color-cyan)' },
        { id: 5, value: 'var(--color-blue)' }
    ];
  return (
    <div>
      <label className="text-xs font-body">Folder Name</label>
      <input
        type="text"
        className="border-b border-gray-300 p-2 w-full my-2 text-2xl focus:border-black focus:outline-none transition-all duration-200"
      />
      <label className="text-xs font-body">Folder color</label>
      <div className="flex justify-center items-center gap-4 p-6">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => setSelectedColor(color.id)}
            className="w-20 h-20 rounded-full transition-transform duration-200 ease-out cursor-pointer"
            style={{
              backgroundColor: color.value,
              boxShadow: selectedColor === color.id ? '0 0 0 2px black' : 'none',
              transform: selectedColor === color.id ? 'scale(1.1)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              if (selectedColor !== color.id) {
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedColor !== color.id) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
            aria-label={`Select color ${color.value}`}
          />
        ))}
      </div>
    </div>
  )
}