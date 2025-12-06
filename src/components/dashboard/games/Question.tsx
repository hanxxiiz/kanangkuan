import React from "react";

export default function Question({ text }: { text: string }) {
  return (
    <div className="flex-1 h-auto flex items-center justify-center rounded-3xl p-10 border border-black bg-white">
      <p className="text-center font-main text-black text-md lg:text-xl max-w-md whitespace-pre-line">
        {text || "Loading question..."}
      </p>
    </div>
  );
}