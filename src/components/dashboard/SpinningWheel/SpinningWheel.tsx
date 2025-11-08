import React, { useEffect, useRef, useState } from 'react';
import './SpinningWheel.css';
import ShowReward from './ShowReward';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { ProcessSpinReward } from "@/lib/actions/daily-rewards-actions";
import { RewardType } from '@/types/dashboard';
import { useDashboard } from '../DashboardContext';


interface Sector {
  color: string;
  text: string;
  label: string;
  icon?: string;
  rewardType: RewardType;  
  rewardAmount: number;    
}

const sectors: Sector[] = [
  { color: "#8AFF00", text: "#ffffffff", label: "+3 Lives", icon: "/dashboard/heart.svg", rewardType: "lives", rewardAmount: 3 },
  { color: "#FD14BB", text: "#ffffffff", label: "+1 Key", icon: "/dashboard/key.svg", rewardType: "keys", rewardAmount: 1 },
  { color: "#6715FF", text: "#ffffffff", label: "+2 Hints", icon: "/dashboard/bulb.svg", rewardType: "hints", rewardAmount: 2},
  { color: "#C401DB", text: "#ffffffff", label: "+150 XP", icon: "/dashboard/star.svg", rewardType: "xp", rewardAmount: 150 },
  { color: "#8AFF00", text: "#ffffffff", label: "+5 Lives", icon: "/dashboard/heart.svg", rewardType: "lives", rewardAmount: 5 },
  { color: "#FD14BB", text: "#ffffffff", label: "+2 Keys", icon: "/dashboard/key.svg", rewardType: "keys", rewardAmount: 2 },
  { color: "#6715FF", text: "#ffffffff", label: "+3 Hints", icon: "/dashboard/bulb.svg", rewardType: "hints", rewardAmount: 3 },
  { color: "#C401DB", text: "#ffffffff", label: "+200 XP", icon: "/dashboard/star.svg", rewardType: "xp", rewardAmount: 200 },
];

type SpinningWheelProps = {
  isOpen: boolean;
  onClose: () => void;
  onSpinComplete?: () => void;
};

type RewardConfig = {
  type: RewardType;
  amount: number;
  label: string;
  color: string;
};


