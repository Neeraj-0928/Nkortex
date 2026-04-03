"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function AnimatedNode() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1.5, 64, 64]}>
                <MeshDistortMaterial
                    color="#0ff0fc"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                    emissive="#9d4edd"
                    emissiveIntensity={0.5}
                    wireframe={true}
                />
            </Sphere>

            {/* Inner glowing core */}
            <Sphere args={[0.8, 32, 32]}>
                <meshBasicMaterial color="#ffffff" />
            </Sphere>
        </Float>
    );
}

export default function AIChatModel() {
    return (
        <div className="w-full h-full relative cursor-move">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#00f0ff" />
                <directionalLight position={[-10, -10, -5]} intensity={2} color="#9d4edd" />
                <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

                <AnimatedNode />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 1.5}
                    minPolarAngle={Math.PI / 3}
                />
            </Canvas>
        </div>
    );
}
