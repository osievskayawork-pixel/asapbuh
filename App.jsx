import { useState, useEffect } from "react";

// ─────────── BRAND ───────────
const BRAND = {
  black: "#0a0a0a", white: "#ffffff", red: "#E8281E",
  gray: "#f0f0f0", darkGray: "#1a1a1a", midGray: "#888",
};

const ROLE_COLORS = {
  Кухар: "#0a0a0a", Офіціант: "#E8281E",
  Адмін: "#444", Бармен: "#1a6b3a", Шеф: "#7a2e00",
};

// ─────────── STAFF ───────────
const INITIAL_STAFF = [
  { id: 1, name: "Катерина", role: "Кухар",    rate: 1500, section: "kitchen" },
  { id: 2, name: "Микола",   role: "Кухар",    rate: 1500, section: "kitchen" },
  { id: 3, name: "Яна",      role: "Кухар",    rate: 1500, section: "kitchen" },
  { id: 4, name: "Віталій",  role: "Кухар",    rate: 1500, section: "kitchen" },
  { id: 5, name: "Олексій",  role: "Кухар",    rate: 1500, section: "kitchen" },
  { id: 6, name: "Марія",    role: "Офіціант", rate: 500,  section: "hall" },
  { id: 7, name: "Юлія",     role: "Офіціант", rate: 500,  section: "hall" },
  { id: 8, name: "Максим",   role: "Офіціант", rate: 500,  section: "hall" },
  { id: 9, name: "Юлія А",   role: "Адмін",    rate: 0,    section: "admin" },
  { id: 10, name: "Бармен",  role: "Бармен",   rate: 1500, section: "kitchen" },
];

// ─────────── PINS & ACCESS ───────────
const PINS = {
  "1105": { role: "owner",  staffId: null, label: "Власник",  emoji: "👑",  color: "#7a2e00" },
  "2222": { role: "admin",  staffId: null, label: "Адмін",    emoji: "📊",  color: "#444" },
  "2215": { role: "chef",   staffId: null, label: "Шеф",      emoji: "👨‍🍳", color: "#1a6b3a" },
  "1212": { role: "waiter", staffId: 6,  label: "Марія",    emoji: "🍽️", color: BRAND.red },
  "1209": { role: "waiter", staffId: 7,  label: "Юлія",     emoji: "🍽️", color: BRAND.red },
  "1915": { role: "waiter", staffId: 8,  label: "Максим",   emoji: "🍽️", color: BRAND.red },
  "3847": { role: "cook",   staffId: 1,  label: "Катерина", emoji: "🍳",  color: BRAND.black },
  "7291": { role: "cook",   staffId: 2,  label: "Микола",   emoji: "🍳",  color: BRAND.black },
  "4563": { role: "cook",   staffId: 3,  label: "Яна",      emoji: "🍳",  color: BRAND.black },
  "8134": { role: "cook",   staffId: 4,  label: "Віталій",  emoji: "🍳",  color: BRAND.black },
  "6729": { role: "cook",   staffId: 5,  label: "Олексій",  emoji: "🍳",  color: BRAND.black },
};

const SUPERVISOR_ROLES = ["owner", "admin", "chef"];
const isSup = (role) => SUPERVISOR_ROLES.includes(role);

const ROLE_TABS = {
  owner:  ["schedule","kitchen","hall","chef","admin"],
  admin:  ["schedule","kitchen","hall","chef","admin"],
  chef:   ["schedule","kitchen","chef"],
  waiter: ["schedule","hall"],
  cook:   ["schedule","kitchen"],
};

const ALL_TABS = [
  { id: "schedule", label: "Графік",  emoji: "📅" },
  { id: "kitchen",  label: "Кухня",   emoji: "🍳" },
  { id: "hall",     label: "Зал",     emoji: "🍽️" },
  { id: "chef",     label: "Шеф",     emoji: "👨‍🍳" },
  { id: "admin",    label: "Адмін",   emoji: "📊" },
];

const KPI_METRICS = [
  { id: "purchase",   label: "Своєчасна закупівля продуктів",      weight: 0.20, maxBonus: 2000 },
  { id: "writeoff",   label: "Контроль списання / актив продажів", weight: 0.20, maxBonus: 2000 },
  { id: "cashplan",   label: "Виконання плану по касі",            weight: 0.10, maxBonus: 1000 },
  { id: "menu",       label: "Впровадження (оптимізація) меню",    weight: 0.30, maxBonus: 3000 },
  { id: "discipline", label: "Дисципліна (запізнення, порушення)", weight: 0.20, maxBonus: 2000 },
];

