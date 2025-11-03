"use client";

import Link from 'next/link';
import { login } from '@/lib/auth-actions';
import { signInWithGoogle } from '@/lib/auth-actions';
import { FcGoogle } from "react-icons/fc";
import 'animate.css';

export default function SignInPage() {

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
              {"Don't have an account yet?"}
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
          <form action={login}>
            <div className="mt-8 space-y-7">
              <div className="relative">
                <input
                  id="email"
                  name="email"
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

              <div className="text-right -mt-7">
                <button className="text-xs font-body text-gray-400 hover:text-cyan cursor-pointer">
                  Forgot password?
                </button>
              </div>

              <div className="flex flex-col items-center justify-center">
                <button
                  type="submit"
                  className="w-[60%] py-1 bg-white border-1 border-gray-900 rounded-full text-gray-900 font-main hover:bg-gray-900 hover:text-white transition-colors text-base mt-8 cursor-pointer"
                >
                  Sign in
                </button>

                <div className="text-center font-body text-xs text-gray-400 my-2">
                  or continue with
                </div>

                <button
                  type="button"
                  onClick={() => {
                    signInWithGoogle();
                  }}
                  className="w-[60%] py-1 bg-white border-1 border-gray-900 rounded-full text-gray-900 font-main hover:bg-gray-900 hover:text-white transition-colors text-base cursor-pointer"
                >
                  <FcGoogle className="inline-block mr-2" />
                    Google
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}