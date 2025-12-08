"use client";

import { useState } from "react";
import ImportProgressModal from "@/components/dashboard/my-decks/ImportProgressModal";

export default function TestPage() {
  const [showModal, setShowModal] = useState(true);
  const [progress, setProgress] = useState(50);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Show Import Modal
      </button>
      
      <ImportProgressModal
        showModal={showModal}
        setShowModal={setShowModal}
        progress={progress}
        statusText="Extracting the text..."
      />
    </div>
  );
}