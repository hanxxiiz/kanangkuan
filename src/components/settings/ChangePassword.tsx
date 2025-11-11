"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/buttons/PrimaryButton";

type ChangePasswordProps = {
  onClose: () => void;
  isVisible?: boolean;
};

const ChangePassword: React.FC<ChangePasswordProps> = ({ onClose, isVisible = true }) => {
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

          {/* Centered Popup */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-white border border-black rounded-2xl shadow-2xl w-[800px] h-[600px] flex flex-col items-center justify-between p-20">
              
              {/* Header */}
              <div className="w-full">
                <p className="text-4xl text-black font-main">Change Password</p>

                {/* Current Password */}
                <div className="mt-8">
                  <p className="text-xl font-body text-black mb-3">Current Password</p>
                  <p className="text-lg font-body text-black">[Current Password]</p>
                  <div className="border border-[#CFCECE] mt-3" />
                </div>

                {/* Re-enter New Password */}
                <div className="mt-10">
                  <p className="text-xl font-body text-black mb-3">Re-enter New Password</p>
                  <p className="text-lg font-body text-black mt-20 md:mt-25 sm:mt-20">[Re-enter New Password]</p>
                  <div className="border border-[#CFCECE] mt-3" />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end items-end w-full gap-3">
                <Button variant="outline" size="lg" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="flat" size="lg">Change</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChangePassword;
