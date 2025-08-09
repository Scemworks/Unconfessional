"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// The key for storing entries in the browser's localStorage.
const LOCAL_STORAGE_KEY = "unconfessional-entries";

// Type definition for a single entry.
type Entry = {
  id: string;
  title: string;
  content: string; // scrambled text
  actualContent: string; // original text (kept for future deciphering feature)
  createdAt: string;
  failureCount: number;
  lockoutUntil?: number;
};

// --- Constants moved outside the component to prevent re-creation on each render ---

// A helper component for the ornamental border to keep the main component cleaner.
const OrnamentalBorder = () => (
  <div className="absolute inset-0 p-2 pointer-events-none">
    <div className="w-full h-full border-4 border-black/80 p-1">
      <div className="w-full h-full border-2 border-black/70 p-3 bg-[#e87b95]/20">
         <div className="w-full h-full border border-black/60"></div>
      </div>
    </div>
  </div>
);

// Keyboard roulette map for scrambling text.
const keyboardRoulette: { [key: string]: string[] } = {
    'a': ['x', 'z', 'q', 'w', 'c', 'v', 'b'], 'b': ['n', 'h', 'g', 'v', 'c', 'f', 'd'],
    'c': ['v', 'f', 'd', 'x', 'z', 's', 'w'], 'd': ['s', 'f', 'e', 'r', 'c', 'x', 'z'],
    'e': ['r', 'w', 's', 'd', 'f', 'q', 'a'], 'f': ['d', 'g', 'r', 't', 'v', 'c', 'x'],
    'g': ['f', 'h', 't', 'y', 'b', 'v', 'c'], 'h': ['g', 'j', 'y', 'u', 'n', 'b', 'v'],
    'i': ['u', 'o', 'k', 'j', 'l', 'p', 'q'], 'j': ['h', 'k', 'u', 'i', 'm', 'n', 'b'],
    'k': ['j', 'l', 'i', 'o', 'n', 'm', 'h'], 'l': ['k', 'p', 'o', 'i', 'm', 'n', 'j'],
    'm': ['n', 'j', 'k', 'l', 'x', 'z', 's'], 'n': ['b', 'm', 'h', 'j', 'v', 'c', 'x'],
    'o': ['i', 'p', 'l', 'k', 'u', 'y', 't'], 'p': ['o', 'l', 'k', 'j', 'i', 'u', 'y'],
    'q': ['w', 'a', 's', 'e', 'r', 't', 'y'], 'r': ['e', 't', 'd', 'f', 'g', 'h', 'j'],
    's': ['a', 'd', 'w', 'e', 'z', 'x', 'c'], 't': ['r', 'y', 'f', 'g', 'h', 'j', 'k'],
    'u': ['y', 'i', 'h', 'j', 'k', 'l', 'o'], 'v': ['c', 'b', 'f', 'g', 'h', 'n', 'm'],
    'w': ['q', 's', 'e', 'r', 'a', 'd', 'f'], 'x': ['z', 'c', 's', 'd', 'f', 'v', 'b'],
    'y': ['t', 'u', 'g', 'h', 'j', 'k', 'l'], 'z': ['x', 's', 'a', 'w', 'q', 'e', 'r'],
    'A': ['X', 'Z', 'Q', 'W', 'C', 'V', 'B'], 'B': ['N', 'H', 'G', 'V', 'C', 'F', 'D'],
    'C': ['V', 'F', 'D', 'X', 'Z', 'S', 'W'], 'D': ['S', 'F', 'E', 'R', 'C', 'X', 'Z'],
    'E': ['R', 'W', 'S', 'D', 'F', 'Q', 'A'], 'F': ['D', 'G', 'R', 'T', 'V', 'C', 'X'],
    'G': ['F', 'H', 'T', 'Y', 'B', 'V', 'C'], 'H': ['G', 'J', 'Y', 'U', 'N', 'B', 'V'],
    'I': ['U', 'O', 'K', 'J', 'L', 'P', 'Q'], 'J': ['H', 'K', 'U', 'I', 'M', 'N', 'B'],
    'K': ['J', 'L', 'I', 'O', 'N', 'M', 'H'], 'L': ['K', 'P', 'O', 'I', 'M', 'N', 'J'],
    'M': ['N', 'J', 'K', 'L', 'X', 'Z', 'S'], 'N': ['B', 'M', 'H', 'J', 'V', 'C', 'X'],
    'O': ['I', 'P', 'L', 'K', 'U', 'Y', 'T'], 'P': ['O', 'L', 'K', 'J', 'I', 'U', 'Y'],
    'Q': ['W', 'A', 'S', 'E', 'R', 'T', 'Y'], 'R': ['E', 'T', 'D', 'F', 'G', 'H', 'J'],
    'S': ['A', 'D', 'W', 'E', 'Z', 'X', 'C'], 'T': ['R', 'Y', 'F', 'G', 'H', 'J', 'K'],
    'U': ['Y', 'I', 'H', 'J', 'K', 'L', 'O'], 'V': ['C', 'B', 'F', 'G', 'H', 'N', 'M'],
    'W': ['Q', 'S', 'E', 'R', 'A', 'D', 'F'], 'X': ['Z', 'C', 'S', 'D', 'F', 'V', 'B'],
    'Y': ['T', 'U', 'G', 'H', 'J', 'K', 'L'], 'Z': ['X', 'S', 'A', 'W', 'Q', 'E', 'R'],
    '1': ['3', '7', '9', '4', '2', '5', '8'], '2': ['6', '4', '8', '1', '9', '3', '7'],
    '3': ['8', '1', '5', '7', '2', '6', '4'], '4': ['2', '9', '6', '3', '1', '8', '5'],
    '5': ['7', '3', '1', '9', '4', '2', '6'], '6': ['4', '8', '2', '5', '7', '1', '9'],
    '7': ['9', '5', '3', '1', '8', '4', '2'], '8': ['6', '2', '4', '7', '3', '9', '5'],
    '9': ['1', '7', '5', '8', '6', '3', '4'], '0': ['5', '8', '3', '2', '7', '1', '6'],
    ' ': [' '],
    '.': ['!', '?', ',', ';', ':', '"', "'"], '!': ['.', '?', ',', ';', ':', '"', "'"],
    '?': ['.', '!', ',', ';', ':', '"', "'"], ',': ['.', '!', '?', ';', ':', '"', "'"],
    ';': ['.', '!', '?', ',', ':', '"', "'"], ':': ['.', '!', '?', ',', ';', '"', "'"],
    '"': ['.', '!', '?', ',', ';', ':', "'"], "'": ['.', '!', '?', ',', ';', ':', '"']
};

