# Apercu 3D local

Route : `/plan-3d/`. Cette proposition reprend le visuel conceptuel valide,
pas un releve de la maison. Ne pas publier comme plan contractuel.
La page porte `noindex, nofollow`, sans lien dans le menu ni entree de sitemap.

## Modele

`src/data/house-plan.ts` centralise l'enveloppe, les pieces, les cloisons et
l'escalier, en metres. Deux niveaux de 10 x 7 m, trois chambres au total.
Hypotheses : hauteur libre 2,50 m, dalle 0,20 m, murs exterieurs 0,25 m,
cloisons 0,10 m. Le mobilier et les ouvertures restent indicatifs.

## Rendu

PlayCanvas 2.22.6, importe uniquement sur la page du plan. WebGPU est demande
en premier ; PlayCanvas essaie WebGL 2 si sa creation echoue. Les materiaux
standards ne necessitent ni service distant ni compilateur de shader externe.
Le rendu se fait sur changement de vue, avec une densite de pixels plafonnee
a 1,75. Une image locale remplace la scene si aucun moteur ne peut demarrer.

Rotation : glisser. Deplacement : clic droit ou Maj + glisser, ou deux doigts.
Zoom : molette, pincement ou boutons. Le canvas accepte aussi les fleches,
les touches + / - et 0 pour reinitialiser. Les libelles evitent les collisions.

## Verification

- `npm run test -- --run src/data/__tests__/house-plan.test.ts`
- Compilation avec les variables habituelles, puis `npm run check:seo`.
- En mode developpement, `?renderer=webgl2` force le repli et
  `?renderer=none` simule l'absence de GPU. Ces options sont ignorees en production.
- Verifier les vues Ensemble / Haut / Bas, dessus / perspective, le zoom,
  les meubles, les libelles, les gestes tactiles et le redimensionnement.
- Aucune publication Netlify ni soumission Google/Bing pour cet apercu.
