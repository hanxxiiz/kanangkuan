"use client";

import { useRouter, usePathname } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import EditFolderModal from './EditFolderModal';
import { ModalContext } from '@/components/modals/providers';
import { useFolders } from '@/lib/hooks/useFolders';

interface FolderProps {
  id: string;
  color?: string;
  folderName?: string;
  deckCount?: number;
  userId?: string;
  readonly?: boolean;
}

const colorMap: Record<string, string> = {
  pink: "from-pink to-dark-pink",
  blue: "from-blue to-dark-blue",
  lime: "from-lime to-dark-lime",
  purple: "from-purple to-dark-purple",
  cyan: "from-cyan to-dark-cyan",
};

export default function Folder({
  id,
  color = "pink",
  folderName = "My Folder",
  deckCount = 0,
  userId,
}: FolderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { setShowModal, showModal } = React.useContext(ModalContext);
  const { deleteFolder } = useFolders();
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!showModal) {
      setShowEditModal(false);
    }
  }, [showModal]);

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the dropdown button or menu
    if (
      buttonRef.current?.contains(e.target as Node) ||
      dropdownRef.current?.contains(e.target as Node)
    ) {
      return;
    }

    if(userId){
      router.push(`/dashboard/profile/${userId}/folder/${id}`);
    }
    else if(pathname.startsWith("/dashboard/profile")){
      router.push(`/dashboard/profile/folder/${id}`);
    }
    else{
      router.push(`/dashboard/my-decks/folder/${id}`);
    }
  };

  const handleEdit = () => {
    setShowDropdown(false);
    setShowEditModal(true);
    setShowModal(true);
  };

  const handleDelete = async () => {
    setShowDropdown(false);
    try {
      await deleteFolder(id);
      alert("Folder deleted successfully!");
      router.push(pathname);
    } catch (error) {
      alert(`Failed to delete folder. Please try again. ${error} `);
    }
  };

  const gradient = colorMap[color] || colorMap["pink"];

  return (
    <>
      <div className="flex items-center justify-center" onClick={handleClick}>
        <div className="relative w-full cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-5">
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="absolute top-60 right-5 p-2 rounded-full hover:bg-gray-100/90 transition-colors cursor-pointer z-10"
            >
              <PiDotsThreeOutlineVerticalFill className="text-xl text-white" />
            </button>
            
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-68 right-10 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1 z-20"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="w-full px-4 py-2 hover:bg-gray-100 cursor-pointer text-left text-sm font-body text-gray-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="w-full px-4 py-2 hover:bg-gray-100 cursor-pointer text-left text-sm font-body text-gray-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className={`absolute top-0 left-0 w-3/5 h-40 bg-gradient-to-b ${gradient} rounded-t-[50px]`}>
            <div className="absolute mt-7 left-7 right-0 h-8 bg-white rounded-tl-full"></div>
          </div>

          <div className={`absolute top-0 right-0 w-1/2 h-65 bg-gradient-to-b ${gradient} rounded-t-[50px]`}></div>

          <div className={`relative mt-12 bg-gradient-to-b ${gradient} rounded-[40px] p-9`}>
            <div className="text-white mt-30">
              <h1 className="text-3xl font-main">{folderName}</h1>
              <p className="text-md font-body">{deckCount} Decks</p>
            </div>
          </div>

          <div className="absolute -bottom-2 left-8 right-8 h-4 bg-black/30 blur-lg rounded-full transition-all duration-500"></div>
        </div>
      </div>
      
      {showEditModal && (
        <EditFolderModal
          folderId={id}
          initialFolderName={folderName}
          initialFolderColor={color}
          isOpen={showEditModal && showModal}
        />
      )}
    </>
  );
}
