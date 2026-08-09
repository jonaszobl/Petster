# Prompt für Lovable

Baue den Petster-Poster-Customizer als responsive React-Anwendung. Verwende `config/customizer-config.json` als einzige Quelle für Formate, Stil-IDs, Paletten, Crop-Werte und Typografie. Verwende ausschließlich die Assets aus diesem Ordner.

Der Flow besteht aus Foto, Format, Stil, Texte, Generierung und Ergebnis. Die Formatseite zeigt genau A4, A3 und A2 mit den drei zugehörigen Raumansichten. Die Stilseite zeigt fünf Stilpakete und eine Live-Vorschau. Jede Änderung an Motivgröße, Farbwelt oder Schriftwirkung muss sofort sichtbar sein. Nutze `config/preview-rules.css` als Referenz.

Nutze Lovable Cloud für Auth, Daten und Edge Functions. Der Browser darf Railway niemals direkt für geschützte Aufrufe kontaktieren. Erstelle die Edge Functions `petster-usage`, `petster-generate` und `shopify-create-cart`. Sie authentifizieren den Lovable-Cloud-Nutzer und rufen Railway beziehungsweise Shopify ausschließlich mit serverseitigen Secrets auf. Der genaue Ablauf steht in `LOVABLE-INTEGRATION.md`, der Railway-Vertrag in `config/openapi.yaml`.

Sende niemals freie Prompts, Textfelder oder den OpenAI-Key an die Generierungsroute. An Railway gehen nur `format`, `variants` und die vier validierten Style-IDs. Name, Untertitel, Zusatzinfo und Spruch werden erst im Browser als separate, responsive Typografieebene über das zurückgegebene Artwork gelegt.

Zeige bei `MONTHLY_LIMIT_REACHED` eine klare Kontingentmeldung und starte keine automatische Wiederholung. Bei Netzwerkfehlern darf ein erneuter Versuch ausschließlich durch eine bewusste Nutzeraktion ausgelöst werden, damit keine doppelten Bildkosten entstehen.

Baue zusätzlich einen vollständigen Kaufabschluss: A4, A3 und A2 werden Shopify-Varianten zugeordnet. `shopify-create-cart` erstellt serverseitig einen Shopify Storefront Cart, hängt Poster-Konfiguration, Artwork-ID und Textwerte als Line Attributes an und gibt nur `checkoutUrl` zurück. Der Browser navigiert anschließend zum Shopify Checkout. Shopify-Domain, Storefront-Token und Produkt-GID bleiben ausschließlich Lovable-Cloud-Secrets.
