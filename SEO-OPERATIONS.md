# Maison vue Lac : référencement et publication

## Audit du 8 octobre 2026

Le site public contient aujourd'hui **2 025 URL de contenu**. Les nombres
2 024 mentionnés plus bas décrivent les publications historiques du 30 septembre.
Déploiement de production vérifié : `6ac7e5f0e0c9029ebf68e5b6`, sur le même
projet Netlify `maison` et le même domaine. La fonction `contact-event` est
conservée : sa route personnalisée `/api/contact-event` répond 405 sur GET,
sans création d'événement de suivi. Le compte CLI propriétaire `mario mario` a été rétabli après
vérification de l'identité du créateur du site et de l'équipe `2savoie`.

### Constats des moteurs

- Google, rapport d'indexation mis à jour le 4 octobre : **416 pages indexées**,
  **1 609 détectées, actuellement non indexées**, **3 pages avec redirection**.
  Le dernier groupe correspond aux variantes HTTP/www de l'accueil, qui doivent
  rester redirigées. Les URL détectées ne sont pas des erreurs HTTP : Google
  n'avait pas encore exploré ces pages. L'export contient au maximum 1 000
  exemples sur les 1 609 ; le contrôle indépendant porte sur les 2 025 URL.
- Aucune action manuelle, aucun problème de sécurité, aucun fichier robots.txt
  invalide, aucune erreur HTTPS signalée. Fils d'Ariane : 0 élément invalide,
  10 valides. Les Core Web Vitals manquent de données réelles ; cela ne prouve
  ni une panne ni un bon score. Statistiques d'exploration : 905 requêtes,
  99 % HTTP 200, moyenne 280 ms, aucun problème d'hôte sur 90 jours.
- Une requête Google HTTP 404 concernait `/feed` le 6 octobre. Un vrai flux
  RSS `/feed.xml` contient maintenant la fiche de vente et les 12 guides ;
  `/feed` et `/feed/` redirigent en 301 vers ce flux.
- La fiche `/maison-vue-lac-bourget/` était déjà indexée. Son test en ligne du
  8 octobre confirme l'accès Google et un fil d'Ariane valide. Sa mise à jour
  a été ajoutée à la file d'exploration prioritaire, confirmation conservée
  dans `.seo/proofs/google-indexation-demandee-2026-10-08.jpg`.
  Les guides `/guides/duplex-inverse-maison-voglans/` et
  `/guides/terrasses-piscine-jardin/`, détectés mais jamais explorés, ont
  également reçu une confirmation de demande d'indexation.
- Bing : le statut enregistré de l'accueil était « Discovered but not crawled ».
  Le test en ligne confirme « URL can be indexed by Bing » et « No SEO/GEO
  issues found ». Une demande d'indexation a été acceptée. Le scan intégré
  ne peut pas démarrer : quota de scan disponible de 0 page. Le rapport
  AI Performance affiche « No data available » ; aucune citation IA démontrée.

### Corrections publiées et vérification

- Audit HTTP exhaustif des 2 025 pages : 2 025 réponses 200, aucune page
  orpheline, aucun blocage technique détecté par les contrôles. Les cinq liens
  internes sans slash signalés par l'audit ont été normalisés. Le rapport
  initial est dans `.seo/audit-before.json`.
  L'audit public final `.seo/audit-apres.json` vérifie aussi les empreintes
  du build : **2 025 réponses 200, 2 025 pages accessibles depuis l'accueil,
  0 anomalie et 0 avertissement** selon les contrôles du script.
- Sitemap historique `/sitemap.xml` conservé, avec les 2 025 URL canoniques.
  Nouvel index `/sitemap-index.xml` : 14 fichiers, sans doublon, partitionnés
  en pages de vente/guides, annuaire et 12 départements. Le fichier
  `/sitemap-maison.xml` contient 25 pages. Les deux sitemaps racine sont
  déclarés dans robots.txt. Les dates réelles de modification sont conservées
  dans `src/data/content-updates.json`, sans date artificielle à chaque build.
- Maillage vers les six communes réellement les plus proches, mesuré entre
  leurs centres avec geolib. Données structurées des fiches cohérentes avec
  les données visibles, citations de l'API publique et limites de calcul.
  Le snapshot source n'a pas été actualisé : aucun nouveau millésime de
  population ou fait local n'est inventé.
