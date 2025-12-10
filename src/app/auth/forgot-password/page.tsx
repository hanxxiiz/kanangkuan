"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = formData.get("email") as string;

        await supabase.auth.resetPasswordForEmail(email);

        setLoading(false);
    }
  return (
    <div className="min-h-screen flex items-center justify-center px-80 bg-gradient-to-br from-[#FEEF69] to-cyan">
        <div className="relative w-full flex flex-col items-center justify-center py-24 px-54 rounded-[75px] bg-white shadow-2xl">
            <div className="absolute top-10 left-10">
                <button
                    onClick={() => router.push("/auth/signin")}
                    className="rounded-lg text-5xl text-gray-400 hover:text-black flex items-center justify-center gap-2
                         transition-colors duration-300 ease-in-out cursor-pointer"
                >
                    <IoIosArrowRoundBack />
                </button>
            </div>
            <div className="text-black font-main text-5xl">{`Forgot password?`}</div>
            <div className="mt-3 text-gray-700 font-body">{`Enter the email associated with your account.`}</div>

            <form className="w-full items-center justify-center" onSubmit={handleSubmit}>
                <div className="mt-7 w-full flex flex-col items-start justify-start">
                    <label className="font-main text-base">Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder=" "
                        className="border-b text-2xl text-black border-gray-600 py-3 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                        autoComplete="off"
                    />
                </div>

                <div className="flex justify-center items-center mt-10">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-24 py-3 bg-cyan cursor-pointer text-white text-md font-main rounded-full shadow-lg hover:bg-pink hover:scale-110 transition-all duration-300"
                    >
                        {loading ? "Sending Email..." : "Send Email"}
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}
