"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Paperclip,
    Image as ImageIcon,
    Mic,
    Send,
    ChevronDown,
    Download,
    Bookmark
} from "lucide-react";
import MarkdownIt from "markdown-it";
import AIChatModel from "@/components/AIChatModel";

import { useChat } from "@/context/ChatContext";

export default function ChatInterface() {
    const {
        messages,
        sendMessage,
        isTyping,
        selectedModel,
        setSelectedModel,
        currentSessionId,
        toggleBookmark
    } = useChat();
    const [inputValue, setInputValue] = useState("");
    const [showModel, setShowModel] = useState(true);

    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
    });

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (messages.length > 0) setShowModel(false);
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;

        setShowModel(false);
        const text = inputValue;
        setInputValue("");
        await sendMessage(text);
    };

    const exportConversation = () => {
        const content = messages.map(m => `[${m.sender.toUpperCase()}] ${m.text}`).join("\n\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nkortex-chat-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    const models = [
        { name: "NKortex Pro", desc: "Most capable local model", color: "text-neon-cyan" },
        { name: "NKortex Lite", desc: "Fast & efficient", color: "text-neon-purple" },
        { name: "Research Hub", desc: "Expert in documentation", color: "text-white" },
    ];

    return (
        <div className="flex flex-col flex-1 h-full w-full relative min-h-0">

            {/* Top Header */}
            <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-white/5 glass z-20">
                <div className="relative">
                    <div
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer group border border-white/5 hover:border-white/10"
                    >
                        <span className={`${models.find(m => m.name === selectedModel)?.color || 'text-neon-cyan'} font-semibold group-hover:glow-text transition-all`}>
                            {selectedModel}
                        </span>
                        <ChevronDown size={16} className={`text-gray-400 group-hover:text-white transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    <AnimatePresence>
                        {isModelDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 mt-2 w-64 glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl z-50 backdrop-blur-2xl"
                            >
                                {models.map((model) => (
                                    <button
                                        key={model.name}
                                        onClick={() => {
                                            setSelectedModel(model.name);
                                            setIsModelDropdownOpen(false);
                                        }}
                                        className={`flex flex-col gap-0.5 w-full p-3 rounded-xl transition-all text-left ${selectedModel === model.name ? 'bg-white/10 ring-1 ring-white/10' : 'hover:bg-white/5'}`}
                                    >
                                        <span className={`text-sm font-bold ${model.color}`}>{model.name}</span>
                                        <span className="text-[10px] text-gray-500">{model.desc}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={exportConversation}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-neon-cyan transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-white/10"
                        title="Export Conversation"
                    >
                        <Download size={20} />
                    </button>
                    <div className="h-4 w-[1px] bg-white/10 mx-1" />
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan/10 text-[10px] font-bold text-neon-cyan border border-neon-cyan/20 animate-pulse-slow">
                        VOICE: ACTIVE
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col items-center min-h-0 w-full">

                {/* Startup 3D Model View */}
                <AnimatePresence>
                    {showModel && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                        >
                            {/* Background / Floating object */}
                            <div className="absolute top-0 left-0 w-full h-full z-0 flex items-center justify-center pointer-events-auto pb-32">
                                <div className="w-[350px] h-[350px] md:w-[450px] md:h-[450px]">
                                    <AIChatModel />
                                </div>
                            </div>

                            {/* Main content */}
                            <div className="relative z-10 flex items-center justify-center h-full pointer-events-none">
                                <h1 className="text-2xl md:text-3xl font-bold text-white/80 glow-text text-center mt-64 pointer-events-auto">
                                    What dimension shall we explore?
                                </h1>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Messages */}
                <div 
                    ref={chatContainerRef}
                    className={`w-full max-w-4xl flex-1 min-h-0 overflow-y-auto px-6 py-8 space-y-8 z-20 ${showModel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, x: msg.sender === "user" ? 20 : -20 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[90%] md:max-w-[80%] p-5 rounded-2xl shadow-2xl relative group break-words markdown-content ${msg.sender === "user"
                                    ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-white rounded-tr-sm"
                                    : "glass-panel text-gray-100 rounded-tl-sm border-l-2 border-l-neon-purple glow-border"
                                    }`}
                                style={msg.sender === "ai" ? { transform: "translateZ(30px)" } : {}}
                            >
                                {msg.sender === "user" ? (
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                ) : (
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: md.render(msg.text) }} 
                                        className="prose prose-invert max-w-none prose-sm prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10"
                                    />
                                )}
                                <button
                                    onClick={() => toggleBookmark(msg.id)}
                                    className={`absolute -bottom-2 -right-2 p-2 rounded-full border border-white/10 transition-all scale-75 group-hover:scale-100 ${msg.bookmarked
                                        ? 'bg-neon-purple/20 text-neon-purple opacity-100 shadow-[0_0_10px_rgba(188,19,254,0.3)]'
                                        : 'bg-black/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-neon-cyan'
                                        }`}
                                    title={msg.bookmarked ? "Remove bookmark" : "Save to bookmarks"}
                                >
                                    <Bookmark size={14} className={msg.bookmarked ? "fill-current" : ""} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="glass-panel p-5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </motion.div>
                    )}
                    <div className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="px-4 pb-2 pt-2 w-full max-w-4xl mx-auto z-30 shrink-0">
                <form
                    onSubmit={handleSend}
                    className="relative flex items-center bg-black/50 glass-panel rounded-2xl p-2 border border-white/10 focus-within:glow-border focus-within:border-neon-cyan transition-all duration-500"
                >
                    <button type="button" className="p-3 text-gray-400 hover:text-white transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <button type="button" className="p-3 text-gray-400 hover:text-white transition-colors">
                        <ImageIcon size={20} />
                    </button>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (showModel) setShowModel(false);
                        }}
                        placeholder="Talk to NKortex AI..."
                        className="flex-1 bg-transparent border-none text-lg text-white placeholder-gray-500 focus:outline-none px-4"
                    />

                    <button type="button" className="p-3 text-gray-400 hover:text-neon-purple transition-colors">
                        <Mic size={20} />
                    </button>

                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-3 ml-2 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-xl text-white disabled:opacity-50 disabled:grayscale transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <p className="text-center text-[10px] text-gray-500 mt-2 mb-1 leading-relaxed tracking-wider">
                    AI generated content may be inaccurate. Verified by NKortex.
                </p>
            </div>
        </div>
    );
}
