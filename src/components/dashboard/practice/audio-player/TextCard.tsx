import React, { useState, useEffect, useRef, useCallback } from "react";

interface TextCardProps {
  question: string;
  answer: string;
  deckColor: string;
  isAlternate?: boolean;
  cardIndex: number;
}

const TextCard: React.FC<TextCardProps> = ({ question, answer, deckColor, isAlternate = false, cardIndex }) => {
  const [fadeState, setFadeState] = useState<'visible' | 'fading-out' | 'fading-in'>('visible');
  const [displayContent, setDisplayContent] = useState({ question, answer });
  const [displayColor, setDisplayColor] = useState(() => getCardColorFromProps(deckColor, isAlternate));
  const [textSize, setTextSize] = useState<'large' | 'medium'>('large');
  const [needsScroll, setNeedsScroll] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // Move function outside component or use useCallback
  const getCardColor = useCallback(() => {
    return getCardColorFromProps(deckColor, isAlternate);
  }, [deckColor, isAlternate]);

  // Check if content fits and adjust text size accordingly
  useEffect(() => {
    const checkFit = () => {
      if (!contentRef.current || !answerRef.current) return;

      // Reset to large first
      setTextSize('large');
      setNeedsScroll(false);
      
      // Wait for render
      setTimeout(() => {
        if (!contentRef.current || !answerRef.current) return;
        
        const containerHeight = contentRef.current.clientHeight;
        const contentHeight = contentRef.current.scrollHeight;
        
        // Check if overflowing with large text
        if (contentHeight > containerHeight + 5) { // 5px buffer
          // Try medium text
          setTextSize('medium');
          
          // Check again after medium text is applied
          setTimeout(() => {
            if (!contentRef.current) return;
            const newContentHeight = contentRef.current.scrollHeight;
            const newContainerHeight = contentRef.current.clientHeight;
            
            // If still overflowing, enable scroll
            if (newContentHeight > newContainerHeight + 5) {
              setNeedsScroll(true);
            }
          }, 50);
        }
      }, 50);
    };

    checkFit();
  }, [displayContent.question, displayContent.answer]);

  useEffect(() => {
    // Step 1: Fade out current content
    setFadeState('fading-out');
    
    // Step 2: After fade out completes, update content
    const timer1 = setTimeout(() => {
      setDisplayContent({ question, answer });
      setDisplayColor(getCardColor());
      setFadeState('fading-in');
    }, 200);

    // Step 3: After fade in animation, set to visible
    const timer2 = setTimeout(() => {
      setFadeState('visible');
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [cardIndex, question, answer, getCardColor]);

  const getAnimationClass = () => {
    switch(fadeState) {
      case 'fading-out':
        return 'opacity-0';
      case 'fading-in':
        return 'opacity-100 animate-bounce-in';
      case 'visible':
        return 'opacity-100';
    }
  };

  const getQuestionSize = () => {
    return textSize === 'large' ? 'text-xl' : 'text-lg';
  };

  const getAnswerSize = () => {
    return textSize === 'large' ? 'text-lg' : 'text-base';
  };

  return (
    <div 
      className="w-full max-w-[900px] rounded-2xl p-8 h-[260px] lg:h-[185px] overflow-hidden relative"
      style={{ backgroundColor: displayColor, transition: 'background-color 0.3s ease' }}
    >
      {/* Content wrapper with fade animation */}
      <div 
        ref={contentRef}
        className={`flex flex-col gap-2 h-full transition-opacity duration-200 ${getAnimationClass()}`}
      >
        {/* Question */}
        <h2 className={`font-main text-white ${getQuestionSize()} flex-shrink-0 text-center`}>
          {displayContent.question}
        </h2>

        {/* Answer with conditional scrollbar - mobile friendly */}
        <div 
          ref={answerRef} 
          className={`flex-1 ${needsScroll ? 'overflow-y-auto custom-scrollbar' : ''}`}
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overflowY: needsScroll ? 'auto' : 'visible'
          }}
        >
          <p className={`font-regular text-white ${getAnswerSize()} leading-relaxed ${needsScroll ? 'pr-2' : ''} text-center`}>
            {displayContent.answer}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.9);
          }
          50% {
            transform: scale(1.03);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-bounce-in {
          animation: bounceIn 0.4s ease-out;
        }

        .custom-scrollbar {
          /* Make scrollable area larger for easier touch interaction */
          -webkit-overflow-scrolling: touch;
          overflow-y: auto;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
        }

        /* Ensure mobile touch scrolling works */
        @supports (-webkit-touch-callout: none) {
          .custom-scrollbar {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

// Helper function moved outside component
function getCardColorFromProps(deckColor: string, isAlternate: boolean) {
  if (!isAlternate) {
    return deckColor;
  }

  // Extract color name from CSS variable format
  const colorName = deckColor.includes('--color-') 
    ? deckColor.match(/--color-(\w+)/)?.[1] 
    : deckColor;

  switch(colorName) {
    case 'pink':
      return 'var(--color-cyan)';
    case 'blue':
      return 'var(--color-pink)';
    case 'purple':
      return 'var(--color-lime)';
    case 'cyan':
      return 'var(--color-purple)';
    case 'lime':
      return 'var(--color-blue)';
    default:
      return deckColor;
  }
}

export default TextCard;