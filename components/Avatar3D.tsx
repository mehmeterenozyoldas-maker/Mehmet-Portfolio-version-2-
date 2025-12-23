import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, RoundedBox, Cylinder, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Audio Helper for 8-bit Sounds ---
const playRetroSound = (type: 'on' | 'off' | 'pop') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'on') {
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'off') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.2);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'pop') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {
    console.error("Audio error", e);
  }
};

// --- Background Components ---

const FloatingBrick = ({ position, color, rotationSpeed, scale }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x += rotationSpeed * 0.01;
        meshRef.current.rotation.y += rotationSpeed * 0.02;
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * rotationSpeed) * 0.002;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <boxGeometry args={[0.2, 0.1, 0.4]} />
                <meshStandardMaterial color={color} roughness={0.3} transparent opacity={0.6} />
            </mesh>
        </Float>
    )
}

const CreativeParticles = () => {
    return (
        <group>
            <FloatingBrick position={[-2, 1, -2]} color="#4f46e5" rotationSpeed={1} scale={0.5} />
            <FloatingBrick position={[2.5, -1, -3]} color="#ec4899" rotationSpeed={0.8} scale={0.7} />
            <FloatingBrick position={[-1.5, -2, -1]} color="#a855f7" rotationSpeed={0.5} scale={0.4} />
            <FloatingBrick position={[1.8, 2, -2]} color="#06b6d4" rotationSpeed={1.2} scale={0.6} />
            <Sparkles count={40} scale={6} size={2} speed={0.4} opacity={0.4} color="#ffffff" />
        </group>
    )
}

// --- Lego Components ---

const PlasticMaterial = ({ color }: { color: string }) => (
  <meshPhysicalMaterial 
    color={color} 
    roughness={0.25}
    metalness={0.0} 
    clearcoat={0.3} 
    clearcoatRoughness={0.2} 
  />
);

const LegoStud = ({ position, color }: { position: [number, number, number], color: string }) => (
  <mesh position={position}>
    <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
    <PlasticMaterial color={color} />
  </mesh>
);

const LegoHand = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.12, 16]} />
      <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={0.5} />
    </mesh>
    <group position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <torusGeometry args={[0.09, 0.045, 12, 24, Math.PI + 0.8]} />
        <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={0.5} />
      </mesh>
      <mesh position={[0.085, 0.03, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={0.5} />
      </mesh>
      <mesh position={[-0.085, 0.03, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={0.5} />
      </mesh>
    </group>
  </group>
);

const HairPuff = ({ position, scale = 1, color, sway = 0, phase = 0 }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current && sway > 0) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.x = position[0] + Math.sin(t * 1 + phase) * (sway * 0.02);
      meshRef.current.position.y = position[1] + Math.cos(t * 0.8 + phase) * (sway * 0.02);
    }
  });
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[0.14, 12, 12]} /> 
      <meshPhysicalMaterial color={color} roughness={0.7} metalness={0.1} />
    </mesh>
  );
};

const PixelBlock = ({ index }: { index: number }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if(!ref.current) return;
        const t = state.clock.getElapsedTime();
        const speed = 1.5;
        const offset = index * 1.5;
        const yPos = 0.15 - ((t * speed + offset) % 0.3);
        ref.current.position.y = yPos;
        ref.current.visible = yPos > -0.12;
    });
    return (
        <mesh ref={ref} position={[0, 0, 0.02]}>
            <planeGeometry args={[0.06, 0.06]} />
            <meshBasicMaterial color="#0f380f" />
        </mesh>
    )
}

