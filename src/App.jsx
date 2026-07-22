import { useState } from 'react';
import { useJournal } from './lib/useJournal';
import Welcome from './components/Welcome';
import Journal from './components/Journal';

export default function App() {
  const journal = useJournal();

  return (
    <>
      <header>
        <div className="monogram">MP</div>
        <div className="header-text">
          <h1>Michaël Panneau — Naturopathe Iridologue</h1>
          <p>Journal de suivi hebdomadaire · Confidentiel</p>
        </div>
        {journal.started && (
          <div className="header-right">
            <SaveBadge status={journal.saveStatus} />
            <button className="btn btn-ghost" onClick={() => {
              if (confirm('Recommencer une nouvelle semaine ? Les données actuelles resteront dans Notion.')) journal.reset();
            }}>↺ Nouvelle semaine</button>
          </div>
        )}
      </header>

      {!journal.started
        ? <Welcome onStart={journal.start} existingClient={journal.client} />
        : <Journal {...journal} />
      }
    </>
  );
}

function SaveBadge({ status }) {
  const map = {
    idle:   { cls: '',        txt: 'Non sauvegardé' },
    saving: { cls: 'saving', txt: 'Sauvegarde...' },
    saved:  { cls: 'saved',  txt: 'Sauvegardé ✓' },
    error:  { cls: '',        txt: '⚠ Erreur' },
  };
  const { cls, txt } = map[status] || map.idle;
  return <div className={`save-badge ${cls}`}>{txt}</div>;
}
