"use client";

import { useEffect, useRef, forwardRef } from "react";
import MascotSVG from "./Mascot";

const MascotBlink = forwardRef<SVGSVGElement, Record<string, never>>((props, ref) => {
  const mascotRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const eyelidStates = [
      ["#eyelid-left-upper", "#eyelid-right-upper"],
      ["#eyelid-left-mid", "#eyelid-right-mid"],
      ["#eyelid-left-lower", "#eyelid-right-lower"],
      ["#eyelid-left-mid", "#eyelid-right-mid"],
      ["#eyelid-left-upper", "#eyelid-right-upper"]
    ];

    let currentIndex = 0;
    const allEyelids = eyelidStates.flat();
    allEyelids.forEach(id => {
      const el = document.querySelector(id) as HTMLElement | SVGElement;
      if (el) el.style.opacity = "0";
    });

    const blink = () => {
      allEyelids.forEach(id => {
        const el = document.querySelector(id) as HTMLElement | SVGElement;
        if (el) el.style.opacity = "0";
      });

      eyelidStates[currentIndex].forEach(id => {
        const el = document.querySelector(id) as HTMLElement | SVGElement;
        if (el) el.style.opacity = "1";
      });

      currentIndex++;

      if (currentIndex >= eyelidStates.length) {
        currentIndex = 0;
        setTimeout(() => requestAnimationFrame(blink), 3000 + Math.random() * 2000);
      } else {
        setTimeout(() => requestAnimationFrame(blink), 50);
      }
    };

    const timer = setTimeout(blink, 2000);
    return () => clearTimeout(timer);
  }, []);

  return <MascotSVG ref={ref || mascotRef} {...props} />;
});

MascotBlink.displayName = "MascotBlink";
export default MascotBlink;
