"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, Mail } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, MeshDistortMaterial, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function R4XRobot({ status, onArrived }: { status: "idle" | "success", onArrived: () => void }) {
    const groupRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const leftEyeRef = useRef<THREE.Mesh>(null);
    const rightEyeRef = useRef<THREE.Mesh>(null);
    const blinkTimer = useRef(0);
    const isBlinking = useRef(false);

    // Track if arrival event has fired
    const hasArrived = useRef(false);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        if (!groupRef.current || !headRef.current) return;

        // 1. Entrance Animation & Success State
        if (status === "success") {
            // Success: Look up and blast off upward
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -Math.PI / 4, 0.1);
            groupRef.current.position.y += delta * 15; // Accelerate up
            groupRef.current.rotation.y += delta * 10; // Spin
        } else {
            // Entrance: Roll in from left (-15) to center-left (-2.0)
            if (groupRef.current.position.x < -2.1) {
                // Still rolling in
                groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, -2.0, 0.03);

                // Roll the body (simulated by rotating the whole group slightly or bobbing)
                groupRef.current.position.y = Math.abs(Math.sin(t * 10)) * 0.1;

                // Face right while moving right
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.PI / 2, 0.1);
            } else {
                // Arrived!
                if (!hasArrived.current) {
                    hasArrived.current = true;
                    onArrived(); // Trigger the UI to fade in
                }

                // Settle into idle hover
                groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, -2.0, 0.1);
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, Math.sin(t * 2) * 0.1, 0.05);

                // Face user (forward)
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);

                // 2. Mouse Tracking (Only track when arrived and idle)
                // Map mouse coordinates to rotation limited angles. Inverting signs to make the head follow the cursor.
                const targetRotationX = -state.mouse.y * 0.5; // Look up/down (toward cursor)
                const targetRotationY = state.mouse.x * 0.8; // Look left/right (toward cursor)

                headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotationX, 0.1);
                headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotationY, 0.1);

                // 3. Blinking Logic
                if (leftEyeRef.current && rightEyeRef.current) {
                    blinkTimer.current += delta;

                    // Trigger a blink randomly every 2 to 6 seconds
                    if (blinkTimer.current > 2 + Math.random() * 4 && !isBlinking.current) {
                        isBlinking.current = true;
                        blinkTimer.current = 0;
                    }

                    if (isBlinking.current) {
                        // Close eyes (Scale Y to near 0)
                        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 0.1, 0.4);
                        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 0.1, 0.4);

                        // If fully closed, stop blinking and let them open
                        if (leftEyeRef.current.scale.y < 0.2) {
                            isBlinking.current = false;
                        }
                    } else {
                        // Open eyes (Scale Y back to 1)
                        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 1, 0.3);
                        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 1, 0.3);
                    }
                }
            }
        }
    });

    return (
        <group ref={groupRef} position={[-15, 0, 0]} scale={1.2}>
            {/* Body (Matte White Sphere with slight texture/noise) */}
            <mesh position={[0, -1, 0]} castShadow receiveShadow>
                <sphereGeometry args={[1.2, 64, 64]} />
                <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.1} />
            </mesh>

            {/* Collar */}
            <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[1.05, 0.08, 16, 64]} />
                <meshStandardMaterial color="#e4e4e7" roughness={0.4} />
            </mesh>

            {/* Head Group (Rotates to track mouse) */}
            <group ref={headRef} position={[0, 0.8, 0]}>

                {/* Outer Glass Dome */}
                <mesh>
                    <sphereGeometry args={[1, 64, 64]} />
                    <MeshTransmissionMaterial
                        backside
                        samples={16}
                        thickness={0.05}
                        chromaticAberration={0.02}
                        anisotropy={0}
                        distortion={0}
                        distortionScale={0}
                        temporalDistortion={0}
                        clearcoat={0}
                        roughness={0.1}
                        transmission={0.95}
                        ior={1.2}
                        attenuationDistance={1}
                        attenuationColor="#ffffff"
                        color="#ffffff"
                    />
                </mesh>

                {/* Inner Glowing Core / Face */}
                <mesh scale={0.92}>
                    <sphereGeometry args={[1, 64, 64]} />
                    <meshBasicMaterial color="#b24bf3" />
                </mesh>

                {/* Left Eye */}
                <mesh ref={leftEyeRef} position={[-0.3, 0.2, 0.88]} rotation={[0, -0.2, 0]}>
                    <torusGeometry args={[0.12, 0.03, 16, 32]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Right Eye */}
                <mesh ref={rightEyeRef} position={[0.3, 0.2, 0.88]} rotation={[0, 0.2, 0]}>
                    <torusGeometry args={[0.12, 0.03, 16, 32]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Left Antenna */}
                <mesh position={[-1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
                    <meshStandardMaterial color="#e4e4e7" />
                </mesh>
                <mesh position={[-1.2, 0.15, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.4, 16]} />
                    <meshStandardMaterial color="#e4e4e7" />
                </mesh>

                {/* Right Antenna */}
                <mesh position={[1.05, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
                    <meshStandardMaterial color="#e4e4e7" />
                </mesh>
                <mesh position={[1.2, 0.15, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.4, 16]} />
                    <meshStandardMaterial color="#e4e4e7" />
                </mesh>

            </group>
        </group>
    );
}

function ColorfulScatter() {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 3000;

    /* eslint-disable */
    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        // Vibrant neon color palette for the scatter particles
        const palette = [
            new THREE.Color("#00d8ff"), // Cyan
            new THREE.Color("#ec4899"), // Pink
            new THREE.Color("#8b5cf6"), // Purple
            new THREE.Color("#ffffff"), // Bright White
            new THREE.Color("#fbbf24"), // Gold
        ];

        for (let i = 0; i < count; i++) {
            // Wide spread across the background
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 15; // Push back behind the robot

            // Assign a random color from the neon palette
            const color = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        return [positions, colors];
    }, []);
    /* eslint-enable */

    useFrame((state, delta) => {
        if (pointsRef.current) {
            // Slowly rotate the entire scatter field for dynamic movement
            pointsRef.current.rotation.y += delta * 0.05;
            pointsRef.current.rotation.x += delta * 0.02;

            // Subtle bobbing effect
            pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 2;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending} // Make them glow intensely when overlapping
            />
        </points>
    );
}

function TrendingLoginScene({ status, onArrived }: { status: "idle" | "success", onArrived: () => void }) {
    return (
        <>
            <color attach="background" args={["#030712"]} />
            <ambientLight intensity={0.5} color="#ffffff" />

            {/* Colorful directional lighting to hit the glass */}
            <directionalLight position={[5, 5, 5]} intensity={3} color="#00d8ff" />
            <directionalLight position={[-5, -5, -5]} intensity={3} color="#ec4899" />

            <Environment preset="night" />

            {/* Minimal Floor Drop Shadow */}
            <ContactShadows
                position={[-2.0, -3.5, 0]}
                opacity={0.6}
                scale={20}
                blur={2.5}
                far={10}
                color="#000"
            />

            {/* Dynamic Background Scatter Animation */}
            <ColorfulScatter />

            <R4XRobot status={status} onArrived={onArrived} />
        </>
    );
}


export default function CinematicLoginPage() {
    const router = useRouter();
    const [showUI, setShowUI] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [sequenceStatus, setSequenceStatus] = useState<"idle" | "success">("idle");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        // UI is now triggered exclusively by the onArrived callback from the R4XRobot
    }, []);

    const handleRobotArrived = () => {
        setShowUI(true);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setSequenceStatus("success");
        setIsSuccess(true);
        localStorage.setItem("nkortex_user", JSON.stringify({ email: username || "operator@nkortex.ai" }));
        setTimeout(() => {
            router.push("/chat");
        }, 2500);
    };

    return (
        <main className="relative w-full h-screen overflow-hidden text-white perspective-[1000px]">

            {/* Elegant Soft Gradient Background Fallback */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#131b2c] via-[#0a0f18] to-black z-[-1]" />

            {/* 3D Cinematic Layer */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 1.8, 10], fov: 40 }}>
                    <TrendingLoginScene status={sequenceStatus} onArrived={handleRobotArrived} />
                </Canvas>
            </div>

            {/* Atmospheric Fades - Lighter and softer */}
            <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0a0f18]/90" />

            {/* Initial Bright Fade In (instead of black) */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 z-50 bg-[#0a0f18] pointer-events-none"
            />

            {/* Login UI Layer - Expanding Out of The Briefcase */}
            <AnimatePresence>
                {showUI && !isSuccess && (
                    <motion.div
                        // Animate scaling and fading from the right
                        initial={{ opacity: 0, scale: 0.9, x: 50, rotateY: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }} // Final resting place
                        exit={{
                            opacity: 0,
                            scale: 0.9,
                            filter: "blur(20px)",
                            x: 50,
                            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                        }}
                        transition={{
                            duration: 1.2,
                            type: "spring",
                            bounce: 0.2,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        style={{ transformOrigin: "right center" }} // Springing from right
                        className="absolute right-[12%] md:right-[18%] lg:right-[22%] xl:right-[25%] top-1/2 -translate-y-1/2 z-20 w-full max-w-[420px] perspective-[1000px]"
                    >
                        {/* Flat Dark Premium Panel with Trending Glassmorphism */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="p-6 sm:p-8 rounded-[32px] bg-[#09090b]/60 backdrop-blur-3xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,216,255,0.07)] relative overflow-hidden group"
                        >
                            {/* Animated Ambient Border Glow (Trending Web3 Effect) */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00d8ff]/10 via-transparent to-[#8b5cf6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl pointer-events-none" />

                            {/* Header */}
                            <div className="text-center mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
                                    Welcome
                                </h1>
                                <p className="text-[#a1a1aa] text-sm">
                                    Sign in to continue to NKortex AI
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-1.5">
                                    <label className="text-[#d4d4d8] text-xs sm:text-sm font-medium block">
                                        Email
                                    </label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] group-focus-within/input:text-[#00d8ff] transition-colors" size={16} strokeWidth={2} />
                                        <input
                                            type="email"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg py-2.5 sm:py-3 pl-10 pr-4 text-white placeholder-[#71717a] focus:outline-none focus:border-[#00d8ff]/50 focus:bg-[#27272a]/50 transition-all duration-300 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-1.5">
                                    <label className="text-[#d4d4d8] text-xs sm:text-sm font-medium block">
                                        Password
                                    </label>
                                    <div className="relative group/input">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] group-focus-within/input:text-[#00d8ff] transition-colors" size={16} strokeWidth={2} />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg py-2.5 sm:py-3 pl-10 pr-10 text-white placeholder-[#71717a] focus:outline-none focus:border-[#00d8ff]/50 focus:bg-[#27272a]/50 transition-all duration-300 text-sm"
                                        />
                                        <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white transition-colors">
                                            <Eye size={16} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between pt-0.5">
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <div className="w-3.5 h-3.5 rounded-sm border border-[#3f3f46] bg-[#18181b] group-hover:border-[#00d8ff]/50 flex items-center justify-center transition-colors">
                                            {/* White square placeholder for checked state */}
                                            <div className="w-2 h-2 bg-white rounded-[1px]" />
                                        </div>
                                        <span className="text-[#a1a1aa] text-xs sm:text-sm group-hover:text-white transition-colors">Remember me</span>
                                    </label>
                                    <button type="button" className="text-[#00d8ff] hover:text-[#00d8ff]/80 text-xs sm:text-sm font-medium transition-colors">
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Vibrant Gradient Sign In Button */}
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    className="w-full py-2.5 sm:py-3 mt-1 rounded-lg bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6] text-white font-semibold text-sm transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,216,255,0.25)] hover:shadow-[0_6px_20px_0_rgba(0,216,255,0.4)]"
                                >
                                    Sign In
                                </motion.button>

                                {/* Divider */}
                                <div className="relative flex justify-center text-xs sm:text-sm my-5">
                                    <div className="absolute inset-x-0 top-1/2 translate-y-[1px] border-t border-[#27272a]"></div>
                                    <span className="relative z-10 px-4 bg-[#121212] text-[#71717a]">
                                        Or continue with
                                    </span>
                                </div>

                                {/* Google Sign In Button */}
                                <motion.button
                                    whileHover={{ backgroundColor: "rgba(39,39,42,0.8)" }}
                                    whileTap={{ scale: 0.99 }}
                                    type="button"
                                    className="w-full py-2.5 sm:py-3 rounded-lg bg-[#18181b] border border-[#00d8ff] flex items-center justify-center space-x-3 transition-colors duration-200 shadow-[0_0_10px_0_rgba(0,216,255,0.1)] hover:shadow-[0_0_15px_0_rgba(0,216,255,0.2)]"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        <path fill="none" d="M1 1h22v22H1z" />
                                    </svg>
                                    <span className="text-[#00d8ff] font-medium text-sm">Sign in with Google</span>
                                </motion.button>
                            </form>

                            {/* Footer */}
                            <div className="mt-6 text-center text-sm text-[#a1a1aa] relative z-10 bg-transparent">
                                Don&apos;t have an account?{" "}
                                <button type="button" className="text-white hover:text-[#00d8ff] font-medium transition-colors hover:underline underline-offset-4 decoration-[#00d8ff]/30">
                                    Sign up
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Seamless Transition Expansion Effect */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeIn" }}
                        className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none mix-blend-screen"
                    >
                        <div className="w-[150vw] h-[150vw] bg-radial-gradient from-white via-[#ec4899]/70 to-transparent rounded-full opacity-100" />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
