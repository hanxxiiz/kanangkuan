"use client";

import { ModalContext } from "@/components/modals/providers";
import React, { useContext, useState, useRef } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaFileWord } from "react-icons/fa";
import { BiSolidFileTxt } from "react-icons/bi";
import { RiFilePpt2Fill } from "react-icons/ri";

const fileTypeIcons: Record<string, { icon: React.ReactNode; bg: string }> = {
  pdf: { icon: <FaFilePdf />, bg: "from-pink to-dark-pink" },
  doc: { icon: <FaFileWord />, bg: "from-blue to-dark-blue" },
  docx: { icon: <FaFileWord />, bg: "from-blue to-dark-blue" },
  txt: { icon: <BiSolidFileTxt />, bg: "from-cyan to-dark-cyan" },
  ppt: { icon: <RiFilePpt2Fill />, bg: "from-purple to-dark-purple" },
  pptx: { icon: <RiFilePpt2Fill />, bg: "from-purple to-dark-purple" },
  xls: { icon: <FaFileExcel />, bg: "from-lime to-dark-lime" },
  xlsx: { icon: <FaFileExcel />, bg: "from-lime to-dark-lime" },
  csv: { icon: <FaFileCsv />, bg: "from-cyan to-dark-cyan" },
};

export default function AIImportModal() {
  const { Modal } = useContext(ModalContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      if (!acceptedTypes.includes(file.type)) {
        alert("Unsupported file type. Please upload a valid document.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      alert("Unsupported file type. Please upload a valid document.");
      return;
    }
    setSelectedFile(file);
  };

  const openFileDialog = () => inputRef.current?.click();

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return fileTypeIcons[ext] || { icon: <BiSolidFileTxt />, bg: "from-gray-400 to-gray-600" };
  };

  const truncateFileName = (name: string, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    const ext = name.includes(".") ? "." + name.split(".").pop() : "";
    const base = name.slice(0, maxLength - ext.length - 3);
    return base + "..." + ext;
  };

  return (
    <div>
      <Modal heading="AI Import" actionButtonText="Import">
        {!selectedFile ? (
          <div
            className={`mt-3 w-full rounded-4xl border-3 border-dashed flex flex-col justify-center items-center py-10 cursor-pointer transition-colors ${
              isDragging ? "border-lime bg-lime/10 text-lime" : "border-pink text-pink"
            }`}
            onClick={openFileDialog}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FiUploadCloud className="text-7xl" />
            <h2 className="text-base font-main mb-1">Upload or drag a file here</h2>
            <p className="text-xs font-body text-gray-300">
              Accepted: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, CSV
            </p>
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv"
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <div
            className={`mt-3 w-full rounded-4xl border-1 border-black flex flex-col justify-center items-center py-10 text-black`}
          >
            <div
                className={`py-8 px-5 flex items-center justify-center rounded-2xl text-white text-7xl bg-gradient-to-b ${getFileIcon(selectedFile.name).bg}`}
              >
                {getFileIcon(selectedFile.name).icon}
              </div>

            <h2
              className="mt-2 text-md font-main max-w-[250px] truncate text-center"
              title={selectedFile.name}
            >
              {truncateFileName(selectedFile.name)}
            </h2>
            <p className="text-xs font-body opacity-70 mb-4">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>

            <button
              onClick={openFileDialog}
              className="px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Replace File
            </button>

            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv"
              style={{ display: "none" }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
