"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
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
  addOptions = [],
}: {
  title: string;
  onAddClick?: () => void;
  filterOptions?: FilterOption[];
  children: ReactNode;
  addOptions?: AddOption[];
}) {
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]?.label || "All");
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const addRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        addRef.current &&
        !addRef.current.contains(e.target as Node) &&
        filterRef.current &&
        !filterRef.current.contains(e.target as Node)
      ) {
        setShowAddOptions(false);
        setShowFilterOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-main">{title}</h1>

        <div className="relative" ref={addRef}>
          <Button
            variant="outline"
            className="py-1 px-15 outline-1"
            onClick={() => {
              if (addOptions.length > 0) {
                setShowAddOptions((prev) => !prev);
              } else if (onAddClick) {
                onAddClick();
              }
            }}
          >
            + Add
          </Button>

          <div
            className={`absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 
              transform transition-all duration-200 origin-top
              ${showAddOptions ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}
            `}
          >
            {addOptions.map((option, idx) => (
              <div
                key={idx}
                onClick={() => {
                  option.onClick();
                  setShowAddOptions(false);
                }}
                className={`px-4 py-3 hover:bg-black hover:text-white cursor-pointer text-black text-sm font-main
                  ${idx === 0 ? "first:rounded-t-lg" : ""}
                  ${idx === addOptions.length - 1 ? "last:rounded-b-lg" : "border-b border-gray-100"}
                `}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end my-3">
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilterOptions((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <IoFilter className="text-lg text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Filter: <span className="text-gray-700">{selectedFilter}</span>
            </span>
          </button>

          <div
            className={`absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10
              transform transition-all duration-200 origin-top
              ${showFilterOptions ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}
            `}
          >
            {filterOptions.map((option, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedFilter(option.label);
                  option.onClick();
                  setShowFilterOptions(false);
                }}
                className={`px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm font-medium
                  ${idx === 0 ? "first:rounded-t-lg" : ""}
                  ${idx === filterOptions.length - 1 ? "last:rounded-b-lg" : "border-b border-gray-100"}
                `}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-x-[60px] gap-y-[70px]">
        {children}
      </div>
    </>
  );
}
