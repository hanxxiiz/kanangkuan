"use client";

import React, { ChangeEvent, KeyboardEvent, useRef } from 'react';

interface JoinTabProps {
  onJoinCodeComplete: (joinCode: string) => void;
}

export default function JoinTab({ onJoinCodeComplete }: JoinTabProps) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;

        if (!/^[A-Z0-9]?$/i.test(value)) return;

        e.target.value = value.toUpperCase();

        if (value && index < inputsRef.current.length - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        const allFilled = inputsRef.current.every(input => input?.value);
        if (allFilled) {
            const fullCode = inputsRef.current.map(input => input?.value || '').join('');
            onJoinCodeComplete(fullCode);
        }
    };
    
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    return (
        <div className="my-5 flex flex-col items-center justify-center gap-2">
            <div className="flex self-start">
                <h5 className="text-base text-black font-body">Enter Join Code</h5>
            </div>

            <div className="flex flex-row items-center justify-between gap-3">
                {[...Array(5)].map((_, i) => (
                    <input
                        key={i}
                        type="text"
                        maxLength={1}
                        className="text-center h-35 w-23 px-1 border-2 text-black border-gray-300 rounded-2xl outline-none text-7xl focus:border-black transition-colors duration-200 ease-in-out uppercase"
                        ref={(el) => { inputsRef.current[i] = el; }}
                        onChange={(e) => handleChange(e, i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                    />
                ))}
            </div>
        </div>
    )
}