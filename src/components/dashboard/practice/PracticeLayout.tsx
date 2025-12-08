"use client";

import React, { useContext, useEffect, useState, createContext, useRef } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FaArrowLeft, FaClone } from "react-icons/fa6";
import { usePathname, useRouter, useParams } from "next/navigation";
import { ModalContext } from "@/components/modals/providers";
import { GetDeckInfo, DeckInfo } from "@/lib/queries/practice-queries";
import { UpdateUserSettings } from "@/lib/actions/basic-review-actions";
import AudioPlayerSettingsContent from "./audio-player/AudioPlayerSettingsContent";
import { UpdateAudioSettings } from "@/lib/actions/audio-player-actions";
import {
  GetBasicReviewUserSettings,
  GetCardsForReview,
  GetUserKeys,
  GetUserProfilePic,
} from "@/lib/queries/basic-review-queries";
import {
  GetCardsForActiveRecall,
  GetUserDailyLimits,
  ActiveRecallCard,
  UserDailyLimits,
} from "@/lib/queries/active-recall-queries";
import { GetAudioPlayerUserSettings } from "@/lib/queries/audio-player-queries";

type SortOrder = "oldest_first" | "newest_first" | "random_order";

interface PracticeInitialData {
  cards: Awaited<ReturnType<typeof GetCardsForReview>> | ActiveRecallCard[];
  keys?: Awaited<ReturnType<typeof GetUserKeys>>;
  profilePic?: Awaited<ReturnType<typeof GetUserProfilePic>>;
  dailyLimits?: UserDailyLimits | null;
  deckColor?: string;
  isActiveRecall?: boolean;
}

export const SortOrderContext = createContext<{
  sortOrder: SortOrder;
  updateSortOrder: (newOrder: SortOrder) => void;
}>({
  sortOrder: "oldest_first",
  updateSortOrder: () => {},
});

export const PracticeDataContext = createContext<PracticeInitialData | null>(null);

