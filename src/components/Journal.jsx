import { useState, useCallback } from 'react';
import { JOURS } from '../lib/constants';
import { saveDay, completeWeek } from '../lib/api';
import DayPanel from './DayPanel';
import FinDeSemaine from './FinDeSemaine';

export default function Journal({
  client, days, updateDay, updateClient,
  addSport, updateSport, removeSport,
  addMedic, updateMedic, removeMedic,
  toggleTag, reset
}) {
  const [activeDay, setActiveDay] = useState(0);
  const [syncing, setSyncing]     = useState(false);
  const [toast, setToast]         = useState(null);
  const [showFin, setShowFin]     = useState(false);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Envoyer le jour courant à Notion
  const handleSaveDay = useCallback(async () => {
    setSyncing(true);
    try {
      await saveDay(client, activeDay, days[activeDay]);
      showToast(`${JOURS[activeDay]} enregistré dans Notion ✓`);
    } catch(e) {
      showToast('Erreur de connexion — réessayez', 'error');
    } finally {
      setSyncing(false);
    }
  }, [client, activeDay, days, showToast]);

  // Terminer la semaine
  const handleFinSemaine = useCallback(async () => {
    setSyncing(true);
    try {
      // Envoyer tous les jours remplis
      const filledDays = days.map((d,i) => d.done ? i : -1).filter(i => i >= 0);
      for (const i of filledDays) await saveDay(client, i, days[i]);
      await completeWeek(client);
      setShowFin(true);
    } catch(e) {
      showToast('Erreur lors de l\'envoi — réessayez', 'error');
    } finally {
      setSyncing(false);
    }
  }, [client, days, showToast]);

  if (showFin) return <FinDeSemaine client={client} days={days} onReset={reset} />;

  const doneCount = days.filter(d => d.done).length;

  return (
    <>
      {/* ── Onglets jours ── */}
      <div className="tabs-bar">
        {JOURS.map((j, i) => (
          <button
            key={i}
            className={`tab ${activeDay === i ? 'active' : ''} ${days[i].done ? 'done' : ''}`}
            onClick={() => setActiveDay(i)}
          >
            <span className="day-name">{j}</span>
            <span className="day-num">J{i + 1}</span>
          </button>
        ))}
      </div>

      {/* ── Panel du jour actif ── */}
      <div className="day-content">
        <DayPanel
          dayIdx={activeDay}
          data={days[activeDay]}
          updateDay={updateDay}
          addSport={addSport} updateSport={updateSport} removeSport={removeSport}
          addMedic={addMedic} updateMedic={updateMedic} removeMedic={removeMedic}
          toggleTag={toggleTag}
        />
      </div>

      {/* ── Barre de bas de page ── */}
      <div className="day-footer">
        <span className="left">
          {doneCount} jour{doneCount > 1 ? 's' : ''} rempli{doneCount > 1 ? 's' : ''}
          {doneCount === 7 ? ' — semaine complète 🎉' : ` sur 7`}
        </span>
        <div className="right">
          <button
            className="btn btn-ghost"
            onClick={handleSaveDay}
            disabled={syncing || !days[activeDay].done}
          >
            {syncing ? '…' : '☁ Enregistrer ce jour'}
          </button>
          <button
            className="btn btn-or"
            onClick={() => {
              if (doneCount === 0) return showToast('Remplissez au moins un jour avant d\'envoyer', 'error');
              if (confirm(`Envoyer les ${doneCount} jour(s) rempli(s) à Michaël Panneau ?`)) handleFinSemaine();
            }}
            disabled={syncing}
          >
            {syncing ? 'Envoi…' : '✉ Terminer et envoyer ma semaine'}
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
