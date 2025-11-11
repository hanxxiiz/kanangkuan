"use client";

import { createContext, Dispatch, SetStateAction, ReactNode, useState } from "react"
import { useModal } from "./modal";

export const ModalContext = createContext<{
    setShowModal: Dispatch<SetStateAction<boolean>>;
    showModal: boolean; 
    Modal: React.ComponentType<{
        heading: string;
        children: ReactNode;
        actionButtonText?: string;
        cancelButtonText?: string;
        onAction?: () => void;
    }>;
}>({
    setShowModal: () => {},
    showModal: false, 
    Modal: () => null
})

export default function ModalProvider({
    children,
}: Readonly<{children: React.ReactNode}>) {
    const { setShowModal, showModal, Modal } = useModal(); 

    return (
        <ModalContext.Provider
            value={{
                setShowModal,
                showModal, 
                Modal,
            }}
        >
            {children}
        </ModalContext.Provider>
    )
}
