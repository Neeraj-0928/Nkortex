"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, ContactShadows, MeshTransmissionMaterial, Points, PointMaterial, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function generateParticles() {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
        const r = 25 * Math.cbrt(Math.random()); // Expanded radius for full screen
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Rainbow scattered colors
        color.setHSL(Math.random(), 0.9, 0.6);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
}

function ParticleField() {
    const ref = useRef<THREE.Points>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { positions, colors } = useMemo(() => generateParticles(), []);

    useFrame((state, delta) => {
        if (ref.current && groupRef.current) {
            // Base slow rotation for the entire field
            ref.current.rotation.x -= delta / 30;
            ref.current.rotation.y -= delta / 40;

            // Target position based on mouse (mapped to world space)
            // Subtle, slow full-screen movement following the cursor
            const targetPosX = state.mouse.x * 2.5;
            const targetPosY = state.mouse.y * 1.5;

            // Smoothly move the entire group towards the cursor very slowly
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.015);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.015);

            // Subtle parallax tilt towards cursor
            ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, ref.current.rotation.x + state.mouse.y * 0.05, 0.05);
            ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, ref.current.rotation.y + state.mouse.x * 0.05, 0.05);
        }
    });

    return (
        <group ref={groupRef} rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    vertexColors /* Enables the rainbow colors mapping */
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

function TrendingAICore() {
    const coreRef = useRef<THREE.Group>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const ring3Ref = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (!coreRef.current) return;
        const t = state.clock.elapsedTime;
        coreRef.current.position.y = Math.sin(t * 1.5) * 0.2; // Gentle hover

        // Subtle mouse follow parallax
        coreRef.current.rotation.y = THREE.MathUtils.lerp(coreRef.current.rotation.y, state.mouse.x * 0.8, 0.05);
        coreRef.current.rotation.x = THREE.MathUtils.lerp(coreRef.current.rotation.x, -state.mouse.y * 0.8, 0.05);

        if (ring1Ref.current) {
            ring1Ref.current.rotation.x += delta * 0.2;
            ring1Ref.current.rotation.y -= delta * 0.3;
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.y += delta * 0.4;
            ring2Ref.current.rotation.z -= delta * 0.2;
        }
        if (ring3Ref.current) {
            ring3Ref.current.rotation.x -= delta * 0.1;
            ring3Ref.current.rotation.z += delta * 0.3;
        }
    });

    return (
        <group ref={coreRef} position={[0, 0, 0]}>
            {/* The Outer Glass Shell */}
            <mesh>
                <sphereGeometry args={[2.2, 64, 64]} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={0.5}
                    chromaticAberration={0.5}
                    anisotropy={0.2}
                    distortion={0}
                    distortionScale={0}
                    temporalDistortion={0}
                    iridescence={1}
                    iridescenceIOR={1}
                    iridescenceThicknessRange={[0, 1400]}
                    color="#ffffff"
                    clearcoat={1}
                />
            </mesh>

            {/* The Inner Pulsing Energy Core */}
            <mesh scale={0.8}>
                <sphereGeometry args={[1.5, 64, 64]} />
                <MeshDistortMaterial
                    color="#a78bfa"
                    emissive="#ec4899"
                    emissiveIntensity={1.5}
                    distort={0.4}
                    speed={2.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {/* A wireframe geometric cage around the core */}
            <mesh scale={1.2}>
                <icosahedronGeometry args={[1.6, 1]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#0ea5e9"
                    emissiveIntensity={0.5}
                    wireframe={true}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Orbiting Neon Data Flow Rings */}
            <mesh ref={ring1Ref}>
                <torusGeometry args={[3, 0.05, 16, 100]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#38bdf8" emissiveIntensity={2} toneMapped={false} />
            </mesh>

            <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[3.5, 0.03, 16, 100]} />
                <meshStandardMaterial color="#ec4899" emissive="#f472b6" emissiveIntensity={2} toneMapped={false} />
            </mesh>

            <mesh ref={ring3Ref} rotation={[0, Math.PI / 4, Math.PI / 6]}>
                <torusGeometry args={[4, 0.1, 16, 100]} />
                <MeshTransmissionMaterial
                    thickness={0.2}
                    roughness={0}
                    transmission={1}
                    ior={1.5}
                    chromaticAberration={0.8}
                    backside
                />
            </mesh>

            {/* Some floating geometric bits nearby */}
            <Float speed={2} rotationIntensity={2} floatIntensity={1} position={[3, 2, -2]}>
                <mesh>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.5} toneMapped={false} />
                </mesh>
            </Float>
            <Float speed={3} rotationIntensity={1.5} floatIntensity={2} position={[-3, -2, 1]}>
                <mesh>
                    <tetrahedronGeometry args={[0.6]} />
                    <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.5} toneMapped={false} />
                </mesh>
            </Float>
        </group>
    );
}

