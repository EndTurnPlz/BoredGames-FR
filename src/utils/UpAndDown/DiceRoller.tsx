"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Pip({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

const pip2DPositions: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [
    [-0.4, -0.4],
    [0.4, 0.4],
  ],
  3: [
    [-0.4, -0.4],
    [0, 0],
    [0.4, 0.4],
  ],
  4: [
    [-0.4, -0.4],
    [-0.4, 0.4],
    [0.4, -0.4],
    [0.4, 0.4],
  ],
  5: [
    [-0.4, -0.4],
    [-0.4, 0.4],
    [0, 0],
    [0.4, -0.4],
    [0.4, 0.4],
  ],
  6: [
    [-0.4, -0.6],
    [-0.4, 0],
    [-0.4, 0.6],
    [0.4, -0.6],
    [0.4, 0],
    [0.4, 0.6],
  ],
};

// Helper: map 2D pip positions to 3D on each face
// Each face is defined by a normal axis and two local axes (u, v) to place pips on the face plane
// cube half-size = 1 (so faces at +/-1)

const faces = [
  {
    faceNumber: 1, // Front face (+Z)
    normal: [0, 0, 1],
    u: [1, 0, 0],
    v: [0, 1, 0],
    faceCenter: [0, 0, 1],
  },
  {
    faceNumber: 6, // Back face (-Z)
    normal: [0, 0, -1],
    u: [-1, 0, 0],
    v: [0, 1, 0],
    faceCenter: [0, 0, -1],
  },
  {
    faceNumber: 4, // Right face (+X)
    normal: [1, 0, 0],
    u: [0, 0, -1],
    v: [0, 1, 0],
    faceCenter: [1, 0, 0],
  },
  {
    faceNumber: 3, // Left face (-X)
    normal: [-1, 0, 0],
    u: [0, 0, 1],
    v: [0, 1, 0],
    faceCenter: [-1, 0, 0],
  },
  {
    faceNumber: 2, // Top face (+Y)
    normal: [0, 1, 0],
    u: [1, 0, 0],
    v: [0, 0, -1],
    faceCenter: [0, 1, 0],
  },
  {
    faceNumber: 5, // Bottom face (-Y)
    normal: [0, -1, 0],
    u: [1, 0, 0],
    v: [0, 0, 1],
    faceCenter: [0, -1, 0],
  },
];
// Convert 2D pip pos (px, py) to 3D coords on face using face axes:
// 3D = faceCenter + px*u + py*v
function mapPipTo3D(
  px: number,
  py: number,
  face: {
    faceCenter: number[];
    u: number[];
    v: number[];
  }
): [number, number, number] {
  return [
    face.faceCenter[0] + px * face.u[0] + py * face.v[0],
    face.faceCenter[1] + px * face.u[1] + py * face.v[1],
    face.faceCenter[2] + px * face.u[2] + py * face.v[2],
  ];
}

function RotatingDice({ rolling, result }: { rolling: boolean; result: number }) {
  const meshRef = useRef<any>(null);
  const doneRotating = useRef(false);

  useFrame(() => {
    if (!meshRef.current) return;

    if (rolling) {
      doneRotating.current = false;
      meshRef.current.rotation.x += 0.2;
      meshRef.current.rotation.y += 0.2;
    } else {
      if (!doneRotating.current) {
        // Rotate cube so the result face is front (roughly)
        const faceRotations: Record<number, [number, number, number]> = {
          1: [0, 0, 0],
          2: [Math.PI / 2, 0, 0],
          3: [0, Math.PI / 2, 0],
          4: [0, -Math.PI / 2, 0],
          5: [-Math.PI / 2, 0, 0],
          6: [Math.PI, 0, 0],
        };
        const rotation = faceRotations[result] || [0, 0, 0];
        meshRef.current.rotation.set(...rotation);
        doneRotating.current = true;
      }
    }
  });

  return (
    <group ref={meshRef}>
      {/* Dice Cube */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Pips on all faces */}
      {faces.map(({ faceNumber, faceCenter, u, v }, i) => (
        <group key={i}>
          {pip2DPositions[faceNumber].map((pos, idx) => {
            const [px, py] = pos;
            const position = mapPipTo3D(px, py, { faceCenter, u, v });
            return <Pip key={idx} position={position} />;
          })}
        </group>
      ))}
    </group>
  );
}

export default function Dice3D({ rolling, result }: { rolling: boolean; result: number }) {
  return (
    <Canvas style={{ width: 250, height: 250 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <RotatingDice rolling={rolling} result={result} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
