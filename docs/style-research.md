# Petster Stilrecherche

Stand: 24. Juli 2026

## Ziel

Die Konfiguration soll keine schwer vorhersagbaren Mischbegriffe anbieten, sondern wenige kaufnahe Stilpakete, die sich eindeutig prompten, prüfen und im Ergebnis wiedererkennen lassen.

Eine universelle öffentliche Verkaufsrangliste für Pet-Portrait-Stile existiert nicht. Die Auswahl basiert deshalb auf der Schnittmenge aus Marktplatz-Bestsellern, Such- und Verkaufsdaten sowie aktuellen Wohntrends.

## Beobachtete Signale

- Etsys Seite für [Top Selling Pet Portraits](https://www.etsy.com/market/top_selling_pet_portrait) führt insbesondere Aquarell-, Öl- und handgezeichnete Portraits unter den Bestsellern. In hervorgehobenen Bewertungen werden Wiedererkennbarkeit, Erinnerungswert und hochwertige Ausführung betont.
- Laut Etsys Bericht zu [Gifting and Personalization Shopping Trends](https://www.etsy.com/seller-handbook/article/1030549011089) war „personalized gift“ der meistgesuchte Begriff der Plattform; Suchen nach „custom wall art“ stiegen im betrachteten Zeitraum um 54 Prozent.
- Etsys [Herbst-/Winter-Trendreport 2025](https://www.etsy.com/ca/seller-handbook/article/1417223353768) beschreibt Nachfrage nach persönlicher Geschichte, handgemachter Wärme, Nostalgie und zugleich farbstarkem Maximalismus. Maximalistische Prints wurden dort als stark wachsend ausgewiesen.
- Pinterest meldete für [Mix & Maximalist](https://business.pinterest.com/ru/pinterest-predicts/2025/rococo-revival/) unter anderem +215 Prozent für „eclectic maximalism“ und +260 Prozent für „vintage maximalism“.
- Pinterest berichtet im [Predicts-Report 2026](https://business.pinterest.com/blog/pinterest-predicts-2026-turn-trends-into-unlimited-possibilities/), dass Checkouts auf Inhalte aus den 2025 vorhergesagten Trends im Jahresvergleich um 68 Prozent gestiegen sind. Trendinteresse kann daher nicht nur als Inspirations-, sondern auch als Kaufsignal dienen.

## Abgeleitete Stilpakete

| Stilpaket | Kaufsignal | Klare visuelle Definition |
| --- | --- | --- |
| Aquarell | Breiter Etsy-Bestseller, emotionaler Geschenk- und Memorial-Kontext | Transparente Pigmente, Papierstruktur, weiche Kanten, präzise Augen und Nase |
| Klassisches Ölportrait | Premium-, Memorial- und traditionelle Wohnästhetik | Sichtbare Pinselarbeit, tiefes Studiolicht, gedeckte Olive-/Umbra-Palette |
| Modern Minimal | Moderne, skandinavische und ruhige Wohnräume | Reduzierte Gouacheflächen, Naturtöne, klare Formen, viel visueller Raum |
| Pop Color | Wachsender Maximalismus und Statement-Dekor | Screenprint-Textur, geometrische Primärflächen, hoher Kontrast |
| Pencil Sketch | Handgezeichnete Portraits, persönliche Erinnerung und minimalistische Wohnästhetik | Graphit, feine Schraffur, sichtbares Papierkorn, präzise Augen und Nase |

## Bewusst nicht als Startpaket aufgenommen

- **Royal/Renaissance:** starkes Novelty-Geschenksegment, aber höheres Risiko für Identitätsverlust, unpassende Anatomie und Kostümfehler.
- **Anime, 3D-Cartoon und Franchise-Looks:** trendanfällig und häufig zu nah an geschützten Markenstilen.
- **„Editorial Art“ oder „malerisch“:** zu unspezifisch für reproduzierbare Resultate.
- **Freie Stilprompts:** erschweren Qualitätskontrolle, Vergleichbarkeit und sichere Wiederholungen.

## Produktregel

Jedes Stilpaket besitzt genau ein verbindliches `style_id`, ein Referenzbild, eine eigene Vorschaupalette und ein strukturiertes Promptprofil. Motivgröße, Farbwelt und Schriftwirkung werden als getrennte Achsen sichtbar bestätigt. Live-Vorschau, Generierungsstatus und alle vier Ergebnisvarianten müssen dieselbe Stildefinition verwenden. Nicht funktionale Schnelländerungen werden nicht angeboten.
