"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type NavbarProps = {
  items: string[];
  activeIndex?: number;
  onChange?: (index: number, label: string) => void;
  className?: string;
};

export default function Navbar({ items, activeIndex, onChange, className }: NavbarProps) {
  const isControlled = typeof activeIndex === "number";
  const [internalActive, setInternalActive] = useState(0);
  const currentActive = isControlled ? (activeIndex as number) : internalActive;

  const containerRef = useRef<HTMLUListElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Position the indicator under the active tab
  const positionIndicator = () => {
    if (!containerRef.current || !indicatorRef.current) return;
    const target = itemRefs.current[currentActive];
    if (!target) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const left = targetRect.left - containerRect.left;
    const width = targetRect.width;

    indicatorRef.current.style.left = `${left}px`;
    indicatorRef.current.style.width = `${width}px`;
  };

  useEffect(() => {
    positionIndicator();
    // Reposition on items change as well
  }, [currentActive, items]);

  useEffect(() => {
    const handleResize = () => positionIndicator();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActive]);

  const handleClick = (index: number) => {
    if (!isControlled) setInternalActive(index);
    onChange?.(index, items[index]);
  };

  const mergedClassName = useMemo(() => `${className ?? ""}`.trim(), [className]);

  return (
    <nav className={mergedClassName}>
      <ul
  ref={containerRef}
  className="
    relative flex justify-center items-center w-full mx-auto
    gap-4 sm:gap-6 md:gap-12 lg:gap-24
  "
>
  <div
    ref={indicatorRef}
    className="absolute -bottom-0.5 h-1 rounded-full bg-gray-900 transition-all duration-300 ease-out"
    style={{ left: 0, width: 0 }}
  />
  {items.map((label, i) => (
    <li
      key={label + i}
      ref={(el) => { itemRefs.current[i] = el; }}
      className={`
        relative flex items-center justify-center select-none pb-5 cursor-pointer font-body transition-colors
        text-base sm:text-lg lg:text-3xl
        ${i === currentActive ? "text-black" : "text-gray-500 hover:text-gray-700"}
      `}
      onClick={() => handleClick(i)}
    >
      {label}
    </li>
  ))}
</ul>
      <div className="border bg-white border-gray-300 shadow-xl mb-10"/>
    </nav>
  );
}