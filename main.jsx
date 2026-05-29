:root {
  --paper: #f4efe4;
  --paper-2: #ece4d2;
  --ink: #211c16;
  --ink-soft: #5b5141;
  --line: #cbbfa6;
  --line-soft: #ded3bb;
  --oxblood: #7c2a2a;
  --oxblood-deep: #5e1d1d;
  --gold: #a8762e;
  --green: #3f6b46;
  --shadow: 0 1px 0 rgba(33, 28, 22, 0.06), 0 12px 28px -18px rgba(33, 28, 22, 0.45);
  --radius: 4px;
}

* { box-sizing: border-box; }

html, body, #root { height: 100%; }

body {
  margin: 0;
  background-color: var(--paper);
  background-image:
    radial-gradient(circle at 18% 12%, rgba(168, 118, 46, 0.07), transparent 42%),
    radial-gradient(circle at 84% 0%, rgba(124, 42, 42, 0.06), transparent 40%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  color: var(--ink);
  font-family: 'Newsreader', Georgia, serif;
  font-size: 17px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 { font-family: 'Fraunces', Georgia, serif; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
.mono { font-family: 'Spline Sans Mono', ui-monospace, monospace; }

button { font-family: inherit; cursor: pointer; }
input, select, textarea { font-family: 'Spline Sans Mono', monospace; font-size: 0.92rem; }

/* ---------- shell ---------- */
.shell { max-width: 1080px; margin: 0 auto; padding: 0 22px 80px; }

.masthead {
  border-bottom: 2px solid var(--ink);
  padding: 26px 0 16px;
  margin-bottom: 4px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.masthead .brand { display: flex; flex-direction: column; }
.masthead .kicker {
  font-family: 'Spline Sans Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.32em;
  font-size: 0.62rem;
  color: var(--oxblood);
}
.masthead h1 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; line-height: 0.95; }
.masthead h1 em { font-style: italic; font-weight: 500; color: var(--oxblood); }
.whoami { text-align: right; font-size: 0.85rem; color: var(--ink-soft); }
.whoami b { font-family: 'Spline Sans Mono', monospace; color: var(--ink); }
.linkbtn {
  background: none; border: none; color: var(--oxblood);
  text-decoration: underline; text-underline-offset: 3px; padding: 0; font-size: 0.82rem;
}

/* ---------- tabs ---------- */
.tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--line); margin: 18px 0 26px; flex-wrap: wrap; }
.tab {
  background: none; border: none; padding: 10px 16px;
  font-family: 'Spline Sans Mono', monospace; font-size: 0.78rem;
  text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-soft);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
}
.tab:hover { color: var(--ink); }
.tab.active { color: var(--oxblood); border-bottom-color: var(--oxblood); }

/* ---------- cards ---------- */
.card {
  background: rgba(255, 253, 247, 0.7);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 22px;
}
.card + .card { margin-top: 18px; }
.card h2 { font-size: 1.35rem; }
.card .sub { color: var(--ink-soft); font-size: 0.9rem; margin-top: 2px; }

.section-label {
  font-family: 'Spline Sans Mono', monospace; text-transform: uppercase;
  letter-spacing: 0.18em; font-size: 0.66rem; color: var(--ink-soft);
  border-bottom: 1px solid var(--line-soft); padding-bottom: 6px; margin: 4px 0 14px;
}

/* ---------- the "stamp" — your own pass ---------- */
.stamp {
  position: relative; border: 2px solid var(--oxblood); border-radius: 6px;
  padding: 18px 22px; background:
    repeating-linear-gradient(45deg, rgba(124,42,42,0.05) 0 8px, transparent 8px 16px);
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
}
.stamp .label { font-family: 'Spline Sans Mono', monospace; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.62rem; color: var(--oxblood); }
.stamp .name { font-family: 'Fraunces', serif; font-weight: 900; font-size: 1.6rem; }
.stamp .name em { font-style: italic; font-weight: 500; }
.stamp .infinity { font-family: 'Fraunces', serif; font-size: 2.4rem; color: var(--oxblood); line-height: 1; }

/* ---------- holdings grid ---------- */
.holdings { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
.holding {
  border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px;
  background: var(--paper); display: flex; flex-direction: column; gap: 6px;
}
.holding .who { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.05rem; }
.holding .who em { font-style: italic; }
.holding .bal { font-family: 'Spline Sans Mono', monospace; font-size: 1.7rem; font-weight: 600; }
.holding .unit { font-family: 'Spline Sans Mono', monospace; font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-soft); }
.holding.empty { color: var(--ink-soft); font-style: italic; }
.holding.you { border-color: var(--oxblood); }

