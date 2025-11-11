"use client";

import { ModalContext } from '@/components/modals/providers';
import React, { useContext } from 'react'
import { FiUploadCloud } from "react-icons/fi";

export default function AIImportModal() {
  const { Modal, setShowModal } = useContext(ModalContext);
  return (
    <div>
      <Modal 
        heading="AI Import"
        actionButtonText="Create"
      >
        <div className="mt-3 w-full rounded-4xl border-1 flex flex-col justify-center items-center py-10 cursor-pointer">
          <FiUploadCloud className="text-9xl m-1"/>
          <h2 className="text-base font-main">Upload File</h2>
        </div>
      </Modal>
    </div>
  )
}
