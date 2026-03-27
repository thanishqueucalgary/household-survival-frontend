import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Game.css';

const Game = () => {
  const { token }               = useAuth();
  const canvasRef               = useRef(null);
  const containerRef            = useRef(null);
  const [started, setStarted]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const launchGame = () => {
    setStarted(true);
    setLoading(true);

    const script = document.createElement('script');
    script.src = '/Build/HouseholdSurvivalWeb.loader.js';

    script.onload = () => {
      const config = {
        dataUrl:            '/Build/HouseholdSurvivalWeb.data',
        frameworkUrl:       '/Build/HouseholdSurvivalWeb.framework.js',
        codeUrl:            '/Build/HouseholdSurvivalWeb.wasm',
        streamingAssetsUrl: 'StreamingAssets',
        companyName:        'DefaultCompany',
        productName:        'HouseholdSurvival',
        productVersion:     '1.0',
      };

      window.createUnityInstance(canvasRef.current, config, (progress) => {
        const bar = document.getElementById('unity-progress-bar-full');
        if (bar) bar.style.width = (progress * 100) + '%';
      }).then((unityInstance) => {
        window.unityInstance = unityInstance;
        setLoading(false);

        // Go fullscreen immediately
        if (containerRef.current && containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }

        // Pass JWT token into Unity
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
  };

  return (
    <div className="game-page">
      <div className="game-container" ref={containerRef}>

        {/* Pre-launch overlay */}
        {!started && (
          <div className="game-overlay">
            <div className="overlay-content">
              <div className="overlay-icon">🏠</div>
              <h2>Household Survival</h2>
              <p>Navigate 7 life phases across 5 countries.<br />Every decision shapes your family's future.</p>
              <button className="play-now-btn" onClick={launchGame}>
                ▶ Play Now
              </button>
              <p className="fullscreen-hint">The game will open in fullscreen. Press Esc to exit.</p>
            </div>
          </div>
        )}

        {/* Loading bar */}
        {started && loading && (
          <div id="unity-loading-bar">
            <div id="unity-logo" />
            <div id="unity-progress-bar-empty">
              <div id="unity-progress-bar-full" />
            </div>
            <p className="loading-text">Loading game...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="game-error">
            <p>⚠️ {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* Unity canvas */}
        <canvas
          ref={canvasRef}
          id="unity-canvas"
          tabIndex={-1}
          style={{ display: started && !loading && !error ? 'block' : 'none' }}
        />

        {/* Fullscreen button (only shows when game is running) */}
        {started && !loading && !error && (
          <div id="unity-footer">
            <button
              id="unity-fullscreen-button"
              onClick={() => {
                if (containerRef.current?.requestFullscreen) {
                  containerRef.current.requestFullscreen();
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;