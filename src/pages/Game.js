import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Game.css';

const Game = () => {
  const { token, user } = useAuth();
  const canvasRef = useRef(null);
  const unityInstanceRef = useRef(null);
  const progressRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (document.getElementById('unity-loader-script')) return;

    const script = document.createElement('script');
    script.id = 'unity-loader-script';
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
        devicePixelRatio: window.devicePixelRatio || 1,
      };

      window.createUnityInstance(canvasRef.current, config, (progress) => {
        if (progressRef.current) {
          progressRef.current.style.width = 100 * progress + "%";
        }
      })
        .then((instance) => {
          unityInstanceRef.current = instance;
          setLoading(false);
          
          // Send auth data immediately upon load
          if (token) {
            const userId = user?.id?.toString() ?? '';
            instance.SendMessage('GameController', 'SetAuthFromReact', `${token}|${userId}`);
          }
        })
        .catch((msg) => {
          setError(String(msg));
          setLoading(false);
        });
    };

    document.body.appendChild(script);

    return () => {
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit().catch(() => {});
      }
      const existing = document.getElementById('unity-loader-script');
      if (existing) document.body.removeChild(existing);
    };
  }, [token, user]);

  const handleFullscreen = () => {
    if (unityInstanceRef.current) {
      unityInstanceRef.current.SetFullscreen(1);
    }
  };

  return (
    <div className="game-page">
      <div id="unity-container" className="game-container">
        {loading && (
          <div id="unity-loading-bar">
            <div id="unity-logo"></div>
            <div id="unity-progress-bar-empty">
              <div id="unity-progress-bar-full" ref={progressRef}></div>
            </div>
            <p className="loading-text">Loading Household Survival...</p>
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
          tabIndex={-1}
          style={{ 
            visibility: loading || error ? 'hidden' : 'visible' 
          }}
        />

        {/* Footer with Fullscreen Button */}
        {!loading && !error && (
          <div id="unity-footer">
            <div id="unity-build-title"></div>
            <button 
              id="unity-fullscreen-button" 
              onClick={handleFullscreen}
              title="Fullscreen"
            ></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;