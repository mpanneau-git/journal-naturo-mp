import { useState } from 'react';
import {
  REPAS_MOMENTS, SYMPTOMES, SOURCES_STRESS, GESTION_STRESS,
  TYPES_SPORT, INTENSITES, MOMENTS_MEDIC, BRISTOL, JOURS
} from '../lib/constants';

// ── Composant Section repliable ──
function Section({ title, icon, className, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`section-card ${className}`}>
      <div className={`section-head ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="s-icon">{icon}</span>
        <h2>{title}</h2>
        <span className="chevron">▼</span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

// ── Échelle numérique ──
function ScaleRow({ max = 10, value, onChange, colorize = true }) {
  return (
    <div className="scale-row">
      {Array.from({ length: max }, (_, i) => i + 1).map(n => {
        let cls = '';
        if (value === n && colorize) {
          if (n <= 3) cls = 's-red';
          else if (n <= 6) cls = 's-or';
          else cls = 's-vert';
        } else if (value === n) cls = 's-vert';
        return (
          <button key={n} className={`scale-btn ${cls}`}
            onClick={() => onChange(value === n ? null : n)}>
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ── Tags cliquables ──
function TagRow({ tags, selected, onToggle }) {
  return (
    <div className="tags-row">
      {tags.map(t => (
        <button key={t} className={`tag ${selected?.includes(t) ? 'active' : ''}`}
          onClick={() => onToggle(t)}>{t}</button>
      ))}
    </div>
  );
}

// ── Champ de formulaire ──
function Field({ label, children, style }) {
  return (
    <div className="field" style={style}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

export default function DayPanel({
  dayIdx, data,
  updateDay, addSport, updateSport, removeSport,
  addMedic, updateMedic, removeMedic, toggleTag
}) {
  const j = JOURS[dayIdx];
  const up = (path, val) => updateDay(dayIdx, path, val);

  // Calcul auto durée sommeil
  const calcSommeil = (coucher, lever) => {
    if (!coucher || !lever) return '';
    const [ch, cm] = coucher.split(':').map(Number);
    const [lh, lm] = lever.split(':').map(Number);
    let mins = (lh * 60 + lm) - (ch * 60 + cm);
    if (mins < 0) mins += 24 * 60;
    return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? (mins % 60) + 'min' : ''}`;
  };

  return (
    <>
      {/* 1. ALIMENTATION */}
      <Section title="Alimentation & Boissons" icon="🥗" className="sec-repas">
        <div className="repas-grid">
          {REPAS_MOMENTS.map(m => (
            <div className="repas-card" key={m.key}>
              <h3>{m.label}</h3>
              <textarea
                placeholder={m.ph}
                value={data.repas[m.key]}
                onChange={e => up(`repas.${m.key}`, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="form-row" style={{ marginTop: 14 }}>
          <Field label="Eau et boissons hors repas" style={{ flex: 2 }}>
            <textarea
              placeholder="Ex. : 3 verres eau filtrée, 1 café, 1 tisane gingembre..."
              value={data.repas.boissons}
              onChange={e => up('repas.boissons', e.target.value)}
              style={{ minHeight: 55 }}
            />
          </Field>
          <Field label={`Hydratation estimée — ${data.hydratation * 250 >= 1000 ? (data.hydratation * 250 / 1000).toFixed(1) + ' L' : data.hydratation * 250 + ' ml'}`}>
            <div className="water-row">
              {Array.from({ length: 10 }, (_, i) => (
                <button key={i} className={`glass ${i < data.hydratation ? 'on' : ''}`}
                  onClick={() => up('hydratation', i < data.hydratation ? i : i + 1)}
                  title={`${(i + 1) * 250} ml`}>🥛</button>
              ))}
            </div>
            <p className="hint">Chaque 🥛 = 250 ml</p>
          </Field>
        </div>
      </Section>

      {/* 2. ACTIVITÉ PHYSIQUE */}
      <Section title="Activité physique" icon="🏃" className="sec-sport">
        {data.sport.map((s, si) => (
          <div className="dynamic-block" key={si}>
            <button className="btn-remove-row" onClick={() => removeSport(dayIdx, si)}>✕</button>
            <div className="form-row">
              <Field label="Type d'activité">
                <select value={s.type} onChange={e => updateSport(dayIdx, si, 'type', e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {TYPES_SPORT.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Heure de début">
                <input type="time" value={s.heure} onChange={e => updateSport(dayIdx, si, 'heure', e.target.value)} />
              </Field>
              <Field label="Durée (min)">
                <input type="number" min="5" max="300" placeholder="45" value={s.duree}
                  onChange={e => updateSport(dayIdx, si, 'duree', e.target.value)} />
              </Field>
              <Field label="À jeun ?">
                <select value={s.jeun} onChange={e => updateSport(dayIdx, si, 'jeun', e.target.value)}>
                  <option value="">---</option>
                  <option>Oui</option><option>Non</option>
                </select>
              </Field>
            </div>
            <div className="form-row" style={{ marginTop: 8 }}>
              <Field label="Intensité perçue">
                <div className="scale-row">
                  {INTENSITES.map((label, ii) => (
                    <button key={ii}
                      className={`scale-btn ${s.intensite === label ? 's-vert' : ''}`}
                      style={{ width: 'auto', padding: '0 10px', fontSize: 11 }}
                      onClick={() => updateSport(dayIdx, si, 'intensite', s.intensite === label ? null : label)}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Ressenti post-effort" style={{ flex: 2 }}>
                <input type="text" placeholder="Bonne énergie, douleur genou, difficile de finir..."
                  value={s.ressenti} onChange={e => updateSport(dayIdx, si, 'ressenti', e.target.value)} />
              </Field>
            </div>
          </div>
        ))}
        <button className="btn-add-dyn" onClick={() => addSport(dayIdx)}>+ Ajouter une session</button>
        <p className="hint" style={{ marginTop: 8 }}>Pas d'activité ? Laissez vide — c'est aussi une donnée utile.</p>
      </Section>

      {/* 3. TRANSIT */}
      <Section title="Transit & Symptômes" icon="🌿" className="sec-transit">
        <div className="form-row">
          <Field label="Nombre de selles">
            <input type="number" min="0" max="15" placeholder="Ex. : 1"
              value={data.transit.nbSelles}
              onChange={e => up('transit.nbSelles', e.target.value)} />
          </Field>
          <Field label="Consistance — Échelle de Bristol" style={{ flex: 3 }}>
            <div className="bristol-grid">
              {BRISTOL.map((b, bi) => (
                <button key={bi}
                  className={`bristol-btn ${data.transit.bristol === b.num ? 'active' : ''}`}
                  onClick={() => up('transit.bristol', data.transit.bristol === b.num ? null : b.num)}>
                  {b.emoji} Type {b.num}
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--doux)', fontWeight: 600 }}>
            Symptômes présents
          </label>
          <TagRow tags={SYMPTOMES} selected={data.transit.symptomes}
            onToggle={t => toggleTag(dayIdx, 'transit.symptomes', t)} />
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <Field label="Détails (urinaires, cutanés, autres...)" style={{ flex: 3 }}>
            <textarea placeholder="Ex. : Démangeaisons après midi. Urines foncées le soir..."
              value={data.transit.detail} onChange={e => up('transit.detail', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* 4. SOMMEIL */}
      <Section title="Sommeil & Récupération" icon="🌙" className="sec-sommeil">
        <div className="form-row">
          <Field label="Heure de coucher">
            <input type="time" value={data.sommeil.coucher}
              onChange={e => {
                up('sommeil.coucher', e.target.value);
                up('sommeil.duree', calcSommeil(e.target.value, data.sommeil.lever));
              }} />
          </Field>
          <Field label="Heure de lever">
            <input type="time" value={data.sommeil.lever}
              onChange={e => {
                up('sommeil.lever', e.target.value);
                up('sommeil.duree', calcSommeil(data.sommeil.coucher, e.target.value));
              }} />
          </Field>
          <Field label="Durée estimée">
            <input type="text" readOnly value={data.sommeil.duree || ''} placeholder="Calculée auto"
              style={{ background: 'var(--gris)' }} />
          </Field>
          <Field label="Réveils nocturnes">
            <input type="number" min="0" max="20" placeholder="0"
              value={data.sommeil.reveils}
              onChange={e => up('sommeil.reveils', e.target.value)} />
          </Field>
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <Field label="Qualité du sommeil (1 = très mauvais, 5 = excellent)">
            <ScaleRow max={5} value={data.sommeil.qualite}
              onChange={v => up('sommeil.qualite', v)} />
            <div className="scale-label" style={{ maxWidth: 220 }}>
              <span>Très mauvais</span><span>Excellent</span>
            </div>
          </Field>
          <Field label="Observations (rêves, douleurs, ruminations...)" style={{ flex: 2 }}>
            <input type="text" placeholder="Réveil à 3h, ruminations. Rêves agités..."
              value={data.sommeil.obs} onChange={e => up('sommeil.obs', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* 5. MÉDICAMENTS */}
      <Section title="Médicaments & Compléments" icon="💊" className="sec-medic">
        <p className="hint" style={{ marginTop: 4, marginBottom: 10 }}>
          Médicaments sur ordonnance, automédication et compléments naturels (oméga-3, probiotiques, vitamines, plantes...).
          Notez si une prise a été oubliée.
        </p>
        {data.medicaments.length > 0 && (
          <table className="medic-table">
            <thead>
              <tr>
                <th style={{ width: '26%' }}>Nom</th>
                <th style={{ width: '14%' }}>Dose</th>
                <th style={{ width: '10%' }}>Qté</th>
                <th style={{ width: '22%' }}>Moment</th>
                <th style={{ width: '20%' }}>Pris ?</th>
                <th style={{ width: '8%' }}></th>
              </tr>
            </thead>
            <tbody>
              {data.medicaments.map((m, mi) => (
                <tr key={mi}>
                  <td><input type="text" placeholder="Levothyrox, Magnésium..." value={m.nom}
                    onChange={e => updateMedic(dayIdx, mi, 'nom', e.target.value)} /></td>
                  <td><input type="text" placeholder="75 µg" value={m.dose}
                    onChange={e => updateMedic(dayIdx, mi, 'dose', e.target.value)} /></td>
                  <td><input type="number" min="0" step="0.5" placeholder="1" value={m.qte}
                    onChange={e => updateMedic(dayIdx, mi, 'qte', e.target.value)} /></td>
                  <td>
                    <select value={m.moment} onChange={e => updateMedic(dayIdx, mi, 'moment', e.target.value)}>
                      <option value="">Sélectionner...</option>
                      {MOMENTS_MEDIC.map(mm => <option key={mm}>{mm}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={m.pris} onChange={e => updateMedic(dayIdx, mi, 'pris', e.target.value)}>
                      <option value="">---</option>
                      <option>✅ Oui</option>
                      <option>⚠️ Partiel</option>
                      <option>❌ Non (oublié)</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-remove-row" style={{ position: 'static', fontSize: 13 }}
                      onClick={() => removeMedic(dayIdx, mi)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="btn-add-dyn" onClick={() => addMedic(dayIdx)}>+ Ajouter une ligne</button>
      </Section>

      {/* 6. STRESS */}
      <Section title="Stress & État psycho-émotionnel" icon="🧠" className="sec-stress">
        <div className="form-row">
          <Field label="Niveau de stress (1 = serein, 10 = très stressé)">
            <ScaleRow max={10} value={data.stress.niveau} onChange={v => up('stress.niveau', v)} />
            <div className="scale-label"><span>Serein</span><span>Très stressé</span></div>
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--doux)', fontWeight: 600 }}>
            Sources de stress
          </label>
          <TagRow tags={SOURCES_STRESS} selected={data.stress.sources}
            onToggle={t => toggleTag(dayIdx, 'stress.sources', t)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--doux)', fontWeight: 600 }}>
            Techniques de gestion utilisées
          </label>
          <TagRow tags={GESTION_STRESS} selected={data.stress.gestion}
            onToggle={t => toggleTag(dayIdx, 'stress.gestion', t)} />
        </div>
        <div className="form-row" style={{ marginTop: 12 }}>
          <Field label="Observations libres" style={{ flex: 3 }}>
            <textarea placeholder="Journée chargée, tension avec collègue. 5 min respiration avant déjeuner..."
              value={data.stress.obs} onChange={e => up('stress.obs', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* 7. CYCLE */}
      <Section title="Cycle hormonal" icon="🌸" className="sec-cycle" defaultOpen={false}>
        <p className="hint" style={{ marginTop: 4, marginBottom: 10 }}>
          Optionnel — femmes uniquement. Permet une lecture croisée alimentation / hormones.
        </p>
        <div className="form-row">
          <Field label="Jour du cycle (J1 = 1er jour des règles)">
            <input type="number" min="1" max="40" placeholder="Ex. : 14"
              value={data.cycle.jourCycle} onChange={e => up('cycle.jourCycle', e.target.value)} />
          </Field>
          <Field label="Phase estimée">
            <select value={data.cycle.phase} onChange={e => up('cycle.phase', e.target.value)}>
              <option value="">Sélectionner...</option>
              <option>Menstruelle (J1–J5)</option>
              <option>Folliculaire (J6–J13)</option>
              <option>Ovulatoire (J14–J16)</option>
              <option>Lutéale (J17–J28)</option>
            </select>
          </Field>
          <Field label="Règles présentes">
            <select value={data.cycle.regles} onChange={e => up('cycle.regles', e.target.value)}>
              <option value="">---</option>
              <option>Oui — flux léger</option>
              <option>Oui — flux moyen</option>
              <option>Oui — flux abondant</option>
              <option>Non</option>
            </select>
          </Field>
        </div>
        <div className="form-row" style={{ marginTop: 10 }}>
          <Field label="Symptômes hormonaux (douleurs, humeur, fringales, rétention...)" style={{ flex: 3 }}>
            <textarea placeholder="Douleurs basses ventre légères, forte envie de sucre, humeur irritable..."
              value={data.cycle.symptomes} onChange={e => up('cycle.symptomes', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* 8. BILAN */}
      <Section title="Bilan du jour" icon="📊" className="sec-bilan">
        <div className="score-grid">
          {[
            { key: 'energie',  label: 'Énergie globale' },
            { key: 'humeur',   label: 'Humeur & mental' },
            { key: 'digestion',label: 'Digestion' },
            { key: 'recup',    label: 'Récupération / Sommeil' },
          ].map(({ key, label }) => (
            <div className="score-card" key={key}>
              <div className="sc-label">{label}</div>
              <div className="scale-row" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                  const val = data.bilan[key];
                  let cls = '';
                  if (val === n) { cls = n <= 3 ? 's-red' : n <= 6 ? 's-or' : 's-vert'; }
                  return (
                    <button key={n} className={`scale-btn ${cls}`}
                      style={{ width: 28, height: 28, fontSize: 11 }}
                      onClick={() => up(`bilan.${key}`, val === n ? null : n)}>
                      {n}
                    </button>
                  );
                })}
              </div>
              <div className="sc-val">
                {data.bilan[key] ? `${data.bilan[key]}/10` : 'Non renseigné'}
              </div>
            </div>
          ))}
        </div>
        <div className="form-row" style={{ marginTop: 14 }}>
          <Field label="Note libre du jour" style={{ flex: 3 }}>
            <textarea placeholder="Baisse de régime à 15h. Bon repas en famille. Douleur épaule droite..."
              value={data.bilan.note} onChange={e => up('bilan.note', e.target.value)} />
          </Field>
        </div>
      </Section>
    </>
  );
}
