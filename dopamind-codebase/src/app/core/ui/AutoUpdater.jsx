import React, { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Download, AlertCircle, CheckCircle2, X } from 'lucide-react';
import './AutoUpdater.css';

export default function AutoUpdater() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, downloading, installing, error, done
  const [progress, setProgress] = useState({ downloaded: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Only check for updates if running in Tauri
    if (window.__TAURI_INTERNALS__) {
      checkForUpdates();
    }
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await check();
      if (update) {
        setUpdateInfo(update);
        setStatus('idle');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const handleUpdate = async () => {
    if (!updateInfo) return;
    
    setStatus('downloading');
    setErrorMsg('');
    let downloaded = 0;
    let contentLength = 0;

    try {
      await updateInfo.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength;
            setProgress({ downloaded: 0, total: contentLength });
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            setProgress({ downloaded, total: contentLength });
            break;
          case 'Finished':
            setStatus('done');
            break;
        }
      });

      // Installation finished, restart the app
      await relaunch();
    } catch (error) {
      console.error('Update failed:', error);
      setStatus('error');
      setErrorMsg(error.message || 'An internet or validation error occurred.');
    }
  };

  const handleSkip = () => {
    setUpdateInfo(null);
  };

  if (!updateInfo) return null;

  const percent = progress.total > 0 ? Math.round((progress.downloaded / progress.total) * 100) : 0;
  const mbDownloaded = (progress.downloaded / 1024 / 1024).toFixed(1);
  const mbTotal = progress.total > 0 ? (progress.total / 1024 / 1024).toFixed(1) : '?';

  return (
    <div className="auto-updater-overlay">
      <div className="auto-updater-modal">
        <div className="updater-header">
          <div className="updater-icon-container">
            <Download size={24} className="updater-icon" />
          </div>
          <h2>Update Available</h2>
          {status === 'idle' && (
            <button className="updater-close-btn" onClick={handleSkip}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="updater-content">
          <p className="updater-version">
            Version <strong>{updateInfo.version}</strong> is ready to install!
          </p>
          <div className="updater-notes">
            <strong>Release Notes:</strong>
            <p>{updateInfo.body || "Performance improvements and bug fixes."}</p>
          </div>

          {status === 'idle' && (
            <div className="updater-actions">
              <button className="btn-secondary" onClick={handleSkip}>Later</button>
              <button className="btn-primary" onClick={handleUpdate}>Download & Install</button>
            </div>
          )}

          {status === 'downloading' && (
            <div className="updater-progress-container">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
              </div>
              <div className="progress-stats">
                <span>{percent}% Complete</span>
                <span>{mbDownloaded} / {mbTotal} MB</span>
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="updater-success">
              <CheckCircle2 size={20} className="success-icon" />
              <span>Update complete! Restarting DopaMind...</span>
            </div>
          )}

          {status === 'error' && (
            <div className="updater-error">
              <AlertCircle size={20} className="error-icon" />
              <div>
                <strong>Update Failed</strong>
                <p>{errorMsg}</p>
              </div>
              <button className="btn-secondary" onClick={() => setStatus('idle')}>Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
