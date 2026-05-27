'use client';

import * as THREE from 'three';
import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

const LiquidShaderMaterial = {
  uniforms: {
    uTex1: { value: null },
    uTex2: { value: null },
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(0, 0) },
    uTexResolution: { value: new THREE.Vector2(2000, 1333) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform float uProgress;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uTexResolution;

    // Emulated CSS background-size: cover in GLSL shader (presents perfect centering and aspect ratios)
    vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 texRes) {
      float screenRatio = screenRes.x / screenRes.y;
      float texRatio = texRes.x / texRes.y;
      vec2 ratio = vec2(1.0);
      
      if (screenRatio > texRatio) {
        // Landscape screens: crop top and bottom
        ratio.y = texRatio / screenRatio;
      } else {
        // Portrait mobile screens: crop left and right
        ratio.x = screenRatio / texRatio;
      }
      
      return (uv - 0.5) * ratio + 0.5;
    }

    // High-performance hash for 2D Value Noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // Faster Value Noise function to preserve 60fps on mobile
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
        mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x),
        u.y
      );
    }

    void main() {
      // Map screen coords to texture aspect ratio
      vec2 coverUv = getCoverUv(vUv, uResolution, uTexResolution);

      // Edge envelope mask (guarantees displacement is 0.0 at screen boundaries to prevent clamping)
      float borderMask = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x)
                       * smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);

      // Distort UVs using noise coordinate displacement
      float distortion = noise(coverUv * 5.0 + vec2(uTime * 0.1)) * 0.3
                       + noise(coverUv * 10.0 - vec2(uTime * 0.05)) * 0.15;

      // Morph amplitude peaks in the middle (progress = 0.5)
      float amp = sin(uProgress * 3.14159265);

      // Offset UV vectors modulated by our border envelope to prevent outer artifacts
      vec2 disp = vec2(distortion * 0.05 * amp) * borderMask;
      vec2 distUv1 = coverUv + disp;
      vec2 distUv2 = coverUv - disp;

      // Sample textures directly to maintain absolute pixel-perfect sharpness during transition
      vec4 tex1 = texture2D(uTex1, distUv1);
      vec4 tex2 = texture2D(uTex2, distUv2);

      // Mix based on progress + noise thresholding to give organic fluid border flow
      float edge = smoothstep(0.35, 0.65, uProgress + distortion * 0.08);
      vec4 finalColor = mix(tex1, tex2, edge);

      gl_FragColor = finalColor;
    }
  `
};

function LiquidPlane({ activeTab, tex1, tex2, onReady }) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const { size } = useThree();

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size]);

  useEffect(() => {
    if (materialRef.current && tex1 && tex2) {
      // Disable mipmapping to prevent GPU coordinate derivative calculation from selecting blurry low-res layers
      tex1.generateMipmaps = false;
      tex2.generateMipmaps = false;
      tex1.minFilter = THREE.LinearFilter;
      tex2.minFilter = THREE.LinearFilter;
      tex1.magFilter = THREE.LinearFilter;
      tex2.magFilter = THREE.LinearFilter;
      tex1.wrapS = THREE.ClampToEdgeWrapping;
      tex1.wrapT = THREE.ClampToEdgeWrapping;
      tex2.wrapS = THREE.ClampToEdgeWrapping;
      tex2.wrapT = THREE.ClampToEdgeWrapping;

      materialRef.current.uniforms.uTex1.value = tex1;
      materialRef.current.uniforms.uTex2.value = tex2;
      onReady?.();
    }
  }, [tex1, tex2, onReady]);

  const targetProgress = activeTab === 'vehicle' ? 0.0 : 1.0;
  const progressRef = useRef(0.0);

  useFrame((state, delta) => {
    // Frame-rate independent exponential decay easing (buttery smooth at 60Hz/120Hz/144Hz)
    const speed = 2.8; 
    progressRef.current += (targetProgress - progressRef.current) * (1.0 - Math.exp(-speed * delta));

    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progressRef.current;
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        args={[LiquidShaderMaterial]}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export default function WebGLBackground({ activeTab }) {
  const [mounted, setMounted] = useState(false);
  const [textures, setTextures] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Asynchronously load textures in background to avoid Suspense locking
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const vehicleUrl = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=2000&q=85';
    const campsiteUrl = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=2000&q=85';

    Promise.all([
      new Promise((resolve) => loader.load(vehicleUrl, resolve, undefined, () => resolve(null))),
      new Promise((resolve) => loader.load(campsiteUrl, resolve, undefined, () => resolve(null)))
    ]).then(([t1, t2]) => {
      if (t1 && t2) {
        setTextures({ t1, t2 });
      }
    });
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 bg-black z-0 pointer-events-none" />;
  }

  const vehicleUrl = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=2000&q=85';
  const campsiteUrl = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=2000&q=85';

  return (
    <div className="absolute inset-0 z-0 w-full h-full pointer-events-none overflow-hidden bg-black">
      
      {/* ── Standard CSS Image Fallback (Active immediately during WebGL load) ── */}
      <div 
        className="absolute inset-0 z-[1] transition-opacity duration-1000 ease-in-out pointer-events-none"
        style={{ opacity: isReady ? 0 : 0.85 }}
      >
        <img
          src={activeTab === 'vehicle' ? vehicleUrl : campsiteUrl}
          alt="Adventure Background"
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>

      {/* ── WebGL Canvas rendering the high-end liquid shader ── */}
      {textures && (
        <div 
          className="absolute inset-0 z-[2] transition-opacity duration-1000 ease-in-out"
          style={{ opacity: isReady ? 0.85 : 0 }}
        >
          <Canvas
            style={{ pointerEvents: 'none' }}
            gl={{ antialias: false, depth: false, stencil: false }}
            orthographic
            camera={{ zoom: 1 }}
          >
            <LiquidPlane 
              activeTab={activeTab} 
              tex1={textures.t1} 
              tex2={textures.t2} 
              onReady={() => setIsReady(true)}
            />
          </Canvas>
        </div>
      )}

      {/* ── Editorial Gradient Tint ── */}
      <div className="absolute inset-0 z-[3] bg-gradient-to-b from-black/80 via-black/30 to-black/80 lg:bg-gradient-to-r lg:from-black/90 lg:via-black/55 lg:to-transparent pointer-events-none" />
    </div>
  );
}
