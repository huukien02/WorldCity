"use client";

import { useEffect, useState, useRef } from "react";
import {
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { chatCol } from "@/lib/firestore";
import type { ChatMessageDoc } from "@/types/firestore";

export interface ChatMessage extends ChatMessageDoc {
  id: string;
}

const CHAT_LIMIT = 50;
const COOLDOWN_MS = 3_000;

export function useGlobalChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const lastSentRef = useRef(0);

  useEffect(() => {
    const q = query(chatCol, orderBy("createdAt", "asc"), limit(CHAT_LIMIT));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function sendMessage(
    userId: string,
    userName: string,
    userAvatar: string,
    text: string,
  ) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = Date.now();
    const elapsed = now - lastSentRef.current;
    if (elapsed < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`Chờ ${wait} giây trước khi gửi tiếp`);
    }

    lastSentRef.current = now;
    await addDoc(chatCol, {
      userId,
      userName,
      userAvatar,
      message: trimmed,
      createdAt: serverTimestamp(),
    });
  }

  return { messages, loading, sendMessage };
}
