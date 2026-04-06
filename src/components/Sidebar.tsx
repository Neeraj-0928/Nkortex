"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    Image as ImageIcon,
    Layers,
    Code,
    Folder,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User,
    Zap,
    Palette,
    HelpCircle,
    Download,
    Bookmark
} from "lucide-react";
import Link from "next/link";
import { useChat } from "@/context/ChatContext";

export default function Sidebar() {
    const {
        sessions,
        currentSessionId,
        createNewChat,
        selectSession,
        searchQuery,
        setSearchQuery
    } = useChat();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('recent_searches');
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    const saveSearch = (query: string) => {
        if (!query.trim()) return;
        const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recent_searches', JSON.stringify(updated));
    };

    const getSuggestions = () => {
        if (!searchQuery.trim()) return recentSearches;

        const allText = sessions.map(s => `${s.title} ${s.lastMessage}`).join(" ").toLowerCase();
        const words = Array.from(new Set(allText.match(/\b[a-z]{3,}\b/g) || []));
        const matches = words.filter(w => w.startsWith(searchQuery.toLowerCase()) && w !== searchQuery.toLowerCase());

        return matches.slice(0, 5);
    };

    const suggestions = getSuggestions();

    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const menuItems = [
        { icon: <Plus size={20} />, label: "New Chat", onClick: createNewChat },
        { icon: <Search size={20} />, label: "Search Chats", onClick: () => document.getElementById('search-history')?.focus() },
        { icon: <ImageIcon size={20} />, label: "Images", onClick: () => alert("Image Generation Mode coming soon in 3.0 update!") },
        { icon: <Folder size={20} />, label: "Projects", onClick: () => alert("Local Projects vault offline.") },
    ];

    return (
        <motion.aside
            initial={{ width: 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="h-full bg-black/60 glass-panel border-r border-white/5 flex flex-col justify-between relative z-40 backdrop-blur-xl shrink-0"
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-8 bg-black border border-white/20 rounded-full p-1 text-gray-400 hover:text-white hover:glow-border shadow-lg transition-all z-50"
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className="flex flex-col gap-6 p-4 pt-8 overflow-hidden flex-1">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-2 pb-4 text-xl font-bold tracking-tighter text-white glow-text flex items-center justify-between"
                    >
                        <span>NKortex<span className="text-neon-cyan">AI</span></span>
                        <Zap size={16} className="text-neon-cyan animate-pulse" />
                    </motion.div>
                )}

                {/* Main Navigation */}
                <div className="flex flex-col gap-1.5">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.onClick}
                            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 hover:bg-white/5 group relative ${idx === 0 && !currentSessionId ? "bg-neon-purple/20 text-white shadow-[0_0_20px_rgba(188,19,254,0.15)] ring-1 ring-neon-purple/50" : "text-gray-400 hover:text-white"
                                } ${isCollapsed ? "justify-center" : "justify-start"}`}
                        >
                            <div className={`${idx === 0 && !currentSessionId ? "text-neon-cyan shadow-neon" : "group-hover:text-neon-cyan transition-all transform group-hover:scale-110"}`}>
                                {item.icon}
                            </div>
                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap overflow-hidden">
                                    {item.label}
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-black/90 border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}

                    {/* Search Input */}
                    {!isCollapsed && (
                        <div
                            className="relative mt-4 px-1 group"
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        >
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-cyan transition-colors z-10" />
                            <input
                                id="search-history"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        saveSearch(searchQuery);
                                        setIsSearchFocused(false);
                                    }
                                }}
                                placeholder="Search history..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:glow-border focus:border-neon-cyan/50 focus:outline-none transition-all placeholder:text-gray-600 focus:bg-white/10 relative z-10"
                            />

                            <AnimatePresence>
                                {isSearchFocused && (suggestions.length > 0 || searchQuery) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                                        className="absolute left-1 right-1 top-full mt-2 bg-black/90 border border-white/10 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)] overflow-hidden z-20 backdrop-blur-md"
                                    >
                                        <div className="p-2 flex flex-col gap-0.5">
                                            <span className="text-[10px] text-gray-500 px-2 py-1 uppercase tracking-wider font-bold">
                                                {searchQuery ? "Suggestions" : "Recent Searches"}
                                            </span>
                                            {suggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSearchQuery(suggestion);
                                                        saveSearch(suggestion);
                                                        setIsSearchFocused(false);
                                                    }}
                                                    className="text-left px-2 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 group w-full"
                                                >
                                                    <Search size={12} className="text-neon-cyan/50 group-hover:text-neon-cyan transition-colors" />
                                                    {suggestion}
                                                </button>
                                            ))}
                                            {suggestions.length === 0 && searchQuery && (
                                                <div className="px-2 py-3 text-xs text-gray-500 flex items-center justify-center gap-2">
                                                    <Layers size={14} className="opacity-50" />
                                                    No neural matches
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Session History */}
                {!isCollapsed && (
                    <div className="flex-1 overflow-y-auto px-1 flex flex-col gap-2 mt-6 scrollbar-hide select-none transition-all duration-500">
                        <div className="flex items-center justify-between px-3 mb-3">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-bold opacity-50">Recent Intelligence</span>
                            <div className="h-[1px] flex-1 ml-4 bg-white/5" />
                        </div>
                        {filteredSessions.length > 0 ? (
                            filteredSessions.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => selectSession(session.id)}
                                    className={`flex flex-col gap-1.5 p-4 rounded-2xl transition-all hover:bg-white/10 text-left group border relative overflow-hidden backdrop-blur-sm ${currentSessionId === session.id
                                        ? 'bg-white/10 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                                        : 'border-transparent'
                                        }`}
                                >
                                    {currentSessionId === session.id && (
                                        <motion.div
                                            layoutId="active-session-indicator"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan shadow-[0_0_12px_rgba(0,240,255,1)]"
                                        />
                                    )}
                                    <span className={`text-sm font-bold truncate leading-none ${currentSessionId === session.id ? 'text-white' : 'text-gray-400 group-hover:text-white transition-colors'}`}>
                                        {session.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-neon-cyan/50" />
                                        <span className="text-[11px] text-gray-500 truncate leading-relaxed group-hover:text-gray-400 transition-colors">
                                            {session.lastMessage || "Empty vault"}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-12 text-center flex flex-col items-center gap-4 opacity-20 group">
                                <Layers size={40} className="text-gray-400 group-hover:text-neon-purple transition-all" />
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs font-bold uppercase tracking-widest text-white">Neural Net Empty</p>
                                    <p className="text-[10px] text-gray-400">No matching patterns found</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 relative">
                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-all outline-none ${isCollapsed ? "justify-center" : ""}`}
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-purple to-neon-cyan p-0.5 animate-pulse-slow">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                            <User size={18} className="text-white" />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col items-start whitespace-nowrap">
                            <span className="text-sm font-semibold text-white">Operator 01</span>
                            <span className="text-xs text-neon-cyan">Pro Tier</span>
                        </div>
                    )}
                </button>

                <AnimatePresence>
                    {isProfileOpen && !isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-4 right-4 mb-2 glass-panel rounded-xl p-2 border border-white/10 shadow-2xl"
                        >
                            <div className="flex flex-col gap-1">
                                <button className="flex items-center gap-3 w-full p-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    <Zap size={16} className="text-neon-cyan" /> Upgrade Plan
                                </button>
                                <button className="flex items-center gap-3 w-full p-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    <Palette size={16} className="text-neon-purple" /> Personalization
                                </button>
                                <button className="flex items-center gap-3 w-full p-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    <Settings size={16} /> Settings
                                </button>
                                <button className="flex items-center gap-3 w-full p-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    <HelpCircle size={16} /> Help
                                </button>
                                <div className="h-px w-full bg-white/10 my-1" />
                                <button onClick={() => { localStorage.removeItem("nkortex_user"); window.location.href = "/login"; }} className="flex items-center gap-3 w-full p-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.aside>
    );
}
