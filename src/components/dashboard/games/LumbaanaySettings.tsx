"use client";

import { ModalContext } from '@/components/modals/providers';
import React, { useContext, useEffect, useState } from 'react';
import HostTab from './HostTab';
import JoinTab from './JoinTab';
import { useUser } from '@/lib/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useLumbaanays } from '@/lib/hooks/useLumbaanays';

export default function LumbaanaySettings() {
  const { Modal, setShowModal } = useContext(ModalContext);
  const { user } = useUser();
  const router = useRouter();
  const { createLumbaanay, incrementMaxPlayers, validateJoinCode } = useLumbaanays();

  const [activeTab, setActiveTab] = useState<"host" | "join">("host");
  const [joinCode, setJoinCode] = useState("");
  const [hostUser, setHostUser] = useState("");
  const [enteredJoinCode, setEnteredJoinCode] = useState("");

  useEffect(() => {
    setShowModal(true);
    if (user?.id) setHostUser(user.id);
  }, [setShowModal, user?.id]);

  const tabs = [
    { id: "host", label: "Host" },
    { id: "join", label: "Join" },
  ];

  const tabContent = {
    host: 
      <HostTab onDataChange={(data) => {
          setJoinCode(data.joinCode);
          console.log("LumbaanaySettings joinCode updated:", data.joinCode);
        }} 
      />,
    join: 
      <JoinTab onJoinCodeComplete={(code) => {
          setEnteredJoinCode(code);
          console.log("Join code entered:", code);
        }}
      />
  };

  const handlePlay = async () => {
    console.log("Active tab:", activeTab);

    if (activeTab === "host") {
      if (!joinCode) {
        alert("Cannot play: Please generate a code first!");
        return;
      }

      const newLumbaanay = await createLumbaanay({
        hostId: hostUser,
        joinCode: joinCode,
        status: "waiting",
      });

      if (!newLumbaanay?.id) {
        alert("Failed to create lumbaanay.");
        return;
      }

      router.push(`/dashboard/games/lumbaanay/${newLumbaanay.id}/waiting`);
    }

    if (activeTab === "join") {
      if (!enteredJoinCode || enteredJoinCode.length !== 5) {
        alert("Please enter a complete 5-character join code.");
        return;
      }

      console.log("Validating join code:", enteredJoinCode);
      
      const validation = await validateJoinCode(enteredJoinCode);
      
      if (!validation.isValid) {
        alert(validation.message || "Invalid join code.");
        return;
      }

      if (validation.lumbaanayId) {
        await incrementMaxPlayers(validation.lumbaanayId);
        router.push(`/dashboard/games/lumbaanay/${validation.lumbaanayId}/waiting`);
      }
    }
  };

  return (
    <div>
      <Modal 
        heading="Lumbaanay" 
        actionButtonText="Play"
        onAction={() => {
          handlePlay();
        }}
      >
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