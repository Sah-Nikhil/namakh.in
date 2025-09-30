"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

/*
 * Plug-and-play Hero section for Next.js App Router
 *
 * Dependencies:
 *   npm i three @react-three/fiber @react-three/drei framer-motion
 *
 * Usage:
 *   import HeroWaterDroplet from "./HeroWaterDroplet";
 *   export default function Page() { return <HeroWaterDroplet /> }
 */

// ---------- Ripple Background Shader ----------
const RippleMaterial = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame(({ clock, size }) => {
        const t = clock.getElapsedTime();
        if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = t;
        materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
        }
    });

    const uniforms = useMemo(
        () => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uColorA: { value: new THREE.Color("#f4f4f4") }, // light silver
        uColorB: { value: new THREE.Color("#1a1a1a") }, // deep charcoal

        uCenter: { value: new THREE.Vector2(0.5, 0.48) },
        uIntensity: { value: 0.7 },
        }),
        []
    );

    const vertex = /* glsl */ `
        varying vec2 vUv;
        void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragment = /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform vec2 uResolution;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uTime;
        uniform vec2 uCenter;
        uniform float uIntensity;

        // Simple radial ripple field
        float ripple(vec2 uv, vec2 c) {
        float d = distance(uv, c);
        float waves = sin(28.0 * d - uTime * 3.0);
        float atten = exp(-6.0 * d);
        return waves * atten;
        }

        void main() {
        // Background gradient
        vec2 uv = vUv;
        vec3 base = mix(uColorB, uColorA, smoothstep(0.1, 0.9, uv.y));

        // Primary ripple at center and a subtle secondary offset
        float r1 = ripple(uv, uCenter);
        float r2 = ripple(uv, uCenter + vec2(0.12, -0.08));
        float r = (r1 * 0.8 + r2 * 0.4) * uIntensity;

        // Convert ripple to light banding + slight tint shift
        vec3 light = vec3(0.12) + vec3(0.9) * smoothstep(0.0, 1.0, r * 0.5 + 0.5);
        vec3 color = base + light * 0.08 + vec3(r * 0.12, r * 0.18, r * 0.25);

        gl_FragColor = vec4(color, 1.0);
        }
    `;

    return (
        <shaderMaterial
        ref={materialRef}
        attach="material"
        fragmentShader={fragment}
        vertexShader={vertex}
        uniforms={uniforms}
        depthWrite={false}
        />
    );
    };

function RippleBackground() {
    return (
        <mesh position={[0, 0, -2]}>
        {/* Big plane that covers the viewport background */}
        <planeGeometry args={[20, 12, 1, 1]} />
        <RippleMaterial />
        </mesh>
    );
}

// ---------- Droplet ----------
function Droplet() {
  const ref = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Bounce up & down
    if (ref.current) {
      ref.current.position.y = Math.sin(t * 1.5) * 0.15; // amplitude = 0.15, speed = 1.5
    }

    // Update ripple time
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#cfe9ff") },
      uFresnelColor: { value: new THREE.Color("#ffffff") },
      uRippleStrength: { value: 0.15 },
    }),
    []
  );

  const vertexShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    precision highp float;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uFresnelColor;
    uniform float uRippleStrength;

    float fresnel(vec3 viewDir, vec3 normal) {
      return pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);

      // Internal ripple distortion
      float ripple = sin(25.0 * vUv.x + uTime * 4.0) * 0.5 +
                     cos(25.0 * vUv.y + uTime * 4.0) * 0.5;
      ripple *= uRippleStrength;

      vec3 distortedNormal = normalize(vNormal + ripple * 0.3);

      float light = dot(distortedNormal, normalize(vec3(0.0, 1.0, 1.0)));
      light = clamp(light, 0.0, 1.0);

      float fres = fresnel(viewDir, distortedNormal);
      vec3 color = uColor * light + uFresnelColor * fres * 1.4;

      gl_FragColor = vec4(color, 0.85);
    }
  `;

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[0.9, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        args={[{ vertexShader, fragmentShader, uniforms, transparent: true }]}
      />
    </mesh>
  );
}


// ---------- Lights ----------
function Lights() {
    return (
        <>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <directionalLight position={[-2, -1, -3]} intensity={0.4} />
        </>
    );
}

// ---------- 3D Scene Wrapper ----------
function DropletScene() {
    return (
        <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        className="absolute inset-0"
        >
        <RippleBackground />
        <Droplet />
        <Lights />
        <Environment preset="city" />
        </Canvas>
    );
}

// ---------- Hero Section ----------
export default function HeroWaterDroplet() {
    return (
    <section className="relative h-screen w-full overflow-hidden bg-gray-900 text-white flex items-center justify-center pt-82">
        {/* 3D Canvas background */}
        <div className="absolute inset-0 -z-0">
            <DropletScene />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 mx-auto flex h-full w-full flex-col items-center justify-center px-6 text-center">
            <motion.div
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            >
            <div>
                <h1 className="text-6xl font-bold leading-tight sm:text-7xl md:text-8xl">
                    NAMAKH
                </h1>
                <p className="mt-5 text-lg text-gray-200 md:text-xl">
                    A hero section powered by real-time 3D—featuring a refractive water droplet, dynamic ripples, and responsive motion. Plug it in and make a splash.
                </p>
                <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
                    <a
                    href="#get-started"
                    className="rounded-2xl bg-sky-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110"
                    >
                    Get Started
                    </a>
                    <a
                    href="#learn-more"
                    className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                    >
                    Learn More
                    </a>
                </div>
            </div>
            </motion.div>

            <motion.div
            className="relative h-[340px] w-[340px] sm:h-[420px] sm:w-[420px] md:h-[520px] md:w-[520px] mx-auto"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            >
            {/* Empty div to reserve space—actual 3D is absolutely positioned behind */}
            <div className="pointer-events-none h-full w-full" />
            </motion.div>
        </div>

        {/* Subtle vignette for depth */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_55%,rgba(0,0,0,0.35)_100%)]" />
        </section>
    );
}
