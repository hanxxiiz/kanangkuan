"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/buttons/PrimaryButton";

type ChangeUsernameProps = {
  onClose: () => void;
  isVisible?: boolean;
};

const ChangeUsername: React.FC<ChangeUsernameProps> = ({ onClose, isVisible = true }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Background Overlay */}
          <motion.div
            className="fixed inset-0 bg-[#6D6D6D]/40 backdrop-blur-md z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose} // close when clicking outside
          />

          {/* Popup Card */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="bg-white border border-black rounded-2xl shadow-2xl w-[800px] h-[600px] md:w-[600px] md:h-[400px] lg:w-[800px] lg:h-[600px] sm:w-full sm:h-full flex flex-col items-center justify-between p-20">
              <div className="w-full">
                <p className="text-4xl text-black font-main">Change Username</p>
                <p className="text-xl font-body text-black mt-5 mb-8">Current Username</p>
                <p className="text-lg font-body text-black mb-2">[Current Username]</p>
                <div className="border border-[#CFCECE] w-full" />
              </div>

              <div className="flex justify-end items-end w-full gap-3">
                <Button variant="outline" size="lg" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="flat" size="lg">
                  Change
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChangeUsername;
