"use client";

import { ModalContext } from '@/components/modals/providers';
import { useCards } from '@/lib/hooks/useCards';
import React, { useContext, useState } from 'react';

export default function NewCardModal({currentDeckId} : {currentDeckId?: string}) {
  const { Modal, setShowModal } = useContext(ModalContext);
  const { createCard } = useCards(currentDeckId);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleCreateCard = async () => {
    if (!front.trim()) {
      alert("Please enter front text.");
      return;
    }

    if (!back.trim()) {
      alert("Please enter back text.");
      return;
    }

    await createCard({
      front,
      back,
    });

    setFront('');
    setBack('');

    setShowModal(false);
  };

  return (
    <div>
      <Modal
        heading="New Card"
        actionButtonText="Create"
        onAction={handleCreateCard}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="front"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Front
            </label>
            <input
              id="front"
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full border-b border-gray-300 p-2 text-2xl bg-transparent focus:border-black focus:outline-none transition-colors duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="back"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Back
            </label>
            <textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-md p-3 text-lg font-body resize-y focus:border-black outline-none transition-colors duration-200"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
