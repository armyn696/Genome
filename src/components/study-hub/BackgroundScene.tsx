import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BackgroundScene = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#9b87f5" opacity={0.8} transparent />
      </mesh>
    </>
  );
};

export default BackgroundScene;