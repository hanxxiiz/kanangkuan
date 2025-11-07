"use client";

import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FaClone, FaFolder } from "react-icons/fa";

interface SearchResultProps {
  type: "deck" | "folder";
  name: string;
  iconColor?: string;
}

function SearchResult({ type, name, iconColor = "text-lime-500" }: SearchResultProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200">
      <div className="flex-shrink-0">
        {type === "deck" ? (
          <FaClone className={`${iconColor} text-xl`} />
        ) : (
          <FaFolder className={`${iconColor} text-xl`} />
        )}
      </div>
      <div className="flex-1">
        <p className="text-gray-800 font-body text-lg">{name}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-15 px-6 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <IoSearch className="text-gray-300 text-4xl" />
      </div>
      <p className="text-gray-300 font-body text-md">
        {message}
      </p>
    </div>
  );
}

export { SearchResult };

interface SearchModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  mode?: "search" | "practice"; 
}

export default function SearchModal({ 
  showModal, 
  setShowModal,
  mode = "search", 
}: SearchModalProps) {
  const [searchValue, setSearchValue] = useState("");

  // Demo data 
  const allDecks: Array<{ type: "deck"; name: string; iconColor: string }> = [
    
  ];

  const allFolders: Array<{ type: "folder"; name: string; iconColor: string }> = [
    
  ];

  const allItems = mode === "search" 
    ? [...allDecks, ...allFolders] 
    : allDecks;

  const filteredResults = searchValue.trim()
    ? allItems.filter(item => 
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : allItems;

  const placeholder = mode === "search" 
    ? "Search decks/folders..." 
    : "Pick a deck...";

  const getEmptyMessage = () => {
    if (allItems.length === 0) {
      // No items exist at all
      if (mode === "search") {
        return "You don't have any decks or folders yet. Create one to get started!";
      } else {
        return "You don't have any decks yet. Create one to get started!";
      }
    } else if (searchValue.trim() && filteredResults.length === 0) {
      // Search returned no results
      if (mode === "search") {
        return `No decks or folders found matching "${searchValue}"`;
      } else {
        return `No decks found matching "${searchValue}"`;
      }
    }
    return "";
  };

  const emptyMessage = getEmptyMessage();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/25 backdrop-blur-xs"
        onClick={() => setShowModal(false)}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg z-10 flex flex-col h-[500px]">
        <div className="flex items-center justify-center px-5 py-5 border-b border-gray-200 flex-shrink-0">
          <div className="relative w-full">
            <IoSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 text-xl" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-2 text-gray-800 placeholder:text-gray-300 border-1 border-gray-300 rounded-full focus:outline-none transition-colors font-body"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {emptyMessage ? (
            <EmptyState message={emptyMessage} />
          ) : (
            filteredResults.map((result, index) => (
              <SearchResult 
                key={index} 
                type={result.type} 
                name={result.name}
                iconColor={result.iconColor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}