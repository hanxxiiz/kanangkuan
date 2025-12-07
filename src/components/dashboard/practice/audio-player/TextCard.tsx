import React from "react";

interface TextCardProps {
  question: string;
  answer: string;
  deckColor: string;
}

const TextCard: React.FC<TextCardProps> = ({ question, answer, deckColor }) => {
  return (
    <div 
      className="w-full max-w-[600px] rounded-3xl p-8 flex flex-col gap-6"
      style={{ backgroundColor: deckColor }}
    >
      {/* Question */}
      <h2 className="font-main text-white text-2xl sm:text-3xl font-semibold">
        {question}
      </h2>

      {/* Answer */}
      <p className="font-regular text-white text-base sm:text-lg leading-relaxed">
        {answer}
      </p>
    </div>
  );
};

export default TextCard;