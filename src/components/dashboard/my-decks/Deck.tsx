"use client";

import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import EditDeckModal from './EditDeckModal';
import { ModalContext } from '@/components/modals/providers';
import { useDecks } from '@/lib/hooks/useDecks';

interface DeckProps{
    id: string,
    color?: string;
    deckName?: string;
    cardCount?: number;
    userId?: string;
    readonly?: boolean;
    folderId?: string;
}

const colorMap: Record<string, string> = {
  pink: "from-pink to-dark-pink",
  blue: "from-blue to-dark-blue",
  lime: "from-lime to-dark-lime",
  purple: "from-purple to-dark-purple",
  cyan: "from-cyan to-dark-cyan",
};

export default function Deck({
    id,
    color = "pink",
    deckName = "My Deck",
    cardCount,
    userId,
    folderId,
}:DeckProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { setShowModal, showModal } = React.useContext(ModalContext);
    const { deleteDeck } = useDecks();
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
            router.push(`/dashboard/profile/${userId}/deck/${id}`);
        }
        else if(pathname.startsWith("/dashboard/profile")){
            router.push(`/dashboard/profile/${id}`)
        }
        else{
            router.push(`/dashboard/my-decks/${id}`);
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
            await deleteDeck(id);
            alert("Deck deleted successfully!");
            router.push(pathname);
        } catch (error) {
            alert(`Failed to delete deck. Please try again. ${error} `);
        }
    };

    const gradient = colorMap[color] || colorMap["pink"];
  return (
    <>
        <div className="flex items-center justify-center"
            onClick={handleClick}
        >
            <div className="relative w-full cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-5">
                <div className={`bg-gradient-to-br ${gradient} rounded-[50px] pt-8`}>
                    <div className="bg-white rounded-t-[30px] p-8 mx-8">
                        <div className="relative">
                            <button
                                ref={buttonRef}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDropdown(!showDropdown);
                                }}
                                className="absolute top-45 -right-10 p-2 rounded-full hover:bg-gray-100/90 transition-colors cursor-pointer z-10"
                            >
                                <PiDotsThreeOutlineVerticalFill className="text-xl text-white" />
                            </button>
                            
                            {showDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-52 -right-5 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1 z-20"
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
                        <div className="space-y-6">
                            <div className={`h-2 rounded-full bg-gradient-to-br ${gradient}`}></div>
                            <div className={`h-2 rounded-full bg-gradient-to-br ${gradient}`}></div>
                            <div className={`h-2 rounded-full bg-gradient-to-br ${gradient}`}></div>
                        </div>
                    </div>
                    
                    <div className={`relative bg-gradient-to-b ${gradient} rounded-b-[40px] p-9 `}>
                        <div className="text-white">
                            <h1 className="text-3xl font-main">{deckName}</h1>
                            <p className="text-md font-body">{cardCount} Cards</p>
                        </div>  
                    </div>
                </div>
                
                <div className="absolute -bottom-2 left-8 right-8 h-4 bg-black/30 blur-lg rounded-full transition-all duration-500"></div>
            </div>
        </div>
        
        {showEditModal && (
            <EditDeckModal
                deckId={id}
                initialDeckName={deckName}
                initialDeckColor={color}
                currentFolderId={folderId}
                isOpen={showEditModal && showModal}
            />
        )}
    </>
  );
}