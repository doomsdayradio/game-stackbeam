import type { Side, Level } from '../game/core/types';

export type Language = 'en' | 'de';

type TranslationKey =
  | 'language.label'
  | 'language.en'
  | 'language.de'
  | 'difficulty.label'
  | 'blocks.label'
  | 'controls.undo'
  | 'controls.reset'
  | 'controls.help'
  | 'controls.solution'
  | 'controls.music'
  | 'controls.target'
  | 'controls.nextPuzzle'
  | 'controls.backToGames'
  | 'controls.loreStack'
  | 'controls.play'
  | 'controls.pause'
  | 'controls.targetWithState'
  | 'state.on'
  | 'state.off'
  | 'music.noTracks'
  | 'music.noList'
  | 'help.dialogAria'
  | 'help.title'
  | 'help.close'
  | 'help.rule.1'
  | 'help.rule.2'
  | 'help.rule.3'
  | 'help.rule.4'
  | 'help.rule.5'
  | 'help.color.title'
  | 'help.color.source.cyan'
  | 'help.color.source.magenta'
  | 'help.color.rule.empty'
  | 'help.color.rule.same'
  | 'help.color.rule.mix'
  | 'help.color.rule.white'
  | 'help.color.rule.lockWhite'
  | 'help.color.note'
  | 'help.canonicalTitle'
  | 'help.validationOk'
  | 'help.validationFailed'
  | 'help.hint'
  | 'help.showSolution'
  | 'help.hideSolution'
  | 'help.step'
  | 'help.hint.default'
  | 'help.hint.solved'
  | 'help.hint.missing'
  | 'help.hint.diverged'
  | 'help.hint.none'
  | 'help.notationLabel'
  | 'help.notationExplainTitle'
  | 'help.notationExplainIntro'
  | 'help.notationExplainEdge'
  | 'help.notationExplainBlock'
  | 'help.notationExplainHex'
  | 'help.notationExplainExamples'
  | 'help.notationExplainDecodeTitle'
  | 'help.notationExplainDecode.1'
  | 'help.notationExplainDecode.2'
  | 'help.notationExplainDecode.3'
  | 'help.notationExplainDecode.4'
  | 'help.notationExplainExamplesTitle'
  | 'help.notationExplainExample.1'
  | 'help.notationExplainExample.2'
  | 'help.notationExplainExample.3'
  | 'win.dialogAria'
  | 'win.levelComplete'
  | 'win.youWin'
  | 'win.subtitle'
  | 'win.nextLevel'
  | 'win.restartAtLevel1'
  | 'win.replayLevel'
  | 'difficulty.easy'
  | 'difficulty.normal'
  | 'difficulty.hard'
  | 'difficulty.blocks'
  | 'action.placeBlock'
  | 'action.fireEdge'
  | 'side.top'
  | 'side.right'
  | 'side.bottom'
  | 'side.left'
  | 'message.outsideGrid'
  | 'message.noBlocksRemaining'
  | 'message.blockOccupied'
  | 'message.cellColored'
  | 'message.edgeUsed'
  | 'message.blockPlacementNotAllowed'
  | 'message.edgeCannotFireAgain'
  | 'message.nothingToUndo'
  | 'message.levelNoCanonical'
  | 'message.solutionRejected'
  | 'message.solutionDidNotMatch';

type TranslationDictionary = Record<TranslationKey, string>;

