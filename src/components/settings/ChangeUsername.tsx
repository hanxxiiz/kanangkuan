"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/buttons/PrimaryButton";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useDashboard } from "../dashboard/DashboardContext";


type ChangeUsernameProps = {
  onClose: () => void;
  isVisible?: boolean;
};

const ChangeUsername: React.FC<ChangeUsernameProps> = ({ onClose, isVisible = true }) => {
  const { supabase } = useSupabase();
  const { userId, username, refreshUsername } = useDashboard();

   const [newUsername, setNewUsername] = useState(username);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      setError("Username cannot be empty");
      return;
    }

    if (!supabase) {     // <-- FIX
    setError("Supabase client not initialized");
    return;
  }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername })
        .eq("id", userId);

      await refreshUsername(); // update context
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-lg font-body text-black mb-2 border-b-1 border-[#CFCECE]">{username}</p>
                  <label className="text-lg font-body text-black mb-2">New Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="border-b-1 border-[#CFCECE] rounded-md p-2 w-full text-black text-lg outline-none"
                  />
                  {error && <p className="text-red-600 mt-2">{error}</p>}
              </div>

              <div className="flex justify-end items-end w-full gap-3">
                <Button variant="outline" size="lg" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="flat" size="lg"
                onClick={handleChangeUsername}>
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
