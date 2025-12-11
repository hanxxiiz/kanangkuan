"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { GrFormView, GrFormViewHide } from 'react-icons/gr';

export default function ResetPasswordPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirm-password") as string;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            setLoading(false);
            return;
        }
        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        router.push("/auth/signin");
    }

  return (
    <div className="min-h-screen flex items-center justify-center px-80 bg-gradient-to-br from-pink to-[#FEEF69]">
        <div className="relative w-full flex flex-col items-center justify-center py-24 px-54 rounded-[75px] bg-white shadow-2xl">
            <div className="text-black font-main text-5xl">{`Reset password`}</div>
            <div className="mt-3 text-gray-700 font-body">{`Enter your new password.`}</div>

            <form onSubmit={handleSubmit} className="w-full">
                <div className="mt-7 w-full flex flex-col items-start justify-start space-y-3">
                    <div className="relative w-full">
                        <label className="font-main text-base">New Password</label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder=" "
                            className="border-b text-2xl text-black border-gray-600 pr-12 py-3 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                            autoComplete="off"
                            disabled={loading}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-3 bg-white cursor-pointer"
                            disabled={loading}
                        >
                            {showPassword ? (
                                <GrFormViewHide className="text-3xl" />
                            ) : (
                                <GrFormView className="text-3xl" />
                            )}
                        </button>
                    </div>

                    <div className="relative w-full">
                        <label className="font-main text-base">Confirm New Password</label>
                        <input
                            id="confirm-password"
                            name="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder=" "
                            className="border-b pr-12 text-2xl text-black border-gray-600 py-3 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                            autoComplete="off"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute top-1/2 right-3 bg-white cursor-pointer"
                            disabled={loading}
                        >
                            {showConfirmPassword ? (
                                <GrFormView className="text-3xl" />
                            ) : (
                                <GrFormViewHide className="text-3xl" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-10 flex justify-center items-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-24 py-3 bg-pink cursor-pointer text-white text-md font-main rounded-full shadow-lg hover:bg-cyan hover:scale-110 transition-all duration-300"
                    >
                        {loading ? "Changing Password..." : "Change password"}
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}
