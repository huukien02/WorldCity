"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useGlobalChat } from "../hooks/useGlobalChat";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { useMapStore } from "@/features/map/store";
import { toIso } from "@/features/map/utils/isoCoords";

// Matches "(x, y)" pattern in messages
const COORD_REGEX = /\((\d+),\s*(\d+)\)/g;

interface ChatPanelProps {
  open: boolean;
  onToggle: () => void;
}

export function ChatPanel({ open, onToggle }: ChatPanelProps) {
  const currentUser = useCurrentUser();
  const { messages, loading, sendMessage } = useGlobalChat();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { setStagePos, stageScale } = useMapStore();

  // Auto scroll to bottom when new messages
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !input.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(
        currentUser.uid,
        currentUser.displayName ?? "Unnamed",
        currentUser.photoURL ?? "",
        input,
      );
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi gửi tin");
    } finally {
      setSending(false);
    }
  }

  function panToCoord(x: number, y: number) {
    const { screenX, screenY } = toIso(x, y);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setStagePos({
      x: vw / 2 - screenX * stageScale,
      y: vh / 2 - screenY * stageScale,
    });
  }

  // Render message text — coords become clickable links
  function renderText(text: string) {
    const parts: React.ReactNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    COORD_REGEX.lastIndex = 0;

    while ((match = COORD_REGEX.exec(text)) !== null) {
      if (match.index > last) {
        parts.push(text.slice(last, match.index));
      }
      const cx = parseInt(match[1]);
      const cy = parseInt(match[2]);
      parts.push(
        <button
          key={match.index}
          onClick={() => panToCoord(cx, cy)}
          className="text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer"
        >
          {match[0]}
        </button>,
      );
      last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

  function formatTime(ts: { toMillis?: () => number } | null | undefined) {
    if (!ts?.toMillis) return "";
    return new Date(ts.toMillis()).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      className={`fixed bottom-0 right-4 z-40 flex flex-col transition-all duration-300 ${open ? "h-72 md:h-80" : "h-9"} w-[calc(100vw-2rem)] max-w-xs shadow-2xl rounded-t-xl overflow-hidden border border-slate-700 bg-slate-900`}
    >
      {/* Toggle bar */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between px-3 h-9 bg-slate-800 hover:bg-slate-750 transition-colors shrink-0 w-full"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">💬</span>
          <span className="text-slate-300 text-xs font-medium">
            Chat toàn cầu
          </span>
          {!open && messages.length > 0 && (
            <span className="text-slate-500 text-xs truncate max-w-[100px]">
              — {messages[messages.length - 1]?.userName ?? ""}
            </span>
          )}
        </div>
        <span className="text-slate-500 text-xs">{open ? "▾" : "▴"}</span>
      </button>

      {open && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-slate-600 text-xs text-center mt-4">
                Chưa có tin nhắn nào. Hãy là người đầu tiên!
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.userId === currentUser?.uid;
                return (
                  <div key={msg.id} className="flex items-start gap-1.5">
                    {/* Avatar */}
                    {msg.userAvatar ? (
                      <Image
                        src={msg.userAvatar}
                        alt={msg.userName}
                        width={20}
                        height={20}
                        className="rounded-full mt-0.5 shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] text-slate-400 shrink-0 mt-0.5">
                        {msg.userName[0]?.toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-xs font-medium truncate ${isMe ? "text-blue-400" : "text-slate-300"}`}
                        >
                          {isMe ? "Bạn" : msg.userName}
                        </span>
                        <span className="text-slate-600 text-[10px] shrink-0">
                          {formatTime(
                            msg.createdAt as Parameters<typeof formatTime>[0],
                          )}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed break-words">
                        {renderText(msg.message)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="px-2 pb-2 pt-1 border-t border-slate-800 shrink-0"
          >
            {error && <p className="text-red-400 text-[10px] mb-1">{error}</p>}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentUser ? "Nhắn tin..." : "Đăng nhập để chat"}
                disabled={!currentUser || sending}
                maxLength={200}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 disabled:opacity-50 min-w-0"
              />
              <button
                type="submit"
                disabled={!currentUser || sending || !input.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-white text-xs font-medium transition-colors shrink-0"
              >
                {sending ? "..." : "➤"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
