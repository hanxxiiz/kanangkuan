import { useState, ReactNode, useContext } from "react";
import { Button } from "@/components/buttons/PrimaryButton";
import { IoFilter, IoShareSocialSharp, IoAdd } from "react-icons/io5";
import { RiQuillPenAiFill , RiQuillPenFill } from "react-icons/ri";
import { ModalContext } from "@/components/modals/providers";
import NewCardModal from "./NewCardModal";
import AIImportModal from "./AIImportModal";

type ModalType = "new-card" | "ai-import" | null;

const filterOptions = ["Randomized", "Newest-to-Oldest", "Oldest-to-Newest"];

export default function CardsPageLayout({
  currentDeckId,
  title,
  children,
}: {
  currentDeckId: string;
  title: string;
  children: ReactNode;
}) {
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const { setShowModal } = useContext(ModalContext);
  
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setShowModal(true);
  };

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
          >
            Practice
          </Button>
        </div>
      </div>

      <div className="flex justify-end my-3">
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <IoFilter className="text-lg text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Filter: <span className="text-gray-700">{selectedFilter}</span>
            </span>
          </button>

          <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            {filterOptions.map((option, idx) => (
              <li
                key={option}
                onClick={() => setSelectedFilter(option)}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm
                  ${idx === 0 ? "first:rounded-t-lg" : ""}
                  ${idx === filterOptions.length - 1 ? "last:rounded-b-lg" : "border-b border-gray-100"}
                `}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-[30px]">
        {children}
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3">
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
          className="flex items-center justify-center w-20 h-20 bg-black text-white rounded-full shadow-lg transition-transform duration-300 ease-out cursor-pointer 
            hover:scale-105 hover:shadow-[0_0_10px_rgba(0,0,0,0.4)]"
        >
          <IoAdd
            className={`text-6xl transform transition-transform duration-300 ${
              showAddOptions ? "rotate-45" : ""
            }`}
          />
        </button>
      </div>
      {activeModal === "new-card" && (
          <NewCardModal currentDeckId={currentDeckId}/>
      )}

      {activeModal === "ai-import" && (
          <AIImportModal />
      )}
    </>
  );
}
