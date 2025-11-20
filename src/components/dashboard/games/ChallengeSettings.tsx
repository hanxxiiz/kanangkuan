"use client";

import { ModalContext } from '@/components/modals/providers';
import React, { useContext, useEffect, useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { IoAdd } from "react-icons/io5";

export default function ChallengeSettings() {
  const { Modal, setShowModal } = useContext(ModalContext);
  const [activeTab, setActiveTab] = useState<"host" | "join">("host");

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setShowModal(true);
  }, [setShowModal]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    if (!/^[0-9]?$/.test(value)) return;

    e.target.value = value;

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const tabs = [
    { id: "host", label: "Host" },
    { id: "join", label: "Join" },
  ];

  const tabContent = {
    host: (
      <div className="mt-2 flex flex-col items-center justify-center gap-2">
        <div className="self-start flex items-center gap-2">
          <IoAdd className="text-xl rounded-full border-2" />
          <h5 className="text-base font-body">Add Participant</h5>
        </div>

        <div className="w-full space-y-3">
          {[...Array(3)].map((_, i) => (
            <input
              key={i}
              className="w-full p-4 border-2 border-gray-300 rounded-2xl outline-none text-xl focus:border-black transition-colors duration-200 ease-in-out"
              placeholder={`Player ${i + 1}`}
            />
          ))}
        </div>
      </div>
    ),

    join: (
      <div className="my-5 flex flex-col items-center justify-center gap-2">
        <div className="flex self-start">
          <h5 className="text-base font-body">Enter Join Code</h5>
        </div>

        <div className="flex flex-row items-center justify-between gap-3">
          {[...Array(5)].map((_, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="text-center h-35 w-23 px-1 border-2 border-gray-300 rounded-2xl outline-none text-7xl focus:border-black transition-colors duration-200 ease-in-out"
              ref={(el) => { inputsRef.current[i] = el; }}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div>
      <Modal heading="Challenge" actionButtonText="Play">
        <div className="flex justify-start mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-7 py-2 font-main cursor-pointer transition-all duration-200 ease-in-out ${
                activeTab === tab.id
                  ? "border-b-4 border-black text-xl text-black"
                  : "text-gray-600 text-xl hover:text-black"
              }`}
              onClick={() => setActiveTab(tab.id as "host" | "join")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>{tabContent[activeTab]}</div>
      </Modal>
    </div>
  );
}
