import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BackgroundScene = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Create geometry and store vertices using useMemo to prevent recreation
  const geometry = useMemo(() => {
    const vertices = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      vertices[i * 3] = (Math.random() - 0.5) * 10;     // x
      vertices[i * 3 + 1] = (Math.random() - 0.5) * 10; // y
      vertices[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geo;
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
      <points ref={pointsRef} geometry={geometry}>
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