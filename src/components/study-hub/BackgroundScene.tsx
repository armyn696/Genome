import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BackgroundScene = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Create vertices for a simple star field
  const geometry = useMemo(() => {
    const vertices = [];
    for (let i = 0; i < 100; i++) {
      vertices.push(
        THREE.MathUtils.randFloatSpread(10), // x
        THREE.MathUtils.randFloatSpread(10), // y
        THREE.MathUtils.randFloatSpread(10)  // z
      );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, []);

  // Simple rotation animation
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <points ref={pointsRef}>
        <primitive object={geometry} />
        <pointsMaterial
          size={0.1}
          color="#9b87f5"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </>
  );
};

export default BackgroundScene;