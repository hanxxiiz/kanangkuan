"use client";

import { ReactNode, useEffect, useState } from "react";

function GameModal({
    showModal,
    heading,
    xp,
    children,
    onAction,
}: {
    showModal: boolean;
    heading: string;
    xp: number;
    children: ReactNode;
    onAction?: () => void;
}) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        if (showModal) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showModal]);

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs pointer-events-none" />
            <div
                className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-xl mx-4 z-10"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex flex-col justify-center items-center px-10 pt-5 pb-15">
                    <div className="fixed flex flex-col top-0 right-0 items-center justify-center">
                        <img src="/dashboard/star.svg" className="w-20 mt-5 mx-5" />
                        <h2 className="text-base text-white font-main">{`${xp} XP`}</h2>
                    </div>
                    <h3 className="text-3xl text-pink font-main">{`Betting Time!`}</h3>
                    <h2 className="text-5xl text-black font-main">{heading}</h2>
                    <div className="flex-1 flex-col flex items-center justify-center w-full border-1 rounded-2xl m-6 p-5 overflow-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}


export function useGameModal() {
    const [showModal, setShowModal] = useState(false);

    const ModalComponent = ({
        heading,
        children,
        xp,
        onAction,
    }: {
        heading: string;
        xp: number;
        children: ReactNode;
        onAction?: () => void;
    }) => (
        <GameModal
            showModal={showModal}
            heading={heading}
            xp={xp}
            onAction={onAction}
        >
            {children}
        </GameModal>
    );

    return {
        showModal,
        setShowModal,
        GameModal: ModalComponent,
    };
}
