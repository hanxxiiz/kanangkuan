import { useState, ReactNode, useContext, useRef, useEffect } from "react";
import { Button } from "@/components/buttons/PrimaryButton";
import { IoFilter, IoShareSocialSharp, IoAdd } from "react-icons/io5";
import { RiQuillPenAiFill , RiQuillPenFill } from "react-icons/ri";
import { ModalContext } from "@/components/modals/providers";
import PracticeModal from "../dashboard/my-decks/PracticeModal";

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
        <h1 className="text-5xl font-main">{title}</h1>
        <div className="flex items-center justify-end gap-2">
          <button className="flex items-center p-3 bg-white rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <IoShareSocialSharp className="text-xl text-black" />
          </button>
          <Button
            variant="outline"
            className="py-1 px-4"
            onClick={() => openModal("practice")}
          >
            Practice
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

      {activeModal === "practice" && (
          <PracticeModal />
      )}
    </>
  );
}
