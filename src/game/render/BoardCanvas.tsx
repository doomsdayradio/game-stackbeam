import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { OrthographicCamera } from 'three';
import { MathUtils } from 'three';
import { BoardScene } from './BoardScene';
import { TOP_DOWN_CAMERA_HALF_EXTENT } from './rendering';

const CAMERA_HEIGHT = 24;
const CAMERA_BASE_Z = 0.01;
const CAMERA_DRAG_SPEED = 0.085;
const CAMERA_MAX_OFFSET = 8;
const CAMERA_SNAP_DAMPING = 14;

function TopDownCamera() {
  const camera = useThree((state) => state.camera as OrthographicCamera);
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const currentOffsetRef = useRef({ x: 0, z: 0 });
  const targetOffsetRef = useRef({ x: 0, z: 0 });
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetZ: 0,
  });

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const baseHalfExtent = TOP_DOWN_CAMERA_HALF_EXTENT;
    const halfHeight = aspect >= 1 ? baseHalfExtent : baseHalfExtent / aspect;
    const halfWidth = halfHeight * aspect;

    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.near = 0.1;
    camera.far = 100;
    camera.position.set(0, CAMERA_HEIGHT, CAMERA_BASE_Z);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  useEffect(() => {
    const domElement = gl.domElement;

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      dragStateRef.current.active = true;
      dragStateRef.current.startX = event.clientX;
      dragStateRef.current.startY = event.clientY;
      dragStateRef.current.startOffsetX = targetOffsetRef.current.x;
      dragStateRef.current.startOffsetZ = targetOffsetRef.current.z;
      domElement.style.cursor = 'grabbing';
    }

    function onPointerMove(event: PointerEvent) {
      if (!dragStateRef.current.active) {
        return;
      }

      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      const nextOffsetX = MathUtils.clamp(
        dragStateRef.current.startOffsetX - deltaX * CAMERA_DRAG_SPEED,
        -CAMERA_MAX_OFFSET,
        CAMERA_MAX_OFFSET,
      );
      const nextOffsetZ = MathUtils.clamp(
        dragStateRef.current.startOffsetZ + deltaY * CAMERA_DRAG_SPEED,
        -CAMERA_MAX_OFFSET,
        CAMERA_MAX_OFFSET,
      );

      targetOffsetRef.current.x = nextOffsetX;
      targetOffsetRef.current.z = nextOffsetZ;
    }

    function releaseDrag() {
      if (!dragStateRef.current.active) {
        return;
      }

      dragStateRef.current.active = false;
      targetOffsetRef.current.x = 0;
      targetOffsetRef.current.z = 0;
      currentOffsetRef.current.x = 0;
      currentOffsetRef.current.z = 0;
      camera.position.set(0, CAMERA_HEIGHT, CAMERA_BASE_Z);
      camera.up.set(0, 0, -1);
      camera.lookAt(0, 0, 0);
      domElement.style.cursor = '';
    }

    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', releaseDrag);
    window.addEventListener('pointercancel', releaseDrag);

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', releaseDrag);
      window.removeEventListener('pointercancel', releaseDrag);
      domElement.style.cursor = '';
    };
  }, [gl]);

  useFrame((_, delta) => {
    currentOffsetRef.current.x = MathUtils.damp(
      currentOffsetRef.current.x,
      targetOffsetRef.current.x,
      CAMERA_SNAP_DAMPING,
      delta,
    );
    currentOffsetRef.current.z = MathUtils.damp(
      currentOffsetRef.current.z,
      targetOffsetRef.current.z,
      CAMERA_SNAP_DAMPING,
      delta,
    );

    camera.position.set(
      currentOffsetRef.current.x,
      CAMERA_HEIGHT,
      CAMERA_BASE_Z + currentOffsetRef.current.z,
    );
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function BoardCanvas() {
  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      shadows="percentage"
      camera={{ zoom: 1 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#050813']} />
      <fog attach="fog" args={['#050813', 18, 34]} />
      <TopDownCamera />
      <BoardScene />
      <EffectComposer multisampling={4}>
        <Bloom
          intensity={1.45}
          luminanceThreshold={0.14}
          luminanceSmoothing={0.24}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
