"use client";

import React from "react";

const DashboardHeader = () => {
  return (
    <div className="relative mx-auto max-w-[1000px] lg:max-w-[1200px] 2xl:max-w-[1300px] mt-5 sm:mt-10 sm:px-4">
      {/* Desktop-only mascot images */}
      <img
        src="/dashboard/dashboard-mascot-shadow.png"
        alt="Decorative"
        className="hidden lg:block absolute z-20 right-25 w-[330px] h-[290px] pointer-events-none opacity-90"
        style={{ bottom: 0 }}
      />
      <img
        src="/dashboard/dashboard-mascot.png"
        alt="Decorative"
        className="hidden lg:block absolute z-20 right-0 w-[350px] h-auto pointer-events-none"
        style={{ bottom: 0 }}
      />

      <header className="e-card">
        {/* Decorative wave elements */}
        <div className="wave z-0"></div>
        <div className="wave z-0"></div>
        <div className="wave z-0"></div>

        {/* Mobile/Tablet*/}
        <div className="absolute z-0 -right-7 -bottom-4 w-[280px] sm:w-[280px] md:w-[350px] lg:hidden ">
          <img
            src="/dashboard/dashboard-mascot.png"
            alt="Decorative"
            className="w-full h-auto pointer-events-none"
          />
        </div>
    
        <div className="relative z-10 h-full px-6 sm:px-8 lg:px-12 py-6 sm:py-12 flex flex-col justify-center items-start">
          <h2 className="font-main text-3xl sm:text-4xl lg:text-5xl">
            Welcome, <span className="block sm:inline">classmate!</span>
          </h2>
          <p className="font-regular font-semibold text-lg sm:text-xl lg:text-3xl text-lime mt-1 sm:mt-2 lg:pl-2">
            Ready to get started?
          </p>
          <div className="mt-5 sm:mt-6">
            <button className="font-main w-fit px-5 sm:px-7 py-2 sm:py-3 bg-lime-400 text-white text-sm sm:text-base lg:text-lg rounded-full cursor-pointer transition-all duration-300 hover:bg-cyan hover:scale-105">
              Start Learning
            </button>
          </div>
        </div>

        <style jsx>{`
          .e-card {
            background: linear-gradient(170deg, #C401DB, #FD14BB);
            box-shadow: 0px 8px 28px -9px rgba(0, 0, 0, 0.45);
            position: relative;
            width: 100%;
            min-height: 240px; /* Use min-height for flexibility */
            border-radius: 30px;
            overflow: hidden;
          }

          .wave {
            position: absolute;
            width: 1940px;
            height: 1900px;
            opacity: 0.5;
            left: -50%;
            top: 100px; /* Corrected: Added 'px' unit */
            border-radius: 40%;
            animation: wave 15s infinite linear;
            background: linear-gradient(360deg, #FD14BB 60%, #C401DB);
          }

          .wave:nth-child(2) {
            top: 250px;
            animation-duration: 30s;
          }

          .wave:nth-child(3) {
            top: 250px;
            animation-duration: 20s;
          }

          @keyframes wave {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 767px) {
            .e-card {
              min-height: 220px;
            }
            .wave {
              opacity: 1;
              left: -75%;
              /* FIX: Pulls the waves up into view on mobile */
              top: 5px; 
            }

            .wave:nth-child(2),
            .wave:nth-child(3) {
              /* FIX: Adjusts the other waves for mobile view */
              top: 150px;
            }
          }
        `}</style>
      </header>
    </div>
  );
};

export default DashboardHeader;