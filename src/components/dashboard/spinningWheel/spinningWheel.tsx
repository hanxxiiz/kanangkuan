"use client";

import React, { useRef, useState } from "react";
import "./spinningWheel.css";

type SpinWheelProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SpinWheel: React.FC<SpinWheelProps> = ({ isOpen, onClose }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    const extra = Math.ceil(Math.random() * 1000);
    const newRotation = rotation + extra;

    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${newRotation}deg)`;
      wheelRef.current.style.transition = "transform 5s ease-out";
    }

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="spinwheel-container">
      <button id="spin" onClick={spin}>
        {spinning ? "..." : "SPIN"}
      </button>
      <span className="arrow"></span>
      <div className="wheel" ref={wheelRef}>
        <div className="one">1</div>
        <div className="two">2</div>
        <div className="three">3</div>
        <div className="four">4</div>
        <div className="five">5</div>
        <div className="six">6</div>
        <div className="seven">7</div>
        <div className="eight">8</div>
      </div>
    </div>
  );
};

export default SpinWheel;