const SORT_OPTIONS = [
  { label: "Oldest to Newest", value: "oldest_first" as SortOrder },
  { label: "Newest to Oldest", value: "newest_first" as SortOrder },
  { label: "Random Order", value: "random_order" as SortOrder },
];

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const deckId = params.deckId as string;
  const [mounted, setMounted] = useState(false);
  const { Modal, setShowModal } = useContext(ModalContext);
  const [sortOrder, setSortOrder] = useState<SortOrder>("oldest_first");
  const [deckInfo, setDeckInfo] = useState<DeckInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<PracticeInitialData | null>(null);
  const [audioSettings, setAudioSettings] = useState({
    delay: 3,
    repetition: 1,
    voice: 1,
  }); 
  const hasFetchedRef = useRef(false);

  const isBasicReview = pathname.includes("/dashboard/practice/basic-review");
  const isActiveRecall = pathname.includes("/dashboard/practice/active-recall");
  const isAudioPlayer = pathname.includes("/dashboard/practice/audio-player");
  const showSettings = isBasicReview || isAudioPlayer;
  const showDeckInfo = isBasicReview || isActiveRecall || isAudioPlayer;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!mounted) return;

      hasFetchedRef.current = true;
      setIsLoading(true);

      try {
        const settings = await GetBasicReviewUserSettings();
        setSortOrder(settings.review_sort_order);

        if (isAudioPlayer) {
          const audioSettingsData = await GetAudioPlayerUserSettings();
          setAudioSettings({
            delay: audioSettingsData.audio_delay,
            repetition: audioSettingsData.audio_repetition,
            voice: audioSettingsData.audio_voice,
          });
        }

        if (!deckId) return;

        const info = await GetDeckInfo(deckId);
        setDeckInfo(info);

        if (isActiveRecall) {
          const [cardsData, dailyLimitsData] = await Promise.all([
            GetCardsForActiveRecall(deckId),
            GetUserDailyLimits(),
          ]);
          setInitialData({ 
            cards: cardsData, 
            dailyLimits: dailyLimitsData,
            deckColor: info?.deck_color || "lime", 
            isActiveRecall: true 
          });
        } else if (isBasicReview || isAudioPlayer) {
          const [cardsData, keysData, profilePicData] = await Promise.all([
            GetCardsForReview(deckId, settings.review_sort_order),
            GetUserKeys(),
            GetUserProfilePic(),
          ]);
          setInitialData({ 
            cards: cardsData, 
            keys: keysData, 
            profilePic: profilePicData,
            deckColor: info?.deck_color || "lime",
            isActiveRecall: false 
          });
        } 
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [mounted, deckId, pathname, isBasicReview, isActiveRecall, isAudioPlayer]);

  if (!mounted || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const handleBack = () => {
    const route = deckId ? `/dashboard/my-decks/${deckId}` : "/dashboard/practice";
    router.push(route);
  };


  const handleSaveSettings = async () => {
    const result = await UpdateUserSettings(sortOrder);
    
    if (result.success) {
      setShowModal(false);
    } else {
      console.error("Failed to save settings:", result.error);
      alert("Failed to save settings. Please try again.");
    }
  };

  {/*const handleSaveAudioSettings = async () => {
    const result = await UpdateAudioSettings({
      audio_delay: audioSettings.delay,
      audio_repetition: audioSettings.repetition,
      audio_voice: audioSettings.voice,
    });
    
    if (result.success) {
      setShowModal(false);
    } else {
      console.error("Failed to save settings:", result.error);
      alert("Failed to save settings. Please try again.");
    }
  };*/}

  const handleSaveAudioSettings = async () => {
    setShowModal(false);
    
    // Update database in the background
    UpdateAudioSettings({
      audio_delay: audioSettings.delay,
      audio_repetition: audioSettings.repetition,
      audio_voice: audioSettings.voice,
    }).then((result) => {
      if (!result.success) {
        console.error("Failed to save settings:", result.error);
        alert("Failed to save settings. Please try again.");
      }
    }).catch((error) => {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    });
  };

  const bgColor = isAudioPlayer ? "bg-black" : "bg-white";

  const getIconColor = (isHovered: boolean) => {
    if ((isBasicReview || isActiveRecall) && deckInfo) {
      return isHovered ? `var(--color-${deckInfo.deck_color})` : '#101220';
    }
    if (isAudioPlayer && deckInfo) {
      return isHovered ? `var(--color-${deckInfo.deck_color})` : 'white';
    }
    return undefined;
  };

  return (
    <SortOrderContext.Provider value={{ sortOrder, updateSortOrder: setSortOrder }}>
      <PracticeDataContext.Provider value={initialData}>
        <div className={`fixed inset-0 flex flex-col overflow-hidden ${bgColor}`}>
          {/* Header */}
          <div className="flex-shrink-0 w-full flex items-center px-3 sm:px-6 py-4">
            <div className="flex items-center gap-3 sm:gap-5">
              <FaArrowLeft
                onClick={handleBack}
                className="cursor-pointer text-2xl hover:scale-105 transition-all duration-300"
                style={{ 
                  color: getIconColor(false)
                }}
                onMouseEnter={(e) => {
                  if (deckInfo) {
                    e.currentTarget.style.color = getIconColor(true) || '';
                  }
                }}
                onMouseLeave={(e) => {
                  if (deckInfo) {
                    e.currentTarget.style.color = getIconColor(false) || '';
                  }
                }}
              />
              {showSettings && (
                <IoSettingsSharp
                  onClick={() => setShowModal(true)}
                  className="cursor-pointer text-2xl hover:scale-105 transition-all duration-300"
                  style={{ 
                    color: getIconColor(false)
                  }}
                  onMouseEnter={(e) => {
                    if (deckInfo) {
                      e.currentTarget.style.color = getIconColor(true) || '';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (deckInfo) {
                      e.currentTarget.style.color = getIconColor(false) || '';
                    }
                  }}
                />
              )}
            </div>

            {showDeckInfo && deckInfo && (
              <div className="flex items-center gap-3 ml-5 sm:ml-6">
                <FaClone 
                  className="text-2xl" 
                  style={{ color: `var(--color-${deckInfo.deck_color})` }}
                />
                <span className={`${isAudioPlayer ? 'text-white' : 'text-black'} text-md sm:text-lg font-regular truncate max-w-[185px] sm:max-w-none`}>
                  {deckInfo.deck_name}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 w-full overflow-hidden">
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child, { initialData } as Record<string, unknown>)
                : child
            )}
          </div>

          {/* Settings Modal */}
          {isBasicReview && (
            <Modal
              heading="Settings"
              actionButtonText="Save"
              onAction={handleSaveSettings}
            >
              <div className="py-4">
                <h2 className="font-semibold text-2xl text-black mb-6">Sort Cards</h2>
                <div className="space-y-2 flex flex-col items-center">
                  {SORT_OPTIONS.map(({ label, value }) => (
                    <SortToggle
                      key={value}
                      label={label}
                      isActive={sortOrder === value}
                      onClick={() => setSortOrder(value)}
                    />
                  ))}
                </div>
              </div>
            </Modal>
          )}
          {/* Settings Modal for Audio Player */}
          {isAudioPlayer && (
            <Modal
              heading="Settings"
              actionButtonText="Save"
              onAction={handleSaveAudioSettings}
            >
              <AudioPlayerSettingsContent 
                initialDelay={audioSettings.delay as 1 | 3 | 5}
                initialRepetition={audioSettings.repetition as 1 | 2 | 3}
                initialVoice={audioSettings.voice as 1 | 2}
                onSettingsChange={(settings) => setAudioSettings(settings)}
              />
            </Modal>
          )}
        </div>
      </PracticeDataContext.Provider>
    </SortOrderContext.Provider>
  );
}

function SortToggle({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center py-1 gap-4 sm:gap-8 md:gap-20 lg:gap-40 w-full sm:w-fit justify-between sm:justify-start px-4 sm:px-0">
      <span className="font-body text-black text-lg sm:text-xl w-36 sm:w-48 text-left">
        {label}
      </span>
      <button
        onClick={onClick}
        className={`cursor-pointer w-24 sm:w-32 h-10 rounded-full relative transition-colors duration-500 flex-shrink-0 ${
          isActive ? "bg-black" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-transform duration-500 ${
            isActive ? "translate-x-[60px] sm:translate-x-[92px]" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}