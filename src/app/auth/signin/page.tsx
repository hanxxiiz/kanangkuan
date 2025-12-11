"use client";

import Link from 'next/link';
import { login } from '@/lib/auth-actions';
import { signInWithGoogle } from '@/lib/auth-actions';
import { FcGoogle } from "react-icons/fc";
import 'animate.css';
import Image from 'next/image';
import { useState } from 'react';
import { GrFormView, GrFormViewHide } from 'react-icons/gr';

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit (e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await login(formData);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-cyan to-lime-300  lg:bg-none lg:from-transparent lg:to-transparent lg:bg-black p-4">
      <div className="w-full max-w-4xl min-h-[600px] flex flex-col-reverse lg:flex-row overflow-hidden shadow-2xl bg-white rounded-lg lg:rounded-none">
        <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-bl from-cyan to-lime-300 
          relative rounded-tr-[15%] rounded-br-[15%] drop-shadow-lg overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-between p-12">
            <div className="flex items-center gap-2">
              <Image
                src="/kanangkuan-logo.png"
                alt="Kanang Kuan"
                width={0}
                height={0}
                sizes='100vw'
                className="w-[3.5rem] h-[3.5rem]"
              />
              <h2 className="font-main text-black text-2xl">Kanang Kuan</h2>
            </div>

            <div className="mb-40">
              <h1 className="text-6xl font-main text-white leading-none">
                {`Hello, Classmate`}
              </h1>
              <p className="p-3 font-body text-xs text-white">
                {"Don't have an account yet?"}
              </p>
              <Link
                href="/auth/signup"
                className="inline-block px-16 py-2 bg-cyan cursor-pointer text-white text-md font-main rounded-full shadow-lg hover:bg-pink hover:scale-110 transition-all duration-300"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <h2 className="text-3xl sm:text-4xl font-main text-gray-900 mb-6 sm:mb-8">
              Sign in
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 sm:space-y-7">
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder=" "
                    className="border-b text-black border-gray-600 py-1 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                    autoComplete="off"
                  />
                  <label
                    htmlFor="email"
                    className="absolute text-black left-0 top-1 cursor-text text-sm peer-focus:text-xs peer-focus:-top-4 transition-all peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
                  >
                    Email
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    disabled={loading}
                    className="border-b border-gray-600 text-black py-1 focus:border-b-2 transition-colors 
                              focus:outline-none peer bg-inherit w-full pr-10"
                    autoComplete="off"
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-0 bg-gray-50 cursor-pointer"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <GrFormView className="text-2xl sm:text-3xl" />
                      ) : (
                        <GrFormViewHide className="text-2xl sm:text-3xl" />
                      )}
                    </button>
                  )}
                  <label
                    htmlFor="password"
                    className="absolute left-0 top-1 text-black cursor-text text-sm peer-focus:text-xs peer-focus:-top-4 transition-all peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
                  >
                    Password
                  </label>
                </div>

                <div className="text-right -mt-5">
                  <button 
                    type="button"
                    className="text-xs font-body text-gray-400 hover:text-cyan cursor-pointer transition-colors duration-200 ease-in-out"
                  >
                    {`Forgot password?`}
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-white border border-gray-900 rounded-full text-gray-900 font-main hover:bg-gray-900 hover:text-white transition-colors text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>

                  <div className="text-center font-body text-xs text-gray-400 my-2">
                    or continue with
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      signInWithGoogle();
                    }}
                    disabled={loading}
                    className="w-full py-2 bg-white border border-gray-900 rounded-full text-gray-900 font-main hover:bg-gray-900 hover:text-white transition-colors text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FcGoogle className="inline-block mr-2" />
                    Google
                  </button>
                </div>

                <div className="lg:hidden text-center mt-10 border-t border-gray-300">
                  <p className="text-sm text-gray-600 mb-3 mt-4">
                    {`Don't have an account yet?`}
                  </p>
                  <Link
                    href="/auth/signup"
                    className="inline-block px-12 py-2 bg-cyan text-white text-sm font-main rounded-full shadow-lg hover:bg-pink hover:scale-105 transition-all duration-300"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}