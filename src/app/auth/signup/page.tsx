"use client";

import Link from 'next/link';
import { signup } from '@/lib/auth-actions';
import Image from 'next/image';
import { useState } from 'react';
import { GrFormView, GrFormViewHide } from 'react-icons/gr';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>(''); 

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    const usernameValue = formData.get('username') as string;
    const passwordValue = formData.get('password') as string;
    const confirmPasswordValue = formData.get('confirmPassword') as string;

    const errors: string[] = [];

    const emailErr = validateEmail(emailValue);
    if (emailErr) errors.push(emailErr);

    if (!usernameValue.trim()) errors.push('Username is required');

    const passwordErr = validatePassword(passwordValue);
    if (passwordErr) errors.push(passwordErr);

    if (!confirmPasswordValue) errors.push('Please confirm your password');
    else if (passwordValue !== confirmPasswordValue) errors.push('Passwords do not match');

    if (errors.length > 0) {
      setError(errors.join('. ')); 
      setLoading(false);
      return;
    }

    try {
      await signup(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-4xl h-[600px] flex overflow-hidden shadow-2xl bg-white">
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md -mt-30">
            <h2 className="text-4xl font-main text-gray-900 mt-28">Sign up</h2>
            <form onSubmit={handleSubmit}>
              <div className="mt-8 space-y-7">
                <div className="relative">
                  <input
                    name="email"
                    id="email"
                    type="email"
                    placeholder=" "
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    name="username"
                    id="username"
                    type="text"
                    placeholder=" "
                    disabled={loading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-b text-black border-gray-600 py-1 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                    autoComplete="off"
                  />
                  <label
                    htmlFor="username"
                    className="absolute text-black left-0 top-1 cursor-text text-sm peer-focus:text-xs peer-focus:-top-4 transition-all peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
                  >
                    Username
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder=" "
                    autoComplete="off"
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-b text-black border-gray-600 py-1 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 bg-white cursor-pointer"
                      disabled={loading}
                    >
                      {showPassword ? <GrFormView className="text-2xl" /> : <GrFormViewHide className="text-2xl" />}
                    </button>
                  )}
                  <label
                    htmlFor="password"
                    className="absolute text-black left-0 top-1 cursor-text text-sm peer-focus:text-xs peer-focus:-top-4 transition-all peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder=" "
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-b text-black border-gray-600 py-1 pr-12 focus:border-b-2 transition-colors focus:outline-none peer bg-inherit w-full"
                    autoComplete="off"
                  />
                  {confirmPassword && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 bg-white cursor-pointer"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <GrFormView className="text-2xl" /> : <GrFormViewHide className="text-2xl" />}
                    </button>
                  )}
                  <label
                    htmlFor="confirmPassword"
                    className="absolute text-black left-0 top-1 cursor-text text-sm peer-focus:text-xs peer-focus:-top-4 transition-all peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
                  >
                    Confirm Password
                  </label>
                </div>

                {error && (
                  <div className="border-1 border-pink rounded-lg py-2 text-pink text-sm font-body text-center -mt-4">
                    {error}
                  </div>
                )}

                <div className="flex flex-col items-center justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-[60%] py-1 bg-white border-1 border-gray-900 rounded-full text-gray-900 font-main hover:bg-gray-900 hover:text-white transition-colors text-base mt-8 cursor-pointer"
                  >
                    {loading ? "Signing up..." : "Sign up"}
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
              <Image
                src="/kanangkuan-logo.png"
                alt="Kanang Kuan"
                width={0}
                height={0}
                sizes='100vw'
                className="w-[3.5rem] h-[3.5rem]"
              />
              <h2 className="font-main text-2xl text-black">Kanang Kuan</h2>
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
