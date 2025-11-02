import React from "react";
import { LuBookOpen } from "react-icons/lu";
import { FaAngleRight } from "react-icons/fa";

type DeckCardProps = {
  deckName: string;
  cardCount: number;
};

const DeckCard: React.FC<DeckCardProps> = ({ deckName, cardCount }) => {
  return (
    <div className="group bg-white border rounded-2xl shadow-md p-6 sm:p-8 flex items-center justify-between w-full hover:scale-101 hover:shadow-lg transition-transform transition-shadow duration-100 cursor-pointer">
      <div className="flex items-center min-w-0"> {/* ✅ min-w-0 allows truncation inside flex */}
        <div className="mr-6 shrink-0">
          <LuBookOpen className="transition-colors duration-200 group-hover:text-lime w-9 h-9 sm:w-11 sm:h-11 text-[#101220]" />
        </div>

        {/* Deck Info */}
        <div className="min-w-0"> {/* ✅ ensure child truncation works */}
          <h3 className="transition-colors duration-200 group-hover:text-lime font-main text-xl sm:text-2xl 
            text-[#101220] truncate overflow-hidden whitespace-nowrap max-w-[180px] sm:max-w-[450px] lg:max-w-[800px] xl:max-w-[1200px]">
            {deckName}
          </h3>
          <p className="transition-colors duration-200 group-hover:text-lime font-body text-sm sm:text-lg
            text-gray-700 truncate overflow-hidden whitespace-nowrap max-w-[180px] sm:max-w-[500px]">
            {cardCount} cards
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <FaAngleRight className="transition-colors duration-200 group-hover:text-lime w-4 h-4 sm:w-6 sm:h-6 text-[#101220]" />
      </div>
    </div>

  );
};

export default DeckCard;
