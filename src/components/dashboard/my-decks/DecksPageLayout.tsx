import { ReactNode, useState } from "react";
import { Button } from "@/components/buttons/PrimaryButton";
import { IoFilter } from "react-icons/io5";

type FilterOption = {
  label: string;
  onClick: () => void;
};

type AddOption = {
  label: string;
  onClick: () => void;
};

export default function DecksPageLayout({ 
    title, 
    onAddClick, 
    filterOptions = [], 
    children, 
    addOptions = []
}: {
    title: string,
    onAddClick?: () => void;
    filterOptions?: FilterOption[];
    children: ReactNode;
    addOptions?: AddOption[];
}) {
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]?.label || "All");
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-main">{title}</h1>
        <div className="relative group">
          <Button
              variant="outline"
              className="py-1 px-15 outline-1"
              onClick={onAddClick}
          >
              + Add
          </Button>

          {addOptions.length > 0 && (
            <ul className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              {addOptions.map((option, idx) => (
                <li
                  key={idx}
                  onClick={option.onClick}
                  className={`px-4 py-3 hover:bg-black hover:text-white cursor-pointer text-black text-sm font-main
                    ${idx === 0 ? "first:rounded-t-lg" : ""}
                    ${idx === addOptions.length - 1 ? "last:rounded-b-lg" : "border-b border-gray-100"}
                  `}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
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

          <ul className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            {filterOptions.map((option, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setSelectedFilter(option.label);
                  option.onClick();
                }}
                className={`px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm font-medium
                  ${idx === 0 ? "first:rounded-t-lg" : ""}
                  ${idx === filterOptions.length - 1 ? "last:rounded-b-lg" : "border-b border-gray-100"}
                `}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-3 place-items-center sm:gap-x-10 lg:gap-x-5">
        {children}
      </div>
    </>
  );
}