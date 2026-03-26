import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const API = 'https://household-survival-production.up.railway.app';

const COUNTRIES = [
  { code: 'us', name: 'United States', emoji: '🇺🇸' },
  { code: 'in', name: 'India',         emoji: '🇮🇳' },
  { code: 'ke', name: 'Kenya',         emoji: '🇰🇪' },
  { code: 'se', name: 'Sweden',        emoji: '🇸🇪' },
  { code: 'br', name: 'Brazil',        emoji: '🇧🇷' },
];

const Auth = () => {
  const [isLogin, setIsLogin]         = useState(true);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [username, setUsername]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post(`${API}/api/auth/login`, { email, password });
        login(res.data.user, res.data.token);
        navigate('/home');
      } else {
        const res = await axios.post(`${API}/api/auth/register`, {
          email, password, username
        });
        login(res.data.user, res.data.token);
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-hero">
          <h1>Household<br />Survival</h1>
          <p>A simulation game about poverty, resilience, and the choices that define a family's future.</p>
          <div className="sdg-badge">🎯 SDG 1 — No Poverty</div>
          <div className="country-flags">
            {COUNTRIES.map(c => (
              <span key={c.code} className="flag-display" title={c.name}>{c.emoji}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={isLogin ? 'active' : ''}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Login
            </button>
            <button
              className={!isLogin ? 'active' : ''}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Your character's name"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
{/* 
            {!isLogin && (
              <div className="form-group">
                <label>Country</label>
                <div className="country-select">
                  {COUNTRIES.map(c => (
                    <button
                      type="button"
                      key={c.code}
                      className={`country-btn ${countryCode === c.code ? 'selected' : ''}`}
                      onClick={() => setCountryCode(c.code)}
                    >
                      <span>{c.emoji}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )} */}

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;