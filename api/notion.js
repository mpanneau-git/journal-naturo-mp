// api/notion.js — Vercel Serverless Function
// Reçoit les données du journal et les écrit dans Notion

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { action, payload } = req.body;

      // ── Créer ou mettre à jour une entrée journal ──
      if (action === 'upsert') {
        const { clientNom, semaine, dateDebut, motif, jourIndex, jourData } = payload;

        // Chercher si une entrée existe déjà pour ce client + semaine
        const search = await notion.databases.query({
          database_id: DB_ID,
          filter: {
            and: [
              { property: 'Client', rich_text: { equals: clientNom } },
              { property: 'Semaine n°', number: { equals: semaine } }
            ]
          }
        });

        const jourLabel = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][jourIndex];
        const contenuJour = formatDayContent(jourLabel, jourData);

        if (search.results.length > 0) {
          // Mettre à jour la page existante
          const pageId = search.results[0].id;
          // Ajouter le contenu du jour comme bloc dans la page
          await notion.blocks.children.append({
            block_id: pageId,
            children: buildDayBlocks(jourLabel, jourData)
          });
          // Mettre à jour le statut
          await notion.pages.update({
            page_id: pageId,
            properties: { 'Statut': { select: { name: 'En cours' } } }
          });
          return res.json({ ok: true, pageId, action: 'updated' });

        } else {
          // Créer une nouvelle entrée
          const page = await notion.pages.create({
            parent: { database_id: DB_ID },
            properties: {
              'Journal':      { title: [{ text: { content: `${clientNom} — Semaine ${semaine}` } }] },
              'Client':       { rich_text: [{ text: { content: clientNom } }] },
              'Semaine n°':   { number: semaine },
              'Date de début':{ date: { start: dateDebut } },
              'Motif principal': { rich_text: [{ text: { content: motif || '' } }] },
              'Statut':       { select: { name: 'En cours' } }
            },
            children: buildDayBlocks(jourLabel, jourData)
          });
          return res.json({ ok: true, pageId: page.id, action: 'created' });
        }
      }

      // ── Marquer la semaine comme terminée ──
      if (action === 'complete') {
        const { clientNom, semaine } = payload;
        const search = await notion.databases.query({
          database_id: DB_ID,
          filter: {
            and: [
              { property: 'Client', rich_text: { equals: clientNom } },
              { property: 'Semaine n°', number: { equals: semaine } }
            ]
          }
        });
        if (search.results.length > 0) {
          await notion.pages.update({
            page_id: search.results[0].id,
            properties: { 'Statut': { select: { name: 'Complété' } } }
          });
          // Notifier Make si webhook configuré
          if (process.env.MAKE_WEBHOOK_URL) {
            await fetch(process.env.MAKE_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                clientNom, semaine,
                notionUrl: `https://notion.so/${search.results[0].id.replace(/-/g,'')}`
              })
            });
          }
        }
        return res.json({ ok: true });
      }

      return res.status(400).json({ error: 'Action inconnue' });
    }

    // GET — sanity check
    if (req.method === 'GET') {
      return res.json({ ok: true, message: 'API Journal MP opérationnelle' });
    }

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── Formate le contenu d'un jour en blocs Notion ──
function buildDayBlocks(jourLabel, data) {
  const blocks = [];

  // Titre du jour
  blocks.push({
    object: 'block', type: 'heading_2',
    heading_2: { rich_text: [{ text: { content: `📅 ${jourLabel}` } }] }
  });

  // Section Alimentation
  if (data.repas) {
    blocks.push(heading3('🥗 Alimentation & Boissons'));
    const repasMap = {
      pdj: 'Petit-déjeuner', dej: 'Déjeuner',
      din: 'Dîner', col: 'Collations', boissons: 'Boissons'
    };
    Object.entries(repasMap).forEach(([key, label]) => {
      if (data.repas[key]) blocks.push(bullet(`${label} : ${data.repas[key]}`));
    });
    if (data.hydratation) blocks.push(bullet(`💧 Hydratation : ${data.hydratation}`));
  }

  // Section Sport
  if (data.sport?.length) {
    blocks.push(heading3('🏃 Activité physique'));
    data.sport.forEach(s => {
      const txt = [s.type, s.duree ? s.duree+'min' : '', s.intensite, s.ressenti]
        .filter(Boolean).join(' — ');
      if (txt) blocks.push(bullet(txt));
    });
  }

  // Section Transit
  if (data.transit) {
    blocks.push(heading3('🌿 Transit & Symptômes'));
    if (data.transit.nbSelles) blocks.push(bullet(`Selles : ${data.transit.nbSelles}`));
    if (data.transit.bristol) blocks.push(bullet(`Bristol : ${data.transit.bristol}`));
    if (data.transit.symptomes?.length) blocks.push(bullet(`Symptômes : ${data.transit.symptomes.join(', ')}`));
    if (data.transit.detail) blocks.push(bullet(`Détail : ${data.transit.detail}`));
  }

  // Section Sommeil
  if (data.sommeil) {
    blocks.push(heading3('🌙 Sommeil'));
    const s = data.sommeil;
    if (s.coucher || s.lever) blocks.push(bullet(`Coucher ${s.coucher||'?'} → Lever ${s.lever||'?'}${s.duree ? ' ('+s.duree+')' : ''}`));
    if (s.qualite) blocks.push(bullet(`Qualité : ${s.qualite}/5`));
    if (s.reveils) blocks.push(bullet(`Réveils : ${s.reveils}`));
    if (s.obs) blocks.push(bullet(`Obs : ${s.obs}`));
  }

  // Section Médicaments
  if (data.medicaments?.length) {
    blocks.push(heading3('💊 Médicaments & Compléments'));
    data.medicaments.forEach(m => {
      const txt = [m.nom, m.dose, m.moment, m.pris].filter(Boolean).join(' — ');
      if (txt) blocks.push(bullet(txt));
    });
  }

  // Section Stress
  if (data.stress) {
    blocks.push(heading3('🧠 Stress & Psycho-émotionnel'));
    if (data.stress.niveau) blocks.push(bullet(`Stress : ${data.stress.niveau}/10`));
    if (data.stress.sources?.length) blocks.push(bullet(`Sources : ${data.stress.sources.join(', ')}`));
    if (data.stress.gestion?.length) blocks.push(bullet(`Gestion : ${data.stress.gestion.join(', ')}`));
    if (data.stress.obs) blocks.push(bullet(`Obs : ${data.stress.obs}`));
  }

  // Bilan
  if (data.bilan) {
    blocks.push(heading3('📊 Bilan du jour'));
    const b = data.bilan;
    const scores = [
      b.energie ? `Énergie ${b.energie}/10` : null,
      b.humeur ? `Humeur ${b.humeur}/10` : null,
      b.digestion ? `Digestion ${b.digestion}/10` : null,
      b.recup ? `Récup ${b.recup}/10` : null
    ].filter(Boolean);
    if (scores.length) blocks.push(bullet(scores.join(' | ')));
    if (b.note) blocks.push(bullet(`Note : ${b.note}`));
  }

  // Séparateur
  blocks.push({ object: 'block', type: 'divider', divider: {} });

  return blocks;
}

const heading3 = (text) => ({
  object: 'block', type: 'heading_3',
  heading_3: { rich_text: [{ text: { content: text } }] }
});

const bullet = (text) => ({
  object: 'block', type: 'bulleted_list_item',
  bulleted_list_item: { rich_text: [{ text: { content: text.substring(0, 2000) } }] }
});