const CHEF_KPI_METRICS = [
  { id: "stoplist",       label: "Контроль стоп-листа",                    weight: 0.25, maxBonus: 2500, hint: "Мета: ≥15 днів без стоп-листа на місяць." },
  { id: "costcontrol",    label: "Контроль собівартості / тех. карт",      weight: 0.25, maxBonus: 2500, hint: "Своєчасне сповіщення про зміни цін. Актуальність тех. карт." },
  { id: "sanitation",     label: "Санітарія та чистота кухні",              weight: 0.15, maxBonus: 1500, hint: "Регулярні чек-апи: чистота зон, зберігання, гігієна." },
  { id: "teamdiscipline", label: "Дисципліна команди",                     weight: 0.20, maxBonus: 2000, hint: "Стопи через опізнення кухарів — відповідальність шефа." },
  { id: "menu",           label: "Впровадження / оновлення меню",          weight: 0.15, maxBonus: 1500, hint: "Нові позиції, сезонні зміни, мінімум помилок у подачі." },
];

const MONTHS = ["Січень","Лютий","Березень","Квітень","Травень","Червень",
  "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];

function getDIM(y, m) { return new Date(y, m + 1, 0).getDate(); }
function fmt(n) { return Math.round(n).toLocaleString("uk-UA") + " ₴"; }
function cc(pct) { return pct >= 100 ? "#1a6b3a" : pct >= 70 ? "#e08000" : BRAND.red; }

// ─────────── MESSAGE BOX ───────────
function MessageBox({ staffId, canWrite, messages, replies, onSave, onReply, user }) {
  const msg = messages[staffId] || "";
  const reply = replies[staffId] || "";
  const [draft, setDraft] = useState(msg);
  const [replyDraft, setReplyDraft] = useState(reply);
  const [savedMsg, setSavedMsg] = useState(false);
  const [savedReply, setSavedReply] = useState(false);

  useEffect(() => { setDraft(messages[staffId] || ""); }, [messages, staffId]);
  useEffect(() => { setReplyDraft(replies[staffId] || ""); }, [replies, staffId]);

  const isWorker = !isSup(user.role);
  if (!canWrite && !msg && isWorker) return null;

  const saveM = () => { onSave(staffId, draft); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 1500); };
  const saveR = () => { onReply(staffId, replyDraft); setSavedReply(true); setTimeout(() => setSavedReply(false), 1500); };

  return (
    <div style={{ margin: "0 12px 10px" }}>
      {(canWrite || msg) && (
        <div style={{ background: canWrite ? "#fffbea" : "#f0f7ff",
          border: "1.5px solid " + (canWrite ? "#e6c800" : "#4a90d9"), borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em",
            color: canWrite ? "#a07800" : "#2060a0", marginBottom: 6 }}>
            {canWrite ? "✏️ Повідомлення керівника" : "📩 Повідомлення від керівника"}
          </div>
          {canWrite ? (
            <>
              <textarea value={draft} onChange={e => setDraft(e.target.value)}
                placeholder="Напишіть повідомлення для цього співробітника..."
                style={{ ...inputStyle, width: "100%", minHeight: 60, resize: "vertical", fontSize: 13,
                  fontWeight: 400, lineHeight: 1.5, boxSizing: "border-box", background: BRAND.white }} />
              <button onClick={saveM} style={{ marginTop: 6, background: savedMsg ? "#1a6b3a" : BRAND.black,
                color: BRAND.white, border: "none", borderRadius: 8, padding: "7px 18px",
                fontWeight: 800, fontSize: 12, cursor: "pointer", transition: "background 0.2s" }}>
                {savedMsg ? "✓ Збережено" : "Зберегти"}
              </button>
            </>
          ) : (
            <div style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg}</div>
          )}
        </div>
      )}

      {isWorker && (
        <div style={{ background: "#f3fff3", border: "1.5px solid #7bcf7b", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#2a7a2a", marginBottom: 6 }}>
            ✍️ Ваша відповідь
          </div>
          <textarea value={replyDraft} onChange={e => setReplyDraft(e.target.value)}
            placeholder="Напишіть відповідь керівнику..."
            style={{ ...inputStyle, width: "100%", minHeight: 56, resize: "vertical", fontSize: 13,
              fontWeight: 400, lineHeight: 1.5, boxSizing: "border-box", background: BRAND.white }} />
          <button onClick={saveR} style={{ marginTop: 6, background: savedReply ? "#1a6b3a" : "#2a7a2a",
            color: BRAND.white, border: "none", borderRadius: 8, padding: "7px 18px",
            fontWeight: 800, fontSize: 12, cursor: "pointer", transition: "background 0.2s" }}>
            {savedReply ? "✓ Надіслано" : "Надіслати"}
          </button>
        </div>
      )}

      {canWrite && reply && (
        <div style={{ background: "#f3fff3", border: "1.5px solid #7bcf7b", borderRadius: 10, padding: "12px 14px", marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#2a7a2a", marginBottom: 6 }}>
            💬 Відповідь співробітника
          </div>
          <div style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{reply}</div>
        </div>
      )}
    </div>
  );
}

// ─────────── SCHEDULE TAB ───────────
function ScheduleTab({ schedule, setSchedule, year, month, staff, activeSection, user }) {
  const days = getDIM(year, month);
  const daysArr = Array.from({ length: days }, (_, i) => i + 1);
  const canEdit = isSup(user.role);

  let filtered = staff.filter(s => activeSection === "all" || s.section === activeSection);
  if (!canEdit && user.staffId) filtered = filtered.filter(s => s.id === user.staffId);

  const toggle = (sId, day) => {
    if (!canEdit) return;
    const key = `${year}-${month}-${sId}-${day}`;
    setSchedule(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const getCount = (sId) => daysArr.filter(d => schedule[`${year}-${month}-${sId}-${d}`]).length;

  return (
    <div style={{ overflowX: "auto", paddingBottom: 80 }}>
      {!canEdit && (
        <div style={{ padding: "8px 14px", background: "#f5f5f5", fontSize: 11, color: BRAND.midGray, borderBottom: "1px solid #e0e0e0" }}>
          👁 Тільки перегляд
        </div>
      )}
      <table style={{ borderCollapse: "collapse", minWidth: "100%", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={thS(true)}>Ім'я / Роль</th>
            {daysArr.map(d => <th key={d} style={thS(false)}>{d}</th>)}
            <th style={thS(false)}>Змін</th>
            <th style={thS(false)}>ЗП</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s, i) => {
            const count = getCount(s.id);
            return (
              <tr key={s.id} style={{ background: i % 2 === 0 ? BRAND.white : "#fafafa" }}>
                <td style={nameCS(s.role)}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: ROLE_COLORS[s.role], fontWeight: 600 }}>{s.role}</div>
                </td>
                {daysArr.map(d => {
                  const on = schedule[`${year}-${month}-${s.id}-${d}`];
                  return (
                    <td key={d} onClick={() => toggle(s.id, d)} style={{
                      textAlign: "center", cursor: canEdit ? "pointer" : "default", padding: "6px 2px",
                      background: on ? BRAND.black : "transparent", color: on ? BRAND.white : BRAND.midGray,
                      fontWeight: on ? 700 : 400, borderRight: "1px solid #eee", userSelect: "none", transition: "background 0.15s",
                    }}>{on ? "✓" : "·"}</td>
                  );
                })}
                <td style={{ ...tdS, fontWeight: 700 }}>{count}</td>
                <td style={{ ...tdS, fontWeight: 700, color: count > 0 ? BRAND.red : BRAND.midGray }}>
                  {count > 0 ? fmt(count * s.rate) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────── KITCHEN TAB ───────────
function KitchenTab({ schedule, year, month, staff, user, messages, replies, onSaveMessage, onSaveReply }) {
  const days = getDIM(year, month);
  const daysArr = Array.from({ length: days }, (_, i) => i + 1);
  const canWrite = isSup(user.role);
  let kitchen = staff.filter(s => s.section === "kitchen");
  if (!canWrite && user.staffId) kitchen = kitchen.filter(s => s.id === user.staffId);
  const getCount = (sId) => daysArr.filter(d => schedule[`${year}-${month}-${sId}-${d}`]).length;
  const [advances, setAdvances] = useState({});

  return (
    <div style={{ padding: "0 0 80px" }}>
      <SectionHeader title="КУХНЯ / БАРИ" sub="1 500 ₴ / зміна" />
      {kitchen.map(s => {
        const shifts = getCount(s.id);
        const gross = shifts * s.rate;
        const net = gross - Number(advances[s.id] || 0);
        return (
          <div key={s.id}>
            <MessageBox staffId={s.id} canWrite={canWrite} messages={messages} replies={replies} onSave={onSaveMessage} onReply={onSaveReply} user={user} />
            <StaffCard name={s.name} role={s.role}>
              <Row label="Змін відпрацьовано" value={shifts} />
              <Row label="Ставка за зміну" value={fmt(s.rate)} />
              <Divider />
              <Row label="Нараховано" value={fmt(gross)} bold />
              {canWrite && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
                  <span style={labelS}>Аванс</span>
                  <input type="number" value={advances[s.id] || ""}
                    onChange={e => setAdvances(p => ({ ...p, [s.id]: e.target.value }))}
                    placeholder="0" style={inputStyle} />
                </div>
              )}
              <ResultRow label="До виплати" value={fmt(net)} />
            </StaffCard>
          </div>
        );
      })}
    </div>
  );
}

// ─────────── HALL TAB ───────────
function HallTab({ schedule, year, month, staff, user, messages, replies, onSaveMessage, onSaveReply }) {
  const days = getDIM(year, month);
  const daysArr = Array.from({ length: days }, (_, i) => i + 1);
  const canWrite = isSup(user.role);
  let waiters = staff.filter(s => s.section === "hall");
  if (!canWrite && user.staffId) waiters = waiters.filter(s => s.id === user.staffId);
  const getCount = (sId) => daysArr.filter(d => schedule[`${year}-${month}-${sId}-${d}`]).length;
  const [bonuses, setBonuses] = useState({});
  const [advances, setAdvances] = useState({});
  const upd = (sId, f, v) => setBonuses(p => ({ ...p, [sId]: { ...(p[sId]||{}), [f]: v } }));

  return (
    <div style={{ padding: "0 0 80px" }}>
      <SectionHeader title="ЗАЛ / ОФІЦІАНТИ" sub="500 ₴ / зміна + бонуси" />
      {waiters.map(s => {
        const shifts = getCount(s.id);
        const base = shifts * s.rate;
        const b = bonuses[s.id] || {};
        const dC = Number(b.drinkCount||0), dP = Number(b.drinkAvgPrice||0);
        const drinkBonus = dC * dP * 0.10;
        const cPlan = Number(b.checkPlan||0), cAct = Number(b.checkActual||0), cCnt = Number(b.checkCount||0);
        let avgBonus = 0;
        if (cPlan > 0 && cAct > cPlan) avgBonus = ((cAct-cPlan)/cPlan) * (cCnt*cAct) * 0.10;
        const gross = base + drinkBonus + avgBonus;
        const net = gross - Number(advances[s.id]||0);

        return (
          <div key={s.id}>
            <MessageBox staffId={s.id} canWrite={canWrite} messages={messages} replies={replies} onSave={onSaveMessage} onReply={onSaveReply} user={user} />
            <StaffCard name={s.name} role={s.role}>
              <Row label="Змін" value={shifts} />
              <Row label="База" value={fmt(base)} />
              <Divider label="🍹 Бонус напої" />
              <MiniInput label="К-ть напоїв" value={b.drinkCount||""} onChange={v => upd(s.id,"drinkCount",v)} readOnly={!canWrite} />
              <MiniInput label="Серед. ціна (₴)" value={b.drinkAvgPrice||""} onChange={v => upd(s.id,"drinkAvgPrice",v)} readOnly={!canWrite} />
              <FormulaNote text={`${dC} × ${dP} × 10% = `} result={fmt(drinkBonus)} />
              <Divider label="🧾 Бонус сер. чек" />
              <MiniInput label="План чек (₴)" value={b.checkPlan||""} onChange={v => upd(s.id,"checkPlan",v)} readOnly={!canWrite} />
              <MiniInput label="Факт чек (₴)" value={b.checkActual||""} onChange={v => upd(s.id,"checkActual",v)} readOnly={!canWrite} />
              <MiniInput label="К-ть чеків" value={b.checkCount||""} onChange={v => upd(s.id,"checkCount",v)} readOnly={!canWrite} />
              {cPlan>0 && cAct>0 && <FormulaNote text={`(${cAct}−${cPlan})/${cPlan} × ${cCnt}×${cAct} × 10% = `} result={fmt(avgBonus)} />}
              <Divider />
              <Row label="База" value={fmt(base)} />
              <Row label="Бонус напої" value={fmt(drinkBonus)} />
              <Row label="Бонус сер. чек" value={fmt(avgBonus)} />
              <Row label="Нараховано" value={fmt(gross)} bold />
              {canWrite && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
                  <span style={labelS}>Аванс</span>
                  <input type="number" value={advances[s.id]||""}
                    onChange={e => setAdvances(p => ({...p,[s.id]:e.target.value}))}
                    placeholder="0" style={inputStyle} />
                </div>
              )}
              <ResultRow label="До виплати" value={fmt(net)} />
            </StaffCard>
          </div>
        );
      })}
    </div>
  );
}

// ─────────── CHEF TAB ───────────
function ChefTab() {
  const [kpi, setKpi] = useState({});
  const [base, setBase] = useState(5000);
  const [adv, setAdv] = useState(0);
  const [stopDays, setStopDays] = useState(0);
  const [notes, setNotes] = useState({});
  const [hint, setHint] = useState(null);

  useEffect(() => {
    const pct = Math.min(100, Math.round((Number(stopDays)/15)*100));
    setKpi(p => ({...p, stoplist: pct}));
  }, [stopDays]);

  const upd = (id, v) => setKpi(p => ({...p, [id]: Math.min(100, Math.max(0, Number(v)))}));
  const totalBonus = CHEF_KPI_METRICS.reduce((s,m) => s + (Number(kpi[m.id]||0)/100)*m.maxBonus, 0);
  const gross = base + totalBonus;
  const net = gross - Number(adv||0);

  return (
    <div style={{ padding: "0 0 80px" }}>
      <SectionHeader title="ШЕФ / KPI" sub="База 5 000 ₴ + бонус до 10 000 ₴" />
      <div style={cardS}>
        <label style={{...labelS, display:"block", marginBottom:4}}>Оклад (база)</label>
        <input type="number" value={base} onChange={e => setBase(Number(e.target.value))}
          style={{...inputStyle, width:"100%", fontSize:18, fontWeight:700, padding:"10px 12px"}} />
      </div>

      <div style={{...cardS, borderLeft:"4px solid "+cc(kpi.stoplist||0)}}>
        <div style={{fontWeight:800, fontSize:13, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8}}>🚫 Стоп-лист</div>
        <div style={{fontSize:12, color:BRAND.midGray, marginBottom:10}}>Мета: <strong>≥15 днів</strong> без стопу на місяць</div>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
          <span style={labelS}>Днів без стопу</span>
          <input type="number" min="0" max="31" value={stopDays} onChange={e=>setStopDays(e.target.value)}
            style={{...inputStyle, width:64, textAlign:"center"}} />
          <span style={{fontSize:12, color:BRAND.midGray}}>/ 15</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div style={{flex:1, height:8, background:"#e8e8e8", borderRadius:4, overflow:"hidden"}}>
            <div style={{height:"100%", width:`${Math.min(100,kpi.stoplist||0)}%`, background:cc(kpi.stoplist||0), borderRadius:4, transition:"width 0.3s"}} />
          </div>
          <span style={{fontWeight:800, fontSize:14, color:cc(kpi.stoplist||0)}}>{kpi.stoplist||0}%</span>
        </div>
        <div style={{marginTop:6, textAlign:"right", fontSize:13, fontWeight:700, color:cc(kpi.stoplist||0)}}>
          +{fmt(((kpi.stoplist||0)/100)*2500)}
        </div>
        <Divider label="Нотатки" />
        <textarea value={notes.stoplist||""} onChange={e=>setNotes(p=>({...p,stoplist:e.target.value}))}
          placeholder="Причини стопів..." style={{...inputStyle, width:"100%", minHeight:56, resize:"vertical", fontSize:12, fontWeight:400, lineHeight:1.5, boxSizing:"border-box"}} />
      </div>

      <div style={cardS}>
        <div style={{fontWeight:800, fontSize:14, letterSpacing:"0.08em", marginBottom:16, textTransform:"uppercase"}}>KPI Показники</div>
        {CHEF_KPI_METRICS.filter(m=>m.id!=="stoplist").map(m => {
          const pct = Number(kpi[m.id]||0);
          const bonus = (pct/100)*m.maxBonus;
          const exp = hint===m.id;
          return (
            <div key={m.id} style={{marginBottom:20}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4}}>
                <span style={{fontSize:12, fontWeight:600, flex:1, paddingRight:8}}>{m.label}</span>
                <button onClick={()=>setHint(exp?null:m.id)} style={{background:"none", border:"none", cursor:"pointer", fontSize:14, color:BRAND.midGray, padding:0}}>{exp?"✕":"ℹ"}</button>
              </div>
              {exp && <div style={{background:"#f5f5f5", borderRadius:6, padding:"8px 10px", fontSize:11, color:"#555", marginBottom:8, lineHeight:1.5}}>{m.hint}</div>}
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <input type="range" min="0" max="100" step="5" value={pct} onChange={e=>upd(m.id,e.target.value)} style={{flex:1, accentColor:cc(pct)}} />
                <input type="number" min="0" max="100" value={pct} onChange={e=>upd(m.id,e.target.value)} style={{...inputStyle, width:52, textAlign:"center", padding:"4px 6px"}} />
                <span style={{fontSize:11, color:BRAND.midGray}}>%</span>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:4}}>
                <div style={{height:4, flex:1, background:"#e8e8e8", borderRadius:2, overflow:"hidden", marginRight:8}}>
                  <div style={{height:"100%", width:`${pct}%`, background:cc(pct), borderRadius:2, transition:"width 0.3s"}} />
                </div>
                <span style={{fontSize:12, fontWeight:700, color:cc(pct), minWidth:60, textAlign:"right"}}>+{fmt(bonus)}</span>
              </div>
              {(m.id==="costcontrol"||m.id==="sanitation") && (
                <textarea value={notes[m.id]||""} onChange={e=>setNotes(p=>({...p,[m.id]:e.target.value}))}
                  placeholder={m.id==="costcontrol"?"Зміни цін...":"Результати чек-апів..."}
                  style={{...inputStyle, width:"100%", minHeight:46, resize:"vertical", fontSize:11, fontWeight:400, lineHeight:1.4, marginTop:6, boxSizing:"border-box"}} />
              )}
            </div>
          );
        })}
        <div style={{borderTop:"2px solid "+BRAND.black, paddingTop:12}}>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:14}}>
            <span style={{fontWeight:700}}>KPI бонус</span>
            <span style={{fontWeight:800, color:BRAND.red}}>{fmt(totalBonus)}</span>
          </div>
        </div>
      </div>

      <div style={cardS}>
        <Row label="Оклад (база)" value={fmt(base)} />
        <Row label="KPI бонус" value={fmt(totalBonus)} />
        <Divider />
        <Row label="Нараховано" value={fmt(gross)} bold />
        <div style={{display:"flex", alignItems:"center", gap:8, margin:"8px 0"}}>
          <span style={labelS}>Аванс</span>
          <input type="number" value={adv} onChange={e=>setAdv(e.target.value)} placeholder="0" style={inputStyle} />
        </div>
        <ResultRow label="До виплати" value={fmt(net)} />
      </div>
    </div>
  );
}

// ─────────── ADMIN TAB ───────────
function AdminTab() {
  const [kpi, setKpi] = useState({});
  const [base, setBase] = useState(10000);
  const [adv, setAdv] = useState(0);
  const upd = (id, v) => setKpi(p => ({...p, [id]: Math.min(100,Math.max(0,Number(v)))}));
  const totalBonus = KPI_METRICS.reduce((s,m) => s+(Number(kpi[m.id]||0)/100)*m.maxBonus, 0);
  const gross = base + totalBonus;
  const net = gross - Number(adv||0);

  return (
    <div style={{padding:"0 0 80px"}}>
      <SectionHeader title="АДМІН / KPI" sub="База + бонуси по KPI" />
      <div style={cardS}>
        <label style={{...labelS, display:"block", marginBottom:4}}>Оклад (база)</label>
        <input type="number" value={base} onChange={e=>setBase(Number(e.target.value))}
          style={{...inputStyle, width:"100%", fontSize:18, fontWeight:700, padding:"10px 12px"}} />
      </div>
      <div style={cardS}>
        <div style={{fontWeight:800, fontSize:14, letterSpacing:"0.08em", marginBottom:16, textTransform:"uppercase"}}>KPI Показники</div>
        {KPI_METRICS.map(m => {
          const pct = Number(kpi[m.id]||0);
          const bonus = (pct/100)*m.maxBonus;
          return (
            <div key={m.id} style={{marginBottom:20}}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                <span style={{fontSize:12, fontWeight:600, flex:1, paddingRight:8}}>{m.label}</span>
                <span style={{fontSize:11, color:BRAND.midGray}}>{m.weight*100}%</span>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <input type="range" min="0" max="100" step="5" value={pct} onChange={e=>upd(m.id,e.target.value)} style={{flex:1, accentColor:cc(pct)}} />
                <input type="number" min="0" max="100" value={pct} onChange={e=>upd(m.id,e.target.value)} style={{...inputStyle, width:52, textAlign:"center", padding:"4px 6px"}} />
                <span style={{fontSize:11, color:BRAND.midGray}}>%</span>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:4}}>
                <div style={{height:4, flex:1, background:"#e8e8e8", borderRadius:2, overflow:"hidden", marginRight:8}}>
                  <div style={{height:"100%", width:`${pct}%`, background:cc(pct), borderRadius:2, transition:"width 0.3s"}} />
                </div>
                <span style={{fontSize:12, fontWeight:700, color:cc(pct), minWidth:60, textAlign:"right"}}>+{fmt(bonus)}</span>
              </div>
            </div>
          );
        })}
        <div style={{borderTop:"2px solid "+BRAND.black, paddingTop:12}}>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:14}}>
            <span style={{fontWeight:700}}>KPI бонус</span>
            <span style={{fontWeight:800, color:BRAND.red}}>{fmt(totalBonus)}</span>
          </div>
        </div>
      </div>
      <div style={cardS}>
        <Row label="Оклад (база)" value={fmt(base)} />
        <Row label="KPI бонус" value={fmt(totalBonus)} />
        <Divider />
        <Row label="Нараховано" value={fmt(gross)} bold />
        <div style={{display:"flex", alignItems:"center", gap:8, margin:"8px 0"}}>
          <span style={labelS}>Аванс</span>
          <input type="number" value={adv} onChange={e=>setAdv(e.target.value)} placeholder="0" style={inputStyle} />
        </div>
        <ResultRow label="До виплати" value={fmt(net)} />
      </div>
    </div>
  );
}

