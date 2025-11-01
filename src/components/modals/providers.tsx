"use client";

import { createContext, Dispatch, SetStateAction, ReactNode, useState } from "react"
import { useModal } from "./modal";

export const ModalContext = createContext<{
    setShowModal: Dispatch<SetStateAction<boolean>>;
    Modal: React.ComponentType<{
        heading: string;
        children: ReactNode;
        actionButtonText?: string;
        cancelButtonText?: string;
        onAction?: () => void;
    }>;
}>({
    setShowModal: () => {},
    Modal: () => null
})

export default function ModalProvider({
    children,
}: Readonly<{children: React.ReactNode}>) {
    const { setShowModal, Modal } = useModal();

    return (
        <ModalContext.Provider
            value={{
                setShowModal,
                Modal,
            }}
        >
            {children}
        </ModalContext.Provider>
    )
}