export default function ConfessPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Scrambled text
  const [actualContent, setActualContent] = useState(""); // Original text
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [spread, setSpread] = useState(false);
  const [cursorOverOpen, setCursorOverOpen] = useState(false);
  const [cursorOverClose, setCursorOverClose] = useState(false);
  const [now, setNow] = useState(Date.now()); // State to track current time for lockouts
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  // Load entries from localStorage on initial render
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error("Failed to load entries from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        if (entries.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to save entries to localStorage", error);
      }
    }
  }, [entries, isLoaded]);

  // Effect to manually set the cursor position after a state update
  useEffect(() => {
    if (textareaRef.current && cursorPositionRef.current !== null) {
      textareaRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
      cursorPositionRef.current = null; // Reset after use
    }
  }, [content]);
  
  // Effect to update timers and check for expired lockouts
  useEffect(() => {
    const interval = setInterval(() => {
        setNow(Date.now());
        
        setEntries(currentEntries => {
            let needsUpdate = false;
            const updatedEntries = currentEntries.map(entry => {
                if (entry.lockoutUntil && Date.now() > entry.lockoutUntil) {
                    needsUpdate = true;
                    const newEntry = { ...entry, failureCount: 0, lockoutUntil: undefined };
                    if (selectedEntry?.id === newEntry.id) {
                        setSelectedEntry(newEntry);
                    }
                    return newEntry;
                }
                return entry;
            });
            return needsUpdate ? updatedEntries : currentEntries;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedEntry]);


  // Scrambles a single character based on the keyboard roulette map
  const scrambleChar = useCallback((char: string): string => {
    const options = keyboardRoulette[char];
    if (!options || options.length === 0) return char;
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }, []);

  const canSave = useMemo(
    () => title.trim().length > 0 || actualContent.trim().length > 0,
    [title, actualContent]
  );

  const save = () => {
    if (!canSave) return;
    const newEntry: Entry = {
      id: `${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      actualContent: actualContent.trim(),
      createdAt: new Date().toISOString(),
      failureCount: 0
    };
    setEntries((prev) => [newEntry, ...prev]);
    setTitle("");
    setContent("");
    setActualContent("");
  };

  // Intercepts key presses to implement the Keyboard Roulette logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { key } = e;
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (key.length === 1) { // Handle character input
      e.preventDefault();
      const scrambled = scrambleChar(key);
      const newActualContent = actualContent.slice(0, start) + key + actualContent.slice(end);
      const newContent = content.slice(0, start) + scrambled + content.slice(end);
      setActualContent(newActualContent);
      setContent(newContent);
      cursorPositionRef.current = start + 1;
    } else if (key === 'Backspace') {
      e.preventDefault();
      if (start === 0 && end === 0) return;
      const newStart = start === end ? start - 1 : start;
      setActualContent(actualContent.slice(0, newStart) + actualContent.slice(end));
      setContent(content.slice(0, newStart) + content.slice(end));
      cursorPositionRef.current = newStart;
    } else if (key === 'Delete') {
      e.preventDefault();
      if (start === end && start === content.length) return;
      const newEnd = start === end ? end + 1 : end;
      setActualContent(actualContent.slice(0, start) + actualContent.slice(newEnd));
      setContent(content.slice(0, start) + content.slice(newEnd));
      cursorPositionRef.current = start;
    } else if (key === 'Enter') {
      e.preventDefault();
      setActualContent(actualContent.slice(0, start) + '\n' + actualContent.slice(end));
      setContent(content.slice(0, start) + '\n' + content.slice(end));
      cursorPositionRef.current = start + 1;
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Simulates a decipher attempt, incrementing failure count and setting a lockout
  const handleDecipher = (entryId: string) => {
    setEntries(prevEntries => 
        prevEntries.map(entry => {
            if (entry.id === entryId) {
                if (isEntryLocked(entry)) return entry;
                
                const newFailureCount = (entry.failureCount || 0) + 1;
                let newLockoutUntil = entry.lockoutUntil;
                
                if (newFailureCount >= 3) {
                    newLockoutUntil = now + 30000; // 30-second lockout
                }

                const updatedEntry = { ...entry, failureCount: newFailureCount, lockoutUntil: newLockoutUntil };
                setSelectedEntry(updatedEntry);
                return updatedEntry;
            }
            return entry;
        })
    );
  };
  
  const handleClearMemories = () => {
    setEntries([]);
    setShowClearConfirm(false);
  };

  const isEntryLocked = (entry: Entry): boolean => {
    if (!entry.lockoutUntil) return false;
    return now < entry.lockoutUntil;
  };

  const getLockoutTimeRemaining = (entry: Entry): string => {
    if (!entry.lockoutUntil) return "";
    const remaining = Math.max(0, entry.lockoutUntil - now);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleOpenBook = () => setSpread(true);
  const handleCloseBook = () => setSpread(false);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inconsolata&display=swap');
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-mono {
          font-family: 'Inconsolata', monospace;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9e9ec;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e8d7da;
          border-radius: 10px;
          border: 2px solid #f9e9ec;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #d8c8a8;
        }
      `}</style>
      <motion.div
        className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8"
        style={{
          background: "#4a2511",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md lg:max-w-none" style={{ perspective: "2000px", perspectiveOrigin: "center center" }}>
          <div className={`flex flex-col lg:flex-row lg:gap-1 relative w-full justify-center`}>
            {spread && (
              <motion.div
                className="hidden lg:block absolute left-1/2 top-0 w-1 h-full z-0"
                style={{
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.6) 100%)",
                  transform: "translateZ(-5px)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />
            )}

            {/* Left page - cover */}
            <motion.div
              className={`w-full lg:w-[520px] h-auto aspect-[520/720] lg:h-[720px] relative items-center justify-center shrink-0 ${spread ? 'hidden lg:flex' : 'flex'}`}
              style={{
                background: "#d8c8a8",
                boxShadow: spread
                  ? "0 25px 50px rgba(0,0,0,0.6), -10px 0 20px rgba(0,0,0,0.3)"
                  : "0 18px 36px rgba(0,0,0,0.5)",
                border: "2px solid #2a150a",
                borderRadius: "10px 10px 0 0 lg:borderRadius: '10px 0 0 10px'",
                transformOrigin: "bottom center lg:transformOrigin: 'right center'",
                transformStyle: "preserve-3d",
              }}
              animate={{
                rotateY: spread ? -25 : 0,
                z: spread ? 20 : 0,
              }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "tween"
              }}
            >
              <OrnamentalBorder />
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
                  <div className="mb-4 md:mb-8 border-y-2 border-black/70 py-2 px-4 md:px-6 bg-[#d8c8a8]/50">
                      <h1 className="text-3xl md:text-5xl font-bold text-black font-serif">
                          The Unconfessional
                      </h1>
                      <p className="text-black/80 text-xs md:text-sm italic mt-2">
                          Your Thoughts are safe here
                      </p>
                  </div>
                  <div className="w-40 h-32 md:w-80 md:h-60 flex items-center justify-center bg-transparent">
                     <p className="text-center text-black/60 italic text-6xl md:text-7xl opacity-20">
                       ❧
                     </p>
                  </div>
              </div>

              {!spread && (
                <motion.div
                  role="button"
                  aria-label="Open to next page"
                  className="absolute right-0 bottom-0 cursor-pointer overflow-hidden z-20"
                  onMouseEnter={() => setCursorOverOpen(true)}
                  onMouseLeave={() => setCursorOverOpen(false)}
                  onClick={handleOpenBook}
                  title="Open"
                  initial={{ width: '48px', height: '48px' }}
                  animate={{
                      width: cursorOverOpen ? "56px" : "48px",
                      height: cursorOverOpen ? "56px" : "48px"
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="absolute right-0 bottom-0 w-full h-full"
                      style={{
                          background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.25) 51%, rgba(0,0,0,0.5) 100%)",
                          boxShadow: "3px 3px 7px rgba(0,0,0,0.35)",
                          borderRadius: "0 0 0 100%",
                      }}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Right page */}
            <AnimatePresence>
              {spread && (
                <motion.div
                  className="w-full lg:w-[520px] h-auto aspect-[520/720] lg:h-[720px] relative overflow-hidden shrink-0"
                  style={{
                    background: "#f9e9ec",
                    backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 31px, #e8d7da 32px)",
                    backgroundSize: "100% 32px",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.6), 10px 0 20px rgba(0,0,0,0.3)",
                    borderRadius: "0 0 10px 10px lg:borderRadius: '0 10px 10px 0'",
                    transformOrigin: "top center lg:transformOrigin: 'left center'",
                    transformStyle: "preserve-3d",
                  }}
                  initial={{ opacity: 0, y: -20, rotateY: 25 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  exit={{ opacity: 0, y: -20, rotateY: 25 }}
                  transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], type: "tween" }}
                >
                  <motion.div
                      role="button"
                      aria-label="Back to cover"
                      className="absolute left-0 bottom-0 cursor-pointer z-20"
                      onMouseEnter={() => setCursorOverClose(true)}
                      onMouseLeave={() => setCursorOverClose(false)}
                      onClick={handleCloseBook}
                      title="Back"
                      initial={{ width: '48px', height: '48px' }}
                      animate={{
                          width: cursorOverClose ? "56px" : "48px",
                          height: cursorOverClose ? "56px" : "48px"
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                      <div className="absolute left-0 bottom-0 w-full h-full"
                          style={{
                              background: "linear-gradient(225deg, transparent 50%, rgba(0,0,0,0.25) 51%, rgba(0,0,0,0.5) 100%)",
                              boxShadow: "-3px 3px 7px rgba(0,0,0,0.35)",
                              borderRadius: "0 0 100% 0",
                          }}
                      />
                  </motion.div>

                  <motion.div
                    className="relative z-10 p-6 md:p-10 h-full flex flex-col text-stone-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="mb-4">
                      <h2 className="text-2xl md:text-3xl font-bold font-serif">New Entry</h2>
                      <p className="text-sm italic">What's on your mind?</p>
                    </div>

                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Give your thoughts a title"
                        value={title}
                        onChange={handleTitleChange}
                        className="w-full p-2 bg-transparent border-none text-lg focus:outline-none placeholder:text-stone-500/80 font-serif"
                      />
                    </div>

                    <div className="flex-1 relative min-h-[150px]">
                      <textarea
                        ref={textareaRef}
                        placeholder="Then write them down here..."
                        value={content}
                        onKeyDown={handleKeyDown}
                        onChange={() => {}} 
                        className="w-full h-full p-2 bg-transparent border-none resize-none focus:outline-none leading-8 placeholder:text-stone-500/80 font-mono"
                        style={{ lineHeight: "32px" }}
                      />
                    </div>

                    <div className="flex justify-end items-center mt-auto my-4">
                      <button
                        className="px-6 py-3 font-serif text-amber-100 bg-red-900/80 rounded-md shadow-lg border border-red-900/50 backdrop-blur-sm transform transition-all duration-200 hover:bg-red-800/90 hover:shadow-xl hover:scale-105 active:scale-95 disabled:bg-stone-500/20 disabled:text-stone-500 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
                        onClick={save}
                        disabled={!canSave}
                      >
                        Seal Your Thoughts
                      </button>
                    </div>

                    <div className="border-t border-stone-300 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl md:text-2xl font-semibold font-serif">Memories</h3>
                        {entries.length > 0 && (
                          <div className="flex gap-2 text-xl items-center">
                            <button
                              aria-label="Grid view"
                              className={`p-1 rounded transition-colors text-stone-700 hover:bg-pink-200/50 ${view === "grid" ? "bg-pink-300/70" : "bg-pink-200/30"}`}
                              onClick={() => setView("grid")}
                            >
                              ⊞
                            </button>
                            <button
                              aria-label="List view"
                              className={`p-1 rounded transition-colors text-stone-700 hover:bg-pink-200/50 ${view === "list" ? "bg-pink-300/70" : "bg-pink-200/30"}`}
                              onClick={() => setView("list")}
                            >
                              ≡
                            </button>
                             <button
                                aria-label="Clear all memories"
                                className="p-1 rounded transition-colors text-red-700/70 hover:bg-red-200/50"
                                onClick={() => setShowClearConfirm(true)}
                                title="Clear all memories"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              </button>
                          </div>
                        )}
                      </div>

                      <div className="h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {entries.length === 0 ? (
                          <p className="text-stone-600 text-sm italic">
                            Your scrambled thoughts will appear here once sealed.
                          </p>
                        ) : view === "grid" ? (
                          <div className="grid grid-cols-1 gap-3">
                            {entries.map((e) => (
                              <div key={e.id} onClick={() => setSelectedEntry(e)} className="bg-white/40 p-3 rounded-md border border-stone-300/50 shadow-sm cursor-pointer hover:bg-white/60 transition-colors">
                                <div className="flex justify-between items-start">
                                  <div className="text-sm font-semibold text-stone-800 line-clamp-1 font-serif">
                                    {e.title || "Untitled"}
                                  </div>
                                  {isEntryLocked(e) && (
                                    <div className="text-xs text-red-600 font-mono bg-red-100 px-2 py-1 rounded">
                                      🔒
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-stone-600 line-clamp-2 mt-1 font-mono">
                                  {e.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ul className="space-y-2">
                            {entries.map((e) => (
                              <li key={e.id} onClick={() => setSelectedEntry(e)} className="p-2 bg-white/40 rounded-md border-l-4 border-pink-300 cursor-pointer hover:bg-white/60 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-stone-800 truncate font-serif">
                                      {e.title || "Untitled"}
                                    </div>
                                    <div className="text-xs text-stone-600 line-clamp-1 font-mono">
                                      {e.content}
                                    </div>
                                  </div>
                                  {isEntryLocked(e) && (
                                    <div className="ml-4 flex-shrink-0 text-xs text-red-600 font-mono bg-red-100 px-2 py-1 rounded">
                                      🔒
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      
      {/* Modal for viewing a single entry */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              className="bg-[#fdf6f7] rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full relative border-4 border-stone-400/50"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-2 right-3 text-stone-500 hover:text-stone-900 text-3xl font-bold"
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="font-serif text-2xl md:text-3xl mb-2 text-stone-800 pr-8">{selectedEntry.title || "Untitled"}</h2>
              <p className="text-xs text-stone-500 mb-4 italic">
                Created on: {new Date(selectedEntry.createdAt).toLocaleString()}
              </p>
              <div className="bg-white/80 p-4 rounded-md h-64 overflow-y-auto font-mono text-stone-700 border border-stone-300/80 whitespace-pre-wrap break-words custom-scrollbar">
                {selectedEntry.content}
              </div>
              <div className="mt-6 flex justify-end items-center">
                {isEntryLocked(selectedEntry) ? (
                  <div className="text-base md:text-lg text-red-700 font-mono bg-red-100/70 px-4 py-2 rounded-md border border-red-300">
                    🔒 Locked for: {getLockoutTimeRemaining(selectedEntry)}
                  </div>
                ) : (
                  <button
                    className="text-base md:text-lg bg-blue-200 hover:bg-blue-300 px-6 py-2 rounded text-blue-900 font-semibold transition-colors shadow-md hover:shadow-lg"
                    onClick={() => handleDecipher(selectedEntry.id)}
                    title={`Decipher attempt: ${selectedEntry.failureCount}/3`}
                  >
                    🔓 Attempt to Decipher
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for clearing memories */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              className="bg-[#d8c8a8] rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full relative border-4 border-red-900/50"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl md:text-2xl font-bold font-serif text-stone-900 mb-4">Burn Your Memories?</h3>
              <p className="text-stone-700 mb-6 text-sm md:text-base">This will permanently destroy all of your sealed thoughts. This action cannot be undone and the ashes will scatter to the wind.</p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-md font-semibold text-stone-800 bg-stone-300/70 hover:bg-stone-400/70 transition-colors"
                >
                  Have Mercy
                </button>
                <button 
                  onClick={handleClearMemories}
                  className="px-4 py-2 rounded-md font-semibold text-white bg-red-800 hover:bg-red-900 shadow-lg hover:shadow-xl transition-all"
                >
                  Burn Them All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
