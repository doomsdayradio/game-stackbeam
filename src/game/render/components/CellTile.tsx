import { RoundedBox } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { BlockPreview, Cell, Side } from '../../core/types';
import {
  CELL_SIZE,
  TILE_HEIGHT,
  VISUAL_PALETTE,
  getBeamVisualColor,
  getCellVisuals,
  getSideBeamColor,
} from '../rendering';

interface CellTileProps {
  cell: Cell;
  worldPosition: readonly [number, number, number];
  preview: BlockPreview | null;
  onHover: () => void;
  onBlur: () => void;
  onClick: () => void;
}

export function CellTile({ cell, worldPosition, preview, onHover, onBlur, onClick }: CellTileProps) {
  const visuals = getCellVisuals(cell.color);
  const previewTint = preview
    ? preview.canPlace
      ? VISUAL_PALETTE.preview
      : VISUAL_PALETTE.danger
    : null;

  function stopEvent(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
  }

  const previewOpacity = preview?.canPlace ? 0.45 : 0.35;
  const sourceMarkers = cell.beamSources.map((side) => createSourceMarker(side));

  return (
    <group position={worldPosition}>
      <RoundedBox
        args={[CELL_SIZE, TILE_HEIGHT, CELL_SIZE]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
        onPointerOver={(event) => {
          stopEvent(event);
          onHover();
        }}
        onPointerOut={(event) => {
          stopEvent(event);
          onBlur();
        }}
        onClick={(event) => {
          stopEvent(event);
          onClick();
        }}
      >
        <meshStandardMaterial
          color={visuals.surface}
          emissive={visuals.emissive}
          emissiveIntensity={visuals.intensity}
          metalness={0.42}
          roughness={0.36}
        />
      </RoundedBox>

      {sourceMarkers.map((marker) => (
        <mesh
          key={marker.side}
          position={[marker.position[0], TILE_HEIGHT * 0.62, marker.position[2]]}
          rotation={[-Math.PI / 2, 0, marker.rotation]}
        >
          <planeGeometry args={marker.size} />
          <meshBasicMaterial
            color={getBeamVisualColor(getSideBeamColor(marker.side))}
            transparent
            opacity={0.12}
            toneMapped={false}
          />
        </mesh>
      ))}

      {previewTint ? (
        <RoundedBox
          args={[CELL_SIZE * 0.92, 0.035, CELL_SIZE * 0.92]}
          position={[0, TILE_HEIGHT * 0.7, 0]}
          radius={0.08}
          smoothness={4}
        >
          <meshBasicMaterial
            color={previewTint}
            transparent
            opacity={previewOpacity}
          />
        </RoundedBox>
      ) : null}
    </group>
  );
}

function createSourceMarker(side: Side) {
  const inset = CELL_SIZE * 0.24;
  const inward = CELL_SIZE * 0.14;
  const short = CELL_SIZE * 0.14;
  const long = CELL_SIZE * 0.42;

  switch (side) {
    case 'top':
      return {
        side,
        position: [0, 0, -inset] as const,
        size: [short, long] as const,
        rotation: 0,
      };
    case 'bottom':
      return {
        side,
        position: [0, 0, inset] as const,
        size: [short, long] as const,
        rotation: Math.PI,
      };
    case 'left':
      return {
        side,
        position: [-inset, 0, 0] as const,
        size: [short, long] as const,
        rotation: Math.PI / 2,
      };
    case 'right':
      return {
        side,
        position: [inset, 0, 0] as const,
        size: [short, long] as const,
        rotation: -Math.PI / 2,
      };
  }
}