- Fiche immobilière structurée harmonisée, entité maison unique, prix et
  disponibilité cohérents, fils d'Ariane hiérarchiques, extraits autorisés
  et alternances français/anglais réciproques. Le plan 3D conceptuel reste
  disponible dans le code de preview, mais est exclu du build public ; son
  URL et son image répondent toujours 404 en production.
- Build de production et contrôle SEO réussis ; **41 tests sur 6 fichiers
  réussis** en une exécution. Vérification publique des 14 sous-sitemaps,
  du RSS, du 301 `/feed` et d'une URL inconnue en 404. Les empreintes SHA-256
  des **2 025 pages publiées** correspondent toutes au build local validé.
- IndexNow a reçu les **2 025 URL, HTTP 200**. Le reçu est dans
  `.seo/indexnow-receipt.json`. Réception ne signifie pas indexation.

Les sitemaps historique et index ont été soumis à Google et Bing le 8 octobre.
Le sitemap des 25 pages de vente/guides a aussi été déclaré séparément à Google.
Le sitemap historique reste reconnu par Google, avec 2 025 pages découvertes.
Le premier traitement du nouvel index Google a affiché une erreur de
récupération ; son inspection en ligne confirme pourtant « Récupération de
page : Réussie », exploration autorisée et réponse publique HTTP 200.
Il a été renvoyé une fois après ce diagnostic. Au dernier contrôle, l'index
et le sitemap des 25 pages affichent encore « Impossible de récupérer le
sitemap ». Leur lecture par le traitement de sitemaps Google n'est donc
pas confirmée, malgré des fichiers XML valides et accessibles. Le sitemap
historique accepté contient déjà toutes les URL ; aucun chemin n'en est exclu.
Ne pas masquer ce statut ni présenter la réception comme une lecture complète.
Bing confirme maintenant **Success pour les deux fichiers**, lus le 8 octobre,
sans erreur ni avertissement ; les compteurs de plusieurs sitemaps peuvent compter les mêmes
URL plusieurs fois et ne représentent pas des pages uniques indexées.

Pour refaire les contrôles après une publication :

```sh
npm run check:seo
npm run check:seo:live -- --report=audit-apres --verify-build
npm test -- --run --hookTimeout=60000 --testTimeout=30000 --maxWorkers=1 --no-file-parallelism
npm run indexnow -- --submit
```

Le déploiement manuel et les sources Git doivent rester synchronisés : un
prochain push sur `main` déclenche le build Netlify. Le commit de cet audit
utilise `[skip netlify]` pour conserver la publication déjà vérifiée.
Les rapports privés, preuves de compte et originaux photo ne sont ni publiés
ni ajoutés à Git. Aucun abonnement, scan payant ou suivi récurrent n'est créé.

L'éligibilité technique ne garantit pas la sélection de chaque fiche
géographique : les moteurs évaluent aussi l'utilité et l'originalité de ces
pages pour un site vendant une seule maison à Voglans. Ne pas créer davantage
de pages en masse pour résoudre ce statut. Prioriser les informations utiles
aux acheteurs et la fiche de vente plutôt que promettre 100 % d'indexation.
Pour les fonctions IA Google, les mêmes exigences SEO s'appliquent ; aucune
balise spéciale ne garantit une citation ou un classement.

Références :
- https://support.google.com/webmasters/answer/7451001
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/ai-features

## Domaine et données

Le projet Netlify `maison` utilise **https://maison-vuelac.com**. Le nom
`maisonvue-lac.com` renvoie NXDOMAIN (vérification du 30 septembre 2026).
Ne pas modifier le DNS pour déplacer le tiret : le domaine confirmé par Netlify
et le site existant est déjà opérationnel.

Les données communes sont dans `src/data/property.json` : prix 780 000 EUR,
DPE B, GES B, estimation communiquée de 2 700 à 3 000 EUR/an. Les années de
référence des prix d'énergie restent à renseigner depuis le diagnostic.
133 m², trois chambres, construction 2020 et les équipements viennent du site
existant. Aucune surface de terrain supplémentaire n'a été déduite des annonces
de tiers. Ne pas inventer de consommation, de numéro ADEME ou de date de DPE.

## Contenu et lots

12 guides français sont conservés dans `src/data/guides.ts`. La variable
`CONTENT_BATCH` pilote les routes, les liens, les traductions et le sitemap :

| Valeur | Contenu disponible | Pages de contenu |
| --- | --- | --- |
| 0 | 7 pages françaises existantes, index des guides, 4 pages anglaises | 12 |
| 1 | Ajout des 4 guides sur la maison | 16 |
| 2 | Ajout des 4 guides locaux | 20 |
| 3 | Ajout des 4 guides d'achat | 24 |

