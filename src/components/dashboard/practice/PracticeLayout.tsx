"use client";

import React, { useContext, useEffect, useState, createContext } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FaArrowLeft, FaClone } from "react-icons/fa6";
import { usePathname, useRouter, useParams } from "next/navigation";
import { ModalContext } from "@/components/modals/providers";
import { GetDeckInfo, DeckInfo } from "@/lib/queries/practice-queries";
import { UpdateUserSettings } from "@/lib/actions/basic-review-actions";
import {
  GetUserSettings,
  GetCardsForReview,
  GetUserKeys,
  GetUserProfilePic,
} from "@/lib/queries/basic-review-queries";
import { generateBlankWordsForDeck } from "@/lib/actions/generate-blank-words";

type SortOrder = "oldest_first" | "newest_first" | "random_order";

export const SortOrderContext = createContext<{
  sortOrder: SortOrder;
  updateSortOrder: (newOrder: SortOrder) => void;
}>({
  sortOrder: "oldest_first",
  updateSortOrder: () => {},
});

export const PracticeDataContext = createContext<any>(null);

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
  const [initialData, setInitialData] = useState<any>(null);

  const isBasicReview = pathname.includes("/dashboard/practice/basic-review");
  const isActiveRecall = pathname.includes("/dashboard/practice/active-recall");
  const showSettings = isBasicReview || pathname.includes("/dashboard/practice/audio-player");

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
  let isCancelled = false;

  async function loadData() {
    if (!mounted || !deckId) return;

    setIsLoading(true);
    try {
      const settings = await GetUserSettings();
      if (isCancelled) return;
      setSortOrder(settings.review_sort_order);

      const info = await GetDeckInfo(deckId);
      if (isCancelled) return;
      setDeckInfo(info);

      if (isActiveRecall) {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('prepare') === 'true' && !isGenerating) {
          setIsGenerating(true);
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const result = await generateBlankWordsForDeck(deckId);
          
          setIsGenerating(false);
          
          if (result.success) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('prepare');
            window.history.replaceState({}, '', newUrl);
          }
        }
        
        if (!isCancelled) {
          const cardsData = await GetCardsForReview(deckId, "oldest_first");
          setInitialData({ cards: cardsData });
        }
      }
      
    } finally {
      if (!isCancelled) {
        setIsLoading(false);
      }
    }
  }

  loadData();

  return () => {
    isCancelled = true;
  };
}, [mounted, deckId]);

  //will be changed with the loading component later on
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

  return (
    <SortOrderContext.Provider value={{ sortOrder, updateSortOrder: setSortOrder }}>
      <PracticeDataContext.Provider value={initialData}>
        <div className="fixed inset-0 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 w-full flex items-center px-3 sm:px-6 py-4">
            <div className="flex items-center gap-3 sm:gap-5">
              <FaArrowLeft
                onClick={handleBack}
                className="cursor-pointer text-2xl text-[#101220] xl:text-gray-200 hover:text-[#101220] hover:scale-105 transition-all duration-250"
              />
              {showSettings && (
                <IoSettingsSharp
                  onClick={() => setShowModal(true)}
                  className="cursor-pointer text-2xl text-[#101220] xl:text-gray-200 hover:text-[#101220] hover:scale-105 transition-all duration-250"
                />
              )}
            </div>

            {isBasicReview && deckInfo && (
              <div className="flex items-center gap-3 ml-5 sm:ml-6">
                <FaClone className="text-2xl" style={{ color: deckInfo.deck_color }} />
                <span className="text-black text-md sm:text-lg font-body truncate max-w-[185px] sm:max-w-none">
                  {deckInfo.deck_name}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 w-full overflow-hidden">
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child, { initialData } as any)
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