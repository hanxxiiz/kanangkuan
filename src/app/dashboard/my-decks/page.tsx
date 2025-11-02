"use client";

import { ModalContext } from '@/components/modals/providers'
import { useRouter } from 'next/navigation';
import React, { useContext } from 'react'

export default function MyDecks() {
    const {Modal, setShowModal} = useContext(ModalContext);
    const router = useRouter();
  return (
    <div>
        <button onClick={() => setShowModal(true)}>Sample</button>
        <Modal
            heading="New Card"
            actionButtonText="Create"
            onAction={() => {
                router.push("/");
                setShowModal(false);
            }}
        >
            <div className="w-full">
                <h5 className="font-body">Folder Name</h5>
                <div className="h-px w-full bg-black" />
            </div>
        </Modal>
    </div>
  )
}
