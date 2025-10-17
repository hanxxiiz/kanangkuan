"use client";

import React from "react";

const DashboardHeader = () => {
  return (
    <div className="relative mx-auto max-w-[1000px] lg:max-w-[1200px] 2xl:max-w-[1500px] mt-5 sm:mt-10 sm:px-4">
      {/* Desktop versions - outside card */}
      <img
        src="/dashboard-mascot-shadow.png"
        alt="Decorative"
        className="hidden lg:block absolute z-20 right-25 w-[330px] h-[290px] pointer-events-none"
        style={{ bottom: 0 }}
      />
      <img
        src="/dashboard-mascot.png"
        alt="Decorative"
        className="hidden lg:block absolute z-20 right-0 w-[350px] h-auto pointer-events-none"
        style={{ bottom: 0 }}
      />
      <header className="e-card">
        <div className="wave z-0"></div>
        <div className="wave z-0"></div>
        <div className="wave z-0"></div>

        {/* Mobile/Tablet versions - inside card */}
        <img
          src="/dashboard-mascot-shadow.png"
          alt="Decorative"
          className="mt-3 sm:-mt-5 lg:hidden absolute z-10 right-8 sm:right-20  w-[280px] sm:w-[330px] h-auto pointer-events-none"
        />
        <img
          src="/dashboard-mascot.png"
          alt="Decorative"
          className="sm:-mt-12 lg:hidden absolute z-10 -right-7 sm:-right-3 w-[300px] sm:w-[370px] h-auto pointer-events-none"
        />

        <div className="relative z-10 h-full px-6 sm:px-12 lg:px-12 py-5 sm:py-10 lg:py-13 flex flex-col justify-between items-start gap-2 sm:gap-0">
          <h2 className="font-main text-4xl sm:text-5xl">
            Welcome,{" "}
            <span className="max-[799px]:inline min-[800px]:max-lg:block lg:inline">
              classmate!
            </span>
          </h2>
          <h2 className="font-regular font-semibold sm:text-2xl lg:text-3xl text-lime -mt-1 sm:mt-1 lg:pl-2">
            Ready to get started?
          </h2>
          <button className="font-main w-fit px-5 sm:px-7 py-2 sm:py-3 bg-lime-400 text-white text-sm sm:text-base lg:text-lg font-semibold rounded-full cursor-pointer transition-all duration-300 hover:bg-cyan hover:scale-105 mt-3 sm:mt-5 lg:mt-6">
            Start Learning
          </button>
        </div>

        <style jsx>{`
          .e-card {
            margin: 0;
            background: linear-gradient(170deg, #C401DB, #FD14BB);
            box-shadow: 0px 8px 28px -9px rgba(0, 0, 0, 0.45);
            position: relative;
            width: 100%;
            height: 250px;
            border-radius: 20px;
            overflow: hidden;
          }

          .wave {
            position: absolute;
            width: 1940px;
            height: 1900px;
            opacity: 0.5;
            left: -50%;
            top: 100;
            margin-left: 
            margin-top:50%;
            background: linear-gradient(360deg, #FD14BB 60%, #C401DB);
          }

          .wave:nth-child(2),
          .wave:nth-child(3) {
            top: 250px;
          }

          .playing .wave {
            border-radius: 10%;
            animation: wave 3000ms infinite linear;
          }

          .wave {
            border-radius: 40%;
            animation: wave 10s infinite linear;
          }

          .playing .wave:nth-child(2) {
            animation-duration: 2000ms;
          }

          .wave:nth-child(2) {
            animation-duration: 30s;
          }

          .playing .wave:nth-child(3) {
            animation-duration: 5000ms;
          }

          .wave:nth-child(3) {
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

          @media (max-width: 1024px) {
            .e-card {
              height: 22vh;
              border-radius: 16px;
            }
          }

          @media (min-width: 768px) and (max-width: 1024px) {
            .wave {
              width: 1600px;   
              height: 1200px; 
              opacity: 0.6;
              left: -40%;       
              top: 20%;
          }

          @media (max-width: 767px) {
            .wave {
              width: 1400px;   
              height: 1050px;  
              opacity: 1;
              left: -15%;      
              top: 0%;         
            }
          }
          
          @media (max-width: 480px) {
            .wave {
              width: 1200px;   
              height: 900px;   
              opacity: 1;
              left: -10%;
              top: 0%;
            }
          }
        }
        `}</style>
      </header>
    </div>
  );
};

export default DashboardHeader;