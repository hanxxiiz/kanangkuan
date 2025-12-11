"use client";

import { ModalContext } from '@/components/modals/providers';
import { useDecks } from '@/lib/hooks/useDecks';
import { useRouter, usePathname } from 'next/navigation';
import React, { useContext, useState, useEffect } from 'react'

export default function EditDeckModal({
  deckId,
  initialDeckName,
  initialDeckColor,
  currentFolderId,
  isOpen,
}: {
  deckId: string;
  initialDeckName: string;
  initialDeckColor: string;
  currentFolderId?: string;
  isOpen: boolean;
}) {
  const { Modal, setShowModal } = useContext(ModalContext);
  const { updateDeck } = useDecks();
  const router = useRouter();
  const pathname = usePathname();
        
  const [deckName, setDeckName] = useState(initialDeckName);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  
  const colors = [
    { id: 1, name: "purple", value: "var(--color-purple)" },
    { id: 2, name: "pink", value: "var(--color-pink)" },
    { id: 3, name: "lime", value: "var(--color-lime)" },
    { id: 4, name: "cyan", value: "var(--color-cyan)" },
    { id: 5, name: "blue", value: "var(--color-blue)" },
  ];

  useEffect(() => {
    if (isOpen) {
      setDeckName(initialDeckName);
      const colorIndex = colors.findIndex((c) => c.name === initialDeckColor);
      setSelectedColor(colorIndex !== -1 ? colors[colorIndex].id : null);
    }
  }, [isOpen, initialDeckName, initialDeckColor]);

  const handleUpdateDeck = async () => {
    if (!deckName.trim()) {
      alert("Please enter a deck name.");
      return;
    }
    if (selectedColor === null) {
      alert("Please select a deck color.");
      return;
    }

    const colorName = colors.find((c) => c.id === selectedColor)?.name;

    await updateDeck(deckId, {
      deckName,
      deckColor: colorName || "pink",
      folderId: currentFolderId,
    });

    setShowModal(false);
    router.push(pathname);
  };

  if (!isOpen) return null;

  return (
    <div>
      <Modal
        heading="Edit Deck"
        actionButtonText="Update"
        onAction={handleUpdateDeck}
      >
        <label className="text-xs text-black font-body">Deck Name</label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className="border-b text-black border-gray-300 p-2 w-full my-2 text-2xl focus:border-black focus:outline-none transition-all duration-200"
        />
        <label className="text-xs text-black font-body">Deck color</label>
        <div className="flex justify-center items-center gap-2 lg:gap-4 p-1 lg:p-6">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className="w-15 h-11 lg:w-20 lg:h-20 rounded-full transition-transform duration-200 ease-out cursor-pointer"
              style={{
                backgroundColor: color.value,
                boxShadow:
                  selectedColor === color.id ? "0 0 0 2px black" : "none",
                transform: selectedColor === color.id ? "scale(1.1)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (selectedColor !== color.id) {
                  e.currentTarget.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedColor !== color.id) {
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
              aria-label={`Select color ${color.name}`}
            />
          ))}
        </div>
      </Modal>
    </div>
  )
}

