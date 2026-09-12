import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Mesh } from 'three';
import type { BeamIntersection, BeamVisualColor, ShotResult } from '../../core/types';
import { CELL_SPACING, getBeamEnergyColor, gridToWorld } from '../rendering';

interface BeamPathProps {
  shot: Pick<ShotResult, 'path' | 'color' | 'intersections'>;
  gridSize: number;
  opacityScale?: number;
}

function getBeamGeometry(
  path: ShotResult['path'],
  color: BeamVisualColor,
  gridSize: number,
): {
  center: [number, number, number];
  rotation: [number, number, number];
  coreRadius: number;
  glowRadius: number;
  coreLength: number;
  glowLength: number;
  start: [number, number, number];
  end: [number, number, number];
  colorHex: string;
} | null {
  if (path.length === 0) {
    return null;
  }

  const first = gridToWorld(path[0]!, gridSize);
  const last = gridToWorld(path[path.length - 1]!, gridSize);
  const colorHex = getBeamEnergyColor(color);
  const isVertical = path.length === 1 ? true : path[0]!.x === path[path.length - 1]!.x;
  const center: [number, number, number] = [
    (first[0] + last[0]) / 2,
    0.42,
    (first[2] + last[2]) / 2,
  ];
  const totalLength =
    path.length === 1 ? CELL_SPACING * 0.72 : CELL_SPACING * (path.length - 1) + 0.76;
  const coreRadius = 0.09;
  const glowRadius = 0.23;
  const coreLength = Math.max(totalLength - coreRadius * 2, 0.001);
  const glowLength = Math.max(totalLength + 0.18 - glowRadius * 2, 0.001);
  const rotation: [number, number, number] = isVertical
    ? [Math.PI / 2, 0, 0]
    : [0, 0, Math.PI / 2];

  return {
    center,
    rotation,
    coreRadius,
    glowRadius,
    coreLength,
    glowLength,
    start: [first[0], 0.45, first[2]],
    end: [last[0], 0.45, last[2]],
    colorHex,
  };
}

function BeamSegment({
  path,
  color,
  gridSize,
  opacityScale,
}: {
  path: ShotResult['path'];
  color: BeamVisualColor;
  gridSize: number;
  opacityScale: number;
}) {
  const coreRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const geometry = useMemo(() => getBeamGeometry(path, color, gridSize), [color, gridSize, path]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const pulse = 0.82 + Math.sin(time * 3.4) * 0.18;

    if (coreRef.current?.material instanceof THREE.MeshBasicMaterial) {
      coreRef.current.material.opacity = (0.72 + pulse * 0.16) * opacityScale;
    }

    if (glowRef.current?.material instanceof THREE.MeshBasicMaterial) {
      glowRef.current.material.opacity = (0.18 + pulse * 0.14) * opacityScale;
    }
  });

  if (!geometry) {
    return null;
  }

  return (
    <>
      <mesh ref={glowRef} position={geometry.center} rotation={geometry.rotation}>
        <capsuleGeometry args={[geometry.glowRadius, geometry.glowLength, 10, 18]} />
        <meshBasicMaterial color={geometry.colorHex} transparent opacity={0.24 * opacityScale} />
      </mesh>
      <mesh ref={coreRef} position={geometry.center} rotation={geometry.rotation}>
        <capsuleGeometry args={[geometry.coreRadius, geometry.coreLength, 8, 18]} />
        <meshBasicMaterial color={geometry.colorHex} transparent opacity={0.82 * opacityScale} />
      </mesh>
    </>
  );
}

function getAnimatedBeamColor(
  baseColor: BeamVisualColor,
  transitions: Array<{ threshold: number; outgoingColor: BeamVisualColor }>,
  flow: number,
): BeamVisualColor {
  let color = baseColor;

  for (const transition of transitions) {
    if (flow < transition.threshold) {
      break;
    }

    if (flow < Math.min(transition.threshold + 0.04, 1)) {
      return 'white';
    }

    color = transition.outgoingColor;
  }

  return color;
}