La page `/videos/`, auparavant vide, redirige définitivement vers `/video/`.
La vidéo n'est présentée qu'une fois. Les anciens chemins sans slash restent
accessibles ; toutes les URL canoniques se terminent par un slash.

Avant chaque lot, relire ses faits et sources, puis tester ses pages. Le lot 3
est désormais le défaut de production. Le mode preview affiche les douze guides.
Conserver le lot de production atteint dans `netlify.toml` pour ne pas faire
disparaître les guides au déploiement suivant. Ne jamais baisser ce numéro
après publication sans prévoir les redirections appropriées.

`INCLUDE_AREA_PAGES=true` ajoute exactement 2 000 pages : l'annuaire `/reperes/`
et 1 999 fiches de communes, soit **2 024 pages de contenu** avec le lot 3.
Ce sont des fiches géographiques générées à partir de données publiques,
pas 2 000 annonces immobilières ni 2 000 articles rédigés individuellement.
La maison est toujours située à Voglans ; les pages le précisent explicitement.

Le fichier `src/data/area-snapshot.json` conserve les données de l'API
Découpage administratif téléchargées le 30 septembre 2026, leur URL source,
leur empreinte SHA-256 et la méthode de sélection. Les 1 999 communes françaises
complètes les plus proches de Voglans couvrent 12 départements, jusqu'à
109,3 km à vol d'oiseau. Les distances entre centres géographiques sont
calculées avec `geolib`, sans inventer de durée ni de distance routière.
Le millésime de population n'étant pas fourni par la réponse API, il n'est
pas inventé. Chaque fiche indique ses sources, les limites et ses calculs.

`npm run import:area` actualise ce snapshot ; aucun téléchargement n'a lieu
pendant un build ordinaire. Relire la différence avant toute actualisation :
un changement des communes sélectionnées nécessite de conserver les anciennes
routes ou de prévoir des redirections. Ne pas désactiver `INCLUDE_AREA_PAGES`
après publication sans traiter ces URL.

## Vérification et déploiement

Contrôles effectués le 30 septembre 2026 : build de production, compilation
Netlify de la fonction et contrôle SEO réussi sur les 2 024 pages (titres,
canoniques, sitemap et liens internes). Navigation et affichage testés avec
Playwright à 320, 390 et 1440 px ; recherche sans accents, filtre département
et état vide vérifiés. Le menu principal a aussi été testé sans JavaScript.
Les 35 tests des 5 fichiers réussissent, y compris les 9 tests du compteur et
les 5 tests des données géographiques. Une première relance globale avait été
interrompue par ENOSPC sur le Mac ; après retour d'espace disponible, la suite
a été relancée avec succès en un seul worker. Aucun fichier personnel n'a été
supprimé pour cela. `git diff --check` est également sans erreur.

Accès Netlify rétabli le 30 septembre 2026 : le compte CLI actif appartenait à
une autre équipe et renvoyait HTTP 404 à la création d'un déploiement. Le compte
déjà enregistré `mario mario` a été sélectionné avec `netlify switch` ;
`netlify status --json` confirme l'équipe propriétaire `2savoie`. Ce choix de
compte CLI est global : vérifier le compte avant de travailler sur un autre
projet. Le navigateur et le connecteur Netlify conservent leurs propres sessions.
Ne pas créer un autre site pour contourner une erreur d'accès.

Aperçu déployé et vérifié :
https://6abcae4a86f11bbf52bb75d8--maison.netlify.app

Le déploiement `6abcae4a86f11bbf52bb75d8` est `ready` en contexte
`deploy-preview`. Accueil, guides et anglais répondent HTTP 200 ; robots.txt
interdit l'exploration et le sitemap est vide ; la redirection vidéo répond
301. La fonction de contact répond 405 sur GET et 204 pour un événement de test
dans le store de preview. Les 24 pages ont passé le contrôle SEO local.
Le 30 septembre 2026, un déploiement technique de production
`6abcb035812c6f2fd05351ce` a ajouté uniquement `/robots.txt` et `/sitemap.xml`.
Les 364 fichiers du déploiement du 18 août `6a84b90a9d83710008cd1587` ont été
conservés avec leurs mêmes empreintes SHA ; aucun contenu d'annonce, image,
script ou style n'a changé. Ce premier sitemap contenait les 7 pages utiles
existantes et excluait `/videos/`, la page redondante.

