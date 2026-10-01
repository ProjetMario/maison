import { contentBatch } from './seo';

export interface Guide {
  slug: string;
  title: string;
  description: string;
  group: string;
  batch: number;
  image: 'view' | 'living' | 'pool' | 'location';
  sections: { title: string; paragraphs: string[]; checklist?: string[] }[];
  sources: { label: string; url: string }[];
  related: string[];
}

const town = { label: 'Mairie de Voglans : informations et services municipaux', url: 'https://mairie-voglans.fr/' };
const lake = { label: 'Grand Lac : les plages et leurs conditions d’accès', url: 'https://grand-lac.fr/au-quotidien/services-a-la-population/plages' };
const bus = { label: 'Ondéa Grand Lac : découvrir le territoire en bus', url: 'https://www.ondeagrandlac.fr/itineraires/decouvrir-le-territoire-en-bus' };
const diagnostics = { label: 'Service Public : diagnostics à fournir pour la vente', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F10798' };
const dpe = { label: 'Service Public : diagnostic de performance énergétique', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F16096' };
const contract = { label: 'Service Public : promesse et compromis de vente', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2965' };

export const guides: Guide[] = [
  {
    slug: 'duplex-inverse-maison-voglans', title: 'Un duplex inversé pour profiter de la vue à Voglans',
    description: 'Pièces de vie à l’étage, chambres au rez-de-chaussée : comprendre l’organisation de cette maison et les circulations à vérifier en visite.',
    group: 'Comprendre la maison', batch: 1, image: 'living',
    sections: [
      { title: 'Les pièces de vie prennent de la hauteur', paragraphs: ['Dans cette maison, le séjour et la cuisine ouverte sont à l’étage. Cette disposition place la vue sur le lac du Bourget et la Dent du Chat au centre de la vie quotidienne. L’entrée, les toilettes et l’accès aux terrasses se trouvent également sur ce niveau.', 'Le terrain permet de rejoindre le jardin depuis l’espace de vie. Il faut donc distinguer les niveaux intérieurs de la maison et les accès extérieurs : une visite aide à comprendre leur articulation bien mieux qu’une simple liste de pièces.'] },
      { title: 'Un espace nuit séparé', paragraphs: ['Le rez-de-chaussée accueille les trois chambres, dont une suite parentale avec dressing et salle d’eau. La buanderie, une autre salle d’eau avec baignoire et douche, et des toilettes séparées complètent ce niveau.', 'Cette séparation peut convenir à un foyer qui souhaite isoler les chambres des activités du séjour. Son intérêt dépend toutefois de vos habitudes : télétravail, présence de jeunes enfants ou besoin de circuler souvent entre les deux niveaux.'] },
      { title: 'Les circulations à essayer', paragraphs: ['La maison comporte des escaliers et ne convient pas à un besoin d’accès entièrement de plain-pied. Lors de la visite, parcourez le trajet entre le stationnement, la cuisine, les chambres et le jardin. Vous pourrez ainsi apprécier le fonctionnement réel de la maison.'], checklist: ['Observer les dimensions et l’éclairage de l’escalier.', 'Repérer les rangements sur chacun des niveaux.', 'Vérifier les accès aux terrasses depuis le séjour.'] },
    ], sources: [], related: ['vue-lac-orientation-voglans', 'preparer-visite-maison-voglans'],
  },
  {
    slug: 'vue-lac-orientation-voglans', title: 'Vue sur le lac du Bourget : les points à observer sur place',
    description: 'Panorama, lumière et terrasses : apprécier la vue réelle depuis la maison de Voglans et choisir les bons moments pour votre visite.',
    group: 'Comprendre la maison', batch: 1, image: 'view',
    sections: [
      { title: 'Regarder depuis les espaces du quotidien', paragraphs: ['La vue sur le lac du Bourget et la Dent du Chat se découvre depuis l’espace de vie à l’étage. Pour apprécier ce panorama, prenez le temps de vous placer à différents endroits : près des baies, dans la partie salon et sur les terrasses.', 'Une photographie montre un point de vue à un instant donné. La météo, la saison et la position dans la pièce modifient la perception du paysage. Les photos du site sont celles de la maison ; la visite permet de retrouver leurs angles et de les comparer.'] },
      { title: 'Trois terrasses, plusieurs usages', paragraphs: ['Les extérieurs comprennent une terrasse carrelée au sud, une terrasse en bois avec piscine et une terrasse au nord. Cette dernière est accessible depuis le séjour. L’intérêt de ces espaces est de pouvoir choisir où s’installer selon la chaleur et les activités.', 'L’exposition d’une terrasse ne suffit pas à garantir son ensoleillement à chaque heure. Observez les ombres, les protections solaires et les vis-à-vis au moment de votre venue. Une seconde visite à un autre horaire peut être utile.'] },
      { title: 'Une vue lac ne signifie pas un accès privé au lac', paragraphs: ['La maison se situe à Voglans, et non sur une parcelle les pieds dans l’eau. Pour la baignade ou une promenade sur les rives, il faut rejoindre un accès public au lac. Ce point est important pour comparer ce bien à une propriété directement riveraine.'], checklist: ['Comparer la vue depuis l’intérieur et depuis les terrasses.', 'Observer les vis-à-vis sans se limiter au panorama lointain.', 'Prévoir un trajet vers les rives après la visite.'] },
    ], sources: [lake], related: ['terrasses-piscine-jardin', 'acces-lac-bourget-depuis-voglans'],
  },
  {
    slug: 'terrasses-piscine-jardin', title: 'Piscine, jardin et terrasses : se projeter dans les extérieurs',
    description: 'Comprendre les usages des trois terrasses, de la piscine au sel chauffée et du jardin de cette maison à Voglans avant une visite.',
    group: 'Comprendre la maison', batch: 1, image: 'pool',
    sections: [
      { title: 'Des espaces à parcourir ensemble', paragraphs: ['La maison propose trois terrasses, un jardin accessible depuis l’espace de vie et une piscine au sel chauffée par pompe à chaleur. La terrasse en bois accompagne la piscine ; les terrasses nord et sud offrent d’autres lieux pour les repas ou les moments de repos.', 'Lors de la visite, regardez les circulations entre ces espaces. La position de la cuisine, les passages près des baies et la place occupée par le mobilier comptent autant que la surface apparente sur les photos.'] },
      { title: 'Comprendre l’entretien de la piscine', paragraphs: ['Une piscine fait partie du confort de la maison, mais aussi de son entretien. Demandez à voir les équipements et leur fonctionnement : filtration, traitement au sel, chauffage et protections. Les propriétaires pourront expliquer leurs habitudes d’utilisation.', 'Les consommations varient selon la saison, la température de l’eau et la durée d’utilisation. Aucun coût annuel propre à la piscine n’est annoncé ici. Pour comparer les dépenses, demandez les éléments disponibles plutôt que de vous fier à une moyenne générale.'] },
      { title: 'Jardin, voisinage et stationnement', paragraphs: ['Le jardin ne doit pas être confondu avec la surface totale de la parcelle. Les limites, les accès et les éventuelles servitudes se vérifient avec les documents du bien. Le garage est mitoyen et des vis-à-vis existent : ces caractéristiques font partie de la présentation de la maison.'], checklist: ['Observer les limites et les vues vers les parcelles voisines.', 'Demander les documents d’entretien et de sécurité de la piscine.', 'Tester les accès au garage double et aux stationnements.'] },
    ], sources: [], related: ['vue-lac-orientation-voglans', 'documents-achat-maison'],
  },
  {
    slug: 'confort-energie-dpe-b', title: 'DPE B et confort : comprendre les équipements de la maison',
    description: 'Chauffage au sol par pompe à chaleur, climatisation du séjour et DPE B : les informations à examiner pour cette maison de Voglans.',
    group: 'Comprendre la maison', batch: 1, image: 'living',
    sections: [
      { title: 'Les équipements présents', paragraphs: ['La maison a été construite en 2020. Le chauffage au sol est alimenté par une pompe à chaleur et le séjour est climatisé. Des brise-soleil orientables équipent l’espace de vie. Ces éléments permettent de discuter concrètement du confort en hiver comme en été.', 'Pendant la visite, demandez à voir les commandes et à comprendre les réglages. L’emplacement des équipements, l’entretien et les habitudes d’aération aident à apprécier leur usage quotidien. La piscine dispose également d’un chauffage : ses usages doivent être distingués de ceux du logement.'] },
      { title: 'Le classement annoncé est B', paragraphs: ['Le propriétaire indique une classe DPE B. Pour interpréter ce classement, consultez le diagnostic complet, sa date et les informations relatives aux émissions de gaz à effet de serre. La classe énergétique ne remplace pas la lecture de ce document.', 'L’estimation de dépenses communiquée par le propriétaire figure sur la fiche énergie du bien. Demandez le rapport pour connaître les années de prix de référence et le périmètre exact de cette estimation. Il ne s’agit pas d’une promesse de facture : vos usages et les tarifs de l’énergie peuvent changer le montant réel.'] },
      { title: 'Préparer les bonnes questions', paragraphs: ['La comparaison avec votre logement actuel sera plus utile si vous partez d’usages proches : température souhaitée, présence en journée et fréquence d’utilisation de la climatisation. Les factures historiques, lorsqu’elles sont disponibles, apportent un autre éclairage que le seul classement DPE.'], checklist: ['Consulter le DPE complet et son identification.', 'Demander les justificatifs d’entretien de la pompe à chaleur.', 'Distinguer estimation du diagnostic et consommations constatées.'] },
    ], sources: [dpe], related: ['documents-achat-maison', 'duplex-inverse-maison-voglans'],
  },
  {
    slug: 'vivre-a-voglans', title: 'Vivre à Voglans : préparer son installation près du lac',
    description: 'Des repères pour découvrir Voglans, apprécier son quotidien entre Chambéry et Aix-les-Bains et évaluer l’environnement de la maison.',
    group: 'Se projeter à Voglans', batch: 2, image: 'location',
    sections: [
      { title: 'Une adresse à découvrir à l’échelle du quartier', paragraphs: ['La maison se trouve au 93 chemin de la Combe, à Voglans, en Savoie. Son emplacement permet d’envisager une vie tournée vers le bassin du lac du Bourget, Chambéry et Aix-les-Bains. Le choix d’un logement reste toutefois lié à vos propres trajets et à vos besoins.', 'Après la visite, réservez du temps pour parcourir les environs. Observez les accès, les possibilités de marche et les destinations que vous utilisez régulièrement. Vous pourrez ainsi distinguer l’attrait du panorama et l’organisation concrète de vos journées.'] },
      { title: 'Identifier les services qui vous concernent', paragraphs: ['Le site de la mairie de Voglans est le point d’entrée pour les informations municipales et les actualités locales. Pour une installation, consultez les services correspondant à votre situation, puis contactez directement les organismes concernés.', 'Faites votre propre liste : école, activités, achats courants, rendez-vous médicaux et transports. Les horaires ou les disponibilités peuvent évoluer. Ce guide ne présume pas d’une place disponible dans un service ou d’un temps de trajet garanti depuis la maison.'] },
      { title: 'Évaluer aussi l’environnement sonore', paragraphs: ['Les propriétaires signalent des nuisances possibles liées à la voie rapide et à l’aéroport, ainsi qu’un léger vis-à-vis. Il est préférable d’apprécier ces aspects sur place, à des horaires proches de votre futur rythme de vie.', 'Le garage est mitoyen et la maison comporte des escaliers. Ces détails peuvent peser dans votre choix autant que la vue ou la piscine. La page des points clés et une conversation avec les propriétaires permettent de préparer une visite sans éluder ces sujets.'] },
    ], sources: [town], related: ['ecoles-services-voglans', 'deplacements-chambery-aix-les-bains'],
  },
  {
    slug: 'ecoles-services-voglans', title: 'Écoles et services à Voglans : organiser ses recherches',
    description: 'Les démarches et questions utiles pour une famille qui envisage de s’installer à Voglans, avec les sources locales à consulter.',
    group: 'Se projeter à Voglans', batch: 2, image: 'location',
    sections: [
      { title: 'Partir de la situation de votre famille', paragraphs: ['Un achat immobilier peut s’accompagner d’un changement d’école, de garde ou d’activités. Avant de décider, identifiez l’âge des enfants, vos horaires professionnels et les jours où vous aurez besoin d’un accueil complémentaire.', 'La maison comporte trois chambres et un espace nuit au rez-de-chaussée. Cette organisation peut intéresser une famille, mais la visite doit aussi porter sur l’escalier, la circulation vers le jardin et les questions de surveillance autour de la piscine.'] },
      { title: 'Vérifier les modalités auprès de la mairie', paragraphs: ['Consultez le site officiel de Voglans pour retrouver les informations et interlocuteurs municipaux. Demandez quels établissements et quelles démarches correspondent à votre adresse et à votre situation. Les conditions d’inscription doivent être confirmées directement.', 'Préparez vos questions avant de contacter les services : calendrier, pièces à fournir, restauration, accueil avant ou après la classe. Ce site immobilier ne garantit aucune affectation scolaire ni disponibilité. Les réponses officielles priment sur une indication donnée lors d’une visite.'] },
      { title: 'Tester une journée ordinaire', paragraphs: ['Pour apprécier l’emplacement, reconstituez un parcours maison, école ou garde, puis travail. Essayez-le à un horaire pertinent et repérez les conditions de dépose, de stationnement ou de marche.', 'Complétez cette observation avec vos autres besoins : activités, courses et rendez-vous habituels. Un quartier agréable lors d’une visite le week-end peut se vivre différemment un matin de semaine. Cette vérification vous aidera à décider avec vos propres repères.'] },
    ], sources: [town], related: ['vivre-a-voglans', 'preparer-visite-maison-voglans'],
  },
  {
    slug: 'deplacements-chambery-aix-les-bains', title: 'Depuis Voglans vers Chambéry et Aix-les-Bains : tester ses trajets',
    description: 'Préparer ses déplacements depuis la maison : trajets professionnels, transports publics et accès aux gares, sans temps de parcours garanti.',
    group: 'Se projeter à Voglans', batch: 2, image: 'location',
    sections: [
      { title: 'Raisonner avec des adresses précises', paragraphs: ['La maison se situe entre les secteurs de Chambéry et d’Aix-les-Bains. Pour évaluer un trajet professionnel, utilisez l’adresse complète de départ et celle de votre destination. Le centre d’une ville ne représente pas nécessairement votre lieu de travail ou votre gare.', 'Les indications de proximité ne remplacent pas un essai en conditions réelles. Comparez au moins un trajet à l’heure de pointe avec un trajet plus calme et tenez compte du stationnement à l’arrivée. Aucun temps fixe n’est garanti sur cette page.'] },
      { title: 'Vérifier les transports disponibles', paragraphs: ['Le réseau Ondéa Grand Lac publie des informations pour se déplacer sur son territoire. Consultez le calcul d’itinéraire et les horaires correspondant au jour de votre déplacement. Un service adapté à une sortie peut ne pas convenir à un retour tardif.', 'Pour un trajet combinant plusieurs réseaux ou le train, vérifiez séparément les correspondances et le temps de marche. L’arrêt, la ligne et la fréquence utilisables depuis la maison doivent être confirmés avec les informations à jour de l’opérateur.'] },
      { title: 'Les accès propres à la maison', paragraphs: ['Le bien dispose d’un garage double et de stationnements complémentaires. Une borne de recharge est indiquée dans la présentation des équipements. Leur disposition et les manœuvres d’accès se vérifient lors de la visite.', 'Si vous utilisez plusieurs véhicules ou un vélo au quotidien, examinez l’espace réellement nécessaire pour les ranger et les sortir. Ces détails sont particulièrement utiles pour comparer plusieurs maisons dans un même secteur.'] },
    ], sources: [bus], related: ['vivre-a-voglans', 'acces-lac-bourget-depuis-voglans'],
  },
  {
    slug: 'acces-lac-bourget-depuis-voglans', title: 'Rejoindre le lac du Bourget depuis Voglans',
    description: 'Vue depuis la maison, baignade et promenades : distinguer les usages du lac et préparer une sortie vers les Mottets à Viviers-du-Lac.',
    group: 'Se projeter à Voglans', batch: 2, image: 'view',
    sections: [
      { title: 'Du panorama à la promenade', paragraphs: ['La maison offre une vue sur le lac du Bourget, mais ne possède pas d’accès privatif à ses rives. Il faut prévoir un déplacement pour rejoindre une plage ou un lieu de promenade. Cette distinction compte si vous recherchez un usage quotidien du bord de l’eau.', 'Lors de votre venue, associez la visite de la maison à une découverte des rives. Vous pourrez apprécier le trajet, les accès et la manière dont cette proximité s’intégrerait dans vos habitudes, sans vous limiter à une distance annoncée.'] },
      { title: 'Le repère des Mottets', paragraphs: ['La plage des Mottets se situe à Viviers-du-Lac, au 610 allée de la Plage. Grand Lac et l’office de tourisme publient les informations d’accès. Le site des Mottets comprend également des espaces de promenade et de loisirs.', 'Avant une sortie, consultez les conditions du moment : périodes de surveillance, tarification éventuelle, stationnement et restrictions. Elles peuvent évoluer selon la saison. Pour une famille, vérifiez aussi les conditions de baignade le jour même.'] },
      { title: 'Choisir le mode de déplacement adapté', paragraphs: ['Comparez le parcours en voiture avec les possibilités de transport public ou de déplacement actif qui vous conviennent. Ne déduisez pas la facilité d’un trajet à pied ou à vélo de la seule proximité sur une carte : pente, continuité et sécurité du parcours comptent.', 'Le jardin et les terrasses répondent à un autre usage, directement à la maison. En visite, prenez le temps de distinguer ces deux plaisirs : profiter de la vue chez soi et organiser une sortie au bord du lac.'] },
    ], sources: [lake, { label: 'Office de tourisme : plage des Mottets', url: 'https://www.aixlesbains-rivieradesalpes.com/equipement/plage-des-mottets-viviers-du-lac/' }], related: ['vue-lac-orientation-voglans', 'deplacements-chambery-aix-les-bains'],
  },
  {
    slug: 'residence-principale-secondaire-savoie', title: 'Résidence principale ou secondaire : quel usage pour cette maison ?',
    description: 'Comparer deux projets de vie pour cette maison avec vue lac : quotidien familial, séjours ponctuels, entretien et organisation à distance.',
    group: 'Préparer son achat', batch: 3, image: 'pool',
    sections: [
      { title: 'Pour y vivre toute l’année', paragraphs: ['Dans un projet de résidence principale, la priorité est souvent l’organisation des journées : trajets, chambres, rangements et entretien. La maison propose un séjour à l’étage, trois chambres au rez-de-chaussée et un garage double.', 'Regardez comment ce plan s’accorde avec votre mode de vie. Le besoin d’un bureau, l’usage des escaliers et les déplacements entre cuisine et extérieurs méritent un essai concret. Une belle vue ne dispense pas de vérifier ces aspects pratiques.'] },
      { title: 'Pour des séjours ponctuels', paragraphs: ['Un projet de résidence secondaire conduit à d’autres questions : arrivée après une absence, remise en route des équipements, entretien du jardin et suivi de la piscine. Il est utile d’imaginer ces tâches sur une année entière, y compris hors saison.', 'Demandez aux propriétaires comment ils utilisent les équipements et quels entretiens ils effectuent. La disponibilité d’un prestataire ou le coût d’une gestion à distance ne sont pas établis par cette annonce. Ils doivent être étudiés selon votre projet.'] },
      { title: 'Comparer le coût global et les contraintes', paragraphs: ['Au-delà du prix affiché, préparez votre budget d’acquisition et de fonctionnement avec les professionnels concernés. Votre situation personnelle et l’usage du logement peuvent modifier les dépenses à prévoir.', 'Ce site ne présente aucun rendement locatif et ne garantit pas la possibilité d’une location touristique. Si cette dimension entre dans votre projet, faites vérifier les règles applicables, le statut du bien et les démarches nécessaires avant de vous engager.'] },
    ], sources: [{ label: 'Service Public : préparer un achat immobilier', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F15913' }], related: ['confort-energie-dpe-b', 'documents-achat-maison'],
  },
  {
    slug: 'preparer-visite-maison-voglans', title: 'Préparer une visite de la maison à Voglans',
    description: 'Un parcours de visite concret : séjour avec vue lac, chambres, terrasses, accès et documents à demander aux propriétaires.',
    group: 'Préparer son achat', batch: 3, image: 'living',
    sections: [
      { title: 'Avant de prendre rendez-vous', paragraphs: ['Consultez les photos, le plan d’organisation des pièces et la page des points clés. Notez vos critères indispensables et les sujets sur lesquels vous souhaitez une réponse. Cela permet de consacrer la visite à votre projet plutôt qu’à répéter les informations de l’annonce.', 'Les propriétaires organisent les visites sur rendez-vous. Indiquez vos disponibilités et, si vous venez de loin, le temps dont vous disposez. Pour un échange en anglais, convenez à l’avance des modalités ou prévoyez une personne pour vous accompagner.'] },
      { title: 'Parcourir les deux niveaux et les extérieurs', paragraphs: ['À l’étage, examinez la cuisine, le séjour, la lumière et les accès aux terrasses. Au rez-de-chaussée, regardez les trois chambres, les salles d’eau, la buanderie et les rangements. Essayez les circulations entre stationnement et pièces de vie.', 'À l’extérieur, prenez le temps de voir la piscine, le jardin et les limites. Observez les vis-à-vis et l’environnement sonore. Les propriétaires signalent des bruits possibles de la voie rapide et de l’aéroport ; une seconde visite à un autre horaire peut être pertinente.'] },
      { title: 'Faire le point avant de décider', paragraphs: ['Après la visite, distinguez les questions déjà résolues de celles qui nécessitent un document ou un avis professionnel. Demandez les diagnostics et les éléments utiles sur les équipements. Le garage mitoyen et les escaliers doivent être pris en compte dans votre appréciation.'], checklist: ['Noter les pièces ou équipements à revoir.', 'Demander les documents manquants sans supposer leur contenu.', 'Convenir d’un nouvel échange avec les propriétaires.'] },
    ], sources: [], related: ['documents-achat-maison', 'vente-entre-particuliers-etapes'],
  },
  {
    slug: 'documents-achat-maison', title: 'Quels documents consulter avant d’acheter cette maison ?',
    description: 'Diagnostics, plans et équipements : préparer une liste de documents à examiner avec les propriétaires et le notaire avant l’achat.',
    group: 'Préparer son achat', batch: 3, image: 'living',
    sections: [
      { title: 'Commencer par les diagnostics', paragraphs: ['Le dossier de diagnostic technique rassemble les diagnostics applicables à la vente. Leur liste dépend de la situation du logement. Service Public présente les documents concernés ; le notaire aide à vérifier le dossier correspondant précisément au bien.', 'La classe DPE B a été communiquée par le propriétaire. Demandez le rapport complet pour lire la date, les résultats et les hypothèses de calcul. Les autres informations, notamment la classe GES et les années de référence des coûts d’énergie, ne doivent pas être déduites de la seule lettre B.'] },
      { title: 'Comprendre le terrain et les accès', paragraphs: ['Demandez les éléments permettant de distinguer surface habitable, jardin et parcelle. Regardez les limites, les accès et le statut du garage mitoyen. Une visite permet de voir l’usage des lieux ; les documents précisent les droits et obligations associés.', 'La maison est présentée comme construite en 2020. Les plans et pièces disponibles sur la construction ou les aménagements seront utiles à votre examen. Ne supposez pas qu’un document existe ou qu’une autorisation est acquise : demandez confirmation pour chaque point important.'] },
      { title: 'Examiner les équipements', paragraphs: ['Pour la pompe à chaleur, la climatisation et la piscine, recherchez les notices, les références et les justificatifs d’entretien disponibles. Ils permettent d’anticiper l’usage et la maintenance après l’achat.', 'Préparez une liste commune avec votre notaire et signalez les points non résolus avant de signer. Cette page sert à organiser vos questions ; elle ne remplace ni les diagnostics ni la vérification juridique du dossier.'] },
    ], sources: [diagnostics, dpe], related: ['confort-energie-dpe-b', 'vente-entre-particuliers-etapes'],
  },
  {
    slug: 'vente-entre-particuliers-etapes', title: 'Acheter entre particuliers : du premier échange à la signature',
    description: 'Comprendre les grandes étapes d’un achat direct auprès des propriétaires : visite, documents, proposition et accompagnement du notaire.',
    group: 'Préparer son achat', batch: 3, image: 'view',
    sections: [
      { title: 'Échanger directement sur le bien', paragraphs: ['La vente présentée sur ce site se fait directement avec les propriétaires. Vous pouvez leur poser vos questions sur la vie dans la maison, les équipements et les raisons pratiques qui comptent dans votre projet. Un rendez-vous permet ensuite de confronter les photos à votre propre impression.', 'Préparez un retour précis après la visite : ce qui vous convient, les points à éclaircir et les documents souhaités. Cela facilite les échanges et évite de confondre un intérêt pour le panorama avec une décision d’achat déjà mûrie.'] },
      { title: 'Formaliser le projet avec le notaire', paragraphs: ['Lorsque votre intérêt se confirme, échangez sur les conditions envisagées et faites-vous accompagner pour les formaliser. Le prix ne constitue qu’un élément du projet : financement, calendrier et contenu du dossier doivent également être examinés.', 'Service Public distingue notamment la promesse unilatérale et le compromis de vente. Le notaire vous explique le document adapté, les conditions et les délais applicables à votre situation. Un achat entre particuliers conserve cette étape de vérification et de sécurisation.'] },
      { title: 'Anticiper la suite', paragraphs: ['Avant la signature définitive, faites préciser ce qui reste dans la maison, les modalités de remise des clés et les informations nécessaires pour reprendre les équipements. Conservez les réponses et les documents échangés.', 'Pour un acheteur venant de l’étranger, prévoyez également les échanges avec le notaire, la compréhension des documents et les contraintes de déplacement. Cette page ne fixe aucun calendrier universel : les étapes dépendent du dossier et du financement.'] },
    ], sources: [contract, { label: 'Service Public : acte de vente', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2962' }], related: ['preparer-visite-maison-voglans', 'documents-achat-maison'],
  },
];

export const publishedGuides = guides.filter(guide => guide.batch <= contentBatch);
