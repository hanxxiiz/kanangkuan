"use client";

import { ModalContext } from "@/components/modals/providers";
import React, { useContext, useState, useRef, useEffect } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaFileWord } from "react-icons/fa";
import { BiSolidFileTxt } from "react-icons/bi";
import { RiFilePpt2Fill } from "react-icons/ri";
import { uploadDocument } from '@/lib/actions/document-actions';
import { getProcessingStatus } from '@/lib/actions/process-document';
import ImportProgressModal from './ImportProgressModal';

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

interface AIImportModalProps {
  currentDeckId: string;
}

const STEP_TEXTS = [
  "Analyzing document content...",
  "Drafting flashcards...",
  "Saving to your decks...",
  "Finalizing the import...",
  "Preparing study modes...",
];

export default function AIImportModal({ currentDeckId }: AIImportModalProps) {
  const { Modal, setShowModal } = useContext(ModalContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Progress tracking
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STEP_TEXTS[0]);
  const [, setImportId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!acceptedTypes.includes(file.type)) {
      setError("Unsupported file type. Please upload PDF, DOCX, TXT, PPTX, XLSX, or CSV.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 8MB limit. Please choose a smaller file.');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setError(null);
    setSelectedFile(file);
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
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!acceptedTypes.includes(file.type)) {
      setError("Unsupported file type. Please upload PDF, DOCX, TXT, PPTX, XLSX, or CSV.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 8MB limit. Please choose a smaller file.');
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const pollProcessingStatus = async (id: string) => {
    let localProgress = 0;
    let pollCount = 0;
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const status = await getProcessingStatus(id);
        console.log('Processing status:', status); 
        pollCount++;
        
        if (status.status === 'pending' || status.status === 'processing') {
          const increment = pollCount % 2 === 0 ? 15 : 10;
          localProgress = Math.min(localProgress + increment, 90);
          
          setProgress(localProgress);
          
          // Update status text based on progress ranges
          if (localProgress < 25) {
            setStatusText(STEP_TEXTS[0]);
          } else if (localProgress < 45) {
            setStatusText(STEP_TEXTS[1]);
          } else if (localProgress < 65) {
            setStatusText(STEP_TEXTS[2]);
          } else if (localProgress < 80) {
            setStatusText(STEP_TEXTS[3]);
          } else {
            setStatusText(STEP_TEXTS[4]);
          }
        } else if (status.status === 'completed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          
          setProgress(100);
          setStatusText('Import complete!');
          
          setTimeout(() => {
            setShowProgressModal(false);
            // Reset state
            setSelectedFile(null);
            setProgress(0);
            setStatusText(STEP_TEXTS[0]);
            setImportId(null);
            if (inputRef.current) {
              inputRef.current.value = '';
            }
            // Optionally trigger a refresh of the cards list here
            //window.location.reload(); comment for now.. idek unsay pamaagi ani ug nanay bag o cards if murefresh ba gyud ang whole website or ang decks page ra 
          }, 2000);
        } else if (status.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          
          setStatusText('An error has occurred.');
          setProgress(0);
          
          // Close after showing error for 3 seconds
          setTimeout(() => {
            setShowProgressModal(false);
            setError('Processing failed');
          }, 3000);
        } else if (status.status === 'error') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          
          setStatusText('An error has occurred.');
          setProgress(0);
          
          // Close after showing error for 3 seconds
          setTimeout(() => {
            setShowProgressModal(false);
            const errorMsg = 'error' in status ? status.error : 'Processing failed';
            setError(errorMsg || 'Processing failed');
          }, 3000);
        }
      } catch (err) {
        console.error('Polling error:', err);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setStatusText('An error has occurred.');
        setTimeout(() => {
          setShowProgressModal(false);
          setError('Failed to check processing status');
        }, 3000);
      }
    }, 2000); // Poll every 2 seconds

    // Safety timeout after 5 minutes
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (progress < 100) {
        setStatusText('An error has occurred.');
        setTimeout(() => {
          setShowProgressModal(false);
          setError('Processing timeout - please try again');
        }, 3000);
      }
    }, 300000);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!currentDeckId) {
      setError('Deck ID is missing');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('deckId', currentDeckId);

      const result = await uploadDocument(formData);

      if (result.success && result.importId) {
        // Close the file selection modal first
        setShowModal(false);
        
        // Show progress modal and start tracking
        setShowProgressModal(true);
        setProgress(0); 
        setStatusText(STEP_TEXTS[0]);
        setImportId(result.importId);
        
        // Start polling for status
        pollProcessingStatus(result.importId);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

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
    <>
      <Modal 
        heading="AI Import" 
        actionButtonText={uploading ? "Uploading..." : "Import"}
        onAction={handleUpload}
      >
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
              Accepted: PDF, DOCX, TXT, PPTX, XLSX, CSV (Max 8MB)
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
              disabled={uploading}
              className="px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </Modal>

      {/* Progress modal rendered outside of main Modal */}
      {showProgressModal && (
        <ImportProgressModal
          showModal={showProgressModal}
          setShowModal={setShowProgressModal}
          progress={progress}
          statusText={statusText}
        />
      )}
    </>
  );
}