À la demande de poursuivre la publication, le déploiement de production
`6abcb2d86935959f7e7e6250` a publié les 24 pages, puis
**`6abcb5cec70385c9636e9e29`** a publié les 2 000 pages géographiques
supplémentaires. Le site public et son sitemap contiennent désormais
**2 024 URL de contenu**. Les métadonnées publiques confirment
`indexable: true`, `batch: 3`, `areaPages: 2000`.
L'annuaire et une fiche répondent 200 sans X-Robots-Tag noindex, `/videos/`
répond 301 vers `/video/` et une URL inexistante répond bien 404.

Les années de référence des prix d'énergie restent à compléter depuis le DPE.
Le composant énergie affiche explicitement qu'elles n'ont pas encore été
communiquées ; ce libellé ne remplace pas les mentions légales requises et
ne permet pas d'affirmer que l'annonce est juridiquement complète.

```sh
npm run build:preview
npm run check:seo
npm test -- --run
netlify deploy --no-build --dir dist
```

Le brouillon a une balise noindex, un robots.txt fermé, un sitemap vide et un
en-tête X-Robots-Tag. Les URL canoniques pointent vers le domaine de production.
Les statistiques du brouillon ne se mélangent pas à celles du site publié.

Pour publier un lot relu et validé, reconstruire explicitement la production :

```sh
SITE_INDEXABLE=true CONTENT_BATCH=3 INCLUDE_AREA_PAGES=true npm run build
npm run check:seo
npm test -- --run --testTimeout=30000 --maxWorkers=1 --no-file-parallelism
netlify deploy --prod --no-build --dir dist
npm run indexnow
npm run indexnow -- --submit
```

`indexnow` est un aperçu par défaut. `--submit` vérifie la clé, les métadonnées
et l'empreinte de chaque page réellement en ligne, avec quatre requêtes au
maximum simultanément, avant d'envoyer uniquement les URL ajoutées, modifiées ou
retirées depuis la dernière soumission locale. L'état est dans `.seo/`, ignoré
par Git. Une réponse 200/202 signifie réception, pas indexation. IndexNow ne
remplace pas Google Search Console. Ne jamais promouvoir le build preview
directement : il est volontairement non indexable.

Soumission du 30 septembre 2026 : les empreintes des **2 024 pages en ligne**
ont toutes été vérifiées. Le premier envoi IndexNow a répondu 403 avec
`SiteVerificationNotCompleted`, bien que le fichier de clé réponde 200.
Une seconde tentative, après attente et sans changement du contenu déployé,
a été acceptée **HTTP 200 pour les 2 024 URL**. L'état des empreintes a été
enregistré dans `.seo/indexnow-state.json`. Il s'agit d'une réception, pas
d'une garantie d'indexation.

## Google, Bing et IA

Le sitemap de production est https://maison-vuelac.com/sitemap.xml. Son contenu
actuel comprend **2 024 URL**. Les robots de recherche peuvent accéder aux pages HTML,
y compris sans JavaScript. Aucune affirmation de citation
par une IA ou de résultat enrichi immobilier n'est faite. Aucun fichier llms.txt
ni fausses annonces dans d'autres communes n'est utilisé. Le volume de pages
ne garantit ni leur indexation ni du trafic ; suivre l'utilité réelle pour
les acheteurs avant d'étendre encore ce contenu programmatique.

Google Search Console et Bing Webmaster Tools ont été configurés et validés
le 30 septembre 2026 dans les sessions du propriétaire :

- Google : propriété domaine `sc-domain:maison-vuelac.com`, validation TXT DNS.
  Sitemap envoyé de nouveau après la dernière publication, lu le même jour,
  état « Opération effectuée », **2 024 pages découvertes**, contre 7 avant
  publication. Ce nombre ne signifie pas 2 024 pages indexées.
  L'inspection antérieure de l'accueil indique « Cette URL est sur Google »
  et « La page est indexée » ; il ne s'agit pas d'une nouvelle indexation
  obtenue pendant cette intervention.
- Bing : site `https://maison-vuelac.com/`, validation CNAME DNS. Sitemap
  soumis de nouveau après publication, puis état **« Success »** au dernier
  contrôle, **« 2.0K » URL découvertes** (affichage arrondi), aucune erreur ni
  avertissement. La découverte ne garantit pas l'indexation des pages.

