import { useState, ReactNode, useContext, useRef, useEffect } from "react";
import { Button } from "@/components/buttons/PrimaryButton";
import { IoFilter, IoShareSocialSharp, IoAdd } from "react-icons/io5";
import { RiQuillPenAiFill , RiQuillPenFill } from "react-icons/ri";
import { ModalContext } from "@/components/modals/providers";
import NewCardModal from "./NewCardModal";
import AIImportModal from "./AIImportModal";
import PracticeModal from "./PracticeModal";
import { FaGamepad } from "react-icons/fa6";

type ModalType = "new-card" | "ai-import" | "practice" | null;

type FilterOption = {
  label: string;
  onClick: () => void;
};

export default function CardsPageLayout({
  currentDeckId,
  title,
  filterOptions = [],
  children,
}: {
  currentDeckId: string;
  title: string;
  filterOptions?: FilterOption[];
  children: ReactNode;
}) {
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]?.label || "All");
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const { setShowModal } = useContext(ModalContext);
  
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const addRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setShowModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        addRef.current &&
        !addRef.current.contains(e.target as Node) &&
        filterRef.current &&
        !filterRef.current.contains(e.target as Node)
      ) {
        setShowAddOptions(false);
        setShowFilterOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-xl lg:text-5xl font-main text-black">{title}</h1>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            className="py-1 flex items-center gap-2"
            onClick={() => openModal("practice")}
          >
            <FaGamepad className="lg:hidden" />
            <span className="hidden lg:inline">Practice</span>
          </Button>

        </div>
      </div>

      <div className="flex justify-end my-3">
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilterOptions((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <IoFilter className="text-lg text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Filter: <span className="text-gray-700">{selectedFilter}</span>
            </span>
          </button>

          <div
            className={`absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10
              transform transition-all duration-200 origin-top
              ${showFilterOptions ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}
            `}
          >
            {filterOptions.map((option, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedFilter(option.label);
                  option.onClick();
                  setShowFilterOptions(false);
                }}
                className={`px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm font-medium
                  ${idx === 0 ? "first:rounded-t-lg" : ""}
                  ${idx === filterOptions.length - 1 ? "last:rounded-b-lg" : "border-b border-gray-100"}
                `}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-[30px]">
        {children}
      </div>

      <div className="fixed bottom-20 lg:bottom-6 right-6 flex flex-col items-end space-y-3">
        <div
          className={`flex flex-col items-end mb-2 space-y-2 origin-bottom-right transition-all ${
            showAddOptions ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <button
            onClick={() => {
              setShowAddOptions(false);
              openModal("ai-import")
            }}
            className={`flex items-center gap-2 px-7 py-2 bg-black text-white rounded-full text-lg font-main
              transition-all duration-300 ease-out transform
              ${
                showAddOptions
                  ? "opacity-100 scale-100 translate-y-0 animate-bubble"
                  : "opacity-0 scale-0 translate-y-4"
              }
              hover:scale-105 hover:shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer
            `}
            style={{ transitionDelay: showAddOptions ? "50ms" : "0ms" }}
          >
            <RiQuillPenAiFill className="transition-colors duration-300" />
            <span className="transition-colors duration-300">AI Import</span>
          </button>

          <button
            onClick={() => {
              setShowAddOptions(false);
              openModal("new-card")
            }}
            className={`flex items-center gap-2 px-7 py-2 bg-black text-white rounded-full text-lg font-main
              transition-all duration-300 ease-out transform
              ${
                showAddOptions
                  ? "opacity-100 scale-100 translate-y-0 animate-bubble"
                  : "opacity-0 scale-0 translate-y-4"
              }
              hover:scale-105 hover:shadow-[0_0_15px_rgba(0,0,0,0.3)]  cursor-pointer
            `}
            style={{ transitionDelay: showAddOptions ? "100ms" : "0ms" }}
          >
            <RiQuillPenFill className="transition-colors duration-300" />
            <span className="transition-colors duration-300">New Card</span>
          </button>
        </div>

        <button
          onClick={() => setShowAddOptions(!showAddOptions)}
          className="flex items-center justify-center w-15 h-15 lg:w-20 lg:h-20 bg-black text-white rounded-full shadow-lg transition-transform duration-300 ease-out cursor-pointer 
            hover:scale-105 hover:shadow-[0_0_10px_rgba(0,0,0,0.4)]"
        >
          <IoAdd
            className={`text-4xl lg:text-6xl transform transition-transform duration-300 ${
              showAddOptions ? "rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {activeModal === "practice" && (
          <PracticeModal currentDeckId={currentDeckId}/>
      )}

      {activeModal === "new-card" && (
          <NewCardModal currentDeckId={currentDeckId}/>
      )}

      {activeModal === "ai-import" && (
          <AIImportModal currentDeckId={currentDeckId}/>
      )}
    </>
  );
}
