# Stack Beam

Browserbasiertes Puzzlespiel aus dem Doomsday-Radio-Universum. Die Anwendung
lädt ihre Rätsel aus `puzzles/puzzle-pool.json` und wird als vorgebautes
statisches Frontend ausgeliefert.

## Lokal starten

```bash
python -m http.server 8000
```

Das Spiel ist anschließend unter <http://localhost:8000> erreichbar. Ein
lokaler Webserver ist erforderlich, damit Browser die Module und Rätseldaten
mit den richtigen Pfaden laden.

## Inhalte

```text
index.html                 Einstiegspunkt
assets/                    gebautes JavaScript und CSS
audio/                     Audioelemente des Spiels
puzzles/puzzle-pool.json   Rätselbestand
favicon.svg                Browser-Icon
```

`assets/` enthält gebaute Artefakte. Der ursprüngliche Quellstand stammt aus
`tools/stack-beam` und `docs/games/stack-beam` des früheren Monorepos; eine
eigenständige Build-Pipeline ist in diesem Repository derzeit nicht enthalten.
