"use client";

import { ModalContext } from '@/components/modals/providers';
import { useDecks } from '@/lib/hooks/useDecks';
import React, { useContext, useState } from 'react'

export default function NewDeckModal({currentFolderId} : {currentFolderId?: string}) {
    const { Modal, setShowModal } = useContext(ModalContext);
    const {createDeck} = useDecks();
        
    const [deckName, setDeckName] = useState("");
    const [selectedColor, setSelectedColor] = useState<number | null>(null);
  
    const colors = [
    { id: 1, name: "purple", value: "var(--color-purple)" },
    { id: 2, name: "pink", value: "var(--color-pink)" },
    { id: 3, name: "lime", value: "var(--color-lime)" },
    { id: 4, name: "cyan", value: "var(--color-cyan)" },
    { id: 5, name: "blue", value: "var(--color-blue)" },
  ];

    const handleCreateDeck = async () => {
      if (!deckName.trim()) {
        alert("Please enter a deck name.");
        return;
      }
      if (selectedColor === null) {
        alert("Please select a deck color.");
        return;
      }

      const colorName = colors.find((c) => c.id === selectedColor)?.name;

      await createDeck({
        deckName,
        deckColor: colorName || "pink",
        folderId: currentFolderId,
      });

      setShowModal(false);
    };

  return (
    <div>
      <Modal
        heading="New Deck"
        actionButtonText="Create"
        onAction={() => {
          handleCreateDeck();
          setShowModal(false);
        }}
      >
        <label className="text-xs text-black font-body">Deck Name</label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className="border-b text-black border-gray-300 p-2 w-full my-2 text-2xl focus:border-black focus:outline-none transition-all duration-200"
        />
        <label className="text-xs text-black font-body">Deck color</label>
        <div className="flex justify-center items-center gap-4 p-6">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className="w-20 h-20 rounded-full transition-transform duration-200 ease-out cursor-pointer"
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