import React, { useState } from 'react';
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

type DelayOption = 1 | 3 | 5;
type RepetitionOption = 1 | 2 | 3;
type VoiceOption = 1 | 2;

const DELAY_OPTIONS: DelayOption[] = [1, 3, 5];
const REPETITION_OPTIONS: RepetitionOption[] = [1, 2, 3];
const VOICE_OPTIONS: VoiceOption[] = [1, 2];

interface AudioPlayerSettingsContentProps {
  initialDelay?: DelayOption;
  initialRepetition?: RepetitionOption;
  initialVoice?: VoiceOption;
  onSettingsChange?: (settings: {
    delay: DelayOption;
    repetition: RepetitionOption;
    voice: VoiceOption;
  }) => void;
}

// This is the content that goes INSIDE the Modal component
export default function AudioPlayerSettingsContent({ 
  initialDelay = 3,
  initialRepetition = 1,
  initialVoice = 1,
  onSettingsChange 
}: AudioPlayerSettingsContentProps) {
  const [delay, setDelay] = useState<DelayOption>(initialDelay);
  const [repetition, setRepetition] = useState<RepetitionOption>(initialRepetition);
  const [voice, setVoice] = useState<VoiceOption>(initialVoice);

  const handleDelayChange = (newDelay: DelayOption) => {
    setDelay(newDelay);
    onSettingsChange?.({ delay: newDelay, repetition, voice });
  };

  const handleRepetitionChange = (newRepetition: RepetitionOption) => {
    setRepetition(newRepetition);
    onSettingsChange?.({ delay, repetition: newRepetition, voice });
  };

  const handleVoiceChange = (newVoice: VoiceOption) => {
    setVoice(newVoice);
    onSettingsChange?.({ delay, repetition, voice: newVoice });
  };

  const handleDelayPrev = () => {
    const currentIndex = DELAY_OPTIONS.indexOf(delay);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : DELAY_OPTIONS.length - 1;
    handleDelayChange(DELAY_OPTIONS[newIndex]);
  };

  const handleDelayNext = () => {
    const currentIndex = DELAY_OPTIONS.indexOf(delay);
    const newIndex = currentIndex < DELAY_OPTIONS.length - 1 ? currentIndex + 1 : 0;
    handleDelayChange(DELAY_OPTIONS[newIndex]);
  };

  const handleRepetitionPrev = () => {
    const currentIndex = REPETITION_OPTIONS.indexOf(repetition);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : REPETITION_OPTIONS.length - 1;
    handleRepetitionChange(REPETITION_OPTIONS[newIndex]);
  };

  const handleRepetitionNext = () => {
    const currentIndex = REPETITION_OPTIONS.indexOf(repetition);
    const newIndex = currentIndex < REPETITION_OPTIONS.length - 1 ? currentIndex + 1 : 0;
    handleRepetitionChange(REPETITION_OPTIONS[newIndex]);
  };

  const handleVoicePrev = () => {
    const currentIndex = VOICE_OPTIONS.indexOf(voice);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : VOICE_OPTIONS.length - 1;
    handleVoiceChange(VOICE_OPTIONS[newIndex]);
  };

  const handleVoiceNext = () => {
    const currentIndex = VOICE_OPTIONS.indexOf(voice);
    const newIndex = currentIndex < VOICE_OPTIONS.length - 1 ? currentIndex + 1 : 0;
    handleVoiceChange(VOICE_OPTIONS[newIndex]);
  };

  const formatDelay = (d: DelayOption) => `${d} sec`;
  const formatRepetition = (r: RepetitionOption) => `${r} rep${r > 1 ? 's' : ''}`;
  const formatVoice = (v: VoiceOption) => `Voice ${v}`;

  return (
    <div className="py-4">
      <h2 className="font-semibold text-2xl text-black mb-6">Timing and Controls</h2>
      
      <div className="space-y-6 flex flex-col items-center">
        {/* Delay Setting */}
        <SettingRow
          label="Delay"
          value={formatDelay(delay)}
          onPrev={handleDelayPrev}
          onNext={handleDelayNext}
        />

        {/* Repetition Setting */}
        <SettingRow
          label="Repetition"
          value={formatRepetition(repetition)}
          onPrev={handleRepetitionPrev}
          onNext={handleRepetitionNext}
        />

        {/* Voice Setting */}
        <SettingRow
          label="Voice"
          value={formatVoice(voice)}
          onPrev={handleVoicePrev}
          onNext={handleVoiceNext}
        />
      </div>
    </div>
  );
}

function SettingRow({
  label,
  value,
  onPrev,
  onNext,
}: {
  label: string;
  value: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center py-1 gap-3 sm:gap-15 w-full sm:w-fit justify-between sm:justify-start px-4 sm:px-0">
      <span className="font-body text-black text-lg sm:text-xl w-32 sm:w-40 text-left">
        {label}
      </span>
      <div className="bg-black rounded-full px-2 py-2 flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onPrev}
          className="text-white cursor-pointer"
          aria-label="Previous"
        >
          <MdNavigateBefore size={28} className="sm:w-8 sm:h-8" />
        </button>
        <div className="min-w-[60px] sm:min-w-[95px] text-center">
          <span className="text-white text-base sm:text-lg font-medium">{value}</span>
        </div>
        <button
          onClick={onNext}
          className="text-white cursor-pointer"
          aria-label="Next"
        >
          <MdNavigateNext size={28} className="sm:w-8 sm:h-8" />
        </button>
      </div>
    </div>
  );
}