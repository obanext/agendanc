# OBA agenda voor MagicINFO

Iedere vestiging heeft twee volledig statische pagina's:

- Landscape: `https://agendatest.vercel.app/landscape/centrale-oba.html`
- Portrait: `https://agendatest.vercel.app/portrait/centrale-oba.html`

Iedere pagina bevat alleen de activiteiten van die vestiging. Er zijn geen extra fetches, externe scripts, fonts, API-routes of queryparameters.

De GitHub Action vernieuwt de 62 HTML-pagina's iedere twee uur en commit `public/landscape` en `public/portrait`. Bij een OBA-fout stopt de sync voordat bestaande pagina's worden overschreven.
