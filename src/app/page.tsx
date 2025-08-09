"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Entry = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function ConfessPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("unconfessional.entries");
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("unconfessional.entries", JSON.stringify(entries));
    } catch {}
  }, [entries]);

  const canSave = useMemo(
    () => title.trim().length > 0 || content.trim().length > 0,
    [title, content]
  );

  const save = () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    setEntries((prev) => [
      { id: `${Date.now()}`, title: title.trim(), content: content.trim(), createdAt: now },
      ...prev,
    ]);
    setTitle("");
    setContent("");
  };

  return (
    <motion.div
      className="min-h-screen w-full flex items-center justify-center p-6 md:p-8"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, #5e1f00 0%, #7a2f0a 35%, #8b3a10 60%, #2c0b00 100%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex gap-1">
        {/* Left page - cover */}
        <motion.div
          className="w-[520px] h-[720px] relative flex items-center justify-center"
          style={{
            background: "#C8B086",
            boxShadow: "0 18px 36px rgba(0,0,0,0.5)",
            border: "10px solid #9B8461",
            borderRadius: "10px 0 0 10px",
          }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* embossy borders */}
          <div className="absolute top-3 left-3 right-3 bottom-3 border-[10px] border-[#3b2e1f] opacity-90 rounded-sm" />
          <div className="absolute top-10 left-10 right-10 bottom-10 border-4 border-pink-300/80 rounded-sm" />
          {/* top tab */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#d9c1a5] text-[#3b2e1f] text-[10px] tracking-widest px-2 py-[2px] rounded-b shadow">
            uconf
          </div>

          {/* cover content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6">
            <div className="bg-pink-300 rounded-md p-6 w-11/12 flex flex-col items-center justify-center relative shadow-inner">
              <div className="text-center mb-2">
                <h1 className="text-4xl font-black text-black leading-tight">
                  The
                  <br />
                  Unconfessional
                </h1>
              </div>
              <p className="text-black text-base italic mt-1 mb-6">
                Your Thoughts are safe here
              </p>
              <div className="w-40 h-40 bg-[#D9C8A0] rounded-md mb-2 flex items-center justify-center shadow-inner">
                <div className="w-32 h-32 rounded-full border-2 border-pink-400 flex items-center justify-center text-6xl opacity-60">
                  ✿
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right page */}
        <motion.div
          className="w-[520px] h-[720px] relative overflow-hidden"
          style={{
            background: "#FFE0E5",
            boxShadow: "0 18px 36px rgba(0,0,0,0.5)",
            borderRadius: "0 10px 10px 0",
          }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* ruled paper + pinstripes */}
          <div
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 31px, #f7bdc7 31px, #f7bdc7 32px), repeating-linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0) 12px, rgba(255,192,203,0.35) 12px, rgba(255,192,203,0.35) 24px)",
            }}
          />
          {/* page curl hint */}
          <div
            className="absolute right-0 bottom-0 w-10 h-10"
            style={{
              background:
                "radial-gradient(14px at 100% 100%, rgba(0,0,0,0.25), transparent 70%)",
            }}
          />

          <div className="relative z-10 p-10 h-full flex flex-col">
            {/* header */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                New Entry
              </h2>
              <p className="text-gray-700 text-sm">What's on your mind?</p>
            </div>

            {/* title */}
            <div className="border-b border-gray-300 mb-3">
              <input
                type="text"
                placeholder="Give your thoughts a title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-transparent border-none text-gray-800 text-lg focus:outline-none placeholder:text-gray-500"
              />
            </div>

            {/* content — sits on the ruled background */}
            <div className="flex-1">
              <textarea
                placeholder="Then write them down here"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-72 p-2 bg-transparent border-none resize-none text-gray-800 focus:outline-none leading-8 placeholder:text-gray-500"
                style={{ lineHeight: "32px" }}
              />
            </div>

            {/* button */}
            <div className="flex justify-end mt-auto mb-4">
              <button
                className="px-4 py-2 text-gray-800 text-sm font-semibold rounded border border-gray-400/60 bg-white/60 hover:bg-white transition disabled:opacity-40"
                onClick={save}
                disabled={!canSave}
              >
                Seal Your Thoughts
              </button>
            </div>

            {/* memories */}
            <div className="border-t border-gray-300 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Memories
                </h3>
                <div className="flex gap-2">
                  <button
                    aria-label="Grid view"
                    className={`p-1 rounded ${view === "grid" ? "bg-black/10" : ""}`}
                    onClick={() => setView("grid")}
                  >
                    ⊞
                  </button>
                  <button
                    aria-label="List view"
                    className={`p-1 rounded ${view === "list" ? "bg-black/10" : ""}`}
                    onClick={() => setView("list")}
                  >
                    ≡
                  </button>
                </div>
              </div>

              {entries.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  Your sealed thoughts will appear here.
                </p>
              ) : view === "grid" ? (
                <div className="grid grid-cols-2 gap-3">
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-md border border-gray-300/70 bg-white/60 p-3 shadow-sm"
                    >
                      <div className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {e.title || "Untitled"}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-3 mt-1">
                        {e.content}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-2">
                        {new Date(e.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-gray-300/70 bg-white/40 rounded-md">
                  {entries.map((e) => (
                    <li key={e.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="mr-3">
                          <div className="text-sm font-semibold text-gray-800">
                            {e.title || "Untitled"}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {e.content}
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 whitespace-nowrap">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
