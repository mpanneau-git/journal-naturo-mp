import { useState, useEffect, useCallback, useRef } from 'react';
import { emptyWeek } from './constants';

const KEY = 'mp_journal_v2';

export function useJournal() {
  const [client, setClient]   = useState({ nom: '', semaine: 1, dateDebut: '', motif: '' });
  const [days, setDays]       = useState(emptyWeek());
  const [saveStatus, setSave] = useState('idle'); // idle | saving | saved
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  // ── Charger depuis localStorage au montage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const { client: c, days: d, started: s } = JSON.parse(raw);
        if (c) setClient(c);
        if (d) setDays(d);
        if (s) setStarted(s);
      }
    } catch(e) { /* ignore */ }
    setSave('idle');
  }, []);

  // ── Sauvegarder avec debounce ──
  const persist = useCallback((newClient, newDays, newStarted) => {
    setSave('saving');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify({
          client: newClient,
          days: newDays,
          started: newStarted,
          ts: Date.now()
        }));
        setSave('saved');
      } catch(e) {
        setSave('error');
      }
    }, 600);
  }, []);

  // ── Mettre à jour le client ──
  const updateClient = useCallback((field, value) => {
    setClient(prev => {
      const next = { ...prev, [field]: value };
      persist(next, days, started);
      return next;
    });
  }, [days, started, persist]);

  // ── Mettre à jour un champ d'un jour ──
  const updateDay = useCallback((dayIdx, path, value) => {
    setDays(prev => {
      const next = prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const updated = structuredClone(d);
        // path ex: 'repas.pdj' ou 'sommeil.coucher' ou 'bilan.energie'
        const parts = path.split('.');
        let obj = updated;
        for (let p = 0; p < parts.length - 1; p++) obj = obj[parts[p]];
        obj[parts[parts.length - 1]] = value;
        updated.done = true;
        return updated;
      });
      persist(client, next, started);
      return next;
    });
  }, [client, started, persist]);

  // ── Ajouter / modifier / supprimer une session sport ──
  const addSport = useCallback((dayIdx) => {
    setDays(prev => {
      const next = prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const updated = structuredClone(d);
        updated.sport.push({ type:'', heure:'', duree:'', intensite:null, jeun:'', ressenti:'' });
        updated.done = true;
        return updated;
      });
      persist(client, next, started);
      return next;
    });
  }, [client, started, persist]);

  const updateSport = useCallback((dayIdx, si, field, value) => {
    setDays(prev => {
      const next = prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const updated = structuredClone(d);
        updated.sport[si][field] = value;
        return updated;
      });
      persist(client, next, started);
      return next;
    });
  }, [client, started, persist]);

  const removeSport = useCallback((dayIdx, si) => {
    setDays(prev => {
      const next = prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const updated = structuredClone(d);
        updated.sport.splice(si, 1);
        return updated;
      });
      persist(client, next, started);
      return next;
    });
  }, [client, started, persist]);

  // ── Médicaments ──
  const addMedic = useCallback((dayIdx) => {
    setDays(prev => {
      const next = prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const updated = structuredClone(d);
        updated.medicaments.push({ nom:'', dose:'', qte:'', moment:'', pris:'' });
        updated.done = true;
        return updated;
      });
      persist(client, next, started);
      return next;
    });
  }, [client, started, persist]);

  const updateMedic = useCallback((dayIdx, mi, field, value) => {
    setDays(prev => {
      const next = prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const updated = structuredClone(d);
        updated.medicaments[mi][field] = value;
        return updated;
      });
      persist(client, next, started);
      return next;
    });
  }, [client, started, persist]);

  const removeMedic = useCallback((dayIdx, mi) => {
    setDays(prev => {
      const next = prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const updated = structuredClone(d);
        updated.medicaments.splice(mi, 1);
        return updated;
      });
      persist(client, next, started);
      return next;
    });
  }, [client, started, persist]);

  // ── Toggle tag (symptômes, stress, gestion) ──
  const toggleTag = useCallback((dayIdx, path, tag) => {
    setDays(prev => {
      const next = prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const updated = structuredClone(d);
        const parts = path.split('.');
        let obj = updated;
        for (let p = 0; p < parts.length - 1; p++) obj = obj[parts[p]];
        const arr = obj[parts[parts.length - 1]];
        const idx = arr.indexOf(tag);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(tag);
        updated.done = true;
        return updated;
      });
      persist(client, next, started);
      return next;
    });
  }, [client, started, persist]);

  // ── Démarrer ──
  const start = useCallback((clientData) => {
    setClient(clientData);
    setStarted(true);
    persist(clientData, days, true);
  }, [days, persist]);

  // ── Reset ──
  const reset = useCallback(() => {
    const fresh = emptyWeek();
    const freshClient = { nom:'', semaine:1, dateDebut:'', motif:'' };
    setClient(freshClient);
    setDays(fresh);
    setStarted(false);
    localStorage.removeItem(KEY);
    setSave('idle');
  }, []);

  return {
    client, days, saveStatus, started,
    updateClient, updateDay, start, reset,
    addSport, updateSport, removeSport,
    addMedic, updateMedic, removeMedic,
    toggleTag
  };
}
