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
      className={`p-3 text-center border border-black rounded-3xl h-full font-body text-base lg:text-lg text-black cursor-pointer hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {text}
    </button>
  );
}