function WarpSpeedTunnel({ active }: { active: boolean }) {
    const linesRef = useRef<THREE.Group>(null);
    const lineInstances = useRef<THREE.Mesh[]>([]);

    // Generate star lines once
    const starCount = 300;
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/purity
    const lines = useMemo(() => {
        const arr: THREE.Mesh[] = [];
        for (let i = 0; i < starCount; i++) {
            const mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, Math.random() * 10 + 5, 8),
                new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? "#00d8ff" : "#ec4899", // Cyan and Pink
                    transparent: true,
                    opacity: 0,
                })
            );
            // Random spread in a tube around the camera
            const radius = Math.random() * 15 + 2;
            const theta = Math.random() * Math.PI * 2;
            mesh.position.set(
                Math.cos(theta) * radius,
                Math.sin(theta) * radius,
                (Math.random() - 0.5) * 100 // Spread along Z deep into the scene
            );

            // Point cylinders towards camera
            mesh.rotation.x = Math.PI / 2;

            arr.push(mesh);
        }
        return arr;
    }, []);

    // Store in ref for mutable access in useFrame
    if (lineInstances.current.length === 0) {
        lineInstances.current = lines;
    }

    useFrame((state, delta) => {
        if (!linesRef.current) return;

        if (active) {
            // Accelerate lines towards the camera
            lineInstances.current.forEach(mesh => {
                mesh.position.z += delta * 150; // VERY FAST
                // Fade in as we warp
                (mesh.material as THREE.MeshBasicMaterial).opacity =
                    THREE.MathUtils.lerp((mesh.material as THREE.MeshBasicMaterial).opacity, 1, 0.1);

                // Reset to back if it passes camera
                if (mesh.position.z > 10) {
                    mesh.position.z = -100;
                }
            });
        }
    });

    return (
        <group ref={linesRef}>
            {lineInstances.current.map((mesh, i) => (
                <primitive key={i} object={mesh} />
            ))}
        </group>
    );
}

export default function Landing3DScene({ isTransitioning = false }: { isTransitioning?: boolean }) {
    const { camera } = useThree();
    const sceneGroupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (isTransitioning) {
            // 1. Warp the Camera FOV wider to simulate extreme speed
            const cam = camera as THREE.PerspectiveCamera;
            // eslint-disable-next-line
            cam.fov = THREE.MathUtils.lerp(cam.fov, 140, delta * 3);
            cam.updateProjectionMatrix();

            // 2. Shrink and push the AI core backward rapidly
            if (sceneGroupRef.current) {
                sceneGroupRef.current.scale.setScalar(
                    THREE.MathUtils.lerp(sceneGroupRef.current.scale.x, 0, delta * 4)
                );
                sceneGroupRef.current.position.z = THREE.MathUtils.lerp(
                    sceneGroupRef.current.position.z, -50, delta * 4
                );
            }
        } else {
            // Cinematic Scroll Transition
            if (sceneGroupRef.current && typeof window !== 'undefined') {
                const scrollY = window.scrollY;

                // Drive the core TOWARDS the camera and rotate dramatically as you scroll down
                // The max scroll depth will push it right through the camera lens!
                sceneGroupRef.current.position.z = scrollY * 0.012;
                sceneGroupRef.current.position.y = scrollY * 0.005; // Pan up

                // Add an intense spin that binds to the scroll wheel
                sceneGroupRef.current.rotation.y = scrollY * 0.002;
                sceneGroupRef.current.rotation.x = scrollY * 0.001;
            }
        }
    });
    return (
        <>
            {/* Cinematic Lighting for Dark Mode */}
            <ambientLight intensity={0.2} color="#ffffff" />

            {/* Neon Pink/Magenta Key Light */}
            <spotLight
                position={[8, 10, 8]}
                angle={0.8}
                penumbra={1}
                intensity={8}
                color="#ec4899"
                castShadow
                shadow-bias={-0.0001}
            />

            {/* Neon Purple/Blue Rim Light */}
            <spotLight
                position={[-8, 8, -8]}
                angle={0.6}
                penumbra={1}
                intensity={6}
                color="#8b5cf6"
            />

            {/* Interactive Particle Field (Full Screen) */}
            <ParticleField />

            {/* Studio Environment for gorgeous gold and glass reflections */}
            <Environment preset="studio" />

            {/* Warp Speed Tunnel Effect */}
            <WarpSpeedTunnel active={isTransitioning} />

            {/* Everything else gets shrunk and pushed back during transition */}
            <group ref={sceneGroupRef}>
                {/* Shift the entire 3D Core to the Right natively since canvas is full-screen */}
                <group position={[4, 0, -2]}>
                    <TrendingAICore />
                </group>

                {/* High quality contact shadows to ground the scene perfectly */}
                <ContactShadows
                    position={[4, -2.9, -2]}
                    opacity={0.8}
                    scale={30}
                    blur={2.5}
                    far={10}
                    color="#0f172a"
                />
            </group>
        </>
    );
}