const SpinningWheel: React.FC<SpinningWheelProps> = ({ isOpen, onClose,  onSpinComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinText, setSpinText] = useState("SPIN");
  const [spinBg, setSpinBg] = useState("#fff");
  const [spinColor, setSpinColor] = useState("#fff");
  const [canvasRotation, setCanvasRotation] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [wonSector, setWonSector] = useState<Sector | null>(null);
  const [wheelSize, setWheelSize] = useState(600);
  const [isVisible, setIsVisible] = useState(false);
  const { updateSpinStatus } = useDashboard();

  const angVelRef = useRef(0);
  const angRef = useRef(0);
  const spinButtonClickedRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const loadedImagesRef = useRef<{ [key: string]: HTMLImageElement }>({});

  const rand = (m: number, M: number) => Math.random() * (M - m) + m;
  const tot = sectors.length;
  const PI = Math.PI;
  const TAU = 2 * PI;
  const arc = TAU / sectors.length;
  const friction = 0.991;

  const getIndex = () => Math.floor(tot - (angRef.current / TAU) * tot) % tot;

  const drawSector = (ctx: CanvasRenderingContext2D, sector: Sector, i: number, rad: number) => {
    const ang = arc * i;
    ctx.save();

    // COLOR
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();

    // TEXT AND ICON
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.fillStyle = sector.text;
    
    const fontSize = Math.floor(rad * 0.093); 
    ctx.font = `bold ${fontSize}px 'Poppins'`;
    
    if (sector.icon && loadedImagesRef.current[sector.icon]) {
      const img = loadedImagesRef.current[sector.icon];
      const iconSize = Math.floor(rad * 0.167); 
      
      ctx.textAlign = "right";
      ctx.fillText(sector.label, rad - 10, 10);
      
      ctx.drawImage(img, rad - (rad * 0.6), -iconSize / 2, iconSize, iconSize);
    } else {
      ctx.textAlign = "right";
      ctx.fillText(sector.label, rad - 10, 10);
    }

    ctx.restore();
  };

  const rotate = (ctx: CanvasRenderingContext2D, rad: number) => {
    const sector = sectors[getIndex()];
    setCanvasRotation(angRef.current - PI / 2);

    setSpinText(!angVelRef.current ? "SPIN" : sector.label);
    setSpinBg(sector.color);
    setSpinColor(sector.text);
  };

  const frame = async(ctx: CanvasRenderingContext2D, rad: number) => {
    if (!angVelRef.current && spinButtonClickedRef.current) {
      const finalSector = sectors[getIndex()];
      console.log(`Woop! You won ${finalSector.label}`);
      spinButtonClickedRef.current = false;
      
      setWonSector(finalSector);
      setShowReward(true);
      
      ProcessSpinReward(finalSector.rewardType, finalSector.rewardAmount)
        .then(result => {
          if (result.success && result.nextSpinTime) {
            updateSpinStatus(true, result.nextSpinTime);
          }
        })
        .catch(error => {
          console.error("Failed to process reward:", error);
        });
      
      return;
    }

    angVelRef.current *= friction;
    if (angVelRef.current < 0.002) angVelRef.current = 0;
    angRef.current += angVelRef.current;
    angRef.current %= TAU;
    rotate(ctx, rad);
  };

  const engine = (ctx: CanvasRenderingContext2D, rad: number) => {
    frame(ctx, rad);
    animationFrameRef.current = requestAnimationFrame(() => engine(ctx, rad));
  };

   useEffect(() => {
    if (isOpen) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10); 
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const updateWheelSize = () => {
      if (window.innerWidth < 640) {
        setWheelSize(Math.min(window.innerWidth - 40, 400));
      } else {
        setWheelSize(600);
      }
    };

    updateWheelSize();
    window.addEventListener('resize', updateWheelSize);
    return () => window.removeEventListener('resize', updateWheelSize);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imagesToLoad = sectors
      .filter(s => s.icon)
      .map(s => s.icon as string)
      .filter((icon, index, self) => self.indexOf(icon) === index);

    let loadedCount = 0;
    const totalImages = imagesToLoad.length;

    const initWheel = () => {
      if (!canvas || !ctx) return;
      
      const dia = canvas.width;
      const rad = dia / 2;

      ctx.clearRect(0, 0, dia, dia);
      sectors.forEach((sector, i) => drawSector(ctx, sector, i, rad));
      rotate(ctx, rad);
      engine(ctx, rad);
    };

    if (totalImages === 0) {
      initWheel();
    } else {
      imagesToLoad.forEach(iconUrl => {
        const img = new Image();
        img.onload = () => {
          loadedImagesRef.current[iconUrl] = img;
          loadedCount++;
          if (loadedCount === totalImages) {
            initWheel();
          }
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${iconUrl}`);
          loadedCount++;
          if (loadedCount === totalImages) {
            initWheel();
          }
        };
        img.src = iconUrl;
      });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, wheelSize]);

  const handleSpin = () => {
    if (!angVelRef.current) {
      angVelRef.current = rand(0.25, 0.45);
      spinButtonClickedRef.current = true;
    }
  };

  const handleClose = () => {
    angVelRef.current = 0;
    angRef.current = 0;
    spinButtonClickedRef.current = false;
    setShowReward(false);
    setWonSector(null);
    setCanvasRotation(0);
    setIsVisible(false); 
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}      
    >
      <button
        onClick={handleClose}
        className={`cursor-pointer absolute top-4 right-4 sm:top-6 sm:right-6 text-white text-3xl sm:text-4xl hover:scale-105 transition-all duration-500 delay-100 z-40 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}      
      >
        <IoIosCloseCircleOutline />
      </button>
      <div className={`relative flex items-center justify-center w-full transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        {/* Spinning wheel */}
        <div 
          id="spin_the_wheel"
          style={{
            width: `${wheelSize}px`,
            height: `${wheelSize}px`,
            position: 'relative'
          }}
        >
          <canvas 
            id="wheel" 
            ref={canvasRef}
            width={wheelSize}
            height={wheelSize}
            style={{ transform: `rotate(${canvasRotation}rad)` }}
          />
          <div 
            id="spin" 
            onClick={handleSpin}
            style={{
              width: `${wheelSize * 0.25}px`,
              height: `${wheelSize * 0.25}px`,
            }}
          >
            <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
              <img 
                src="/dashboard/spinning-wheel-button.svg" 
                alt="Spin icon" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      <img
        src="/dashboard/spinning-wheel-hero.svg"
        alt="Decorative"
        className="hidden xl:block absolute right-[150px] bottom-5 z-20 w-100 h-auto"
      />
      <img
        src="/dashboard/cloud-2.svg"
        alt="Decorative"
        className="hidden xl:block absolute -bottom-35 -z-30 w-500 h-auto"
      />
      
      {showReward && wonSector && (
        <ShowReward
          isOpen={showReward}
          onClose={() => {
            setShowReward(false);
            setWonSector(null);
            if (onSpinComplete) {
              onSpinComplete();
            }
          }}
          onGoBack={() => {
            handleClose();
            if (onSpinComplete) {
              onSpinComplete();
            }
          }}
          reward={wonSector.label}
          icon={wonSector.icon}
        />
      )}
    </div>
    
  );
};

export default SpinningWheel;