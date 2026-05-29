import { useMemo, useState } from 'react'

export default function Directory({ me, profiles, holdings, nameOf, onGive, onRequest }) {
  const [open, setOpen] = useState(null) // expanded user id
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return profiles.filter((p) => !term || p.username.toLowerCase().includes(term))
  }, [profiles, q])

  function holdingsFor(userId) {
    return holdings.filter((h) => h.holder_id === userId && h.balance > 0)
  }
  function circulationFor(userId) {
    return holdings
      .filter((h) => h.issuer_id === userId && h.holder_id !== userId && h.balance > 0)
      .reduce((s, h) => s + Number(h.balance), 0)
  }

  return (
    <div className="card">
      <div className="spread" style={{ marginBottom: 6 }}>
        <h2>Members</h2>
        <input
          placeholder="search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 200 }}
        />
      </div>
      <p className="muted" style={{ marginTop: 0, fontSize: '0.88rem' }}>
        Tap a member to see every pass they hold. Pass counts are public to all members.
      </p>

      <div className="stack">
        {list.map((p) => {
          const isMe = p.id === me.id
          const expanded = open === p.id
          const held = holdingsFor(p.id)
          return (
            <div key={p.id}>
              <div className="row" style={{ cursor: 'pointer' }} onClick={() => setOpen(expanded ? null : p.id)}>
                <div className="left">
                  <span className="uname">
                    {p.username} {isMe && <span className="tag">you</span>}
                  </span>
                  <span className="meta">
                    mints <span className="mono">{p.username}</span> passes ·{' '}
                    <span className="mono">{circulationFor(p.id)}</span> in circulation
                  </span>
                </div>
                <span className="muted mono" style={{ fontSize: '0.8rem' }}>{expanded ? '−' : '+'}</span>
              </div>

              {expanded && (
                <div style={{ padding: '6px 4px 18px' }}>
                  <div className="section-label">Passes {isMe ? 'you hold' : `${p.username} holds`}</div>
                  {held.length === 0 ? (
                    <p className="muted" style={{ margin: '0 0 14px' }}>Holds no passes yet.</p>
                  ) : (
                    <div className="holdings" style={{ marginBottom: 14 }}>
                      {held.map((h) => (
                        <div className={`holding ${h.issuer_id === p.id ? 'you' : ''}`} key={h.issuer_id}>
                          <span className="who"><em>{nameOf(h.issuer_id)}</em></span>
                          <span className="bal mono">{h.balance}</span>
                          <span className="unit">{nameOf(h.issuer_id)} {Number(h.balance) === 1 ? 'pass' : 'passes'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isMe && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn sm" onClick={() => onGive({ id: p.id, username: p.username })}>
                        Give passes →
                      </button>
                      <button className="btn sm ghost" onClick={() => onRequest({ id: p.id, username: p.username })}>
                        Request passes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
