# OBA agenda voor MagicINFO

Vaste scherm-URL's:

- Landscape: `https://agendatest.vercel.app/landscape/centrale-oba.html`
- Portrait: `https://agendatest.vercel.app/portrait/centrale-oba.html`

De schermpagina's zijn volledig statisch. De Avenir-fonts zitten inline in de gegenereerde HTML; MagicINFO doet geen aparte fontrequest en geen browser-fetch naar agenda-data.

## Bestaande GitHub-repository opschonen

Upload de inhoud van dit pakket over de bestaande repository en start daarna één keer **OBA agenda sync** via **Actions → Run workflow**.

Na een succesvolle OBA-sync verwijdert de generator automatisch de oude structuur `public/landscape/<vestiging>/index.html` en `public/portrait/<vestiging>/index.html` en vervangt die door directe `.html`-bestanden. De workflow gebruikt `git add -A`, zodat GitHub zowel de verwijderingen als de nieuwe bestanden commit.

Bij een OBA API-fout stopt de sync vóórdat de bestaande schermpagina's worden vervangen.

`vercel.json` bevat geen redirects naar extensieloze URL's en `cleanUrls` staat uit.

> De bestaande repository moet `public/AvenirLight.woff2` en `public/AvenirBlack.woff2` behouden; de generator gebruikt die uitsluitend tijdens de GitHub-build om Avenir in de HTML in te bedden.