export function BeamPath({ shot, gridSize, opacityScale = 1 }: BeamPathProps) {
  const sparkRef = useRef<Mesh>(null);
  const pulseRefs = useRef<Mesh[]>([]);
  const fullGeometry = useMemo(() => getBeamGeometry(shot.path, shot.color, gridSize), [gridSize, shot.color, shot.path]);
  const renderSegments = useMemo(() => {
    const segments: Array<{
      path: ShotResult['path'];
      color: BeamVisualColor;
    }> = [];
    let segmentStartIndex = 0;
    let segmentColor: BeamVisualColor = shot.color;

    for (const intersection of shot.intersections) {
      const segmentPath = shot.path.slice(segmentStartIndex, intersection.pathIndex);

      if (segmentPath.length > 0) {
        segments.push({
          path: segmentPath,
          color: segmentColor,
        });
      }

      segmentStartIndex = intersection.pathIndex + 1;
      segmentColor = intersection.outgoingColor;
    }

    const finalSegmentPath = shot.path.slice(segmentStartIndex);

    if (finalSegmentPath.length > 0) {
      segments.push({
        path: finalSegmentPath,
        color: segmentColor,
      });
    }

    return segments;
  }, [shot.color, shot.intersections, shot.path]);
  const sparkTransitions = useMemo(
    () =>
      shot.path.length <= 1
        ? []
        : shot.intersections.map((intersection) => ({
            threshold: intersection.pathIndex / (shot.path.length - 1),
            outgoingColor: intersection.outgoingColor,
          })),
    [shot.intersections, shot.path.length],
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const flow = (time * 0.42) % 1;

    if (sparkRef.current && fullGeometry) {
      sparkRef.current.position.lerpVectors(
        new THREE.Vector3(...fullGeometry.start),
        new THREE.Vector3(...fullGeometry.end),
        flow,
      );

      if (sparkRef.current.material instanceof THREE.MeshBasicMaterial) {
        const sparkColor = getAnimatedBeamColor(shot.color, sparkTransitions, flow);
        sparkRef.current.material.color.set(getBeamEnergyColor(sparkColor));
        sparkRef.current.material.opacity = 0.88 * opacityScale;
      }
    }

    if (fullGeometry) {
      pulseRefs.current.forEach((pulse, index) => {
        if (!pulse) {
          return;
        }

        const localFlow = (flow + index * 0.22) % 1;
        pulse.position.lerpVectors(
          new THREE.Vector3(...fullGeometry.start),
          new THREE.Vector3(...fullGeometry.end),
          localFlow,
        );

        const pulseColor = getAnimatedBeamColor(shot.color, sparkTransitions, localFlow);

        if (pulse.material instanceof THREE.MeshBasicMaterial) {
          pulse.material.color.set(getBeamEnergyColor(pulseColor));
          pulse.material.opacity = (0.28 - index * 0.06) * opacityScale;
        }

        const stretch = 1 + Math.sin((time + index * 0.7) * 5.2) * 0.18;
        pulse.scale.setScalar(stretch);
        pulse.scale.y = 0.7 + index * 0.08;
        pulse.scale.z = 0.7 + index * 0.08;
        pulse.scale.x = 1.15 + index * 0.12;
      });
    }
  });

  if (!fullGeometry) {
    return null;
  }

  return (
    <group>
      {renderSegments.map((segment, index) => (
        <BeamSegment
          key={`segment-${index}`}
          path={segment.path}
          color={segment.color}
          gridSize={gridSize}
          opacityScale={opacityScale}
        />
      ))}
      {shot.intersections.map((intersection: BeamIntersection, index) => (
        <mesh
          key={`intersection-${index}`}
          position={[
            gridToWorld(intersection.position, gridSize)[0],
            0.46,
            gridToWorld(intersection.position, gridSize)[2],
          ]}
        >
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.95 * opacityScale} />
        </mesh>
      ))}
      {[0, 1, 2].map((index) => (
        <mesh
          key={`pulse-${index}`}
          ref={(instance) => {
            if (instance) {
              pulseRefs.current[index] = instance;
            }
          }}
          position={fullGeometry.start}
          rotation={fullGeometry.rotation}
        >
          <capsuleGeometry args={[0.07 + index * 0.012, 0.18 + index * 0.04, 8, 16]} />
          <meshBasicMaterial
            color={getBeamEnergyColor(shot.color)}
            transparent
            opacity={(0.28 - index * 0.06) * opacityScale}
          />
        </mesh>
      ))}
      <mesh ref={sparkRef} position={fullGeometry.start}>
        <sphereGeometry args={[0.15, 18, 18]} />
        <meshBasicMaterial
          color={getBeamEnergyColor(shot.color)}
          transparent
          opacity={0.92 * opacityScale}
        />
      </mesh>
    </group>
  );
}
