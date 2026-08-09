# Petster Poster Lab

Interaktiver Frontend-Prototyp für den Full-AI-Pet-Poster-Flow. Vor der Generierung sieht der User nur das Tierfoto und strukturierte Auswahlmöglichkeiten; vier komplette Poster werden erst nach dem Reveal gezeigt.

## Lokal starten

```bash
npm install
copy .env.example .env.local
npm run dev
```

Trage in `.env.local` deinen `OPENAI_API_KEY` ein. Der Schlüssel wird ausschließlich
von der lokalen Vite-Serverroute gelesen und nicht an das Browser-Bundle ausgeliefert.

## Enthalten

- Foto-Upload mit neutraler Zuschneideansicht
- fünf Formatfamilien mit exaktem Seitenverhältnis
- kuratierte Stil-, Kompositions-, Hintergrund- und Farboptionen
- dynamische Live-Stilvorschau mit fünf konsistenten, kaufnahen KI-generierten Beispielmotiven einschließlich Pencil Sketch
- sichtbar getrennte Feinabstimmung für Motivgröße, Farbwelt und Schriftwirkung mit aktiver Kombinationsübersicht
- Textformular ohne verfrühte Postervorschau
- kosteneffiziente Generierung von vier Artwork-Entwürfen über die OpenAI Image API (`gpt-image-2`, Qualität `low`)
- exakte, responsive Typografie als separate Layout-Ebene statt fehleranfälligem KI-Text im Bild
- Vierer-Reveal mit Auswahl und vordefinierten Änderungsoptionen

Die Fortschrittsanzeige und der Quality-Gate-Text sind weiterhin UI-seitig dargestellt;
die vier Artwork-Ebenen werden real über die API erzeugt. Das Referenzfoto wird vor dem
Upload auf maximal 1024 Pixel Kantenlänge optimiert, die Ausgabe nutzt die kleinste für
das gewählte Seitenverhältnis zulässige Auflösung. Name, Untertitel, Zusatzinfo und
Spruch werden verlustfrei im Frontend gesetzt und überdecken nicht mehr das Tiermotiv.
Jede Generierung verursacht API-Kosten gemäß der aktuellen OpenAI-Preisübersicht.

Die Stilvorschau verwendet ein neutrales Beispielmotiv und ist ausdrücklich kein fertiger Posterentwurf. Kunststil, Bildwirkung, Farbwirkung und Titelcharakter reagieren unmittelbar auf die Auswahl. Vorschau, Generierungsstatus und Ergebnisansicht verwenden dieselbe verbindliche Stildefinition.

Die Herleitung der Stilpakete ist in [docs/style-research.md](docs/style-research.md) dokumentiert.

## Railway-Backend und Lovable

Die produktive Bildgenerierung läuft als eigenständige Node-API in `server/`. Vite enthält keine geheime API-Route mehr. Das Lovable-Frontend sendet Bilddatei und ausschließlich validierte Customizing-IDs an `POST /api/v1/generations`.

Lokal beide Prozesse starten:

```bash
npm run dev:api
npm run dev
```

Produktiv baut Railway mit `railway.json` Frontend und Backend und startet `npm start`. Erforderliche Railway-Variablen:

- `OPENAI_API_KEY`
- `DATABASE_URL` aus einem Railway-PostgreSQL-Service
- `AUTH_MODE=supabase`
- `SUPABASE_URL`
- `ALLOWED_ORIGINS` mit der Lovable-Produktionsdomain

Optionale Limits: `MONTHLY_GENERATION_LIMIT`, `MONTHLY_IMAGE_LIMIT`, `MAX_VARIANTS` und `REQUESTS_PER_MINUTE`.

Die vollständige Lovable-Übergabe liegt in `lovable-assets/`. Dort befinden sich alle Stil- und Formatbilder, der Customizer-Katalog, die OpenAPI-Datei und ein fertiges Supabase-Aufrufbeispiel.
