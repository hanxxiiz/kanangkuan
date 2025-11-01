"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signup } from '@/lib/auth-actions';

export default function SignUpPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-4xl h-[600px] flex overflow-hidden shadow-2xl bg-white">
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md -mt-30">
            <h2 className="text-4xl font-main text-gray-900 mt-28">
              Sign up
            </h2>
            <form action="">
              <div className="mt-8 space-y-7">
                <div className="relative">
                  <input
                    name="email"
                    id="email"
                    type="email"
                    placeholder=" "
                    className="border-b border-gray-600 py-1 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                    autoComplete="off"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 top-1 cursor-text text-sm peer-focus:text-xs peer-focus:-top-4 transition-all peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
                  >
                    Email
                  </label>
                </div>

                <div className="relative">
                  <input
                    name="username"
                    id="username"
                    type="text"
                    placeholder=" "
                    className="border-b border-gray-600 py-1 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                    autoComplete="off"
                  />
                  <label
                    htmlFor="username"
                    className="absolute left-0 top-1 cursor-text text-sm peer-focus:text-xs peer-focus:-top-4 transition-all peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
                  >
                    Username
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder=" "
                    className="border-b border-gray-600 py-1 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                    autoComplete="off"
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-0 top-1 cursor-text text-sm peer-focus:text-xs peer-focus:-top-4 transition-all peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder=" "
                    className="border-b border-gray-600 py-1 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                    autoComplete="off"
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="absolute left-0 top-1 cursor-text text-sm peer-focus:text-xs peer-focus:-top-4 transition-all peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
                  >
                    Confirm Password
                  </label>
                </div>


                <div className="flex flex-col items-center justify-center">
                  <button
                    formAction={signup}
                    className="w-[60%] py-1 bg-white border-1 border-gray-900 rounded-full text-gray-900 font-main hover:bg-gray-900 hover:text-white transition-colors text-base mt-8 cursor-pointer"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-bl from-pink to-lime-300 
          relative rounded-tl-[15%] rounded-bl-[15%] drop-shadow-lg overflow-hidden">
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
                Welcome, Classmate
              </h1>
              <p className="p-3 font-body text-xs text-white">
                Already have an account?
              </p>
              <Link
                href="/auth/signin"
                className="px-16 py-2 bg-pink cursor-pointer text-white text-md font-main rounded-full shadow-lg hover:bg-cyan hover:scale-110 transition-all duration-300"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}