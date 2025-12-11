import React from 'react'
import { Ring2 } from 'ldrs/react'
import 'ldrs/react/Ring2.css'

export default function StylishLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-white overflow-hidden">
      {/* Animated container with glow effect */}
      <div className="relative">
        {/* Glow effect behind loader */}
        <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full scale-150 animate-pulse"></div>
        
        {/* Loader */}
        <div className="relative">
          <Ring2
            size="50"
            stroke="6"
            strokeLength="0.25"
            bgOpacity="0.1"
            speed="0.8"
            color="#C401DB" 
          />
        </div>
      </div>

      {/* Loading text with animation */}
      <p className="font-main text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
        Loading
      </p>
    </div>
  )
}