const translations: Record<Language, TranslationDictionary> = {
  en: {
    'language.label': 'Language',
    'language.en': 'English',
    'language.de': 'Deutsch',
    'difficulty.label': 'Difficulty',
    'blocks.label': 'Blocks',
    'controls.undo': 'Undo',
    'controls.reset': 'Reset',
    'controls.help': 'Rules',
    'controls.solution': 'Solution',
    'controls.music': 'Music',
    'controls.target': 'Target',
    'controls.nextPuzzle': 'Next Puzzle',
    'controls.backToGames': 'Back to Games',
    'controls.loreStack': 'Stack Lore',
    'controls.play': 'Play',
    'controls.pause': 'Pause',
    'controls.targetWithState': 'Target ({state})',
    'state.on': 'On',
    'state.off': 'Off',
    'music.noTracks': 'No tracks',
    'music.noList': 'No music list found',
    'help.dialogAria': 'Game rules',
    'help.title': 'Rules',
    'help.close': 'Close',
    'help.rule.1': 'Build the color image on the 16x16 board exactly like the target image.',
    'help.rule.2': 'Top and bottom fire Cyan, left and right fire Magenta.',
    'help.rule.3': 'Beams travel straight and stop before the first block.',
    'help.rule.4': 'If Cyan and Magenta meet on the same cell, the result becomes Mix.',
    'help.rule.5': 'If a Mix beam later meets Cyan or Magenta, the remaining beam path becomes White.',    
    'help.color.title': 'Color Rules (Visual Guide)',
    'help.color.source.cyan': 'Top/Bottom edges fire Cyan',
    'help.color.source.magenta': 'Left/Right edges fire Magenta',
    'help.color.rule.empty': '+= Empty cell + first beam = beam color',
    'help.color.rule.same': '+= Same color + same color = same color',
    'help.color.rule.mix': '+= Cyan + Magenta = Mix',
    'help.color.rule.white': '+= Mix + Cyan/Magenta = White',
    'help.color.rule.lockWhite': '+= White + any color = White',
    'help.color.note':
      'Important: beam color can change while traveling through intersections. Each crossed cell stores the current beam color at that moment.',
    'help.canonicalTitle': 'Verified Canonical Solution',
    'help.validationOk': 'Validated against the core rules with {steps} canonical steps.',
    'help.validationFailed': 'Validation failed.',
    'help.hint': 'Solution',
    'help.showSolution': 'Show Solution',
    'help.hideSolution': 'Hide Solution',
    'help.step': 'Step {step}:',
    'help.hint.default': 'Reveal the next recommended move for the verified canonical path.',
    'help.hint.solved': 'This board is already solved.',
    'help.hint.missing': 'No canonical hint data is available for this level.',
    'help.hint.diverged':
      'Your current attempt diverges from the verified solution path. Use Undo/Reset or open the full solution.',
    'help.hint.none': 'No further hint step is available.',
    'help.notationLabel': 'Canonical notation',
    'help.notationExplainTitle': 'Notation Explained',
    'help.notationExplainIntro': 'Each token in the canonical solution represents exactly one move.',
    'help.notationExplainEdge':
      'T/B/L/R + hex slot fires an edge node: T=top, B=bottom, L=left, R=right.',
    'help.notationExplainBlock':
      'X + hex XY places a player block: first hex digit = X (column), second hex digit = Y (row).',
    'help.notationExplainHex':
      'Hex means 0-9 and A-F (10-15). On a 16x16 board, slots and coordinates are encoded from 0 to F.',
    'help.notationExplainExamples':
      'Examples: T4 (top, slot 4), RA (right, slot A), X6A (block at column 6, row A).',
    'help.notationExplainDecodeTitle': 'How to Read a Token',
    'help.notationExplainDecode.1': 'Start with the first character: T/B/L/R means edge shot, X means block placement.',
    'help.notationExplainDecode.2': 'For edge shots: the remaining characters are the slot index in hex (for example A = 10).',
    'help.notationExplainDecode.3': 'For blocks: the two following hex digits are XY coordinates (X = column, Y = row).',
    'help.notationExplainDecode.4':
      'Read tokens from left to right. The sequence is the exact canonical move order used for validation.',
    'help.notationExplainExamplesTitle': 'Decoded Examples',
    'help.notationExplainExample.1': 'T4 -> fire top edge slot 4',
    'help.notationExplainExample.2': 'RA -> fire right edge slot A (decimal 10)',
    'help.notationExplainExample.3': 'X6A -> place block at column 6, row A (decimal 10)',
    'win.dialogAria': 'Level complete',
    'win.levelComplete': 'Level Complete',
    'win.youWin': 'YOU WIN',
    'win.subtitle': 'Target matched exactly. Choose your next move.',
    'win.nextLevel': 'Next Level: {title}',
    'win.restartAtLevel1': 'Restart At Level 1',
    'win.replayLevel': 'Replay Level',
    'difficulty.easy': 'Easy',
    'difficulty.normal': 'Normal',
    'difficulty.hard': 'Hard',
    'difficulty.blocks': 'blocks',
    'action.placeBlock': 'Place a player block at column {x}, row {y}.',
    'action.fireEdge': 'Fire the {side} edge at slot {index}.',
    'side.top': 'Top',
    'side.right': 'Right',
    'side.bottom': 'Bottom',
    'side.left': 'Left',
    'message.outsideGrid': 'Outside of the playable grid.',
    'message.noBlocksRemaining': 'No player blocks remaining.',
    'message.blockOccupied': 'A block already occupies this cell.',
    'message.cellColored': 'Colored cells can no longer receive blocks.',
    'message.edgeUsed': 'This edge node has already been used.',
    'message.blockPlacementNotAllowed': 'Block placement is not allowed.',
    'message.edgeCannotFireAgain': 'This edge node cannot fire again.',
    'message.nothingToUndo': 'Nothing to undo yet.',
    'message.levelNoCanonical': 'Level has no canonical solution metadata.',
    'message.solutionRejected': 'Solution action rejected: {reason}',
    'message.solutionDidNotMatch': 'Canonical solution did not reach the target image.',
  },
  de: {
    'language.label': 'Sprache',
    'language.en': 'English',
    'language.de': 'Deutsch',
    'difficulty.label': 'Schwierigkeit',
    'blocks.label': 'Blöcke',
    'controls.undo': 'Rückgängig',
    'controls.reset': 'Zurücksetzen',
    'controls.help': 'Regeln',
    'controls.solution': 'Lösung',
    'controls.music': 'Musik',
    'controls.target': 'Ziel',
    'controls.nextPuzzle': 'Nächstes Rätsel',
    'controls.backToGames': 'Zurück zu den Spielen',
    'controls.loreStack': 'Zum Stack (Lore)',
    'controls.play': 'Play',
    'controls.pause': 'Pause',
    'controls.targetWithState': 'Ziel ({state})',
    'state.on': 'An',
    'state.off': 'Aus',
    'music.noTracks': 'Keine Tracks',
    'music.noList': 'Keine Musikliste gefunden',
    'help.dialogAria': 'Spielregeln',
    'help.title': 'Spielregeln',
    'help.close': 'Schließen',
    'help.rule.1': 'Baue das Farbbild auf dem 16x16-Feld exakt so nach wie im Zielbild.',
    'help.rule.2': 'Oben und unten feuern Cyan, links und rechts feuern Magenta.',
    'help.rule.3': 'Strahlen laufen gerade und stoppen vor dem ersten Block.',
    'help.rule.4': 'Treffen Cyan und Magenta auf derselben Zelle zusammen, wird daraus Mix.',
    'help.rule.5': 'Trifft ein Mix-Strahl später auf Cyan oder Magenta, wird der restliche Strahlverlauf Weiß.',
    'help.color.title': 'Farblogik (mit Beispielen)',
    'help.color.source.cyan': 'Oben/Unten feuert Cyan',
    'help.color.source.magenta': 'Links/Rechts feuert Magenta',
    'help.color.rule.empty': '+= Leere Zelle + erster Strahl = Strahlfarbe',
    'help.color.rule.same': '+= Gleiche Farbe + gleiche Farbe = gleiche Farbe',
    'help.color.rule.mix': '+= Cyan + Magenta = Mix',
    'help.color.rule.white': '+= Mix + Cyan/Magenta = Weiß',
    'help.color.rule.lockWhite': '+= Weiß + beliebige Farbe = Weiß',
    'help.color.note':
      'Wichtig: Die Strahlfarbe kann sich entlang des Weges durch Kreuzungen ändern. Jede getroffene Zelle speichert die aktuell gemischte Strahlfarbe.',
    'help.canonicalTitle': 'Verifizierte kanonische Lösung',
    'help.validationOk': 'Mit den Core-Regeln verifiziert ({steps} kanonische Schritte).',
    'help.validationFailed': 'Validierung fehlgeschlagen.',
    'help.hint': 'Lösung',
    'help.showSolution': 'Lösung zeigen',
    'help.hideSolution': 'Lösung ausblenden',
    'help.step': 'Schritt {step}:',
    'help.hint.default': 'Zeigt den nächsten empfohlenen Zug auf dem verifizierten Lösungsweg.',
    'help.hint.solved': 'Dieses Feld ist bereits gelöst.',
    'help.hint.missing': 'Für dieses Level sind keine kanonischen Hinweisdaten vorhanden.',
    'help.hint.diverged':
      'Dein aktueller Versuch weicht vom verifizierten Lösungsweg ab. Nutze Rückgängig/Zurücksetzen oder öffne die komplette Lösung.',
    'help.hint.none': 'Kein weiterer Hinweis-Schritt verfügbar.',
    'help.notationLabel': 'Kanonische Notation',
    'help.notationExplainTitle': 'Notation erklärt',
    'help.notationExplainIntro': 'Jeder Eintrag in der kanonischen Lösung steht für genau einen Zug.',
    'help.notationExplainEdge':
      'T/B/L/R + Hex-Slot feuert einen Randpunkt: T=oben, B=unten, L=links, R=rechts.',
    'help.notationExplainBlock':
      'X + Hex-XY setzt einen Spieler-Block: erste Hex-Ziffer = X (Spalte), zweite Hex-Ziffer = Y (Zeile).',
    'help.notationExplainHex':
      'Hex bedeutet 0-9 und A-F (10-15). Auf dem 16x16-Feld sind Slots und Koordinaten daher von 0 bis F kodiert.',
    'help.notationExplainExamples':
      'Beispiele: T4 (oben, Slot 4), RA (rechts, Slot A), X6A (Block bei Spalte 6, Zeile A).',
    'help.notationExplainDecodeTitle': 'So liest du ein Token',
    'help.notationExplainDecode.1':
      'Starte mit dem ersten Zeichen: T/B/L/R bedeutet Randstrahl, X bedeutet Block platzieren.',
    'help.notationExplainDecode.2':
      'Bei Randstrahlen: die restlichen Zeichen sind der Slot-Index in Hex (z. B. A = 10).',
    'help.notationExplainDecode.3':
      'Bei Blöcken: die zwei folgenden Hex-Ziffern sind XY-Koordinaten (X = Spalte, Y = Zeile).',
    'help.notationExplainDecode.4':
      'Lies die Tokens von links nach rechts. Die Reihenfolge ist die exakte kanonische Zugfolge der Validierung.',
    'help.notationExplainExamplesTitle': 'Dekodierte Beispiele',
    'help.notationExplainExample.1': 'T4 -> oberen Rand, Slot 4 feuern',
    'help.notationExplainExample.2': 'RA -> rechten Rand, Slot A feuern (dezimal 10)',
    'help.notationExplainExample.3': 'X6A -> Block bei Spalte 6, Zeile A setzen (dezimal 10)',
    'win.dialogAria': 'Level abgeschlossen',
    'win.levelComplete': 'Level abgeschlossen',
    'win.youWin': 'DU HAST GEWONNEN',
    'win.subtitle': 'Zielbild exakt getroffen. Wähle deinen nächsten Schritt.',
    'win.nextLevel': 'Nächstes Level: {title}',
    'win.restartAtLevel1': 'Bei Level 1 neu starten',
    'win.replayLevel': 'Level erneut spielen',
    'difficulty.easy': 'Einfach',
    'difficulty.normal': 'Normal',
    'difficulty.hard': 'Schwer',
    'difficulty.blocks': 'Blöcke',
    'action.placeBlock': 'Setze einen Spieler-Block bei Spalte {x}, Zeile {y}.',
    'action.fireEdge': 'Feuere den {side}-Rand am Slot {index}.',
    'side.top': 'oberen',
    'side.right': 'rechten',
    'side.bottom': 'unteren',
    'side.left': 'linken',
    'message.outsideGrid': 'Außerhalb des Spielfelds.',
    'message.noBlocksRemaining': 'Keine Spieler-Blöcke mehr übrig.',
    'message.blockOccupied': 'Diese Zelle ist bereits von einem Block belegt.',
    'message.cellColored': 'Auf bereits gefärbte Zellen können keine Blöcke gesetzt werden.',
    'message.edgeUsed': 'Dieser Randpunkt wurde bereits verwendet.',
    'message.blockPlacementNotAllowed': 'Block kann hier nicht gesetzt werden.',
    'message.edgeCannotFireAgain': 'Dieser Randpunkt kann nicht erneut feuern.',
    'message.nothingToUndo': 'Noch kein Zug zum Rückgängig machen.',
    'message.levelNoCanonical': 'Level enthält keine kanonischen Lösungsdaten.',
    'message.solutionRejected': 'Lösungsaktion abgelehnt: {reason}',
    'message.solutionDidNotMatch': 'Kanonische Lösung erreicht das Zielbild nicht.',
  },
};

