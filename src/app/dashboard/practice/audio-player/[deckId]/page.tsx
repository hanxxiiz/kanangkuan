"use client"

import HeroCard from "@/components/dashboard/practice/audio-player/HeroCard";
import TextCard from "@/components/dashboard/practice/audio-player/TextCard";
import { PracticeDataContext } from "@/components/dashboard/practice/PracticeLayout";
import { useState, useContext, useEffect, useRef } from "react";
import { CgPlayButtonO, CgPlayPauseO, CgPlayTrackPrev, CgPlayTrackNext } from "react-icons/cg";

type Card = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
};

type TTSSettings = {
  delay: number;
  repetition: number;
  voice: number;
};

type AudioSettings = {
  delay: number;
  repetition: number;
  voice: number;
} | undefined;

const AudioPlayer = () => {
  const practiceData = useContext(PracticeDataContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const contextSettings = (practiceData as { audioSettings?: AudioSettings })?.audioSettings;
  const [settings, setSettings] = useState<TTSSettings>({
    delay: contextSettings?.delay ?? 3,
    repetition: contextSettings?.repetition ?? 1,
    voice: contextSettings?.voice ?? 1
  });

  useEffect(() => {
    if (contextSettings) {
      console.log("Settings updated from context:", contextSettings);
      setSettings({
        delay: contextSettings.delay,
        repetition: contextSettings.repetition,
        voice: contextSettings.voice
      });
    }
  }, [contextSettings]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldContinueRef = useRef(false);
  const currentSequenceRef = useRef<number>(0);

  const cards = (practiceData?.cards || []) as Card[];
  const deckColor = practiceData?.deckColor || "lime";

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang })));
      setAvailableVoices(voices);
    };

    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldContinueRef.current = false;
      window.speechSynthesis.cancel();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (cards.length === 0) {
    return (
      <div className="bg-black w-full h-full flex items-center justify-center">
        <p className="text-white text-xl">No cards available</p>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  const stopPlayback = () => {
    console.log("Stopping playback...");
    shouldContinueRef.current = false;
    currentSequenceRef.current++;
    
    window.speechSynthesis.cancel();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const getVoiceByType = (voiceType: number): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    console.log(`Selecting voice for type: ${voiceType} (1=FEMALE, 2=MALE)`);
    console.log('All available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));

    // Filter for US English voices only (en-US)
    const usEnglishVoices = availableVoices.filter(v => 
      v.lang === 'en-US' || v.lang.startsWith('en-US')
    );
    
    // If no US voices, fall back to any English
    const englishVoices = usEnglishVoices.length > 0 
      ? usEnglishVoices 
      : availableVoices.filter(v => v.lang.startsWith('en'));

    if (voiceType === 2) {
      // Voice 2 = STRICTLY MALE
      const maleKeywords = ['male', 'man', 'daniel', 'alex', 'david', 'mark', 'james', 'christopher', 'jason'];
      
      // Try US English male first
      let voice = englishVoices.find(v => 
        maleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
      );
      
      // If no male voice found in filtered list, search all voices
      if (!voice) {
        voice = availableVoices.find(v => 
          maleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
        );
      }
      
      if (voice) {
        console.log('✓ Selected MALE voice:', voice.name, voice.lang);
        return voice;
      }
      
      console.warn('⚠ No male voice found! Using first available voice.');
      return englishVoices[0] || availableVoices[0];
    }
    
    // Voice 1 = STRICTLY FEMALE
    const femaleKeywords = ['female', 'woman', 'samantha', 'victoria', 'susan', 'karen', 'moira', 'fiona', 'zira', 'hazel'];
    
    // Try US English female first
    let voice = englishVoices.find(v => 
      femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
    );
    
    // If no female voice found in filtered list, search all voices
    if (!voice) {
      voice = availableVoices.find(v => 
        femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
      );
    }
    
    // If still no female voice, find a voice that is NOT male
    if (!voice) {
      const maleKeywords = ['male', 'man', 'daniel', 'alex', 'david', 'mark', 'james', 'christopher', 'jason'];
      voice = englishVoices.find(v => 
        !maleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
      );
    }
    
    if (voice) {
      console.log('✓ Selected FEMALE voice:', voice.name, voice.lang);
      return voice;
    }
    
    console.warn('⚠ No female voice found! Using first available voice.');
    return englishVoices[0] || availableVoices[0];
  };

  const speak = async (text: string, voiceType: number, sequenceId: number): Promise<boolean> => {
    console.log(`Speaking: "${text}" with voice type ${voiceType}`);
    
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return false;
    }

    // Check if this sequence is still valid
    if (sequenceId !== currentSequenceRef.current) {
      console.log("Sequence cancelled");
      return false;
    }

    return new Promise((resolve) => {
      try {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();
        
        // Small delay to ensure cancellation completes
        setTimeout(() => {
          if (sequenceId !== currentSequenceRef.current) {
            resolve(false);
            return;
          }

          const utterance = new SpeechSynthesisUtterance(text);
          
          const selectedVoice = getVoiceByType(voiceType);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
          }
          
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          utterance.onend = () => {
            console.log("Speech ended successfully");
            resolve(true);
          };
          
          utterance.onerror = (event) => {
            console.log("Speech error:", event.error);
            resolve(false);
          };
          
          window.speechSynthesis.speak(utterance);
          console.log("Speech started");
        }, 100);
        
      } catch (error) {
        console.error('Speech error:', error);
        resolve(false);
      }
    });
  };

  const delay = (seconds: number, sequenceId: number): Promise<boolean> => {
    if (seconds === 0 || seconds < 1) return Promise.resolve(true);
    
    console.log(`Delaying for ${seconds} seconds...`);
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(() => {
        console.log("Delay complete");
        // Check if sequence is still valid
        if (sequenceId === currentSequenceRef.current) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, seconds * 1000);
    });
  };

  const playCardSequence = async (cardIndex: number) => {
    const sequenceId = currentSequenceRef.current;
    console.log(`Starting card sequence ${sequenceId} for card ${cardIndex}`);
    console.log(`Settings - Delay: ${settings.delay}s, Repetition: ${settings.repetition}x, Voice: ${settings.voice}`);
    
    if (!shouldContinueRef.current || cardIndex >= cards.length) {
      console.log("Stopping sequence");
      setIsPlaying(false);
      return;
    }

    const card = cards[cardIndex];
    console.log("Playing card:", card.front);

    try {
      // Repeat the question based on repetition setting
      for (let i = 0; i < settings.repetition; i++) {
        if (sequenceId !== currentSequenceRef.current) {
          console.log("Sequence cancelled during question repetition");
          return;
        }
        
        console.log(`Question repetition ${i + 1}/${settings.repetition}`);
        const success = await speak(card.front, settings.voice, sequenceId);
        
        if (!success || sequenceId !== currentSequenceRef.current) {
          console.log("Speech failed or sequence cancelled");
          return;
        }
        
        // Delay between question repetitions (except after last one)
        if (i < settings.repetition - 1) {
          const delaySuccess = await delay(settings.delay, sequenceId);
          if (!delaySuccess || sequenceId !== currentSequenceRef.current) {
            console.log("Delay cancelled");
            return;
          }
        }
      }

      // Delay before answer
      const delayBeforeAnswer = await delay(settings.delay, sequenceId);
      if (!delayBeforeAnswer || sequenceId !== currentSequenceRef.current) {
        return;
      }

      // Speak the answer
      console.log("Speaking answer");
      const answerSuccess = await speak(card.back, settings.voice, sequenceId);
      
      if (!answerSuccess || sequenceId !== currentSequenceRef.current) {
        return;
      }

      // Delay before next card
      const delayBeforeNext = await delay(settings.delay, sequenceId);
      if (!delayBeforeNext || sequenceId !== currentSequenceRef.current) {
        return;
      }

      // Move to next card
      if (cardIndex < cards.length - 1 && sequenceId === currentSequenceRef.current) {
        setCurrentCardIndex(cardIndex + 1);
        await playCardSequence(cardIndex + 1);
      } else {
        console.log("End of deck reached");
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    console.log("Play/Pause clicked. Current isPlaying:", isPlaying);
    
    if (isPlaying) {
      console.log("Pausing...");
      stopPlayback();
      setIsPlaying(false);
      shouldContinueRef.current = false;
    } else {
      console.log("Playing with settings:", settings);
      setIsPlaying(true);
      shouldContinueRef.current = true;
      currentSequenceRef.current++;
      playCardSequence(currentCardIndex);
    }
  };

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      stopPlayback();
      setIsPlaying(false);
      shouldContinueRef.current = false;
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      stopPlayback();
      setIsPlaying(false);
      shouldContinueRef.current = false;
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  return (
    <div className="bg-black w-full h-full flex flex-col items-center overflow-hidden pt-15 lg:pt-2 px-4 gap-3">
      <HeroCard deckColor={`var(--color-${deckColor})`} />

      <TextCard 
        question={currentCard.front}
        answer={currentCard.back}
        deckColor={`var(--color-${deckColor})`}
        isAlternate={currentCardIndex % 2 === 1}
        cardIndex={currentCardIndex}
      />

      <div className="flex items-center justify-center gap-8">
        <button
          onClick={handlePrev}
          disabled={currentCardIndex === 0}
          className="cursor-pointer text-white transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          onMouseEnter={(e) => {
            if (currentCardIndex > 0) {
              e.currentTarget.style.color = `var(--color-${deckColor})`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
          }}
        >
          <CgPlayTrackPrev size={60} />
        </button>

        <button
          onClick={handlePlayPause}
          className="cursor-pointer text-white transition-colors duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = `var(--color-${deckColor})`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
          }}
        >
          {isPlaying ? (
            <CgPlayPauseO size={65} />
          ) : (
            <CgPlayButtonO size={65} />
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
          className="cursor-pointer text-white transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          onMouseEnter={(e) => {
            if (currentCardIndex < cards.length - 1) {
              e.currentTarget.style.color = `var(--color-${deckColor})`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
          }}
        >
          <CgPlayTrackNext size={60} />
        </button>
      </div>
    </div>
  );
}

export default AudioPlayer;