/* ---------- list rows ---------- */
.row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 13px 4px; border-bottom: 1px solid var(--line-soft);
}
.row:last-child { border-bottom: none; }
.row .left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.row .uname { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.08rem; }
.row .meta { font-size: 0.82rem; color: var(--ink-soft); }
.row .meta .mono { color: var(--ink); }

.tag {
  font-family: 'Spline Sans Mono', monospace; font-size: 0.6rem; text-transform: uppercase;
  letter-spacing: 0.12em; padding: 3px 8px; border-radius: 100px; border: 1px solid var(--line);
  color: var(--ink-soft); white-space: nowrap;
}
.tag.in { color: var(--green); border-color: var(--green); }
.tag.out { color: var(--oxblood); border-color: var(--oxblood); }
.tag.pending { color: var(--gold); border-color: var(--gold); }

/* ---------- buttons ---------- */
.btn {
  background: var(--ink); color: var(--paper); border: 1px solid var(--ink);
  padding: 9px 16px; border-radius: var(--radius); font-size: 0.82rem;
  font-family: 'Spline Sans Mono', monospace; letter-spacing: 0.04em;
  transition: transform 0.08s ease, background 0.15s ease;
}
.btn:hover { background: var(--oxblood); border-color: var(--oxblood); }
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn.ghost { background: transparent; color: var(--ink); }
.btn.ghost:hover { background: var(--paper-2); color: var(--ink); }
.btn.danger { background: transparent; color: var(--oxblood); border-color: var(--line); }
.btn.danger:hover { background: var(--oxblood); color: var(--paper); border-color: var(--oxblood); }
.btn.sm { padding: 6px 11px; font-size: 0.72rem; }

/* ---------- forms ---------- */
.field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
.field label { font-family: 'Spline Sans Mono', monospace; font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-soft); }
.field input, .field select, .field textarea {
  background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 10px 12px; color: var(--ink); outline: none;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--oxblood); }
.field textarea { resize: vertical; min-height: 60px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.notice { font-size: 0.85rem; padding: 10px 12px; border-radius: var(--radius); margin: 10px 0; }
.notice.err { background: rgba(124,42,42,0.1); color: var(--oxblood-deep); border: 1px solid rgba(124,42,42,0.3); }
.notice.ok { background: rgba(63,107,70,0.12); color: var(--green); border: 1px solid rgba(63,107,70,0.3); }

/* ---------- auth screen ---------- */
.auth-wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.auth-card { width: 100%; max-width: 430px; }
.auth-card .seal {
  width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--oxblood);
  display: grid; place-items: center; margin: 0 auto 16px;
  font-family: 'Fraunces', serif; font-weight: 900; font-size: 1.6rem; color: var(--oxblood);
  background: repeating-radial-gradient(circle, transparent 0 5px, rgba(124,42,42,0.08) 5px 6px);
}
.auth-card h1 { text-align: center; font-size: 2rem; font-weight: 900; }
.auth-card h1 em { font-style: italic; font-weight: 500; color: var(--oxblood); }
.auth-card .tagline { text-align: center; color: var(--ink-soft); margin: 4px 0 22px; font-size: 0.92rem; }
.switch { text-align: center; margin-top: 14px; font-size: 0.85rem; color: var(--ink-soft); }

.muted { color: var(--ink-soft); }
.center { text-align: center; }
.spread { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.stack { display: flex; flex-direction: column; gap: 0; }
.loading { text-align: center; padding: 60px 0; color: var(--ink-soft); font-family: 'Spline Sans Mono', monospace; letter-spacing: 0.1em; }

/* ---------- modal ---------- */
.overlay { position: fixed; inset: 0; background: rgba(33,28,22,0.55); display: grid; place-items: center; padding: 20px; z-index: 50; }
.modal { background: var(--paper); border: 1px solid var(--ink); border-radius: 6px; width: 100%; max-width: 460px; padding: 24px; box-shadow: 0 30px 60px -20px rgba(0,0,0,0.5); }
.modal h3 { font-size: 1.4rem; margin-bottom: 4px; }

@media (max-width: 540px) {
  .grid2 { grid-template-columns: 1fr; }
  body { font-size: 16px; }
}
