"use client";

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/lib/auth-actions';
import SignInWithGoogleButton from './SignInWithGoogleButton';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-4xl h-[600px] flex overflow-hidden shadow-2xl bg-white">
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-bl from-cyan to-lime-300 
        relative rounded-tr-[15%] rounded-br-[15%] drop-shadow-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <img
              src="/kanangkuan-logo.png"
              alt="Kanang Kuan"
              className="w-[3.5rem] h-[3.5rem]"
            />
            <h2 className="font-main text-2xl">Kanang Kuan</h2>
          </div>

          <div className="mb-40">
            <h1 className="text-6xl font-main text-white leading-none">
              Hello, Classmate
            </h1>
            <p className="p-3 font-body text-xs text-white">
              Don't have an account yet?
            </p>
            <Link
              href="/auth/signup"
              className="px-16 py-2 bg-cyan cursor-pointer text-white text-md font-main rounded-full shadow-lg hover:bg-pink hover:scale-110 transition-all duration-300"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md -mt-30">
          <h2 className="text-4xl font-main text-gray-900 mt-28">
            Sign in
          </h2>

          <div className="mt-8 space-y-7">
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full font-body border-gray-500 border-b py-1 focus:outline-none focus:border-black focus:border-b-2 transition-colors peer"
                autoComplete="off"
              />
              <label
                htmlFor="email"
                className="font-body absolute text-xs left-0 -top-4 cursor-text text-gray-500 peer-focus:text-black transition-all"
              >
                Email
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full font-body border-gray-500 border-b py-1 focus:outline-none focus:border-black focus:border-b-2 transition-colors peer"
                autoComplete="off"
              />
              <label
                htmlFor="password"
                className="font-body absolute text-xs left-0 -top-4 cursor-text text-gray-500 peer-focus:text-black transition-all"
              >
                Password
              </label>
            </div>

            <div className="text-right -mt-7">
              <button className="text-xs font-body text-gray-400 hover:text-cyan cursor-pointer">
                Forgot password?
              </button>
            </div>

            <div className="flex flex-col items-center justify-center">
              <button
                type="submit"
                formAction={login}
                className="w-[60%] py-1 bg-white border-1 border-gray-900 rounded-full text-gray-900 font-main hover:bg-gray-900 hover:text-white transition-colors text-base mt-8 cursor-pointer"
              >
                Sign in
              </button>

              <div className="text-center font-body text-xs text-gray-400 my-2">
                or continue with
              </div>

              <SignInWithGoogleButton />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}