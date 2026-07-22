const BASE = '/api/notion';

export async function saveDay(client, dayIdx, dayData) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upsert',
      payload: {
        clientNom:  client.nom,
        semaine:    client.semaine,
        dateDebut:  client.dateDebut,
        motif:      client.motif,
        jourIndex:  dayIdx,
        jourData:   dayData
      }
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function completeWeek(client) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'complete',
      payload: { clientNom: client.nom, semaine: client.semaine }
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
