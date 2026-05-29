import { useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

// mode: 'give' | 'request'
// counterparty: { id, username }  (the other person, fixed)
export default function ExchangeModal({ mode, counterparty, me, profiles, holdings, onClose, onDone }) {
  const giving = mode === 'give'

  // Which pass types can be selected as the "issuer".
  const passOptions = useMemo(() => {
    if (giving) {
      // You may always mint your own; otherwise only types you actually hold.
      const opts = [{ id: me.id, username: me.username, mine: true, balance: Infinity }]
      holdings
        .filter((h) => h.balance > 0 && h.issuer_id !== me.id)
        .forEach((h) => {
          const p = profiles.find((x) => x.id === h.issuer_id)
          if (p) opts.push({ id: p.id, username: p.username, mine: false, balance: h.balance })
        })
      return opts
    }
    // Requesting: any pass type that exists.
    return profiles.map((p) => ({ id: p.id, username: p.username, mine: p.id === me.id, balance: null }))
  }, [giving, holdings, profiles, me])

  const [issuerId, setIssuerId] = useState(passOptions[0]?.id || '')
  const [amount, setAmount] = useState(1)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const chosen = passOptions.find((o) => o.id === issuerId)

  async function submit(e) {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const amt = parseInt(amount, 10)
      if (!Number.isInteger(amt) || amt <= 0) throw new Error('Enter a positive whole number.')
      if (!comment.trim()) throw new Error('A comment is required for every exchange.')

      const fn = giving ? 'transfer_passes' : 'create_request'
      const args = giving
        ? { p_recipient: counterparty.id, p_issuer: issuerId, p_amount: amt, p_comment: comment.trim() }
        : { p_target: counterparty.id, p_issuer: issuerId, p_amount: amt, p_comment: comment.trim() }

      const { error } = await supabase.rpc(fn, args)
      if (error) throw error
      onDone(
        giving
          ? `Sent ${amt} ${chosen.username} ${amt === 1 ? 'pass' : 'passes'} to ${counterparty.username}.`
          : `Requested ${amt} ${chosen.username} ${amt === 1 ? 'pass' : 'passes'} from ${counterparty.username}.`
      )
    } catch (e2) {
      setErr(e2.message || String(e2))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{giving ? 'Hand out passes' : 'Request passes'}</h3>
        <p className="muted" style={{ fontSize: '0.88rem', marginTop: 0 }}>
          {giving ? 'to' : 'from'} <b className="mono">{counterparty.username}</b>
        </p>

        {err && <div className="notice err">{err}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Pass type</label>
            <select value={issuerId} onChange={(e) => setIssuerId(e.target.value)}>
              {passOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.username} passes{o.mine ? ' (yours — unlimited)' : o.balance != null ? ` (you hold ${o.balance})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid2">
            <div className="field">
              <label>Amount</label>
              <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="field" style={{ justifyContent: 'flex-end' }}>
              <label>&nbsp;</label>
              {giving && chosen && !chosen.mine && (
                <span className="muted mono" style={{ fontSize: '0.78rem' }}>max {chosen.balance}</span>
              )}
              {giving && chosen && chosen.mine && (
                <span className="muted mono" style={{ fontSize: '0.78rem' }}>your own — no limit</span>
              )}
            </div>
          </div>

          <div className="field">
            <label>Comment (required)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What is this for?" />
          </div>

          <div className="spread" style={{ marginTop: 6 }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn" disabled={busy || !issuerId}>
              {busy ? 'Working…' : giving ? 'Send passes' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
