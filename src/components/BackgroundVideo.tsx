"use client";

import { motion } from "framer-motion";

export default function BackgroundVideo({
    src,
    loop = false,
}: {
    src?: string;
    loop?: boolean;
}) {
    const isLogin = src?.includes("login");

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#030014]">
            {/* Animated Deep Space Nebula Effect */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[150vw] h-[150vh] -top-[25vh] -left-[25vw] mix-blend-screen"
                style={{
                    background: isLogin
                        ? `radial-gradient(circle at 30% 70%, rgba(0,240,255,0.15) 0%, rgba(157,78,221,0.05) 40%, transparent 60%)`
                        : `radial-gradient(circle at 50% 50%, rgba(157,78,221,0.15) 0%, rgba(0,240,255,0.05) 40%, transparent 60%)`
                }}
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[150vw] h-[150vh] -bottom-[25vh] -right-[25vw] mix-blend-screen"
                style={{
                    background: isLogin
                        ? `radial-gradient(circle at 70% 30%, rgba(157,78,221,0.1) 0%, rgba(0,240,255,0.1) 40%, transparent 70%)`
                        : `radial-gradient(circle at 30% 70%, rgba(0,240,255,0.1) 0%, rgba(157,78,221,0.1) 40%, transparent 70%)`
                }}
            />

            {/* Grid overlay for texture */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black z-10" />
        </div>
    );
}
