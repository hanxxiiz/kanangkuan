import React from "react";
import Image from "next/image";

interface HeroCardProps {
  deckColor: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ deckColor }) => {
  return (
    <div 
      className="w-full max-w-[600px] h-[280px] rounded-3xl relative overflow-hidden flex items-end justify-center"
      style={{ backgroundColor: deckColor }}
    >
      {/* Animated bars background */}
      <div className="absolute inset-0 flex items-center justify-center gap-4 px-8">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className={`w-3 rounded-full ${
              i % 2 === 0 ? 'bg-cyan-400' : 'bg-yellow-300'
            }`}
            style={{
              height: `${Math.random() * 60 + 40}%`,
              animation: `pulse ${Math.random() * 2 + 1}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Mascot */}
      <div className="relative z-10 mb-0">
        <Image
          src="/practice/audio-player-mascot1.svg"
          alt="Audio Player Mascot"
          width={200}
          height={200}
          className="object-contain"
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scaleY(1);
          }
          50% {
            opacity: 1;
            transform: scaleY(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCard;