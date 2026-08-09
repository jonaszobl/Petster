# Petster: Lovable Cloud → Railway → Shopify

## Architektur

Der Browser spricht für geschützte Aktionen ausschließlich mit Lovable Cloud. Lovable Auth liefert den Nutzer, Edge Functions halten alle Secrets und Railway übernimmt Bildgenerierung sowie persistente Monatslimits. Railway benötigt keine Supabase-URL.

### Erforderliche Lovable-Cloud-Secrets

- `RAILWAY_API_URL`
- `LOVABLE_API_SECRET` (identisch mit Railway)
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_PRODUCT_GID`

### Erforderliche Railway-Variablen

- `OPENAI_API_KEY`
- `DATABASE_URL`
- `AUTH_MODE=lovable`
- `LOVABLE_API_SECRET`
- `ALLOWED_ORIGINS=https://*.lovable.app`

## Geschützte Edge Functions

Jede Function liest den Bearer-Token des Browsers, validiert ihn mit `supabase.auth.getUser(token)` und verwendet `user.id`. An Railway sendet sie:

```ts
headers: {
  'X-Lovable-Secret': Deno.env.get('LOVABLE_API_SECRET')!,
  'X-User-Id': user.id,
}
```

`petster-generate` übernimmt den Multipart-Body mit `image` und `config` und leitet ihn an `POST /api/v1/generations` weiter. `petster-usage` ruft `GET /api/v1/usage` auf. API-Fehler, Statuscodes und `Retry-After` werden unverändert an den Browser zurückgegeben. Es gibt keine automatische Wiederholung.

## Shopify

`shopify-create-cart` authentifiziert den Nutzer, fragt das konfigurierte Produkt über die Shopify Storefront GraphQL API ab, ordnet `a4`, `a3` und `a2` exakt den entsprechenden Varianten zu und erstellt einen Cart. Die Line Attributes enthalten `petster_generation_id`, `format`, Stil-IDs sowie die finalen Textwerte. Die Function gibt ausschließlich `{ checkoutUrl }` zurück. Token und Produkt-GID gelangen nie in den Browser.

## Frontend-Ablauf

1. Foto lokal validieren und auf maximal 12 MB begrenzen.
2. Format A4/A3/A2 anhand der Raumansichten wählen.
3. Stil, Crop, Farbwelt und Typografie mit sofort sichtbarer Vorschau wählen.
4. Texte als separate, sichere Overlay-Ebene erfassen.
5. Vor Generierung `petster-usage` laden.
6. `petster-generate` bewusst einmal auslösen und vier Varianten anzeigen.
7. Favorit wählen; im Warenkorb Format und Poster-Daten an `shopify-create-cart` senden.
8. Zum zurückgegebenen Shopify Checkout navigieren.

Bei `MONTHLY_LIMIT_REACHED` wird keine Generierung gestartet. Nach Netzwerkfehlern darf nur ein expliziter Klick erneut senden.
