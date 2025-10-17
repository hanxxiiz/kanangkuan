import React from "react";

const DailyRewards = () => {
  return (
    <div className="w-full h-full">
      <div className="relative mx-auto w-full h-full rounded-3xl bg-[#6715FF] p-6 sm:p-8 text-white min-h-[260px] overflow-hidden">
        {/* Image behind content */}
        <img
          src="/dashboard-mascot-2.png"
          alt="Decorative"
          className="absolute right-0 bottom-0 w-[350px] h-auto pointer-events-none opacity-80"
          style={{ zIndex: 0 }}
        />

        {/* Text & button above image */}
        <div className="relative z-10">
          <h2 className="font-main text-2xl sm:text-3xl">Daily Reward</h2>
          <p className="mt-8 sm:mt-15 font-body text-md sm:text-2xl lg:text-xl leading-snug text-white/90">
            Ready to unlock your daily surprise? The wheel is waiting for you.
          </p>
          <div className="mt-8 sm:mt-12">
            <button
              className="cursor-pointer min-w-[140px] px-6 py-3 bg-lime text-white font-main text-lg rounded-full hover:bg-pink hover:scale-105 transition-all duration-300"
            >
              Spin Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRewards;