// ─────────── SHARED UI ───────────
function SectionHeader({ title, sub }) {
  return (
    <div style={{padding:"16px 16px 12px", borderBottom:"3px solid "+BRAND.black, marginBottom:12}}>
      <div style={{fontWeight:900, fontSize:20, letterSpacing:"-0.02em", textTransform:"uppercase"}}>{title}</div>
      {sub && <div style={{fontSize:12, color:BRAND.midGray, marginTop:2, fontWeight:500}}>{sub}</div>}
    </div>
  );
}
function StaffCard({ name, role, children }) {
  return (
    <div style={{...cardS, borderLeft:"4px solid "+(ROLE_COLORS[role]||BRAND.black)}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
        <div style={{width:36, height:36, borderRadius:"50%", background:ROLE_COLORS[role]||BRAND.black,
          color:BRAND.white, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14}}>
          {name[0]}
        </div>
        <div>
          <div style={{fontWeight:800, fontSize:15}}>{name}</div>
          <div style={{fontSize:11, color:ROLE_COLORS[role], fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em"}}>{role}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
function Row({ label, value, bold }) {
  return (
    <div style={{display:"flex", justifyContent:"space-between", padding:"4px 0", fontSize:13}}>
      <span style={{color:bold?BRAND.black:BRAND.midGray, fontWeight:bold?700:400}}>{label}</span>
      <span style={{fontWeight:bold?800:600}}>{value}</span>
    </div>
  );
}
function Divider({ label }) {
  return (
    <div style={{margin:"10px 0 8px", display:"flex", alignItems:"center", gap:8}}>
      {label && <span style={{fontSize:11, fontWeight:700, color:BRAND.midGray, whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.06em"}}>{label}</span>}
      <div style={{flex:1, height:1, background:"#e0e0e0"}} />
    </div>
  );
}
function MiniInput({ label, value, onChange, readOnly }) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
      <span style={{...labelS, flex:1}}>{label}</span>
      <input type="number" value={value} onChange={readOnly ? undefined : e=>onChange(e.target.value)} readOnly={readOnly} placeholder="0"
        style={{...inputStyle, width:80, textAlign:"right", background: readOnly ? "#f5f5f5" : BRAND.white, color: readOnly ? BRAND.midGray : BRAND.black}} />
    </div>
  );
}
function FormulaNote({ text, result }) {
  return (
    <div style={{background:"#f5f5f5", borderRadius:6, padding:"6px 10px", fontSize:11, color:BRAND.midGray, marginBottom:8}}>
      <span>{text}</span><strong style={{color:BRAND.black}}>{result}</strong>
    </div>
  );
}
function ResultRow({ label, value }) {
  return (
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center",
      background:BRAND.black, borderRadius:8, padding:"10px 14px", marginTop:10}}>
      <span style={{color:BRAND.white, fontWeight:700, fontSize:13, textTransform:"uppercase", letterSpacing:"0.05em"}}>{label}</span>
      <span style={{color:BRAND.red, fontWeight:900, fontSize:18}}>{value}</span>
    </div>
  );
}

const cardS = { margin:"0 12px 12px", background:BRAND.white, borderRadius:12, padding:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.08)" };
const labelS = { fontSize:12, color:BRAND.midGray, fontWeight:500 };
const inputStyle = { border:"1.5px solid #ddd", borderRadius:6, padding:"6px 10px", fontSize:14, fontWeight:600, outline:"none", fontFamily:"inherit" };
const thS = (f) => ({ padding:f?"10px 12px":"10px 4px", background:BRAND.black, color:BRAND.white, fontWeight:800, fontSize:f?12:11, textAlign:f?"left":"center", position:f?"sticky":"static", left:f?0:"auto", zIndex:f?10:1, borderRight:"1px solid #333", whiteSpace:"nowrap", letterSpacing:"0.05em" });
const nameCS = (role) => ({ padding:"8px 12px", position:"sticky", left:0, background:BRAND.white, borderRight:"3px solid "+(ROLE_COLORS[role]||BRAND.black), zIndex:5, minWidth:100 });
const tdS = { padding:"6px 6px", textAlign:"center", borderRight:"1px solid #eee", whiteSpace:"nowrap" };
const navBtn = { background:"#222", color:BRAND.white, border:"none", borderRadius:6, width:32, height:32, fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 };

// ─────────── LOGIN ───────────
function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  const handleDigit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (PINS[next]) { onLogin(next); }
        else {
          setShake(true); setError("Невірний PIN");
          setTimeout(() => { setShake(false); setPin(""); setError(""); }, 800);
        }
      }, 150);
    }
  };

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div style={{fontFamily:"'Arial Black',Arial,sans-serif", minHeight:"100vh", background:BRAND.black,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24}}>
      <div style={{color:BRAND.white, fontWeight:900, fontSize:32, letterSpacing:"-0.03em", marginBottom:4}}>
        ASAP <span style={{color:BRAND.red}}>BISTRO</span>
      </div>
      <div style={{color:"#666", fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:48}}>
        Внутрішня система
      </div>
      <div style={{display:"flex", gap:16, marginBottom:12, animation:shake?"shake 0.4s":"none"}}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{width:18, height:18, borderRadius:"50%",
            background:pin.length>i?BRAND.red:"#333", border:"2px solid "+(pin.length>i?BRAND.red:"#555"), transition:"background 0.15s"}} />
        ))}
      </div>
      {error
        ? <div style={{color:BRAND.red, fontSize:12, fontWeight:700, marginBottom:8}}>{error}</div>
        : <div style={{height:20, marginBottom:8}} />}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 72px)", gap:12}}>
        {digits.map((d,i) => {
          if (d==="") return <div key={i}/>;
          return (
            <button key={i}
              onClick={()=>d==="⌫"?setPin(p=>p.slice(0,-1)):handleDigit(d)}
              style={{width:72, height:72, borderRadius:"50%",
                background:d==="⌫"?"transparent":"#1a1a1a", border:d==="⌫"?"none":"1.5px solid #333",
                color:BRAND.white, fontSize:d==="⌫"?22:24, fontWeight:800, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center"}}>
              {d}
            </button>
          );
        })}
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// ─────────── MAIN ───────────
export default function ASAPBistroApp() {
  const now = new Date();
  const [user, setUser] = useState(null);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [activeTab, setActiveTab] = useState("schedule");
  const [schedSec, setSchedSec] = useState("all");
  const [schedule, setSchedule] = useState({});
  const [messages, setMessages] = useState({});
  const [replies, setReplies] = useState({});
  const [staff] = useState(INITIAL_STAFF);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await window.storage.get("asap-schedule");
        if (s) setSchedule(JSON.parse(s.value));
        const m = await window.storage.get("asap-messages");
        if (m) setMessages(JSON.parse(m.value));
        const r = await window.storage.get("asap-replies");
        if (r) setReplies(JSON.parse(r.value));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        await window.storage.set("asap-schedule", JSON.stringify(schedule));
        setSaved("✓"); setTimeout(()=>setSaved(""), 1500);
      } catch {}
    })();
  }, [schedule]);

  const saveMsg = async (staffId, text) => {
    const upd = {...messages, [staffId]: text};
    setMessages(upd);
    try { await window.storage.set("asap-messages", JSON.stringify(upd)); } catch {}
  };

  const saveReply = async (staffId, text) => {
    const upd = {...replies, [staffId]: text};
    setReplies(upd);
    try { await window.storage.set("asap-replies", JSON.stringify(upd)); } catch {}
  };

  const login = (pin) => {
    const u = PINS[pin];
    setUser(u);
    setActiveTab(ROLE_TABS[u.role][0]);
  };

  if (!user) return <LoginScreen onLogin={login} />;

  const tabs = ALL_TABS.filter(t => ROLE_TABS[user.role].includes(t.id));
  const prevM = () => { if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const nextM = () => { if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };

  return (
    <div style={{fontFamily:"'Arial Black',Arial,sans-serif", background:BRAND.gray, minHeight:"100vh", maxWidth:500, margin:"0 auto"}}>
      {/* HEADER */}
      <div style={{background:BRAND.black, padding:"14px 16px 10px", position:"sticky", top:0, zIndex:100}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <div style={{color:BRAND.white, fontWeight:900, fontSize:22, letterSpacing:"-0.03em", lineHeight:1}}>
              ASAP <span style={{color:BRAND.red}}>BISTRO</span>
            </div>
            <div style={{color:"#888", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:1}}>Внутрішня система</div>
          </div>
          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4}}>
            {saved && <div style={{color:"#4caf50", fontSize:11, fontWeight:700}}>{saved} Збережено</div>}
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <div style={{background:user.color, borderRadius:12, padding:"3px 10px", fontSize:11,
                fontWeight:800, color:BRAND.white, display:"flex", alignItems:"center", gap:4}}>
                <span>{user.emoji}</span><span>{user.label}</span>
              </div>
              <button onClick={()=>setUser(null)} style={{background:"#222", border:"none", color:"#888",
                borderRadius:10, padding:"3px 8px", fontSize:10, cursor:"pointer", fontWeight:700}}>вихід</button>
            </div>
          </div>
        </div>
        <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginTop:10}}>
          <button onClick={prevM} style={navBtn}>‹</button>
          <span style={{color:BRAND.white, fontWeight:800, fontSize:15, minWidth:140, textAlign:"center"}}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextM} style={navBtn}>›</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex", background:BRAND.black, borderBottom:"3px solid "+BRAND.red, overflowX:"auto"}}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
            flex:1, padding:"10px 4px", background:activeTab===t.id?BRAND.red:"transparent",
            color:BRAND.white, border:"none", fontWeight:800, fontSize:11, cursor:"pointer",
            letterSpacing:"0.04em", textTransform:"uppercase", display:"flex", flexDirection:"column",
            alignItems:"center", gap:2, transition:"background 0.15s"}}>
            <span style={{fontSize:16}}>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* SCHEDULE FILTER - supervisors only */}
      {activeTab==="schedule" && isSup(user.role) && (
        <div style={{display:"flex", gap:6, padding:"10px 12px", background:"#f8f8f8", borderBottom:"1px solid #e0e0e0"}}>
          {[["all","Всі"],["kitchen","Кухня"],["hall","Зал"]].map(([id,label]) => (
            <button key={id} onClick={()=>setSchedSec(id)} style={{
              padding:"5px 12px", borderRadius:20, border:"1.5px solid "+BRAND.black,
              background:schedSec===id?BRAND.black:"transparent",
              color:schedSec===id?BRAND.white:BRAND.black,
              fontWeight:700, fontSize:11, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.05em"}}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* CONTENT */}
      {activeTab==="schedule" && <ScheduleTab schedule={schedule} setSchedule={setSchedule} year={year} month={month} staff={staff} activeSection={isSup(user.role)?schedSec:"all"} user={user} />}
      {activeTab==="kitchen" && <KitchenTab schedule={schedule} year={year} month={month} staff={staff} user={user} messages={messages} replies={replies} onSaveMessage={saveMsg} onSaveReply={saveReply} />}
      {activeTab==="hall" && <HallTab schedule={schedule} year={year} month={month} staff={staff} user={user} messages={messages} replies={replies} onSaveMessage={saveMsg} onSaveReply={saveReply} />}
      {activeTab==="chef" && <ChefTab />}
      {activeTab==="admin" && <AdminTab />}
    </div>
  );
}
