import React from "react";
import ModalProvider from "@/components/modals/providers";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full">
      <ModalProvider>
          {children}
      </ModalProvider>
    </div>
  );
}