"use client";

import React, { useState } from 'react';

type ToggleBarTabs = {
  barOne: string;
  barTwo: string;
  activeCategory: string;
  onChange: (category: string) => void;
};

export default function ToggleBar({ barOne, barTwo, activeCategory, onChange }: ToggleBarTabs) {
  return (
    <div className="flex justify-end">
      <div className="flex bg-white border-2 border-[#245329] rounded-full p-1 gap-1">

        <button
          onClick={() => onChange(barTwo)}
          className={`px-3 py-3 rounded-full text-base font-medium transition-all duration-100 cursor-pointer font-poppins-bold ${
            activeCategory === barOne
              ? "bg-black"
              : ""
          }`}
        >
        </button>

        <button
          onClick={() => onChange(barOne)}
          className={`px-3 py-3 rounded-full text-base font-medium transition-all duration-100 cursor-pointer font-poppins-bold ${
            activeCategory === barTwo
              ? "bg-black"
              : ""
          }`}
        >
        </button>

      </div>
    </div>
  );
}