import { useState, useEffect } from 'react';

export default function Welcome({ onStart, existingClient }) {
  const [form, setForm] = useState({
    nom: existingClient?.nom || '',
    semaine: existingClient?.semaine || 1,
    dateDebut: existingClient?.dateDebut || '',
    motif: existingClient?.motif || ''
  });

  useEffect(() => {
    if (!form.dateDebut) {
      const today = new Date();
      const mon = new Date(today);
      mon.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
      setForm(f => ({ ...f, dateDebut: mon.toISOString().split('T')[0] }));
    }
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canStart = form.nom.trim().length >= 2;

  const handleStart = () => {
    if (!canStart) return;
    onStart({ ...form, nom: form.nom.trim(), semaine: Number(form.semaine) });
  };

  const hasExisting = existingClient?.nom && existingClient.nom === form.nom;

  return (
    <div className="welcome">
      <div className="welcome-card">
        <h2>🌿 Bienvenue</h2>
        <p className="subtitle">
          Ce journal vous accompagne sur 7 jours. Remplissez-le chaque soir, à votre rythme.
          Vos données sont transmises directement à Michaël en fin de semaine.
        </p>

        {hasExisting && (
          <div style={{
            background: 'var(--vert-l)', border: '1px solid var(--vert)',
            borderRadius: 8, padding: '12px 14px', marginBottom: 20,
            fontSize: 13, color: 'var(--vert)'
          }}>
            ✓ Données de votre semaine précédente retrouvées. Vous pouvez reprendre où vous en étiez.
          </div>
        )}

        <div className="form-group">
          <label>Votre prénom et nom</label>
          <input
            type="text" placeholder="Ex. : Marie Dupont"
            value={form.nom} onChange={e => set('nom', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Motif principal de suivi</label>
          <input
            type="text" placeholder="Ex. : Fatigue chronique, digestion, sommeil..."
            value={form.motif} onChange={e => set('motif', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Semaine n°</label>
            <input
              type="number" min="1" max="52"
              value={form.semaine} onChange={e => set('semaine', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Date du lundi de cette semaine</label>
            <input
              type="date"
              value={form.dateDebut} onChange={e => set('dateDebut', e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-vert" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}
          onClick={handleStart} disabled={!canStart}
        >
          {hasExisting ? 'Reprendre mon journal →' : 'Commencer mon journal →'}
        </button>

        <p className="welcome-legal">
          Vos données sont enregistrées localement sur cet appareil et transmises à Michaël Panneau,
          naturopathe, à la fin de la semaine. Elles ne sont pas partagées avec des tiers.
          Ce journal ne constitue pas un dossier médical.
        </p>
      </div>
    </div>
  );
}
