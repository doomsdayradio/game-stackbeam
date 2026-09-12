import { RoundedBox } from '@react-three/drei';
import type { Block } from '../../core/types';
import { BLOCK_HEIGHT, CELL_SIZE, getBlockVisuals } from '../rendering';

interface BlockMeshProps {
  block: Block;
  worldPosition: readonly [number, number, number];
}

export function BlockMesh({ block, worldPosition }: BlockMeshProps) {
  const visuals = getBlockVisuals(block.owner);

  return (
    <group position={worldPosition}>
      <RoundedBox
        args={[CELL_SIZE * 0.72, BLOCK_HEIGHT, CELL_SIZE * 0.72]}
        radius={0.09}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color={visuals.body}
          emissive={visuals.emissive}
          emissiveIntensity={block.owner === 'fixed' ? 0.25 : 0.4}
          metalness={0.56}
          roughness={0.24}
        />
      </RoundedBox>
      <RoundedBox
        args={[CELL_SIZE * 0.45, 0.12, CELL_SIZE * 0.45]}
        radius={0.05}
        smoothness={4}
        position={[0, BLOCK_HEIGHT * 0.32, 0]}
      >
        <meshBasicMaterial color={visuals.emissive} transparent opacity={0.6} />
      </RoundedBox>
    </group>
  );
}
