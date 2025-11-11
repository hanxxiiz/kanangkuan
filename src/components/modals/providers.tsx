"use client";

import { createContext, Dispatch, SetStateAction, ReactNode } from "react"
import { useModal, useChallengeModal } from "./modal";

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

export function ModalProvider({
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


//THIS IS FOR CHALLENGE MODAL

export const ChallengeModalContext = createContext<{
    setShowModal: Dispatch<SetStateAction<boolean>>;
    Modal: React.ComponentType<{
        subheading: string;
        heading: string;
        xp: number;
        children: ReactNode;
        actionButtonText?: string;
        onAction?: () => void;
    }>;
}>({
    setShowModal: () => {},
    Modal: () => null
})

export function ChallengeModalProvider({
    children,
}: Readonly<{children: React.ReactNode}>) {
    const { setShowModal, Modal } = useChallengeModal();

    return (
        <ChallengeModalContext.Provider
            value={{
                setShowModal,
                Modal,
            }}
        >
            {children}
        </ChallengeModalContext.Provider>
    )
}
