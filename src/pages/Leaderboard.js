import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getTier } from './Home';
import './Leaderboard.css';

const API = 'https://household-survival-production.up.railway.app';

const COUNTRIES = [
  { code: '',   name: 'All Players',     emoji: '🌍' },
  { code: 'us', name: 'Played as US',    emoji: '🇺🇸' },
  { code: 'in', name: 'Played as India', emoji: '🇮🇳' },
  { code: 'ke', name: 'Played as Kenya', emoji: '🇰🇪' },
  { code: 'se', name: 'Played as Sweden',emoji: '🇸🇪' },
  { code: 'br', name: 'Played as Brazil',emoji: '🇧🇷' },
];

const Leaderboard = () => {
  const { token, user }           = useAuth();
  const [entries, setEntries]     = useState([]);
  const [filter, setFilter]       = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filter
      ? `${API}/api/progress/leaderboard?country=${filter}`
      : `${API}/api/progress/leaderboard`;
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setEntries(res.data.leaderboard); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter, token]);

  return (
    <div className="lb-page">
      <div className="lb-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top players across all countries ranked by total score</p>
      </div>

      <div className="lb-filters">
        {COUNTRIES.map(c => (
          <button
            key={c.code}
            className={`filter-btn ${filter === c.code ? 'active' : ''}`}
            onClick={() => setFilter(c.code)}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div className="lb-table">
        <div className="lb-table-header">
          <span>#</span>
          <span>Player</span>
          <span>Country</span>
          <span>Tier</span>
          <span>Score</span>
        </div>

        {loading ? (
          <div className="lb-loading">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="lb-empty">No scores yet. Be the first to play!</div>
        ) : (
          entries.map((entry, i) => {
            const tier    = getTier(entry.total_score);
            const isMe    = entry.email === user?.email;
            return (
              <div key={entry.leaderboard_id} className={`lb-row ${isMe ? 'is-me' : ''}`}>
                <span className="lb-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className="lb-name">
                  {entry.username || entry.email}
                  {isMe && <span className="you-badge">YOU</span>}
                </span>
                <span className="lb-country">
                  {COUNTRIES.find(c => c.code === entry.country_code)?.emoji || '🌍'}
                  {' '}{entry.country_code?.toUpperCase() || '—'}
                </span>
                <span className="lb-tier" style={{ color: tier?.color }}>
                  {tier?.emoji} {tier?.label}
                </span>
                <span className="lb-score" style={{ color: tier?.color }}>
                  {entry.total_score}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Leaderboard;