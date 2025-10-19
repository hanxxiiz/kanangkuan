import React from "react";
import { LuBookOpen } from "react-icons/lu";
import { FaAngleRight } from "react-icons/fa";
import { FaBook } from "react-icons/fa6";

type DeckCardProps = {
  deckName: string;
  cardCount: number;
};

const DeckCard: React.FC<DeckCardProps> = ({ deckName, cardCount }) => {
  return (
    <div className="group bg-white border rounded-2xl shadow-md p-8 flex items-center justify-between w-full hover:scale-101 hover:shadow-lg transition-transform transition-shadow duration-100 cursor-pointer">
      <div className="flex items-center">
        <div className="mr-6 shrink-0">
          <LuBookOpen className="transition-colors duration-200 group-hover:text-lime w-11 h-11 text-[#101220]" />
        </div>

        {/* Deck Info */}
        <div>
          <h3 className="transition-colors duration-200 group-hover:text-lime font-main text-2xl text-[#101220]">
            {deckName}
          </h3>
          <p className="transition-colors duration-200 group-hover:text-lime font-body text-md text-gray-700">
            {cardCount} cards
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <FaAngleRight className="transition-colors duration-200 group-hover:text-lime w-6 h-6 text-[#101220]" />
      </div>
    </div>
  );
};

export default DeckCard;