Accès directs :
- https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Amaison-vuelac.com
- https://www.bing.com/webmasters/sitemaps?siteUrl=https://maison-vuelac.com/

Conserver les deux enregistrements dans la zone DNS Netlify
`698dfe14bcbf8157a36a9a0d` : TXT Google à la racine (ID
`6abcafe43e8663f642fa6f04`) et CNAME
`bde2f11d89e9e8ee96f164fdfc4691f2.maison-vuelac.com` vers `verify.bing.com`
(ID `6abcaffae46b40427c247574`). Aucun changement des serveurs DNS ni des
enregistrements de routage du site n'a été effectué. Ces validations DNS
survivront aux prochaines publications. Les variables de secours
`GOOGLE_SITE_VERIFICATION` et `BING_SITE_VERIFICATION` restent prises en charge
par le code mais ne sont pas nécessaires pour les validations réalisées.

Le connecteur Windsor accessible le 30 septembre 2026 ne contient pas cette
propriété. Connexion : https://onboard.windsor.ai/connect?connector=searchconsole&next=/searchconsole/authorize
Ce connecteur lit les statistiques ; il ne valide pas un site et ne soumet pas
les sitemaps. Aucun trafic initial n'a donc été inventé.

## Confidentialité des photographies

Le 30 septembre 2026, sept zones de plaques ont été masquées sur quatre photos
dans `src/gallery/description-des-pieces/` :

- `IMG_0280 2.jpg` : deux plaques avant.
- `IMG_0284 2.jpg` : trois plaques, dont une partiellement cachée.
- `ALLE DE LA MAISON.jpg` : plaque avant de la voiture bleue.
- `ENTREE MAISON PRINCIPALE.jpg` : plaque arrière de la voiture bleue.

Retouche réalisée avec l'outil intégré `image_gen`. Consigne appliquée à chaque
image : « Flouter fortement toutes les plaques indiquées, rendre tous les
caractères illisibles même en agrandissement, conserver le cadrage et tout le
reste de la photographie, sans inventer de numéro de remplacement. »
Seules les petites zones retouchées ont été réintégrées dans les pixels des
photos originales, à leur résolution d'origine, puis réencodées en JPEG.
La maison et les aménagements n'ont pas été remplacés par une image générée.
Les agrandissements des sept zones ont été vérifiés visuellement.

Publication confirmée : déploiement Netlify `6abcea0f0f41ae21afd89bf2`.
Les 24 fichiers publiés (quatre images et leurs déclinaisons) ont été
téléchargés et leurs empreintes comparées au build local : toutes identiques.
Les 24 anciennes URL d'images retournent désormais 404/410 sur le domaine
`maison-vuelac.com`. L'accueil et la galerie extérieure correspondent au
nouveau build ; le contrôle SEO des 2 024 pages reste valide.

Les originaux sont conservés localement dans `.seo/private-originals/`, exclus
de Git et du dossier publié. La galerie et ses miniatures doivent toujours
être reconstruites depuis les sources masquées. Les anciennes copies déjà
téléchargées par des tiers ou les anciens déploiements Netlify ne sont pas
effacés par une nouvelle publication ; ne pas réutiliser ces anciens builds.

## Contacts et bilan

Le compteur propriétaire enregistre `phone_click` et `contact_view` dans le
store privé Netlify Blobs `maison-contact-events`. Chaque événement contient
uniquement le jour UTC, le type et le chemin de la page, sans query string,
cookie, IP stockée par l'application ou identifiant de visiteur. Un clic ne
garantit pas un appel abouti. Les robots et clics répétés restent possibles.
Do Not Track est respecté. Les journaux techniques de l'hébergeur sont distincts.

Consulter/exporter les clés via l'espace Blobs du projet Netlify. Elles sont
regroupables par jour, événement et page, sans télécharger de données privées
de prospects. Les essais utilisent un store propre au déploiement preview.

Après 6 à 8 semaines, comparer : impressions et clics Search Console, pages
indexées dans Google/Bing, clics téléphone, appels réels et visites convenues
notés par le propriétaire. Développer seulement les sujets qui apportent des
acheteurs. Aucun suivi automatique récurrent n'est activé.

Références :
- https://developers.google.com/search/docs/essentials/spam-policies
- https://www.indexnow.org/documentation
- https://www.service-public.gouv.fr/particuliers/vosdroits/F16096
- https://geo.api.gouv.fr/decoupage-administratif/communes
- https://github.com/datagouv/api-geo/blob/master/definition.yml
