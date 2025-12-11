"use client";

import { ModalContext } from '@/components/modals/providers';
import { useCards } from '@/lib/hooks/useCards';
import React, { useContext, useState, useEffect } from 'react';

export default function EditCardModal({
  currentDeckId,
  cardId,
  initialFront,
  initialBack,
  isOpen,
}: {
  currentDeckId?: string;
  cardId: string;
  initialFront: string;
  initialBack: string;
  isOpen: boolean;
}) {
  const { Modal, setShowModal } = useContext(ModalContext);
  const { updateCard } = useCards(currentDeckId);

  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);

  useEffect(() => {
    if (isOpen) {
      setFront(initialFront);
      setBack(initialBack);
    }
  }, [isOpen, initialFront, initialBack]);

  const handleUpdateCard = async () => {
    if (!front.trim()) {
      alert("Please enter front text.");
      return;
    }

    if (!back.trim()) {
      alert("Please enter back text.");
      return;
    }

    await updateCard(cardId, {
      front,
      back,
    });

    setShowModal(false);
  };

  if (!isOpen) return null;

  return (
    <div>
      <Modal
        heading="Edit Card"
        actionButtonText="Update"
        onAction={handleUpdateCard}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="back"
              className="block text-sm font-medium text-black mb-1"
            >
              Back
            </label>
            <input
              id="back"
              type="text"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full border-b border-gray-300 text-black p-2 text-2xl bg-transparent focus:border-black focus:outline-none transition-colors duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="front"
              className="block text-sm font-medium text-black mb-1"
            >
              Front
            </label>
            <textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={5}
              className="w-full border text-black border-gray-300 rounded-md p-3 text-lg font-body resize-y focus:border-black outline-none transition-colors duration-200"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

