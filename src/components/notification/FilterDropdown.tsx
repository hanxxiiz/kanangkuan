"use client";

import React from "react";

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterSelect?: (filter: string) => void;
}

const filters = ["Newest to Oldest", "Oldest to Newest", "Unread", "Read"];

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  onClose,
  onFilterSelect,
}) => {
  return (
    <>
      {/* Backdrop for outside click (just like ProfileDropdown) */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Dropdown box (keep same position, under the Filter button) */}
      <div
        className={`absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-56 py-3 z-50 transition-all duration-200 ease-in origin-top-right ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <h3 className="text-md font-main px-5 pb-2 text-gray-800 border-b border-[#CFCECE]">
          Filter
        </h3>

        <div className="flex flex-col gap-1 mt-2">
          {filters.map((label) => (
            <button
              key={label}
              onClick={() => {
                onFilterSelect?.(label);
                onClose();
              }}
              className="flex items-center gap-3 px-5 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-md font-body transition-colors rounded"
            >
              <span className="h-2 w-2 bg-black rounded-full"></span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default FilterDropdown;
