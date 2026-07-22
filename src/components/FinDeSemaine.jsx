import { JOURS } from '../lib/constants';

export default function FinDeSemaine({ client, days, onReset }) {
  const doneCount = days.filter(d => d.done).length;

  return (
    <div style={{ padding: '40px 20px' }}>
      <div className="fin-card">
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
        <h2>Semaine envoyée !</h2>
        <p>
          Merci {client.nom.split(' ')[0]} — vos données ont bien été transmises à Michaël Panneau.
          Il les analysera avant votre prochain rendez-vous.
        </p>

        <div className="week-summary">
          <strong>Récapitulatif — Semaine {client.semaine}</strong><br />
          {JOURS.map((j, i) => {
            const d = days[i];
            if (!d.done) return <span key={i} style={{ color: 'var(--gris-m)' }}>• {j} : non renseigné<br /></span>;
            const scores = [d.bilan.energie, d.bilan.humeur, d.bilan.digestion, d.bilan.recup].filter(Boolean);
            const moy = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
            return (
              <span key={i} style={{ color: 'var(--texte)' }}>
                ✓ {j} : score moyen {moy}/10
                {d.stress.niveau ? `, stress ${d.stress.niveau}/10` : ''}
                {d.sport.length ? `, ${d.sport.length} activité(s)` : ''}
                <br />
              </span>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: 'var(--doux)', marginBottom: 20 }}>
          Vos données sont également sauvegardées dans la base Notion de Michaël et
          visibles dans votre espace client. Un email de confirmation lui a été envoyé
          automatiquement.
        </p>

        <button className="btn btn-vert" style={{ width: '100%', justifyContent: 'center' }}
          onClick={onReset}>
          Commencer une nouvelle semaine →
        </button>
      </div>
    </div>
  );
}
