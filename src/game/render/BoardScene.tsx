import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import { useGameStore } from '../state/store';
import { BeamPath } from './components/BeamPath';
import { BlockMesh } from './components/BlockMesh';
import { CellTile } from './components/CellTile';
import { EdgeNode } from './components/EdgeNode';
import { PreviewOverlay } from './components/PreviewOverlay';
import { CELL_SPACING, TILE_HEIGHT, VISUAL_PALETTE, gridToWorld } from './rendering';

export function BoardScene() {
  const grid = useGameStore((state) => state.runtime.grid);
  const shots = useGameStore((state) => state.runtime.shots);
  const usedEdges = useGameStore((state) => state.runtime.usedEdges);
  const preview = useGameStore((state) => state.preview);
  const placeBlock = useGameStore((state) => state.placeBlock);
  const fireEdge = useGameStore((state) => state.fireEdge);
  const setHoveredCell = useGameStore((state) => state.setHoveredCell);
  const setHoveredEdge = useGameStore((state) => state.setHoveredEdge);
  const clearPreview = useGameStore((state) => state.clearPreview);

  const gridSize = grid.length;
  const boardExtent = ((gridSize - 1) * CELL_SPACING) / 2 + 0.72;

  const edgeNodes = useMemo(() => {
    const nodes = [];

    for (let index = 0; index < gridSize; index += 1) {
      nodes.push({ side: 'top' as const, index });
      nodes.push({ side: 'right' as const, index });
      nodes.push({ side: 'bottom' as const, index });
      nodes.push({ side: 'left' as const, index });
    }

    return nodes;
  }, [gridSize]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        castShadow
        intensity={1.4}
        position={[8, 15, 9]}
        color="#d5edff"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-6, 5, -6]} intensity={12} distance={24} color="#2cdcff" />
      <pointLight position={[7, 4, 6]} intensity={10} distance={20} color="#ff4ec4" />

      <RoundedBox
        args={[boardExtent * 2, 0.28, boardExtent * 2]}
        position={[0, -0.26, 0]}
        radius={0.24}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial
          color={VISUAL_PALETTE.boardBase}
          emissive={VISUAL_PALETTE.boardGlow}
          emissiveIntensity={0.25}
          metalness={0.45}
          roughness={0.42}
        />
      </RoundedBox>

      {grid.flatMap((row, y) =>
        row.map((cell, x) => {
          const position = { x, y };
          const [worldX, , worldZ] = gridToWorld(position, gridSize);
          const cellPreview =
            preview.block &&
            preview.block.position.x === x &&
            preview.block.position.y === y
              ? preview.block
              : null;

          return (
            <group key={`${x}-${y}`}>
              <CellTile
                cell={cell}
                worldPosition={[worldX, 0, worldZ]}
                preview={cellPreview}
                onHover={() => setHoveredCell(position)}
                onBlur={clearPreview}
                onClick={() => placeBlock(position)}
              />
              {cell.block ? (
                <BlockMesh block={cell.block} worldPosition={[worldX, TILE_HEIGHT / 2, worldZ]} />
              ) : null}
            </group>
          );
        }),
      )}

      {shots.map((shot, index) => (
        <BeamPath key={`${shot.edge.side}-${shot.edge.index}-${index}`} shot={shot} gridSize={gridSize} />
      ))}

      <PreviewOverlay preview={preview} gridSize={gridSize} />

      {edgeNodes.map((edge) => {
        const isHovered =
          preview.hoveredEdge?.side === edge.side && preview.hoveredEdge?.index === edge.index;

        return (
          <EdgeNode
            key={`${edge.side}-${edge.index}`}
            edge={edge}
            gridSize={gridSize}
            used={usedEdges.includes(`${edge.side}:${edge.index}`)}
            hovered={isHovered}
            blocked={Boolean(isHovered && preview.shot && !preview.shot.canFire)}
            onHover={() => setHoveredEdge(edge)}
            onBlur={clearPreview}
            onClick={() => fireEdge(edge)}
          />
        );
      })}
    </>
  );
}