export function t(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let value = translations[language][key];

  if (!params) {
    return value;
  }

  for (const [name, parameter] of Object.entries(params)) {
    value = value.replace(`{${name}}`, String(parameter));
  }

  return value;
}

const coreMessageByEnglishValue: Record<string, TranslationKey> = {
  'Outside of the playable grid.': 'message.outsideGrid',
  'No player blocks remaining.': 'message.noBlocksRemaining',
  'A block already occupies this cell.': 'message.blockOccupied',
  'Colored cells can no longer receive blocks.': 'message.cellColored',
  'This edge node has already been used.': 'message.edgeUsed',
  'Block placement is not allowed.': 'message.blockPlacementNotAllowed',
  'This edge node cannot fire again.': 'message.edgeCannotFireAgain',
  'Nothing to undo yet.': 'message.nothingToUndo',
  'Level has no canonical solution metadata.': 'message.levelNoCanonical',
  'Canonical solution did not reach the target image.': 'message.solutionDidNotMatch',
};

export function translateCoreMessage(message: string, language: Language): string {
  const knownKey = coreMessageByEnglishValue[message];

  if (knownKey) {
    return t(language, knownKey);
  }

  const rejectedPrefix = 'Solution action rejected: ';

  if (message.startsWith(rejectedPrefix)) {
    const inner = message.slice(rejectedPrefix.length);
    return t(language, 'message.solutionRejected', {
      reason: translateCoreMessage(inner, language),
    });
  }

  return message;
}

export function getLocalizedLevelTitle(level: Pick<Level, 'title' | 'metadata'>, language: Language): string {
  const difficulty = level.metadata?.difficulty;

  if (difficulty === 'easy') {
    return t(language, 'difficulty.easy');
  }

  if (difficulty === 'normal') {
    return t(language, 'difficulty.normal');
  }

  if (difficulty === 'hard') {
    return t(language, 'difficulty.hard');
  }

  return level.title;
}

export function getSideDisplayName(side: Side, language: Language): string {
  return t(language, `side.${side}` as const);
}
