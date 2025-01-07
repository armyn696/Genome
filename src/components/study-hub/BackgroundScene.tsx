import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BackgroundScene = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Create geometry using useMemo to prevent recreation on each render
  const geometry = useMemo(() => {
    const positions = new Float32Array(300); // 100 points * 3 coordinates each
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;     // x
      positions[i + 1] = (Math.random() - 0.5) * 10; // y
      positions[i + 2] = (Math.random() - 0.5) * 10; // z
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Create material using useMemo
  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.1,
      color: "#9b87f5",
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
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
      <primitive object={new THREE.Points(geometry, material)} ref={pointsRef} />
    </>
  );
};

export default BackgroundScene;