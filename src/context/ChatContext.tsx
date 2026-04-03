"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: number;
    bookmarked?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: number;
}

interface ChatContextType {
    messages: Message[];
    sessions: ChatSession[];
    currentSessionId: string | null;
    isTyping: boolean;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    sendMessage: (text: string) => Promise<void>;
    createNewChat: () => void;
    selectSession: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    toggleBookmark: (msgId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedModel, setSelectedModel] = useState("NKortex Pro");
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // Check Auth
    useEffect(() => {
        const user = localStorage.getItem("nkortex_user");
        if (!user) {
            router.push("/login"); // Redirect if not logged in
        }
    }, [router]);

    // Load sessions on mount
    useEffect(() => {
        const savedSessions = localStorage.getItem('chat_sessions');
        if (savedSessions) {
            setSessions(JSON.parse(savedSessions));
        }
    }, []);

    // Save sessions to localStorage
    useEffect(() => {
        localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }, [sessions]);

    const createNewChat = () => {
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
        setMessages([]);
        const newSession: ChatSession = {
            id: newId,
            title: "New Conversation",
            lastMessage: "",
            timestamp: Date.now()
        };
        setSessions([newSession, ...sessions]);
    };

    const toggleBookmark = (msgId: string) => {
        setMessages(prev => {
            const updated = prev.map(msg => msg.id === msgId ? { ...msg, bookmarked: !msg.bookmarked } : msg);
            if (currentSessionId) {
                localStorage.setItem(`chat_messages_${currentSessionId}`, JSON.stringify(updated));
            }
            return updated;
        });
    };

    const selectSession = (id: string) => {
        setCurrentSessionId(id);
        const stored = localStorage.getItem(`chat_messages_${id}`);
        if (stored) {
            setMessages(JSON.parse(stored));
        } else {
            setMessages([]);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        let sessionId = currentSessionId;
        if (!sessionId) {
            sessionId = Date.now().toString();
            setCurrentSessionId(sessionId);
            const newSession: ChatSession = {
                id: sessionId,
                title: text.substring(0, 30) + (text.length > 30 ? "..." : ""),
                lastMessage: text,
                timestamp: Date.now()
            };
            setSessions([newSession, ...sessions]);
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: "user",
            timestamp: Date.now()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(updatedMessages));

        // Update session last message
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, lastMessage: text, timestamp: Date.now() } : s
        ));

        setIsTyping(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages,
                    userId: "local-user",
                    sessionId: sessionId
                })
            });

            if (!response.ok) throw new Error("Offline node");

            setIsTyping(false);
            const aiMsgId = (Date.now() + 1).toString();
            const aiMsg: Message = { id: aiMsgId, text: "", sender: "ai", timestamp: Date.now() };

            setMessages(prev => [...prev, aiMsg]);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) return;

            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                setMessages(prev => {
                    const latest = prev.map(msg =>
                        msg.id === aiMsgId ? { ...msg, text: buffer } : msg
                    );
                    localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(latest));
                    return latest;
                });
            }

            // Update session title if it was default
            setSessions(prev => prev.map(s =>
                s.id === sessionId && s.title === "New Conversation"
                    ? { ...s, title: text.substring(0, 30) + (text.length > 30 ? "..." : "") }
                    : s
            ));

        } catch (error) {
            setIsTyping(false);
            const errorMsg: Message = {
                id: Date.now().toString(),
                text: "Local node disconnected. Ensure Ollama is running.",
                sender: "ai",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    return (
        <ChatContext.Provider value={{
            messages,
            sessions,
            currentSessionId,
            isTyping,
            selectedModel,
            setSelectedModel,
            sendMessage,
            createNewChat,
            selectSession,
            searchQuery,
            setSearchQuery,
            toggleBookmark
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within ChatProvider");
    return context;
};
