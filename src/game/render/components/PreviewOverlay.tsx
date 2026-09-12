import { RoundedBox } from '@react-three/drei';
import type { PreviewState } from '../../core/types';
import { VISUAL_PALETTE, gridToWorld } from '../rendering';
import { BeamPath } from './BeamPath';

interface PreviewOverlayProps {
  preview: PreviewState;
  gridSize: number;
}

export function PreviewOverlay({ preview, gridSize }: PreviewOverlayProps) {
  return (
    <>
      {preview.shot?.canFire ? (
        <BeamPath
          shot={{
            path: preview.shot.path,
            color: preview.shot.color,
            intersections: preview.shot.intersections,
          }}
          gridSize={gridSize}
          opacityScale={preview.shot.canFire ? 0.5 : 0.24}
        />
      ) : null}

      {preview.shot?.canFire && preview.shot.blockedBy ? (
        <RoundedBox
          args={[0.62, 0.18, 0.62]}
          radius={0.08}
          smoothness={4}
          position={[
            gridToWorld(preview.shot.blockedBy, gridSize)[0],
            0.56,
            gridToWorld(preview.shot.blockedBy, gridSize)[2],
          ]}
        >
          <meshBasicMaterial
            color={preview.shot.canFire ? VISUAL_PALETTE.preview : VISUAL_PALETTE.danger}
            transparent
            opacity={0.55}
          />
        </RoundedBox>
      ) : null}
    </>
  );
}
