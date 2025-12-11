import React from "react";

type Props = {
  text: string;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function AnswerOption({ text, onSelect, disabled, className = "" }: Props) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`p-3 sm:p-4 text-center border-2 border-black rounded-xl sm:rounded-2xl font-body text-sm sm:text-base lg:text-lg text-black cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed min-h-[60px] sm:min-h-[70px] ${className}`}
    >
      <span className="line-clamp-3">{text}</span>
    </button>
  );
}