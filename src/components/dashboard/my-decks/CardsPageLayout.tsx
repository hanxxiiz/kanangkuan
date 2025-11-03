import { useState, ReactNode } from "react";
import { Button } from "@/components/buttons/PrimaryButton";
import { IoFilter, IoShareSocialSharp } from "react-icons/io5";

const filterOptions = ["Randomized", "Newest-to-Oldest", "Oldest-to-Newest"];

export default function CardsPageLayout({
  title,
  onAddClick,
  children,
}: {
  title: string;
  onAddClick: () => void;
  children: ReactNode;
}) {
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-main">{title}</h1>
        <div className="flex items-center justify-end gap-2">
          <button className="flex items-center p-3 bg-white rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <IoShareSocialSharp className="text-xl text-black" />
          </button>
          <Button
            variant="outline"
            className="py-1 px-4"
            onClick={onAddClick}
          >
            Practice
          </Button>
        </div>
      </div>

      <div className="flex justify-end my-3">
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <IoFilter className="text-lg text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Filter: <span className="text-gray-700">{selectedFilter}</span>
            </span>
          </button>

          <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            {filterOptions.map((option, idx) => (
              <li
                key={option}
                onClick={() => setSelectedFilter(option)}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm
                  ${idx === 0 ? "first:rounded-t-lg" : ""}
                  ${idx === filterOptions.length - 1 ? "last:rounded-b-lg" : "border-b border-gray-100"}
                `}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {children}
      </div>
    </>
  );
}
