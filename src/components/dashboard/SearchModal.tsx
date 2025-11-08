"use client";

import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FaClone, FaFolder } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";
import { Deck, Folder } from "@/types/dashboard"; 


interface SearchResultProps {
  type: "deck" | "folder";
  name: string;
  iconColor?: string;
}

const getColorClass = (color: string | null): string => {
  const colorMap: Record<string, string> = {
    'lime': 'text-lime',
    'pink': 'text-pink',
    'blue': 'text-blue',
    'purple': 'text-purple',
    'cyan': 'text-cyan',
  };
  
  return colorMap[color || ''] || 'text-lime';
};

function SearchResult({ type, name, iconColor }: SearchResultProps) {
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
        <p className="text-gray-800 font-body text-md">{name}</p>
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
  allDecks: Deck[];
  folders: Folder[];
}

export default function SearchModal({ 
  showModal, 
  setShowModal,
  mode = "search", 
  allDecks, 
  folders, 
}: SearchModalProps) {
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState<"none" | "deck" | "folder">("none");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    if (!showModal) {
      setSearchValue("");
      setFilterType("none");
      setShowFilterDropdown(false);
    }
  }, [showModal]);

  const transformedDecks = allDecks.map(deck => ({
    type: "deck" as const,
    name: deck.deck_name,
    iconColor: getColorClass(deck.deck_color), 
    id: deck.id,
  }));

  const transformedFolders = folders.map(folder => ({
    type: "folder" as const,
    name: folder.folder_name,
    iconColor: getColorClass(folder.folder_color), 
    id: folder.id,
  }));

  const allItems = mode === "search" 
    ? [...transformedDecks, ...transformedFolders] 
    : transformedDecks;
  
  const filteredResults = searchValue.trim()
    ? allItems.filter(item => 
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : allItems;

  const finalResults = filterType === "none" 
    ? filteredResults 
    : filteredResults.filter(item => item.type === filterType);

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
    } else if (searchValue.trim() && finalResults.length === 0) {
      // Search returned no results
      if (mode === "search") {
        return `No decks or folders found matching "${searchValue}"`;
      } else {
        return `No decks found matching "${searchValue}"`;
      }
    } else if (filterType !== "none" && finalResults.length === 0) {
      // Filter returned no results
      return `No ${filterType}s found`;
    }
    return "";
  };

  const emptyMessage = getEmptyMessage();

  const getFilterLabel = () => {
    switch (filterType) {
      case "deck":
        return "Filter: Decks";
      case "folder":
        return "Filter: Folders";
      default:
        return "Filter: All";
    }
  };

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
          {mode === "search" && (
            <div className="px-1 flex items-center gap-2">
              <div className="relative inline-block group">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-gray-400 group-hover:text-gray-500 transition-colors"
                >
                  <FaCaretDown className="text-gray-400 group-hover:text-gray-500 text-sm transition-colors" />
                  <span className="text-sm font-body">{getFilterLabel()}</span>
                </button>

                {showFilterDropdown && (
                  <div className="absolute top-full left-3 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                    <button
                      onClick={() => {
                        setFilterType("none");
                        setShowFilterDropdown(false);
                      }}
                      className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="text-sm font-body text-gray-400">All</span>
                    </button>
                    <button
                      onClick={() => {
                        setFilterType("deck");
                        setShowFilterDropdown(false);
                      }}
                      className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="text-sm font-body text-gray-400">Decks</span>
                    </button>
                    <button
                      onClick={() => {
                        setFilterType("folder");
                        setShowFilterDropdown(false);
                      }}
                      className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="text-sm font-body text-gray-400">Folders</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {emptyMessage ? (
            <EmptyState message={emptyMessage} />
          ) : (
            finalResults.map((result, index) => (
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