import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BackgroundScene = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Create particles using useMemo to prevent recreation on each render
  const positions = useMemo(() => {
    const posArray = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 10;     // x
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 10; // y
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
    }
    return posArray;
  }, []);

  // Animation
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.001;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
            usage={THREE.StaticDrawUsage}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#9b87f5"
          transparent
          opacity={0.8}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
};

export default BackgroundScene;