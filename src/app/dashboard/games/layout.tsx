"use client";

import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import {ModalProvider} from "@/components/modals/providers";


export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleBack = () => { 
    
  };

  return (
    <ModalProvider>
        <div className="fixed inset-0 flex flex-col bg-black">
          <div className="flex-shrink-0 w-full flex items-center px-3 sm:px-6 py-4">
              <div className="flex items-center gap-3 sm:gap-5">
                <FaArrowLeft
                    onClick={handleBack}
                    className="cursor-pointer text-2xl text-[#43434a] hover:xl:text-gray-200  hover:scale-105 transition-all duration-250"
                />
              </div>
          </div>

          <div className="flex-1 min-h-0 w-full overflow-y-auto lg:overflow-hidden">{children}</div>
        </div>
    </ModalProvider>
  );
}