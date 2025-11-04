"use client";

import React, { useContext, useEffect, useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FaArrowLeft, FaClone } from "react-icons/fa6";
import { usePathname, useRouter } from "next/navigation";
import { ModalContext } from "@/components/modals/providers";

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { Modal, setShowModal } = useContext(ModalContext);
  const [sortOrder, setSortOrder] = useState<"oldest" | "newest" | "random">(
    "oldest"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const showSettings =
    mounted &&
    (pathname === "/dashboard/practice/basic-review" ||
      pathname === "/dashboard/practice/audio-player");

  const showText = mounted && pathname === "/dashboard/practice/basic-review";
  const isBasicReview = mounted && pathname === "/dashboard/practice/basic-review";

  const handleBack = () => {
    router.push("/dashboard/practice");
  };

  const handleSettings = () => {
    setShowModal(true);
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 w-full flex items-center px-6 py-4">
        <div className="flex items-center gap-5">
          <FaArrowLeft
            onClick={handleBack}
            className="cursor-pointer text-2xl text-[#101220] xl:text-gray-200 hover:text-[#101220] hover:scale-105 transition-all duration-250"
          />
          {showSettings && (
            <IoSettingsSharp
              onClick={handleSettings}
              className="cursor-pointer text-2xl text-[#101220] xl:text-gray-200 hover:text-[#101220] hover:scale-105 transition-all duration-250"
            />
          )}
        </div>

        {showText && (
          <div className="flex items-center gap-3 ml-5 sm:ml-7">
            <FaClone className="text-2xl text-[#101220]" />
            <span className="text-[#101220] text-md sm:text-xl font-regular truncate max-w-[185px] sm:max-w-none">
              CPEPE361 - Software Processes
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 w-full overflow-hidden">{children}</div>

      {/* Basic Review Settings Modal */}
      {isBasicReview && (
        <Modal
          heading="Settings"
          actionButtonText="&nbsp;&nbsp;Save&nbsp;&nbsp;"
          onAction={() => {
            console.log("Settings saved", sortOrder);
            setShowModal(false);
          }}
        >
          <div className="py-4">
            <h2 className="font-semibold text-2xl text-black mb-6">
              Sort Cards
            </h2>

            <div className="space-y-2 flex flex-col items-center">
              {/* Oldest to Newest */}
              <div className="flex items-center py-1 gap-40 w-fit">
                <span className="font-body text-black text-xl w-48 text-left">
                  Oldest to Newest
                </span>
                <button
                  onClick={() => setSortOrder("oldest")}
                  className={`cursor-pointer w-32 h-10 rounded-full relative transition-colors duration-500 ${
                    sortOrder === "oldest" ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-transform duration-500 ${
                      sortOrder === "oldest"
                        ? "translate-x-[92px]"
                        : "translate-x-1"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Newest to Oldest */}
              <div className="flex items-center py-1 gap-40 w-fit">
                <span className="font-body text-black text-xl w-48 text-left">
                  Newest to Oldest
                </span>
                <button
                  onClick={() => setSortOrder("newest")}
                  className={`cursor-pointer w-32 h-10 rounded-full relative transition-colors duration-500 ${
                    sortOrder === "newest" ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-transform duration-500 ${
                      sortOrder === "newest"
                        ? "translate-x-[92px]"
                        : "translate-x-1"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Random Order */}
              <div className="flex items-center py-1 gap-40 w-fit">
                <span className="font-body text-black text-xl w-48 text-left">
                  Random Order
                </span>
                <button
                  onClick={() => setSortOrder("random")}
                  className={`cursor-pointer w-32 h-10 rounded-full relative transition-colors duration-500 ${
                    sortOrder === "random" ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-transform duration-500 ${
                      sortOrder === "random"
                        ? "translate-x-[92px]"
                        : "translate-x-1"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
