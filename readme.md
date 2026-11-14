# Stack Beam

## Die Doomsday-Welt

**Doomsday Radio ist eine Sendestation aus dem Jahr 2222** — Radio, Geschichten
und Signale aus einer Zukunft, die noch verhindert werden kann. Ein unabhängiges
Online-Radio als zusammenhängende Welt: automatisierte Sendungen, Musik,
Hörspiele, Spiele und Werkzeuge. Jede Komponente ist ein eigener Sender im
Netzwerk — dieser Service ist einer davon.

```text
SOURCE MATERIAL  --->  PRODUCTION  --->  TRANSMISSION  --->  YOU
      lore            services          radio/CDN         [::]
```

`NO SIGNAL IS EVER TRULY LOST // EST. 2222`

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
