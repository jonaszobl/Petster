# Prompt für Lovable

Baue den Petster-Poster-Customizer als responsive React-Anwendung. Verwende `config/customizer-config.json` als einzige Quelle für Formate, Stil-IDs, Paletten, Crop-Werte und Typografie. Verwende ausschließlich die Assets aus diesem Ordner.

Der Flow besteht aus Foto, Format, Stil, Texte, Generierung und Ergebnis. Die Formatseite zeigt genau A4, A3 und A2 mit den drei zugehörigen Raumansichten. Die Stilseite zeigt fünf Stilpakete und eine Live-Vorschau. Jede Änderung an Motivgröße, Farbwelt oder Schriftwirkung muss sofort sichtbar sein. Nutze `config/preview-rules.css` als Referenz.

Nutze Supabase Auth. Vor geschützten API-Aufrufen muss eine aktive Session vorliegen. Lade das verbleibende Kontingent über `GET /api/v1/usage`. Sende Bild und Konfiguration als `multipart/form-data` an die in `VITE_RAILWAY_API_URL` konfigurierte Railway-URL. Der genaue Aufruf steht in `LOVABLE-INTEGRATION.md`, der vollständige Vertrag in `config/openapi.yaml`.

Sende niemals freie Prompts, Textfelder oder den OpenAI-Key an die Generierungsroute. An Railway gehen nur `format`, `variants` und die vier validierten Style-IDs. Name, Untertitel, Zusatzinfo und Spruch werden erst im Browser als separate, responsive Typografieebene über das zurückgegebene Artwork gelegt.

Zeige bei `MONTHLY_LIMIT_REACHED` eine klare Kontingentmeldung und starte keine automatische Wiederholung. Bei Netzwerkfehlern darf ein erneuter Versuch ausschließlich durch eine bewusste Nutzeraktion ausgelöst werden, damit keine doppelten Bildkosten entstehen.
