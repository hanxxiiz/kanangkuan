'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoMenu } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";

 const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100){
        setIsVisible(true);
      }
      else{
        setIsVisible(false);
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", controlNavbar)

    return () => window.removeEventListener("scroll", controlNavbar)
  }, [])


  return (
     <nav className={`fixed w-full bg-white shadow-md transition-transform
      duration-300 z-50 ${ isVisible ? "translate-y-0": "-translate-y-full"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex flex-row items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="kanangkuan-logo.svg"
                  alt="Kanang Kuan"
                  className="w-[3.5rem] h-[3.5rem]"
                />
                <h2 className="font-main text-2xl hover:text-pink transition-colors">Kanang Kuan</h2>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" 
                className="text-black hover:text-lime px-3 py-2
                rounded-md text-md font-body transition-colors"
              >
                  Features
              </Link>
              <Link href="#about" 
                className="text-black hover:text-lime px-3 py-2
                rounded-md text-md font-body transition-colors"
              >
                  About
              </Link>
              <Link
                href="/signin"
                className="m-2 px-6 py-2 bg-pink cursor-pointer text-white text-lg font-main rounded-full hover:bg-lime hover:scale-110 transition-all duration-300"
              >
                Get Started
              </Link>

              <div className="md:hidden flex items-center">
                <button onClick={() => setIsMenuVisible(!isMenuVisible)}
                className="inline-flex items-center justify-center p-2 rounded-md
                text-gray-600 hover:text-gray-900"
                >
                  {!isMenuVisible ? (
                    <IoMenu className="text-3xl" />
                  ) : (
                    <IoIosClose className="text-3xl" />
                  )}
                </button>
              </div>
            </div>

            <div className={`md:hidden transition-all duration-300 ease-in-out
            ${isMenuVisible ? "max-h-64 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link href="#features" onClick={() => 
                  setIsMenuVisible(false)
                } 
                  className="block px-3 py-2 rounded-md text-base font-body"
                >
                    Features
                </Link>
                <Link href="#about" onClick={() => 
                  setIsMenuVisible(false)
                } 
                  className="block px-3 py-2 rounded-md text-base font-body"
                >
                    About
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
   )
 }
 
 export default Navbar