const MusicalNote = ({ position, index }: any) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const cycle = (t * 0.8 + index * 0.5) % 2; 
    
    if (cycle < 1.5) {
       ref.current.visible = true;
       ref.current.position.y = position[1] + cycle * 0.6;
       ref.current.position.x = position[0] + Math.sin(t * 1.5 + index) * 0.05;
       ref.current.scale.setScalar(0.8 * (1 - cycle/1.5));
       (ref.current.children[0] as THREE.Mesh).material.opacity = 0.8 * (1 - cycle/1.5);
    } else {
       ref.current.visible = false;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <torusGeometry args={[0.08, 0.02, 8, 16]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

const LegoAvatar = () => {
  const headGroupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const gameboyScreenRef = useRef<THREE.Mesh>(null);
  const screenLightRef = useRef<THREE.PointLight>(null);
  
  const [jamming, setJamming] = useState(false);
  const [gaming, setGaming] = useState(false);
  const [waving, setWaving] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const colors = {
    skin: "#ffd6a5",
    hair: "#111111", 
    rim: "#e5e7eb", 
    shirtOuter: "#1d4ed8",
    shirtInner: "#374151",
    jeans: "#2563eb",
    shoes: "#111111",
    gameboy: "#d1d5db",
    headphones: "#000000",
    headphonesEmissive: "#818cf8",
    screenOn: "#9bbc0f",
    screenOff: "#333333"
  };
  
  const handleGameToggle = (e: any) => {
      e.stopPropagation();
      playRetroSound(gaming ? 'off' : 'on');
      setGaming(!gaming);
      setWaving(false);
      setThinking(false);
  };

  const handleWave = (e: any) => {
      e.stopPropagation();
      if (gaming) return; 
      playRetroSound('pop');
      setWaving(true);
      setThinking(false);
      setTimeout(() => setWaving(false), 2000); 
  };

  const handleThinking = (e: any) => {
      e.stopPropagation();
      if (gaming || jamming) return; 
      playRetroSound('pop');
      setThinking(!thinking);
      setWaving(false);
  };

  useFrame((state) => {
    if (!headGroupRef.current || !rightArmRef.current || !leftArmRef.current) return;

    const t = state.clock.getElapsedTime();
    const smoothLerp = 0.04; 

    // --- HEAD LOGIC ---
    let targetHeadX = (state.mouse.y * Math.PI) / 12; 
    let targetHeadY = (state.mouse.x * Math.PI) / 8;
    let targetHeadZ = 0;

    if (gaming) {
        targetHeadX = 0.35; targetHeadY = 0;
    } else if (thinking) {
        targetHeadX = 0.1; 
        targetHeadY = 0.2; 
        targetHeadZ = -0.15; 
    } else if (jamming) {
        targetHeadX = Math.sin(t * 3) * 0.1;
        targetHeadY = Math.cos(t * 1.5) * 0.05;
    }

    headGroupRef.current.rotation.x = THREE.MathUtils.lerp(headGroupRef.current.rotation.x, targetHeadX, smoothLerp);
    headGroupRef.current.rotation.y = THREE.MathUtils.lerp(headGroupRef.current.rotation.y, targetHeadY, smoothLerp);
    headGroupRef.current.rotation.z = THREE.MathUtils.lerp(headGroupRef.current.rotation.z, targetHeadZ, smoothLerp);

    // --- ARM LOGIC ---
    let rTargetX = 0; 
    let rTargetY = 0; 
    let rTargetZ = -0.15;

    if (gaming) {
        rTargetX = -1.2; rTargetY = -0.5; rTargetZ = -0.4;
    } else if (waving) {
        rTargetX = 0; 
        rTargetY = 0; 
        rTargetZ = 2.5 + Math.sin(t * 12) * 0.4; 
    } else if (thinking) {
        rTargetX = -1.4; 
        rTargetY = -0.2; 
        rTargetZ = 1.8; 
    }

    rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, rTargetX, smoothLerp);
    rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, rTargetY, smoothLerp);
    const rightArmJitter = gaming ? 0 : 0;
    rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, rTargetZ + rightArmJitter, smoothLerp);

    // LEFT ARM
    let lTargetX = 0;
    let lTargetY = 0; 
    let lTargetZ = 0.15;

    if (gaming) {
        lTargetX = -1.2; lTargetY = 0.6; lTargetZ = 0.2;
    }

    leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, lTargetX, smoothLerp);
    leftArmRef.current.rotation.y = THREE.MathUtils.lerp(leftArmRef.current.rotation.y, lTargetY, smoothLerp);
    leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, lTargetZ, smoothLerp);

    // --- TORSO ---
    if (torsoRef.current) {
        const breathingY = 1.35 + Math.sin(t * 0.8) * 0.008; 
        torsoRef.current.position.y = THREE.MathUtils.lerp(torsoRef.current.position.y, breathingY, 0.1);
        const sway = Math.sin(t * 0.4) * 0.02; 
        torsoRef.current.rotation.z = sway;
    }

    // --- SCREEN LIGHT ---
    if (screenLightRef.current) {
        const targetIntensity = gaming ? 0.6 + Math.sin(t * 2) * 0.1 : 0;
        screenLightRef.current.intensity = THREE.MathUtils.lerp(screenLightRef.current.intensity, targetIntensity, 0.1);
    }
  });

  const hairStrands = useMemo(() => {
    const strands = [];
    const numPuffs = 95;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < numPuffs; i++) {
        const t = i / (numPuffs - 1);
        const y = 1 - t * 0.95; 
        const radiusAtY = Math.sqrt(1 - y * y); 
        const theta = goldenAngle * i;
        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;
        const domeRadius = 0.52; 
        strands.push({
            position: [x * domeRadius, y * domeRadius * 0.85 + 0.35, z * domeRadius] as [number, number, number],
            scale: 0.8 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2
        });
    }
    return strands;
  }, []);

  return (
    <group position={[0, -1.6, 0]} scale={0.9}>
      
      {/* --- HIPS --- */}
      <group position={[0, 0.85, 0]}>
         <RoundedBox args={[0.38, 0.2, 0.25]} radius={0.04} smoothness={4}>
            <PlasticMaterial color={colors.jeans} />
         </RoundedBox>
         <mesh position={[0, 0.1, 0]}>
             <cylinderGeometry args={[0.18, 0.18, 0.12, 32]} />
             <PlasticMaterial color={colors.jeans} />
         </mesh>
         <mesh position={[0.19, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            <meshPhysicalMaterial color="#1d4ed8" roughness={0.5} />
         </mesh>
         <mesh position={[-0.19, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            <meshPhysicalMaterial color="#1d4ed8" roughness={0.5} />
         </mesh>
      </group>

      {/* --- LEGS --- */}
      <group ref={leftLegRef} position={[-0.2, 0.75, 0]}>
         <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.22, 32]} />
            <PlasticMaterial color={colors.jeans} />
         </mesh>
         <RoundedBox args={[0.22, 0.6, 0.3]} position={[0, -0.3, 0]} radius={0.03} smoothness={4}>
            <PlasticMaterial color={colors.jeans} />
         </RoundedBox>
         <RoundedBox args={[0.24, 0.2, 0.45]} position={[0, -0.65, 0.08]} radius={0.02} smoothness={4}>
            <PlasticMaterial color={colors.shoes} />
         </RoundedBox>
         <mesh position={[0, -0.68, 0.32]}>
            <boxGeometry args={[0.24, 0.14, 0.1]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.1} />
         </mesh>
         <mesh position={[-0.11, -0.4, 0]} rotation={[0, Math.PI/2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            <meshPhysicalMaterial color="#111" roughness={0.9} />
         </mesh>
      </group>

      <group ref={rightLegRef} position={[0.2, 0.75, 0]}>
         <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.22, 32]} />
            <PlasticMaterial color={colors.jeans} />
         </mesh>
         <RoundedBox args={[0.22, 0.6, 0.3]} position={[0, -0.3, 0]} radius={0.03} smoothness={4}>
            <PlasticMaterial color={colors.jeans} />
         </RoundedBox>
         <RoundedBox args={[0.24, 0.2, 0.45]} position={[0, -0.65, 0.08]} radius={0.02} smoothness={4}>
            <PlasticMaterial color={colors.shoes} />
         </RoundedBox>
         <mesh position={[0, -0.68, 0.32]}>
            <boxGeometry args={[0.24, 0.14, 0.1]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.1} />
         </mesh>
      </group>

      {/* --- TORSO --- */}
      <group 
         ref={torsoRef} 
         position={[0, 1.45, 0]}
         onClick={handleWave}
         onPointerOver={() => setHoveredPart('Torso')}
         onPointerOut={() => setHoveredPart(null)}
      >
         <mesh rotation={[0, Math.PI/4, 0]}>
            <cylinderGeometry args={[0.4, 0.54, 0.8, 4]} />
            <PlasticMaterial color={colors.shirtOuter} />
         </mesh>
         
         {/* FIX: Moved Z from 0.28 to 0.31 to stop Z-fighting */}
         <mesh position={[0, -0.05, 0.31]} scale={[0.35, 0.6, 1]}>
             <planeGeometry />
             <meshPhysicalMaterial color={colors.shirtInner} roughness={0.6} />
         </mesh>

         <LegoStud position={[-0.2, 0.4, 0]} color={colors.shirtOuter} />
         <LegoStud position={[0.2, 0.4, 0]} color={colors.shirtOuter} />
         
         {hoveredPart === 'Torso' && !gaming && !waving && (
            <Html position={[0.6, 0.2, 0]} center>
                <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap backdrop-blur-sm pointer-events-none">
                   Click to Wave
                </div>
            </Html>
         )}

         {/* Neck */}
         <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.2, 32]} />
            <PlasticMaterial color={colors.skin} />
         </mesh>

         {/* Left Arm */}
         <group ref={leftArmRef} position={[-0.42, 0.25, 0]} rotation={[0, 0, 0.2]}>
             <mesh>
                 <sphereGeometry args={[0.18, 32, 32]} />
                 <PlasticMaterial color={colors.shirtOuter} />
             </mesh>
             <mesh position={[-0.1, -0.22, 0]} rotation={[0, 0, 0.1]}>
                 <cylinderGeometry args={[0.14, 0.14, 0.45, 32]} />
                 <PlasticMaterial color={colors.shirtOuter} />
             </mesh>
             <group position={[-0.15, -0.4, 0.1]} rotation={[0.4, 0, 0]}>
                  <mesh position={[0, -0.2, 0]}>
                      <cylinderGeometry args={[0.13, 0.12, 0.4, 32]} />
                      <PlasticMaterial color={colors.shirtOuter} />
                  </mesh>
                  <group position={[0, -0.45, 0]} rotation={[0, -0.2, 0]}>
                      <LegoHand color={colors.skin} />
                  </group>
             </group>
         </group>

         {/* Right Arm */}
         <group ref={rightArmRef} position={[0.42, 0.25, 0]} rotation={[0, 0, -0.2]}>
             <mesh>
                 <sphereGeometry args={[0.18, 32, 32]} />
                 <PlasticMaterial color={colors.shirtOuter} />
             </mesh>
             <mesh position={[0.1, -0.22, 0]} rotation={[0, 0, -0.1]}>
                 <cylinderGeometry args={[0.14, 0.14, 0.45, 32]} />
                 <PlasticMaterial color={colors.shirtOuter} />
             </mesh>
             <group position={[0.15, -0.4, 0.2]} rotation={[0.8, -0.4, 0]}>
                  <mesh position={[0, -0.2, 0]}>
                      <cylinderGeometry args={[0.13, 0.12, 0.4, 32]} />
                      <PlasticMaterial color={colors.shirtOuter} />
                  </mesh>
                  <group position={[0, -0.45, 0]} rotation={[0, -1.2, -0.2]}>
                      <LegoHand color={colors.skin} />
                       
                       {/* GAMEBOY */}
                       <group 
                          position={[0, 0.2, 0.35]} 
                          rotation={[1.5, 0, 0]}
                          onClick={handleGameToggle}
                          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Gameboy'); }}
                          onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null); }}
                       >
                           <RoundedBox args={[0.5, 0.8, 0.15]} radius={0.05} smoothness={4}>
                               <PlasticMaterial color={colors.gameboy} />
                           </RoundedBox>
                           
                           <mesh ref={gameboyScreenRef} position={[0, 0.15, 0.08]}>
                               <planeGeometry args={[0.35, 0.3]} />
                               <meshStandardMaterial 
                                  color={gaming ? colors.screenOn : colors.screenOff} 
                                  emissive={gaming ? colors.screenOn : "#000"}
                                  emissiveIntensity={gaming ? 0.5 : 0} 
                               />
                               <pointLight 
                                  ref={screenLightRef}
                                  color={colors.screenOn} 
                                  distance={1.5} 
                                  decay={2} 
                                  intensity={0}
                                  position={[0, 0, 0.2]} 
                               />
                               {gaming && (
                                   <group position={[0, 0, 0.01]}>
                                      <PixelBlock index={0} />
                                      <PixelBlock index={1} />
                                      <PixelBlock index={2} />
                                   </group>
                               )}
                           </mesh>
                           
                           <group position={[-0.12, -0.15, 0.08]}>
                               <mesh><boxGeometry args={[0.12, 0.04, 0.04]} />{PlasticMaterial({color: "#222"})}</mesh>
                               <mesh><boxGeometry args={[0.04, 0.12, 0.04]} />{PlasticMaterial({color: "#222"})}</mesh>
                           </group>
                           <mesh position={[0.12, -0.12, 0.08]} rotation={[0, 0, -0.5]}>
                               <capsuleGeometry args={[0.035, 0.08, 8, 16]} />
                               <PlasticMaterial color="#ef4444" />
                           </mesh>
                           <mesh position={[0.18, -0.06, 0.08]} rotation={[0, 0, -0.5]}>
                               <capsuleGeometry args={[0.035, 0.08, 8, 16]} />
                               <PlasticMaterial color="#ef4444" />
                           </mesh>
                           
                           {!gaming && hoveredPart === 'Gameboy' && (
                             <Html position={[0.5, 0, 0]} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
                               <div className="bg-black/80 text-white text-[8px] px-2 py-1 rounded-full font-mono whitespace-nowrap border border-zinc-700 opacity-80">
                                 Click to Play
                               </div>
                             </Html>
                           )}
                       </group>
                  </group>
             </group>
         </group>

         {/* --- HEAD GROUP --- */}
         <group 
            ref={headGroupRef} 
            position={[0, 0.75, 0]}
            onClick={handleThinking}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Head'); }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null); }}
         >
             <mesh>
                 <cylinderGeometry args={[0.35, 0.35, 0.6, 64]} />
                 <PlasticMaterial color={colors.skin} />
             </mesh>
             <mesh position={[0, 0.35, 0]}>
                 <cylinderGeometry args={[0.18, 0.18, 0.15, 32]} />
                 <PlasticMaterial color={colors.skin} />
             </mesh>
             
             {hoveredPart === 'Head' && !gaming && !jamming && (
                <Html position={[0, 0.7, 0]} center>
                    <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap backdrop-blur-sm pointer-events-none">
                       {thinking ? "Stop Thinking" : "Deep Thought"}
                    </div>
                </Html>
             )}

             {/* FIX: Moved Z from 0.32 to 0.36 to prevent head clipping */}
             <group position={[0, 0.05, 0.36]}>
                {/* Eyes */}
                <group position={[-0.14, 0, 0]}>
                   <mesh><sphereGeometry args={[0.045, 16, 16]} /><meshBasicMaterial color="#000" /></mesh>
                   <mesh position={[0.015, 0.015, 0.03]}><sphereGeometry args={[0.012, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
                </group>
                <group position={[0.14, 0, 0]}>
                   <mesh><sphereGeometry args={[0.045, 16, 16]} /><meshBasicMaterial color="#000" /></mesh>
                   <mesh position={[0.015, 0.015, 0.03]}><sphereGeometry args={[0.012, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
                </group>
                {/* Eyebrows */}
                <mesh position={[-0.14, 0.12, 0]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.12, 0.02, 0.01]} />
                    <meshBasicMaterial color="#111" />
                </mesh>
                <mesh position={[0.14, 0.12, 0]} rotation={[0, 0, 0.1]}>
                    <boxGeometry args={[0.12, 0.02, 0.01]} />
                    <meshBasicMaterial color="#111" />
                </mesh>
                {/* Smile */}
                <mesh position={[0, -0.14, 0]} rotation={[0, 0, Math.PI]}>
                   <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
                   <meshBasicMaterial color="#000" />
                </mesh>
             </group>

             <group position={[0, 0.05, 0]}>
                {hairStrands.map((props, i) => (
                    <HairPuff key={i} {...props} color={colors.hair} sway={jamming ? 0.2 : 0.02} />
                ))}
             </group>

             {/* Headphones */}
             <group 
                position={[0, -0.05, 0]} 
                scale={0.9}
                onClick={(e) => { e.stopPropagation(); setJamming(!jamming); }}
                onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Headphones'); }}
                onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null); }}
             >
                 <mesh position={[0, 0.05, -0.05]} rotation={[1.5, 0, 0]}>
                     <torusGeometry args={[0.42, 0.05, 16, 48, Math.PI]} />
                     <meshPhysicalMaterial color={colors.rim} roughness={0.3} metalness={0.7} />
                 </mesh>
                 <group position={[-0.44, 0, 0.05]} rotation={[0, 0, Math.PI/2]}>
                     <Cylinder args={[0.14, 0.14, 0.15, 32]}>
                        <meshPhysicalMaterial 
                           color={colors.headphones} 
                           emissive={colors.headphonesEmissive}
                           emissiveIntensity={jamming ? 0.5 : 0}
                        />
                     </Cylinder>
                 </group>
                 <group position={[0.44, 0, 0.05]} rotation={[0, 0, Math.PI/2]}>
                     <Cylinder args={[0.14, 0.14, 0.15, 32]}>
                        <meshPhysicalMaterial 
                           color={colors.headphones}
                           emissive={colors.headphonesEmissive}
                           emissiveIntensity={jamming ? 0.5 : 0}
                        />
                     </Cylinder>
                 </group>

                 {jamming && (
                    <group position={[0, 0.8, 0]}>
                       {[0, 1, 2].map(i => <MusicalNote key={i} position={[(i-1)*0.5, 0, 0]} index={i} />)}
                    </group>
                 )}
                 
                 {hoveredPart === 'Headphones' && (
                    <Html position={[0, 1.2, 0]} center style={{ pointerEvents: 'none' }}>
                        <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap backdrop-blur-sm">
                           {jamming ? "Stop Music" : "Jam Out"}
                        </div>
                    </Html>
                 )}
             </group>
         </group>
      </group>
    </group>
  );
};

const Avatar3D: React.FC = () => {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
      >
        <color attach="background" args={['transparent']} />
        
        {/* Cinematic Lighting Setup */}
        <ambientLight intensity={0.4} />
        <spotLight 
           position={[5, 10, 5]} 
           angle={0.25} 
           penumbra={1} 
           intensity={1.5} 
           castShadow 
           shadow-bias={-0.0001}
        />
        {/* Cool Rim Light */}
        <pointLight position={[-5, 2, -5]} intensity={0.8} color="#4f46e5" />
        {/* Warm Fill Light */}
        <pointLight position={[5, -2, 2]} intensity={0.5} color="#f472b6" />
        
        <Environment preset="city" blur={0.8} />

        <CreativeParticles />

        <Float speed={2} rotationIntensity={0.05} floatIntensity={0.2}>
           <LegoAvatar />
        </Float>
        
        <ContactShadows 
           position={[0, -2.5, 0]} 
           opacity={0.5} 
           scale={10} 
           blur={2.5} 
           far={4} 
           resolution={1024} 
           color="#000000" 
        />
      </Canvas>
    </div>
  );
};

export default Avatar3D;