import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Game.css';

const Game = () => {
  const { token }             = useAuth();
  const canvasRef             = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src   = '/Build/HouseholdSurvivalWeb.loader.js';

    script.onload = () => {
      const config = {
        dataUrl:            '/Build/HouseholdSurvivalWeb.data.br',
        frameworkUrl:       '/Build/HouseholdSurvivalWeb.framework.js.br',
        codeUrl:            '/Build/HouseholdSurvivalWeb.wasm.br',
        streamingAssetsUrl: 'StreamingAssets',
        companyName:        'DefaultCompany',
        productName:        'HouseholdSurvival',
        productVersion:     '1.0',
      };

      window.createUnityInstance(canvasRef.current, config, (progress) => {
        // progress 0→1
      }).then((unityInstance) => {
        window.unityInstance = unityInstance;
        setLoading(false);

        // Pass JWT token into Unity so APIClient.cs can use it
        if (token) {
            unityInstance.SendMessage('GameController', 'SetToken', token);
        }
      }).catch((msg) => {
        setError(msg);
        setLoading(false);
      });
    };

    script.onerror = () => {
      setError('Failed to load game. Please refresh.');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [token]);

  return (
    <div className="game-page">
      <div className="game-header">
        <h1>Household Survival</h1>
        <p>Navigate financial instability across 7 life phases. Every decision matters.</p>
      </div>

      <div className="game-container">
        {loading && (
          <div className="game-loading">
            <div className="loading-spinner" />
            <p>Loading game...</p>
          </div>
        )}
        {error && (
          <div className="game-error">
            <p>⚠️ {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        <canvas
          ref={canvasRef}
          id="unity-canvas"
          width={1920}
          height={1080}
          tabIndex={-1}
          style={{ 
            display: loading || error ? 'none' : 'block',
            width: '100%',
            height: 'auto',
            background: '#231F20'
          }}
        />
      </div>

      <div className="game-phases">
        <h3>Game Phases</h3>
        <div className="phase-list">
          {[
            { n: 1, title: 'Financial Stability',    icon: '💰' },
            { n: 2, title: 'Income Shock & Side Job', icon: '💼' },
            { n: 3, title: 'Health Crisis',           icon: '🏥' },
            { n: 4, title: 'Family Strain',           icon: '👨‍👩‍👧' },
            { n: 5, title: 'Long-Term Investment',    icon: '📚' },
            { n: 6, title: 'Reflection Checkpoint',   icon: '📊' },
            { n: 7, title: 'Final Outcome',           icon: '🏁' },
          ].map(p => (
            <div key={p.n} className="phase-item">
              <span className="phase-icon">{p.icon}</span>
              <span className="phase-num">Phase {p.n}</span>
              <span className="phase-title">{p.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;