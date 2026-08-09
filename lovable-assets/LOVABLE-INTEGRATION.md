# Petster: Lovable → Railway

Dieser Ordner enthält alle Vorschau-Assets und die verbindliche Customizer-Konfiguration.

## Ordner

- `config/customizer-config.json`: vollständige Auswahlwerte, CSS-Filter und Assetpfade
- `config/preview-rules.css`: direkt übertragbare Regeln für Live-Filter, Crop und Typografie
- `config/openapi.yaml`: API-Vertrag des Railway-Backends
- `format-previews/`: drei maßstäblich unterschiedliche Raumansichten für A4, A3 und A2
- `style-previews/`: fünf Stilbeispiele
- `demo/golden-source.jpg`: neutrales Demo-Referenzfoto
- `LOVABLE-BUILD-PROMPT.md`: fertiger Arbeitsauftrag für Lovable

## Authentifizierung

Lovable verwendet Supabase Auth. Vor jeder geschützten Anfrage die Session lesen und das Access Token senden:

```ts
const { data: { session } } = await supabase.auth.getSession()
if (!session) throw new Error('Bitte melde dich an.')

const form = new FormData()
form.append('image', selectedFile)
form.append('config', JSON.stringify({
  format: 'a3',
  variants: 4,
  style: {
    artStyle: 'watercolor',
    crop: 'balanced',
    colorMood: 'warm',
    typeMood: 'elegant'
  }
}))

const response = await fetch(`${RAILWAY_API_URL}/api/v1/generations`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${session.access_token}` },
  body: form
})
const result = await response.json()
if (!response.ok) throw new Error(result.error?.message ?? 'Generierung fehlgeschlagen')
const imageUrls = result.images.map((image: { dataUrl: string }) => image.dataUrl)
```

Den `OPENAI_API_KEY` niemals in Lovable oder im Browser speichern. Er liegt ausschließlich als Railway-Variable vor.

## Empfohlener Ablauf

1. Beim Start `GET /api/v1/catalog` laden oder `customizer-config.json` lokal bundeln.
2. Die Vorschau vollständig im Browser aus den CSS-Werten der Konfiguration berechnen.
3. Vor der Generierung `GET /api/v1/usage` abrufen und das verbleibende Monatskontingent anzeigen.
4. Bild und ausschließlich die vier IDs als `multipart/form-data` an Railway senden.
5. Texte erst im Lovable-Frontend über die generierte Artwork-Ebene legen.
6. Bei `MONTHLY_LIMIT_REACHED` keine automatische Wiederholung starten.

Das Backend begrenzt Uploads auf 12 MB, normalisiert Bilder serverseitig, erlaubt maximal vier Varianten und ignoriert keine unbekannten Customizing-Werte.
