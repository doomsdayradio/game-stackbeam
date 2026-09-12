import type { BeamColor, BeamVisualColor, CellColor, Side } from './types';

export function getBeamColorForSide(side: Side): BeamColor {
  return side === 'top' || side === 'bottom' ? 'cyan' : 'magenta';
}

export function blendBeamVisualColor(
  current: BeamVisualColor,
  encountered: BeamVisualColor | CellColor,
): BeamVisualColor {
  if (encountered === 'empty') {
    return current;
  }

  if (current === 'white' || encountered === 'white') {
    return 'white';
  }

  if (current === encountered) {
    return current;
  }

  if (current === 'mix' || encountered === 'mix') {
    return 'white';
  }

  return 'mix';
}

export function blendCellColor(current: CellColor, incoming: BeamVisualColor): CellColor {
  if (current === 'empty') {
    return incoming;
  }

  return blendBeamVisualColor(current, incoming);
}
