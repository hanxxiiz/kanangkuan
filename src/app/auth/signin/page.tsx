"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Sign in:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-4xl h-[600px] flex overflow-hidden shadow-2xl bg-white">
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-bl from-cyan to-lime-300 
        relative rounded-tr-[10%] rounded-br-[10%] drop-shadow-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <img
              src="/kanangkuan-logo.png"
              alt="Kanang Kuan"
              className="w-[3.5rem] h-[3.5rem]"
            />
            <h2 className="font-main text-2xl hover:text-pink transition-colors">Kanang Kuan</h2>
          </div>

          <div className="mb-40">
            <h1 className="mb-5 text-6xl font-main text-white leading-none">
              Hello, Classmate
            </h1>
            <Link
              href="/auth/signin"
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

          <div className="mt-6 space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 font-body border-b-2 border-gray-300 bg-transparent focus:border-gray-900 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 font-body border-b-2 border-gray-300 bg-transparent focus:border-gray-900 focus:outline-none transition-colors"
              />
            </div>

            <div className="text-right -mt-2">
              <button className="text-xs font-body text-gray-600 hover:text-gray-900 cursor-pointer">
                Forgot password?
              </button>
            </div>

            <div className="flex flex-col items-center justify-center">
              <button
                onClick={handleSignIn}
                className="w-[60%] py-1 bg-white border-1 border-gray-900 rounded-full text-gray-900 font-main hover:bg-gray-900 hover:text-white transition-colors text-base mt-8 cursor-pointer"
              >
                Sign in
              </button>

              <div className="text-center font-body text-xs text-gray-500 my-2">
                or continue with
              </div>

              <button
                onClick={() => console.log('Google sign in')}
                className="w-[60%] py-1 bg-white border-1 border-gray-900 rounded-full text-gray-900 font-main hover:bg-gray-900 hover:text-white transition-colors text-base cursor-pointer
                flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}