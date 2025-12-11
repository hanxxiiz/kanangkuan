"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import EditCardModal from './EditCardModal';
import { ModalContext } from '@/components/modals/providers';
import { useCards } from '@/lib/hooks/useCards';

interface CardProps{
    id: string,
    color?: string;
    front?: string;
    back?: string;
    deckId?: string;
}

const colorMap = {
  pink: "bg-pink",
  cyan: "bg-cyan",
  lime: "bg-lime",
  purple: "bg-purple",
  blue: "bg-blue",
};

export default function Card({
    id,
    color = "pink",
    front = "",
    back = "",
    deckId,
}:CardProps) {
    const bgColor = colorMap[color as keyof typeof colorMap] || colorMap.pink;
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { setShowModal, showModal } = React.useContext(ModalContext);
    const { deleteCard } = useCards(deckId);
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

    const handleEdit = () => {
        setShowDropdown(false);
        setShowEditModal(true);
        setShowModal(true);
    };

    const handleDelete = async () => {
        setShowDropdown(false);
        try {
            await deleteCard(id);
            alert("Card deleted successfully!");
        } catch (error) {
            alert(`Failed to delete card. Please try again. ${error} `);
            
        }
    };

    return (
        <>
            <div className="relative">
                <div className="flex items-center justify-center">
                    <div className="relative w-full cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1">
                        <div className="bg-white outline-black outline-2 rounded-t-2xl p-8">
                            <div className="relative">
                                <button
                                    ref={buttonRef}
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="absolute -top-5 -right-5 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10"
                                >
                                    <PiDotsThreeOutlineVerticalFill className="text-xl text-black" />
                                </button>
                                
                                {showDropdown && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute top-2 -right-2 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1 z-20"
                                    >
                                        <button
                                            onClick={handleEdit}
                                            className="w-full px-4 py-2 hover:bg-gray-100 cursor-pointer text-left text-sm font-body text-gray-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full px-4 py-2 hover:bg-gray-100 cursor-pointer text-left text-sm font-body text-gray-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="text-black">
                                <p className="text-xs lg:text-base font-body">{front}</p>
                            </div>
                        </div>

                        <div className={`relative ${bgColor} outline-2 outline-black text-black rounded-b-2xl py-4 px-8 `}>
                            <div className="text-white">
                                <h1 className="text-xs lg:text-lg font-main">{back}</h1>
                            </div>  
                        </div>
                    </div>
                </div>
            </div>
            
            {showEditModal && (
                <EditCardModal
                    currentDeckId={deckId}
                    cardId={id}
                    initialFront={front}
                    initialBack={back}
                    isOpen={showEditModal && showModal}
                />
            )}
        </>
    );
}