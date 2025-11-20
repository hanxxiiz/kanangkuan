import React from 'react'

export default function PlayerStatus() {
  return (
    <div 
        className="flex flex-row justify-start items-center gap-3 bg-cyan p-3 w-75 border-3 border-black rounded-full" 
    >
        <img 
            src="/dashboard/default-picture.png"
            className="w-10 h-10 rounded-full"
        />
        <div className="flex flex-col justify-start items-start">
            <h2 className="font-main text-base text-black">Done</h2>
            <h3 className="font-body text-xs text-gray-600">onlynendouglazer</h3>
        </div>
    </div>
  )
}
