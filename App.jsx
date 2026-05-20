import { useState, useEffect } from "react";

// ─────────── BRAND ───────────
const BRAND = {
  black: "#0a0a0a", white: "#ffffff", yellow: "#CCFF00",
  purple: "#7B5CF6", gray: "#111111", darkGray: "#1a1a1a",
  midGray: "#555", card: "#161616", cardBorder: "#2a2a2a",
};

const ROLE_COLORS = {
  Кухар: "#CCFF00", Офіціант: "#7B5CF6",
  Адмін: "#FF6B35", Бармен: "#00E5CC", Шеф: "#FF3B7F",
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

];

// ─────────── PINS & ACCESS ───────────
const PINS = {
  "1105": { role: "owner",  staffId: null, label: "Власник",  emoji: "👑",  color: "#CCFF00" },
  "2222": { role: "admin",  staffId: null, label: "Адмін",    emoji: "📊",  color: "#7B5CF6" },
  "2215": { role: "chef",   staffId: null, label: "Шеф",      emoji: "👨‍🍳", color: "#FF3B7F" },
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
function cc(pct) { return pct >= 100 ? "#4caf50" : pct >= 70 ? "#ffaa00" : "#ff4444"; }

// ─────────── MESSAGE BOX ───────────
function MessageBox({ staffId, canWrite, messages, replies, onSave, onReply, user }) {
  const msg = messages[staffId] || "";
  const reply = replies[staffId] || "";
  const [draft, setDraft] = useState(msg);
  const [replyDraft, setReplyDraft] = useState(reply);
  const [savedMsg, setSavedMsg] = useState(false);
  const [savedReply, setSavedReply] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => { setDraft(messages[staffId] || ""); }, [messages, staffId]);
  useEffect(() => { setReplyDraft(replies[staffId] || ""); }, [replies, staffId]);

  const isWorker = !isSup(user.role);
  if (!canWrite && !msg && isWorker) return null;

  const saveM = () => { onSave(staffId, draft); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 1500); };
  const saveR = () => { onReply(staffId, replyDraft); setSavedReply(true); setTimeout(() => setSavedReply(false), 1500); };

  return (
    <div style={{ margin: "0 12px 8px" }}>

      {/* SUPERVISOR: collapsed button → opens form */}
      {canWrite && !open && (
        <button onClick={() => setOpen(true)} style={{
          width: "100%", background: msg ? "#1a1800" : "transparent",
          border: "1px solid " + (msg ? BRAND.yellow : "#2a2a2a"),
          borderRadius: 10, padding: "9px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, marginBottom: 4
        }}>
          <span style={{ fontSize: 14 }}>✏️</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: msg ? BRAND.yellow : "#444",
            textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {msg ? "Повідомлення" : "Написати повідомлення"}
          </span>
          {reply && <span style={{ marginLeft: "auto", fontSize: 11, color: "#4caf50", fontWeight: 700 }}>💬 відповідь</span>}
        </button>
      )}

      {canWrite && open && (
        <div style={{ background: "#1a1800", border: "1.5px solid " + BRAND.yellow, borderRadius: 12, padding: "12px 14px", marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: BRAND.yellow }}>
              ✏️ Повідомлення
            </span>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
          </div>
          <textarea value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="Напишіть повідомлення..."
            style={{ ...inputStyle, width: "100%", minHeight: 70, resize: "vertical", fontSize: 13,
              fontWeight: 400, lineHeight: 1.5, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
            <button onClick={saveM} style={{ background: savedMsg ? "#1a6b3a" : BRAND.yellow,
              color: BRAND.black, border: "none", borderRadius: 8, padding: "8px 20px",
              fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              {savedMsg ? "✓ Збережено" : "Зберегти"}
            </button>
            {reply && <span style={{ fontSize: 11, color: "#4caf50", fontWeight: 600 }}>💬 {reply.slice(0,35)}{reply.length>35?"...":""}</span>}
          </div>
        </div>
      )}

      {/* WORKER: sees message from management */}
      {!canWrite && msg && (
        <div style={{ background: "#0d1433", border: "1.5px solid #7B5CF6", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#7B5CF6", marginBottom: 6 }}>
            📩 Повідомлення від керівника
          </div>
          <div style={{ fontSize: 14, color: BRAND.white, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg}</div>
        </div>
      )}

      {/* WORKER: reply block */}
      {isWorker && (
        <div style={{ background: "#0a1a0a", border: "1px solid #2d6b2d", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#4caf50", marginBottom: 6 }}>
            ✍️ Ваша відповідь
          </div>
          <textarea value={replyDraft} onChange={e => setReplyDraft(e.target.value)}
            placeholder="Напишіть відповідь керівнику..."
            style={{ ...inputStyle, width: "100%", minHeight: 56, resize: "vertical", fontSize: 13,
              fontWeight: 400, lineHeight: 1.5, boxSizing: "border-box" }} />
          <button onClick={saveR} style={{ marginTop: 8, background: savedReply ? "#1a6b3a" : "#2d6b2d",
            color: BRAND.white, border: "none", borderRadius: 8, padding: "8px 20px",
            fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
            {savedReply ? "✓ Надіслано" : "Надіслати"}
          </button>
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
        <div style={{ padding: "8px 14px", background: "#111", fontSize: 11, color: "#555", borderBottom: "1px solid #1f1f1f" }}>
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
              <tr key={s.id} style={{ background: "transparent" }}>
                <td style={nameCS(s.role)}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: ROLE_COLORS[s.role], fontWeight: 600 }}>{s.role}</div>
                </td>
                {daysArr.map(d => {
                  const on = schedule[`${year}-${month}-${s.id}-${d}`];
                  return (
                    <td key={d} onClick={() => toggle(s.id, d)} style={{
                      textAlign: "center", cursor: canEdit ? "pointer" : "default", padding: "6px 2px",
                      background: on ? BRAND.yellow : "#161616", color: on ? BRAND.black : "#2a2a2a",
                      fontWeight: on ? 900 : 400, border: "1px solid #222", userSelect: "none", transition: "background 0.1s", borderRadius: 4, margin: 1,
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
  const [base, setBase] = useState(10000);
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
        <label style={{fontSize:11, color:"#555", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8}}>Оклад (база)</label>
        <input type="number" value={base} onChange={e => setBase(Number(e.target.value))}
          style={{...inputStyle, width:"100%", fontSize:18, fontWeight:700, padding:"10px 12px"}} />
      </div>

      <div style={{...cardS, borderLeft:"4px solid "+cc(kpi.stoplist||0)}}>
        <div style={{fontWeight:800, fontSize:13, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8, color:BRAND.white}}>🚫 Стоп-лист</div>
        <div style={{fontSize:12, color:"#666", marginBottom:10}}>Мета: <strong style={{color:BRAND.white}}>≥15 днів</strong> без стопу на місяць</div>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
          <span style={{fontSize:11, color:"#666", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase"}}>Днів без стопу</span>
          <input type="number" min="0" max="31" value={stopDays} onChange={e=>setStopDays(e.target.value)}
            style={{...inputStyle, width:64, textAlign:"center"}} />
          <span style={{fontSize:12, color:"#555", fontWeight:600}}>/ 15</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div style={{flex:1, height:8, background:"#1f1f1f", borderRadius:4, overflow:"hidden"}}>
            <div style={{height:"100%", width:`${Math.min(100,kpi.stoplist||0)}%`, background:cc(kpi.stoplist||0), borderRadius:4, transition:"width 0.3s"}} />
          </div>
          <span style={{fontWeight:800, fontSize:14, color:cc(kpi.stoplist||0)}}>{kpi.stoplist||0}%</span>
        </div>
        <div style={{marginTop:6, textAlign:"right", fontSize:13, fontWeight:700, color:cc(kpi.stoplist||0)}}>
          +{fmt(((kpi.stoplist||0)/100)*2500)}
        </div>
        <Divider label="Нотатки" />
        <textarea value={notes.stoplist||""} onChange={e=>setNotes(p=>({...p,stoplist:e.target.value}))}
          placeholder="Причини стопів..." style={{...inputStyle, width:"100%", minHeight:56, resize:"vertical", fontSize:12, fontWeight:400, lineHeight:1.5, boxSizing:"border-box", color:BRAND.white}} />
      </div>

      <div style={cardS}>
        <div style={{fontWeight:800, fontSize:14, letterSpacing:"0.08em", marginBottom:16, textTransform:"uppercase", color:BRAND.white}}>KPI Показники</div>
        {CHEF_KPI_METRICS.filter(m=>m.id!=="stoplist").map(m => {
          const pct = Number(kpi[m.id]||0);
          const bonus = (pct/100)*m.maxBonus;
          const exp = hint===m.id;
          return (
            <div key={m.id} style={{marginBottom:20}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4}}>
                <span style={{fontSize:12, fontWeight:600, flex:1, paddingRight:8, color:BRAND.white}}>{m.label}</span>
                <button onClick={()=>setHint(exp?null:m.id)} style={{background:"none", border:"none", cursor:"pointer", fontSize:14, color:BRAND.midGray, padding:0}}>{exp?"✕":"ℹ"}</button>
              </div>
              {exp && <div style={{background:"#f5f5f5", borderRadius:6, padding:"8px 10px", fontSize:11, color:"#555", marginBottom:8, lineHeight:1.5}}>{m.hint}</div>}
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <input type="range" min="0" max="100" step="5" value={pct} onChange={e=>upd(m.id,e.target.value)} style={{flex:1, accentColor:cc(pct)}} />
                <input type="number" min="0" max="100" value={pct} onChange={e=>upd(m.id,e.target.value)} style={{...inputStyle, width:52, textAlign:"center", padding:"4px 6px"}} />
                <span style={{fontSize:11, color:"#666", fontWeight:700}}>%</span>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:4}}>
                <div style={{height:4, flex:1, background:"#1f1f1f", borderRadius:2, overflow:"hidden", marginRight:8}}>
                  <div style={{height:"100%", width:`${pct}%`, background:cc(pct), borderRadius:2, transition:"width 0.3s"}} />
                </div>
                <span style={{fontSize:12, fontWeight:800, color:cc(pct), minWidth:60, textAlign:"right", filter:"brightness(1.3)"}}>+{fmt(bonus)}</span>
              </div>
              {(m.id==="costcontrol"||m.id==="sanitation") && (
                <textarea value={notes[m.id]||""} onChange={e=>setNotes(p=>({...p,[m.id]:e.target.value}))}
                  placeholder={m.id==="costcontrol"?"Зміни цін...":"Результати чек-апів..."}
                  style={{...inputStyle, width:"100%", minHeight:46, resize:"vertical", fontSize:11, fontWeight:400, lineHeight:1.4, marginTop:6, boxSizing:"border-box"}} />
              )}
            </div>
          );
        })}
        <div style={{borderTop:"1px solid #2a2a2a", paddingTop:12}}>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:14}}>
            <span style={{fontWeight:700, color:BRAND.white}}>KPI бонус</span>
            <span style={{fontWeight:800, color:BRAND.yellow}}>{fmt(totalBonus)}</span>
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
  const [base, setBase] = useState(25000);
  const [adv, setAdv] = useState(0);
  const upd = (id, v) => setKpi(p => ({...p, [id]: Math.min(100,Math.max(0,Number(v)))}));
  const totalBonus = KPI_METRICS.reduce((s,m) => s+(Number(kpi[m.id]||0)/100)*m.maxBonus, 0);
  const gross = base + totalBonus;
  const net = gross - Number(adv||0);

  return (
    <div style={{padding:"0 0 80px"}}>
      <SectionHeader title="АДМІН / KPI" sub="База + бонуси по KPI" />
      <div style={cardS}>
        <label style={{fontSize:11, color:"#555", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8}}>Оклад (база)</label>
        <input type="number" value={base} onChange={e=>setBase(Number(e.target.value))}
          style={{...inputStyle, width:"100%", fontSize:18, fontWeight:700, padding:"10px 12px"}} />
      </div>
      <div style={cardS}>
        <div style={{fontWeight:800, fontSize:14, letterSpacing:"0.08em", marginBottom:16, textTransform:"uppercase", color:BRAND.white}}>KPI Показники</div>
        {KPI_METRICS.map(m => {
          const pct = Number(kpi[m.id]||0);
          const bonus = (pct/100)*m.maxBonus;
          return (
            <div key={m.id} style={{marginBottom:20}}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                <span style={{fontSize:12, fontWeight:600, flex:1, paddingRight:8, color:BRAND.white}}>{m.label}</span>
                <span style={{fontSize:11, color:"#555", fontWeight:700}}>{m.weight*100}%</span>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <input type="range" min="0" max="100" step="5" value={pct} onChange={e=>upd(m.id,e.target.value)} style={{flex:1, accentColor:cc(pct)}} />
                <input type="number" min="0" max="100" value={pct} onChange={e=>upd(m.id,e.target.value)} style={{...inputStyle, width:52, textAlign:"center", padding:"4px 6px"}} />
                <span style={{fontSize:11, color:"#666", fontWeight:700}}>%</span>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:4}}>
                <div style={{height:4, flex:1, background:"#1f1f1f", borderRadius:2, overflow:"hidden", marginRight:8}}>
                  <div style={{height:"100%", width:`${pct}%`, background:cc(pct), borderRadius:2, transition:"width 0.3s"}} />
                </div>
                <span style={{fontSize:12, fontWeight:800, color:cc(pct), minWidth:60, textAlign:"right", filter:"brightness(1.3)"}}>+{fmt(bonus)}</span>
              </div>
            </div>
          );
        })}
        <div style={{borderTop:"1px solid #2a2a2a", paddingTop:12}}>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:14}}>
            <span style={{fontWeight:700, color:BRAND.white}}>KPI бонус</span>
            <span style={{fontWeight:800, color:BRAND.yellow}}>{fmt(totalBonus)}</span>
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
    <div style={{padding:"16px 16px 12px", borderBottom:"1px solid #222", marginBottom:12}}>
      <div style={{fontWeight:900, fontSize:20, letterSpacing:"-0.02em", textTransform:"uppercase", color:BRAND.white}}>{title}</div>
      {sub && <div style={{fontSize:11, color:"#444", marginTop:4, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase"}}>{sub}</div>}
    </div>
  );
}
function StaffCard({ name, role, children }) {
  return (
    <div style={{...cardS, borderLeft:"3px solid "+(ROLE_COLORS[role]||BRAND.yellow)}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
        <div style={{width:36, height:36, borderRadius:10, background:ROLE_COLORS[role]||BRAND.yellow,
          color:BRAND.black, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14}}>
          {name[0]}
        </div>
        <div>
          <div style={{fontWeight:800, fontSize:15, color:BRAND.white}}>{name}</div>
          <div style={{fontSize:11, color:ROLE_COLORS[role], fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em"}}>{role}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
function Row({ label, value, bold }) {
  return (
    <div style={{display:"flex", justifyContent:"space-between", padding:"5px 0", fontSize:13}}>
      <span style={{color:bold?BRAND.white:"#555", fontWeight:bold?700:500}}>{label}</span>
      <span style={{fontWeight:bold?800:600, color:bold?BRAND.yellow:BRAND.white}}>{value}</span>
    </div>
  );
}
function Divider({ label }) {
  return (
    <div style={{margin:"10px 0 8px", display:"flex", alignItems:"center", gap:8}}>
      {label && <span style={{fontSize:10, fontWeight:800, color:"#444", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.1em"}}>{label}</span>}
      <div style={{flex:1, height:1, background:"#222"}} />
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
    <div style={{background:"#1a1a1a", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#666", marginBottom:8, border:"1px solid #2a2a2a"}}>
      <span>{text}</span><strong style={{color:BRAND.yellow}}>{result}</strong>
    </div>
  );
}
function ResultRow({ label, value }) {
  return (
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center",
      background:BRAND.yellow, borderRadius:14, padding:"12px 16px", marginTop:12}}>
      <span style={{color:BRAND.black, fontWeight:800, fontSize:13, textTransform:"uppercase", letterSpacing:"0.06em"}}>{label}</span>
      <span style={{color:BRAND.black, fontWeight:900, fontSize:20}}>{value}</span>
    </div>
  );
}

const cardS = { margin:"0 12px 12px", background:BRAND.card, borderRadius:16, padding:"16px", border:"1px solid "+BRAND.cardBorder };
const labelS = { fontSize:12, color:"#666", fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase" };
const inputStyle = { border:"1.5px solid #333", borderRadius:10, padding:"8px 12px", fontSize:14, fontWeight:700, outline:"none", fontFamily:"inherit", background:"#1f1f1f", color:BRAND.white };
const thS = (f) => ({ padding:f?"10px 12px":"8px 3px", background:"#0a0a0a", color:"#444", fontWeight:700, fontSize:f?11:10, textAlign:f?"left":"center", position:f?"sticky":"static", left:f?0:"auto", zIndex:f?10:1, borderRight:"none", borderBottom:"1px solid #1f1f1f", whiteSpace:"nowrap", letterSpacing:"0.06em", textTransform:"uppercase" });
const nameCS = (role) => ({ padding:"8px 12px", position:"sticky", left:0, background:"#0a0a0a", borderRight:"2px solid "+(ROLE_COLORS[role]||BRAND.yellow), zIndex:5, minWidth:110 });
const tdS = { padding:"5px 3px", textAlign:"center", borderRight:"none", whiteSpace:"nowrap", color:BRAND.white };
const navBtn = { background:"#1f1f1f", color:BRAND.yellow, border:"1px solid #333", borderRadius:10, width:36, height:36, fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 };

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
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24,
      backgroundImage:"radial-gradient(circle, #1f1f1f 1px, transparent 1px)", backgroundSize:"28px 28px"}}>
      
      <div style={{marginBottom:8}}>
        <div style={{
          background:BRAND.yellow, borderRadius:16, padding:"6px 20px",
          display:"inline-block", marginBottom:12
        }}>
          <span style={{color:BRAND.black, fontWeight:900, fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase"}}>
            Внутрішня система
          </span>
        </div>
      </div>
      
      <div style={{color:BRAND.white, fontWeight:900, fontSize:40, letterSpacing:"-0.04em", marginBottom:48, lineHeight:1}}>
        ASAP<span style={{color:BRAND.yellow}}>.</span>
      </div>
      
      <div style={{display:"flex", gap:14, marginBottom:16, animation:shake?"shake 0.4s":"none"}}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:14, height:14, borderRadius:4,
            background:pin.length>i?BRAND.yellow:"#1f1f1f",
            border:"1.5px solid "+(pin.length>i?BRAND.yellow:"#333"),
            transition:"all 0.15s"
          }} />
        ))}
      </div>
      {error
        ? <div style={{color:"#ff4444", fontSize:12, fontWeight:700, marginBottom:12, letterSpacing:"0.05em"}}>{error}</div>
        : <div style={{height:28, marginBottom:0}} />}
      
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 72px)", gap:10}}>
        {digits.map((d,i) => {
          if (d==="") return <div key={i}/>;
          return (
            <button key={i}
              onClick={()=>d==="⌫"?setPin(p=>p.slice(0,-1)):handleDigit(d)}
              style={{
                width:72, height:72,
                borderRadius:d==="⌫"?"50%":16,
                background:d==="⌫"?"transparent":"#161616",
                border:d==="⌫"?"none":"1px solid #2a2a2a",
                color:BRAND.white, fontSize:d==="⌫"?22:24, fontWeight:800, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.1s"
              }}
              onMouseDown={e => { if(d!=="⌫") e.currentTarget.style.background="#CCFF00"; e.currentTarget.style.color="#000" }}
              onMouseUp={e => { e.currentTarget.style.background="#161616"; e.currentTarget.style.color="#fff" }}
              onTouchStart={e => { if(d!=="⌫"){ e.currentTarget.style.background="#CCFF00"; e.currentTarget.style.color="#000" }}}
              onTouchEnd={e => { e.currentTarget.style.background=d==="⌫"?"transparent":"#161616"; e.currentTarget.style.color="#fff" }}
            >
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
    <div style={{fontFamily:"'Arial Black',Arial,sans-serif", background:"#0a0a0a", minHeight:"100vh", maxWidth:500, margin:"0 auto"}}>
      {/* HEADER */}
      <div style={{background:"#0a0a0a", padding:"14px 16px 10px", position:"sticky", top:0, zIndex:100, borderBottom:"1px solid #1f1f1f"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <div style={{color:BRAND.white, fontWeight:900, fontSize:22, letterSpacing:"-0.03em", lineHeight:1}}>
              ASAP <span style={{color:BRAND.yellow}}>BISTRO</span>
            </div>
            <div style={{color:"#444", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", marginTop:2}}>Внутрішня система</div>
          </div>
          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4}}>
            {saved && <div style={{color:"#4caf50", fontSize:11, fontWeight:700}}>{saved} Збережено</div>}
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <div style={{background:user.color, borderRadius:10, padding:"4px 12px", fontSize:11,
                fontWeight:800, color:user.role==="owner"?BRAND.black:BRAND.white, display:"flex", alignItems:"center", gap:4}}>
                <span>{user.emoji}</span><span>{user.label}</span>
              </div>
              <button onClick={()=>setUser(null)} style={{background:"transparent", border:"1px solid #333", color:"#555",
                borderRadius:8, padding:"4px 10px", fontSize:10, cursor:"pointer", fontWeight:700}}>вихід</button>
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
      <div style={{display:"flex", background:"#0a0a0a", borderBottom:"2px solid #1f1f1f", overflowX:"auto"}}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
            flex:1, padding:"10px 4px", background:"transparent",
            color:activeTab===t.id?BRAND.yellow:"#444", border:"none", fontWeight:800, fontSize:11, cursor:"pointer",
            letterSpacing:"0.06em", textTransform:"uppercase", display:"flex", flexDirection:"column",
            alignItems:"center", gap:2, transition:"color 0.15s", borderBottom: activeTab===t.id ? "2px solid "+BRAND.yellow : "2px solid transparent"}}>
            <span style={{fontSize:16}}>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* SCHEDULE FILTER - supervisors only */}
      {activeTab==="schedule" && isSup(user.role) && (
        <div style={{display:"flex", gap:6, padding:"10px 12px", background:"#0a0a0a", borderBottom:"1px solid #1f1f1f"}}>
          {[["all","Всі"],["kitchen","Кухня"],["hall","Зал"]].map(([id,label]) => (
            <button key={id} onClick={()=>setSchedSec(id)} style={{
              padding:"5px 12px", borderRadius:20, border:"1.5px solid "+BRAND.black,
              background:schedSec===id?BRAND.yellow:"transparent",
              color:schedSec===id?BRAND.black:"#555",
              fontWeight:800, fontSize:11, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.07em", border:"1px solid "+(schedSec===id?BRAND.yellow:"#333")}}>
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
