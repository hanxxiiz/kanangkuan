"use client";
import React, {useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/buttons/PrimaryButton";
import { useSupabase } from "../providers/SupabaseProvider";

type ChangePasswordProps = {
  onClose: () => void;
  isVisible?: boolean;
};

const ChangePassword: React.FC<ChangePasswordProps> = ({ onClose, isVisible = true }) => {
  const { supabase } = useSupabase();

  const [ currentPassword, setCurrentPassword ] = useState("");
  const [ newPassword, setNewPassword ] = useState("");
  const [ confirmNewPassword, setConfirmNewPassword ] = useState("");

  const [ error, setError ] = useState<string | null>(null);
  const [ success, setSuccess ] = useState<string | null>(null);
  const [ loading, setLoading ] = useState(false);

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError("Supabase client not initialized");
      return;
    }

    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // 1. Get current user email to reauthenticate
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setError("Could not get your account information.");
        setLoading(false);
        return;
      }

      // 2. Reauthenticate using current password
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reauthError) {
        setError("Current password is incorrect.");
        setLoading(false);
        return;
      }

      // 3. Now update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess("Password updated successfully.");
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }

    setLoading(false);
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
                  <input
                    type="password"
                    className="w-full text-lg font-body text-black bg-transparent outline-none"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <div className="border border-[#CFCECE] mt-3" />
                </div>

                {/* New Password */}
                <div className="mt-10">
                  <p className="text-xl font-body text-black mb-3">New Password</p>
                  <input
                    type="password"
                    className="w-full text-lg font-body text-black bg-transparent outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="border border-[#CFCECE] mt-3" />
                </div>

                {/* Confirm New Password */}
                <div className="mt-10">
                  <p className="text-xl font-body text-black mb-3">Confirm New Password</p>
                  <input
                    type="password"
                    className="w-full text-lg font-body text-black bg-transparent outline-none"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                  <div className="border border-[#CFCECE] mt-3" />
                </div>
              </div>

              {error && (
                  <p className="text-red-500 text-sm mt-4">{error}</p>
                )}

                {success && (
                  <p className="text-green-600 text-sm mt-4">{success}</p>
                )}

              {/* Footer Buttons */}
              <div className="flex justify-end items-end w-full gap-3">
                <Button variant="outline" size="lg" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="flat"
                  size="lg"
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? "Changing..." : "Change"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChangePassword;
