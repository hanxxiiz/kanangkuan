"use client";

import { useDashboard } from "../dashboard/DashboardContext";
import Image from "next/image";

const ProfileCard = () => {
    const { username} = useDashboard();
    return (
        <div>
            {/* Profile Card */}
        <section className=" rounded-2xl overflow-hidden">
          <div className="relative w-full h-auto sm:h-70">
            {/* Gradient Background */}
            <div
              className="absolute inset-0 h-50 sm:h-50 w-full rounded-2xl"
              style={{
                background:
                  "linear-gradient(80deg, #8AFF00 0%, #00FFD1 44%, #00FFD1 100%)",
              }}
            ></div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex relative items-start h-70 w-full">
              {/* Profile Image */}
              <Image
                alt={username}
                src="/dashboard/default-picture.png"
                  width={0}
                  height={0}
                  sizes="100vw"
                className="absolute bottom-0 m-10 max-w-xs max-h-xs w-50 h-50 rounded-full bg-gray-900 z-10 border-5 border-white"
              />
              {/* User Info */}
              <div className="relative flex flex-col left-70 top-15">
                <p className="text-gray-900 text-4xl font-bold font-main">
                  {username}
                </p>
                {/*<p className="text-gray-900 text-2xl font-body my-2">[Name]</p> */}
                <div className="flex items-center">
                  <p className="text-gray-800 text-md font-body">0 Following</p>
                  <div className="w-1 h-1 bg-gray-900 rounded-full m-3"></div>
                  <p className="text-gray-900 text-md font-body">0 Followers</p>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col sm:hidden relative items-center pt-8 pb-4 text-center">
              <p className="text-gray-900 text-3xl font-bold font-main">
                [Username]
              </p>
              <p className="text-gray-900 text-xl font-body my-1">[Name]</p>
              <div className="flex items-center justify-center mt-2">
                <p className="text-gray-800 text-sm font-body">0 Following</p>
                <div className="w-1 h-1 bg-gray-900 rounded-full mx-2"></div>
                <p className="text-gray-900 text-sm font-body">0 Followers</p>
              </div>
              {/* Image below the info */}
              <Image
                alt={`${username}`}
                src="/dashboard/default-picture.png"
                className="mt-6 w-32 h-32 rounded-full bg-gray-900 z-10"
                width={0}
                height={0}
                sizes="100vw"
              />
            </div>
          </div>
        </section>
        </div>
    )
}

export default ProfileCard