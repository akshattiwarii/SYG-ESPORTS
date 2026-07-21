function Rules() {
  return (
    <section className="section section-top">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Competitive Standards</span>
            <h2 className="section-title">Rules & Regulations</h2>
            <div className="section-sub">We keep the competition fair, transparent and easy to follow for every player.</div>
          </div>
        </div>
        
        <div className="grid-3">
          <div className="panel" style={{ padding: '22px' }}>
            <h4 style={{ marginBottom: '12px' }}>Eligibility</h4>
            <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', fontSize: '14px' }}>
              Players must be at least 14 years old and have a valid Free Fire account. Any fake UID, misrepresented account, or duplicate registration will lead to slot removal.
            </p>
          </div>
          <div className="panel" style={{ padding: '22px' }}>
            <h4 style={{ marginBottom: '12px' }}>Match Conduct</h4>
            <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', fontSize: '14px' }}>
              No queue manipulation, team swapping, or intentional disconnects. Use respectful voice chat and follow the host's instructions during lobby match procedures.
            </p>
          </div>
          <div className="panel" style={{ padding: '22px' }}>
            <h4 style={{ marginBottom: '12px' }}>Results & Verification</h4>
            <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', fontSize: '14px' }}>
              Match results are reviewed and published by tournament admins. Any dispute or verification review must be submitted within 24 hours with evidence.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {/* Battle Royale Card */}
          <div className="panel-2" style={{ padding: '24px', borderRadius: '16px', flex: '1 1 300px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--orange-2)', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              Battle Royale Points System (Squad, Duo, Solo)
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginBottom: '16px', lineHeight: '1.5' }}>
              Lobby standings and leaderboard rankings are calculated based on placement points plus <b>1 point per elimination (kill)</b>.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>1st Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>12 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>2nd Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>9 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>3rd Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>8 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>4th Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>7 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>5th Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>6 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>6th Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>5 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>7th Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>4 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>8th Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>3 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>9th Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>2 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontSize: '11px', fontWeight: 600 }}>10th Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text)' }}>1 PT</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-faint)', fontSize: '11px', fontWeight: 600 }}>11th Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text-faint)' }}>0 PTS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-faint)', fontSize: '11px', fontWeight: 600 }}>12th Place</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text-faint)' }}>0 PTS</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--cyan)', textAlign: 'center', fontWeight: 700, letterSpacing: '0.5px' }}>
              🔥 PLUS 1 POINT PER ELIMINATION (KILL)
            </div>
          </div>

          {/* Clash Squad & Lone Wolf Card */}
          <div className="panel-2" style={{ padding: '24px', borderRadius: '16px', flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--orange-2)', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              Clash Squad & Lone Wolf Match Rules
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', lineHeight: '1.6', marginBottom: '16px' }}>
              Clash Squad and Lone Wolf matches follow a direct single-elimination knockout bracket system:
            </p>
            <ul style={{ color: 'var(--text-dim)', fontSize: '13.5px', paddingLeft: '20px', lineHeight: '1.9', flex: 1 }}>
              <li style={{ marginBottom: '8px' }}>
                <b>Head-to-Head Duel:</b> Roster squads or players play directly against each other in custom lobbies.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <b>Absolute Winner:</b> The team or player that wins the match is the absolute winner of that round and advances immediately.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <b>Simple Bracket Logic:</b> No placement or kill points are calculated for Clash Squad or Lone Wolf. Standings are determined strictly by match wins (Booyahs).
              </li>
            </ul>
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '14px', marginTop: '14px' }}>
              <span className="badge badge-open" style={{ width: '100%', justifyContent: 'center' }}>
                <span className="badge-dot"></span>Winner Takes All
              </span>
            </div>
          </div>
        </div>

        <div className="panel-2" style={{ padding: '28px', marginTop: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '14px', color: 'var(--orange-2)' }}>Fair Play & Anticheat Policy</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '14.5px', lineHeight: '1.7', marginBottom: '14px' }}>
            SYG ESPORTS upholds strict standards against cheating and unfair game advantages. The use of hacks, scripts, aimbots, config file editing, or playing on emulators in mobile-only scrims is strictly forbidden.
          </p>
          <div className="rule-warn" style={{ margin: 0 }}>
            <strong>CRITICAL WARNING:</strong> Any player or team caught violating our anti-cheat rules will receive an immediate lifetime ban from all SYG Esports tournaments, scrims, and community rankings, with all points voided.
          </div>
        </div>
      </div>
    </section>
  )
}

export default Rules
