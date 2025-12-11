import React from "react";
import Image from "next/image";

interface HeroCardProps {
  deckColor: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ deckColor }) => {
  const [currentFrame, setCurrentFrame] = React.useState(1);

  React.useEffect(() => {
    const blinkSequence = () => {
      // Blink animation: 1 -> 2 -> 3 -> 4 -> 1
      setCurrentFrame(2);
      setTimeout(() => setCurrentFrame(3), 100);
      setTimeout(() => setCurrentFrame(4), 200);
      setTimeout(() => setCurrentFrame(1), 300);
    };

    // Initial delay before first blink
    const initialTimeout = setTimeout(() => {
      blinkSequence();
      
      // Random delay between blinks (2-5 seconds)
      const scheduleNextBlink = () => {
        const delay = Math.random() * 3000 + 2000;
        setTimeout(() => {
          blinkSequence();
          scheduleNextBlink();
        }, delay);
      };
      
      scheduleNextBlink();
    }, 2000);

    return () => clearTimeout(initialTimeout);
  }, []);

  // Determine the gradient colors based on deck color
  const getGradientColors = () => {
    // Extract color name from CSS variable format (e.g., "var(--color-pink)" -> "pink")
    const colorName = deckColor.includes('--color-') 
      ? deckColor.match(/--color-(\w+)/)?.[1] 
      : deckColor;

    const topColor = deckColor; // Always use the deck color as top

    let bottomColor = '#FEEF69'; // Default

    switch(colorName) {
      case 'blue':
        bottomColor = 'var(--color-cyan)';
        break;
      case 'purple':
        bottomColor = 'var(--color-pink)';
        break;
      case 'cyan':
        bottomColor = 'var(--color-purple)';
        break;
      case 'lime':
        bottomColor = '#FEEF69';
        break;
      case 'pink':
        bottomColor = '#FEEF69';
        break;
      default:
        bottomColor = '#FEEF69';
    }

    return { topColor, bottomColor };
  };

  const { topColor, bottomColor } = getGradientColors();

  return (
    <div 
      className="w-full max-w-[900px] h-[370px] rounded-3xl relative overflow-hidden flex items-end justify-center"
      style={{ 
        background: `linear-gradient(to bottom, ${topColor}, ${bottomColor})`
      }}
    >
      {/* Animated bars background */}
      <div className="absolute inset-0 w-full h-full pt-12">
        <div className="relative w-full h-0 pt-[78%] overflow-hidden">
          {[...Array(22)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-[20px] top-[25%]"
              style={{
                marginTop: '-17%',
                height: '34%',
                width: '2%',
                animation: `prop 17s ${-i * 0.773}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Mascot */}
      <div className="relative z-10 mb-0">
        <Image
          src={`/practice/audio-player-mascot${currentFrame}.svg`}
          alt="Audio Player Mascot"
          width={380}
          height={380}
          className="object-contain"
        />
      </div>

      <style jsx>{`
        @keyframes prop {
          0% {
            background: red;
            left: 0;
          }
          5% {
            background: #9337fe;
          }
          10% {
            height: 10%;
            margin-top: -5%;
            background: #c532fc;
          }
          15% {
            background: #f639f8;
          }
          20% {
            height: 34%;
            margin-top: -17%;
            background: #3af9da;
          }
          25% {
            background: #ff2f8d;
          }
          30% {
            height: 10%;
            margin-top: -5%;
            background: #54e678;
          }
          35% {
            background: #dc5245;
          }
          40% {
            height: 34%;
            margin-top: -17%;
            background: #3af9da;
          }
          45% {
            background: #f8b435;
          }
          50% {
            height: 10%;
            margin-top: -5%;
            background: #54e678;
          }
          55% {
            background: #e0ff3b;
          }
          60% {
            height: 34%;
            margin-top: -17%;
            background: #3af9da;
          }
          65% {
            background: #46f443;
          }
          70% {
            height: 10%;
            margin-top: -5%;
            background: #54e678;
          }
          75% {
            background: #4df3a9;
          }
          80% {
            height: 34%;
            margin-top: -17%;
            background: #3af9da;
          }
          85% {
            background: #36ebf4;
          }
          90% {
            height: 10%;
            margin-top: -5%;
            background: #3db3f3;
          }
          95% {
            background: #3c02f1;
          }
          100% {
            left: 100%;
            height: 34%;
            margin-top: -17%;
            background: #5b38ee;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCard;