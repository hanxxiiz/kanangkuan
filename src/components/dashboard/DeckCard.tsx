import React from "react";
import { FaAngleRight } from "react-icons/fa";
import { FaClone } from "react-icons/fa";
import { useRouter } from "next/navigation";

type DeckCardProps = {
  deckId: string;  
  deckName: string;
  cardCount?: number; 
  deckColor: string; 
};

const DeckCard: React.FC<DeckCardProps> = ({ deckId, deckName, cardCount = 0, deckColor }) => { 
  const router = useRouter();

  const colorClasses: Record<string, string> = { 
    blue: "text-blue",
    lime: "text-lime",
    pink: "text-pink",
    purple: "text-purple",
    cyan: "text-cyan",
    default: "text-[#101220]"
  };

  const hoverColorClasses: Record<string, string> = { 
    blue: "group-hover:text-blue",
    lime: "group-hover:text-lime",
    pink: "group-hover:text-pink",
    purple: "group-hover:text-purple",
    cyan: "group-hover:text-cyan",
    default: "group-hover:text-lime"
  };

  const selectedColor = deckColor || "default"; 

  const handleClick = () => {
    router.push(`/dashboard/my-decks/${deckId}`);
  };

  return (
    <div className="group bg-white border rounded-2xl shadow-md p-6 sm:p-8 flex items-center justify-between w-full hover:scale-101 hover:shadow-lg transition-transform transition-shadow duration-100 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center min-w-0"> 
        <div className="mr-6 shrink-0">
          <FaClone className={`transition-colors duration-200 ${hoverColorClasses[selectedColor]} w-6 h-6 sm:w-8 sm:h-8 ${colorClasses[selectedColor]}`} /> 
        </div>

        <div className="min-w-0">
          <h3 className={`transition-colors duration-200 ${hoverColorClasses[selectedColor]} font-main text-xl sm:text-2xl 
            text-black truncate overflow-hidden whitespace-nowrap max-w-[180px] sm:max-w-[450px] lg:max-w-[800px] xl:max-w-[1200px]`}>
            {deckName}
          </h3>
          <p className={`transition-colors duration-200 ${hoverColorClasses[selectedColor]} font-body text-sm sm:text-lg
            text-gray-700 truncate overflow-hidden whitespace-nowrap max-w-[180px] sm:max-w-[500px]`}>
            {cardCount} cards
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <FaAngleRight className={`transition-colors duration-200 ${hoverColorClasses[selectedColor]} w-4 h-4 sm:w-6 sm:h-6 text-[#101220]`} />
      </div>
    </div>

  );
};

const EmptyDeckState = () => {
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 sm:p-30 flex flex-col items-center justify-center text-center">
      <FaClone className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
      <p className="text-lg text-gray-400 font-body">
        No decks yet — create one to get started!
      </p>
    </div>
  );
};

export { EmptyDeckState };
export default DeckCard;