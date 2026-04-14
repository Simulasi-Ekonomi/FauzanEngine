import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls, GizmoHelper, GizmoViewport, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useEditorStore } from '../../stores/editorStore';

function SceneActor({ actor }: { actor: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const selectedActorId = useEditorStore((s) => s.selectedActorId);
  const selectActor = useEditorStore((s) => s.selectActor);
  const isSelected = selectedActorId === actor.id;

  const geometryMap: Record<string, JSX.Element> = {
    cube: <boxGeometry args={[1, 1, 1]} />,
    sphere: <sphereGeometry args={[0.5, 32, 32]} />,
    plane: <planeGeometry args={[1, 1]} />,
    cylinder: <cylinderGeometry args={[0.5, 0.5, 1, 32]} />,
  };

  if (actor.type === 'light_directional') {
    return (
      <group position={[actor.transform.position.x, actor.transform.position.y, actor.transform.position.z]}>
        <directionalLight
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        {isSelected && (
          <mesh onClick={(e) => { e.stopPropagation(); selectActor(actor.id); }}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#ffaa00" wireframe />
          </mesh>
        )}
      </group>
    );
  }

  if (actor.type === 'light_point') {
    return (
      <group position={[actor.transform.position.x, actor.transform.position.y, actor.transform.position.z]}>
        <pointLight intensity={2} distance={20} castShadow />
        <mesh onClick={(e) => { e.stopPropagation(); selectActor(actor.id); }}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={isSelected ? '#ffcc00' : '#ffaa00'} />
        </mesh>
      </group>
    );
  }

  if (actor.type === 'camera') {
    return (
      <group position={[actor.transform.position.x, actor.transform.position.y, actor.transform.position.z]}>
        <mesh onClick={(e) => { e.stopPropagation(); selectActor(actor.id); }}>
          <boxGeometry args={[0.3, 0.2, 0.4]} />
          <meshBasicMaterial color={isSelected ? '#00aaff' : '#555'} wireframe={!isSelected} />
        </mesh>
      </group>
    );
  }

  if (actor.type === 'player_start') {
    return (
      <group position={[actor.transform.position.x, actor.transform.position.y, actor.transform.position.z]}>
        <mesh onClick={(e) => { e.stopPropagation(); selectActor(actor.id); }}>
          <cylinderGeometry args={[0.05, 0.3, 1.5, 8]} />
          <meshBasicMaterial color={isSelected ? '#00ff88' : '#22aa55'} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color={isSelected ? '#00ff88' : '#22aa55'} />
        </mesh>
      </group>
    );
  }

  const geometry = geometryMap[actor.type];
  if (!geometry) return null;

  const rotation: [number, number, number] = actor.type === 'plane'
    ? [-Math.PI / 2, 0, 0]
    : [
        (actor.transform.rotation.x * Math.PI) / 180,
        (actor.transform.rotation.y * Math.PI) / 180,
        (actor.transform.rotation.z * Math.PI) / 180,
      ];

  return (
    <mesh
      ref={meshRef}
      position={[actor.transform.position.x, actor.transform.position.y, actor.transform.position.z]}
      rotation={rotation}
      scale={[actor.transform.scale.x, actor.transform.scale.y, actor.transform.scale.z]}
      onClick={(e) => { e.stopPropagation(); selectActor(actor.id); }}
      castShadow
      receiveShadow
    >
      {geometry}
      <meshStandardMaterial
        color={isSelected ? '#4488cc' : '#666666'}
        roughness={0.6}
        metalness={0.2}
      />
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[geometryMap[actor.type]?.props ? new THREE.BoxGeometry(1, 1, 1) : undefined]} />
          <lineBasicMaterial color="#ff8800" />
        </lineSegments>
      )}
    </mesh>
  );
}

function FPSCounter() {
  const setFps = useEditorStore((s) => s.setFps);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    if (now - lastTime.current >= 1000) {
      setFps(frameCount.current);
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return null;
}

function SceneContent() {
  const actors = useEditorStore((s) => s.actors);
  const selectedActorId = useEditorStore((s) => s.selectedActorId);
  const selectActor = useEditorStore((s) => s.selectActor);
  const gridVisible = useEditorStore((s) => s.gridVisible);
  const transformMode = useEditorStore((s) => s.transformMode);
  const updateActorTransform = useEditorStore((s) => s.updateActorTransform);
  const selectedActor = selectedActorId ? actors[selectedActorId] : null;
  const transformRef = useRef<any>(null);

  return (
    <>
      <ambientLight intensity={0.3} />
      <FPSCounter />

      {gridVisible && (
        <Grid
          args={[100, 100]}
          position={[0, -0.01, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#333333"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#444444"
          fadeDistance={80}
          infiniteGrid
        />
      )}

      {Object.values(actors).map((actor) => (
        <SceneActor key={actor.id} actor={actor} />
      ))}

      <mesh
        visible={false}
        onClick={(e) => {
          if (e.intersections.length <= 1) {
            selectActor(null);
          }
        }}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
}

export function Viewport() {
  const fps = useEditorStore((s) => s.fps);
  const actors = useEditorStore((s) => s.actors);
  const viewMode = useEditorStore((s) => s.viewMode);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const transformMode = useEditorStore((s) => s.transformMode);

  const actorCount = Object.keys(actors).length;

  return (
    <div className="neo-panel" style={{ height: '100%', position: 'relative' }}>
      <div className="neo-tabs">
        <div className="neo-tab active">Viewport</div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          shadows
          camera={{ position: [8, 6, 10], fov: 60, near: 0.1, far: 5000 }}
          style={{ background: '#1e1e2e' }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#1a1a2e']} />
          <fog attach="fog" args={['#1a1a2e', 50, 150]} />
          <SceneContent />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.1}
            minDistance={1}
            maxDistance={200}
          />
          <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
            <GizmoViewport labelColor="white" axisHeadScale={0.8} />
          </GizmoHelper>
        </Canvas>

        {/* Viewport Overlay */}
        <div className="viewport-overlay">
          <div className="viewport-stats">
            <div>FPS: {fps}</div>
            <div>Actors: {actorCount}</div>
            <div>Mode: {transformMode}</div>
            <div>View: {viewMode}</div>
          </div>
          <div className="viewport-mode">
            {isPlaying ? '▶ PLAYING' : 'EDITOR'}
          </div>
        </div>
      </div>
    </div>
  );
}
