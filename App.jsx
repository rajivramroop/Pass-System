import { useMemo } from 'react'

export default function Dashboard({ me, myHoldings, holdings, nameOf }) {
  const others = myHoldings.filter((h) => h.issuer_id !== me.id && h.balance > 0)

  // How many of MY passes are out in the world, held by others.
  const circulation = useMemo(() => {
    const rows = holdings.filter((h) => h.issuer_id === me.id && h.holder_id !== me.id && h.balance > 0)
    const total = rows.reduce((s, h) => s + Number(h.balance), 0)
    return { total, holders: rows.length, rows }
  }, [holdings, me])

  return (
    <>
      <div className="card">
        <div className="section-label">Your own currency</div>
        <div className="stamp">
          <div>
            <div className="label">Issued by you</div>
            <div className="name"><em>{me.username}</em> passes</div>
          </div>
          <div className="center">
            <div className="infinity">∞</div>
            <div className="label">unlimited supply</div>
          </div>
        </div>
        <p className="muted" style={{ fontSize: '0.88rem', marginTop: 14, marginBottom: 0 }}>
          You can hand out any number of your own passes. Currently <b className="mono">{circulation.total}</b>{' '}
          {circulation.total === 1 ? 'pass is' : 'passes are'} in circulation across{' '}
          <b className="mono">{circulation.holders}</b> {circulation.holders === 1 ? 'holder' : 'holders'}.
        </p>
      </div>

      <div className="card">
        <div className="section-label">Passes you hold (other people's currencies)</div>
        {others.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            You don't hold anyone else's passes yet. Visit <b>Members</b> to request some.
          </p>
        ) : (
          <div className="holdings">
            {others.map((h) => (
              <div className="holding" key={h.issuer_id}>
                <span className="who"><em>{nameOf(h.issuer_id)}</em></span>
                <span className="bal mono">{h.balance}</span>
                <span className="unit">{nameOf(h.issuer_id)} {Number(h.balance) === 1 ? 'pass' : 'passes'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {circulation.rows.length > 0 && (
        <div className="card">
          <div className="section-label">Who holds your passes</div>
          <div className="stack">
            {circulation.rows
              .slice()
              .sort((a, b) => Number(b.balance) - Number(a.balance))
              .map((h) => (
                <div className="row" key={h.holder_id}>
                  <div className="left">
                    <span className="uname">{nameOf(h.holder_id)}</span>
                  </div>
                  <span className="mono">{h.balance} {Number(h.balance) === 1 ? 'pass' : 'passes'}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  )
}
