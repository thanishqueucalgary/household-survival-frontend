import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Game.css';

const Game = () => {
  const { token } = useAuth();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/Build/HouseholdSurvivalWeb.loader.js';

    script.onload = () => {
      const config = {
        dataUrl: '/Build/HouseholdSurvivalWeb.data',
        frameworkUrl: '/Build/HouseholdSurvivalWeb.framework.js',
        codeUrl: '/Build/HouseholdSurvivalWeb.wasm',
        streamingAssetsUrl: 'StreamingAssets',
        companyName: 'DefaultCompany',
        productName: 'HouseholdSurvival',
        productVersion: '1.0',
      };

      window.createUnityInstance(canvasRef.current, config, (progress) => {
        const bar = document.getElementById('unity-progress-bar-full');
        if (bar) bar.style.width = (progress * 100) + '%';
      }).then((unityInstance) => {
        window.unityInstance = unityInstance;
        setLoading(false);
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

    // Track fullscreen changes
    const onFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, [token]);

  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="game-page">
      <div className="game-container" ref={containerRef}>

        {/* Loading bar */}
        {loading && !error && (
          <div id="unity-loading-bar">
            <div id="unity-progress-bar-empty">
              <div id="unity-progress-bar-full" />
            </div>
            <p className="loading-text">Loading Household Survival...</p>
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
        />

        {/* Fullscreen hint — only shows when not in fullscreen and game is loaded */}
        {!loading && !error && !isFullscreen && (
          <div className="fullscreen-hint-wrapper" onClick={enterFullscreen}>
            <div className="hint-bubble">Click for best experience</div>
            <div className="hint-arrow">↘</div>
            <button className="fullscreen-btn" title="Enter Fullscreen">⛶</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;