"use client";

import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { Button } from "../buttons/PrimaryButton";

function Modal({
    showModal,
    setShowModal,
    heading,
    children,
    actionButtonText = "Confirm",
    onAction,
}: {
    showModal: boolean;
    setShowModal: Dispatch<SetStateAction<boolean>>;
    heading: string;
    children: ReactNode;
    actionButtonText?: string;
    onAction?: () => void;
}) {
    const [cancelButtonClicked, setCancelButtonClicked] = useState(false);
    const [actionButtonClicked, setActionButtonClicked] = useState(false);

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div 
                        className="absolute inset-0 bg-black/25 backdrop-blur-xs"
                        onClick={() => setShowModal(false)}
                    />

                    <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-xl mx-4 z-10">
                        <div className="text-left font-main">
                            <h2 className="text-4xl font-semibold">{heading}</h2>
                            <div className="h-px my-2 w-full bg-black" />
                            <div className="flex-1 overflow-auto mb-6">
                                {children}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button 
                                    variant="outline"
                                    size="lg"
                                    disabled={cancelButtonClicked}
                                    onClick={() => {
                                        setCancelButtonClicked(true);
                                        setShowModal(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="flat"
                                    size="lg"
                                    disabled={actionButtonClicked}
                                    onClick={() => {
                                        setActionButtonClicked(true);
                                        if (onAction) {
                                            onAction();
                                        }
                                    }}
                                >
                                    {actionButtonText}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function useModal() {
  const [showModal, setShowModal] = useState(false);

  const ModalComponent = ({
    heading,
    children,
    actionButtonText,
    onAction,
  }: {
    heading: string;
    children: ReactNode;
    actionButtonText?: string;
    onAction?: () => void;
  }) => {
    return (
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        heading={heading}
        actionButtonText={actionButtonText}
        onAction={onAction}
      >
        {children}
    </Modal>
    );
  };

  return {
    setShowModal,
    showModal,
    Modal: ModalComponent,
  };
}


// USAGE

// <IMPORT THE FOLLOWING>
// import { ModalContext } from '@/components/modals/providers'

// <WITHIN YOUR FUNCTION, ADD THIS BEFORE YOUR RETURN VALUE>
// const {Modal, setShowModal} = useContext(ModalContext);

// <FULL EXAMPLE>
// "use client";

// import { ModalContext } from '@/components/modals/providers'
// import { useRouter } from 'next/navigation';
// import React, { useContext } from 'react'

// export default function MyDecks() {
//     const {Modal, setShowModal} = useContext(ModalContext);
//     const router = useRouter();
//   return (
//     <div>
//         <button onClick={() => setShowModal(true)}>Sample</button>
//         <Modal
//             heading="New Card"
//             actionButtonText="Create"
//             onAction={() => {
//                 router.push("/");
//                 setShowModal(false);
//             }}
//         >
//             <THIS IS WHERE YOU EDIT THE CONTENT OF THE SPECIFIC MODAL YOURE WORKING ON>

// 	    <div className="w-full">
//                 <h5 className="font-body">Folder Name</h5>
//                 <div className="h-px w-full bg-black" />
//             </div>

//         </Modal>
//     </div>
//   )
// }

