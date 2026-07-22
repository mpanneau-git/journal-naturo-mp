export const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

export const REPAS_MOMENTS = [
  { key: 'pdj', label: 'Petit-déjeuner', ph: 'Pain complet, beurre, confiture, café...' },
  { key: 'dej', label: 'Déjeuner',        ph: 'Riz, poulet, haricots verts, huile olive...' },
  { key: 'din', label: 'Dîner',            ph: 'Soupe maison, tartine, tisane...' },
  { key: 'col', label: 'Collations',       ph: '10h : 1 pomme. 16h : 2 carrés chocolat...' },
];

export const SYMPTOMES = [
  'Ballonnements','Gaz','Douleurs abdominales','Constipation',
  'Transit accéléré','Nausées','Reflux','Démangeaisons',
  'Éruption cutanée','Douleurs articulaires','Maux de tête','Aucun'
];

export const SOURCES_STRESS = [
  'Travail','Relations','Finances','Santé','Famille','Aucun','Autre'
];

export const GESTION_STRESS = [
  'Cohérence cardiaque','Méditation','Marche','Sport','Lecture','Nature','Musique','Autre'
];

export const TYPES_SPORT = [
  'Marche','Course à pied','Vélo','Natation','Musculation',
  'Yoga / Pilates','Étirements','Sport collectif','Arts martiaux','Autre'
];

export const INTENSITES = ['Légère','Modérée','Intense','Maximale'];

export const MOMENTS_MEDIC = [
  'À jeun','Avec le petit-déjeuner','Avec le déjeuner','Avec le dîner','Avant le coucher','Autre'
];

export const BRISTOL = [
  { num: '1', label: 'Très dur',      emoji: '⚫' },
  { num: '2', label: 'Dur',           emoji: '🟤' },
  { num: '3', label: 'Normal ferme',  emoji: '🟢' },
  { num: '4', label: 'Normal mou',    emoji: '🟢' },
  { num: '5', label: 'Mou',           emoji: '🟡' },
  { num: '6', label: 'Liquide',       emoji: '🔴' },
];

// Valeur par défaut d'un jour vide
export const emptyDay = () => ({
  repas:       { pdj:'', dej:'', din:'', col:'', boissons:'' },
  hydratation: 0,
  sport:       [],
  transit: {
    nbSelles: '', bristol: null,
    symptomes: [], detail: ''
  },
  sommeil: {
    coucher:'', lever:'', qualite: null, reveils:'', obs:''
  },
  medicaments: [],
  stress: {
    niveau: null, sources: [], gestion: [], obs: ''
  },
  cycle: {
    actif: false, jourCycle:'', phase:'', regles:'', symptomes:''
  },
  bilan: {
    energie: null, humeur: null, digestion: null, recup: null, note: ''
  },
  done: false
});

export const emptyWeek = () => Array.from({ length: 7 }, emptyDay);
