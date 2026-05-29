import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Requests({ me, requests, nameOf, onFlash }) {
  const [busyId, setBusyId] = useState(null)
  const [err, setErr] = useState('')

  const incoming = requests.filter((r) => r.target_id === me.id)
  const outgoing = requests.filter((r) => r.requester_id === me.id)

  async function act(id, kind) {
    setErr(''); setBusyId(id)
    try {
      let res
      if (kind === 'accept') res = await supabase.rpc('accept_request', { p_request: id })
      else if (kind === 'decline') res = await supabase.rpc('resolve_request', { p_request: id, p_action: 'declined' })
      else res = await supabase.rpc('resolve_request', { p_request: id, p_action: 'cancelled' })
      if (res.error) throw res.error
      onFlash(
        kind === 'accept' ? 'Request accepted — passes sent.'
          : kind === 'decline' ? 'Request declined.' : 'Request cancelled.'
      )
    } catch (e) {
      setErr(e.message || String(e))
      setBusyId(null)
    }
  }

  function statusTag(s) {
    if (s === 'pending') return <span className="tag pending">pending</span>
    if (s === 'accepted') return <span className="tag in">accepted</span>
    if (s === 'declined') return <span className="tag out">declined</span>
    return <span className="tag">cancelled</span>
  }

  return (
    <>
      {err && <div className="notice err">{err}</div>}

      <div className="card">
        <div className="section-label">Requests sent to you</div>
        {incoming.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>No one has asked you for passes.</p>
        ) : (
          <div className="stack">
            {incoming.map((r) => (
              <div className="row" key={r.id}>
                <div className="left">
                  <span className="uname">
                    {nameOf(r.requester_id)} wants <span className="mono">{r.amount}</span>{' '}
                    <em>{nameOf(r.issuer_id)}</em> {Number(r.amount) === 1 ? 'pass' : 'passes'}
                  </span>
                  <span className="meta">“{r.comment}”</span>
                </div>
                {r.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn sm" disabled={busyId === r.id} onClick={() => act(r.id, 'accept')}>Accept</button>
                    <button className="btn sm danger" disabled={busyId === r.id} onClick={() => act(r.id, 'decline')}>Decline</button>
                  </div>
                ) : statusTag(r.status)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-label">Requests you've sent</div>
        {outgoing.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>You haven't requested any passes.</p>
        ) : (
          <div className="stack">
            {outgoing.map((r) => (
              <div className="row" key={r.id}>
                <div className="left">
                  <span className="uname">
                    <span className="mono">{r.amount}</span> <em>{nameOf(r.issuer_id)}</em>{' '}
                    {Number(r.amount) === 1 ? 'pass' : 'passes'} from {nameOf(r.target_id)}
                  </span>
                  <span className="meta">“{r.comment}”</span>
                </div>
                {r.status === 'pending' ? (
                  <button className="btn sm danger" disabled={busyId === r.id} onClick={() => act(r.id, 'cancel')}>Cancel</button>
                ) : statusTag(r.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
