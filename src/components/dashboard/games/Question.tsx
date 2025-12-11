import React from "react";

export default function Question({ text }: { text: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-center font-main text-black text-lg sm:text-xl lg:text-2xl max-w-full px-2 whitespace-pre-line leading-relaxed">
        {text || "Loading question..."}
      </p>
    </div>
  );
}