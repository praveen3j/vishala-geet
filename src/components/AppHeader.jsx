import { APP_NAME, APP_VERSION } from "../constants.js";

export default function AppHeader({ canInstall, onInstall }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="24" fill="#f7f5ef" />
            <path d="M15 18h9l8 24 8-24h9L36 50h-8L15 18Z" fill="#14213d" />
            <path
              d="M44 17v23.5c0 5.1-4.6 9.2-10.2 9.2-5.4 0-9.8-3.6-9.8-8.1s4.4-8.1 9.8-8.1c1.5 0 2.9.3 4.1.8V21.3L52 18.5v7.3l-8 1.6Z"
              fill="#b7791f"
            />
            <path d="M34 44c2.5 0 4.4-1.3 4.4-3s-1.9-3-4.4-3-4.4 1.3-4.4 3 1.9 3 4.4 3Z" fill="#f7f5ef" />
          </svg>
        </div>
        <div className="brand-copy">
          <div className="title-row">
            <h1>
              <span className="app-name-full">{APP_NAME}</span>
              <span className="app-name-short">Geet</span>
            </h1>
            <span className="version-pill" aria-label={`App version ${APP_VERSION}`}>
              v{APP_VERSION}
            </span>
          </div>
          <p className="subtitle">Mom&apos;s favorite songs.</p>
        </div>
      </div>
      <button
        className={`install-button${canInstall ? " is-visible" : ""}`}
        type="button"
        onClick={onInstall}
      >
        Install
      </button>
    </header>
  );
}
