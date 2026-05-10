import AuthPanel from "./AuthPanel.jsx";

export default function AboutPanel({
  adminProfile,
  authEmail,
  authLoading,
  backendEnabled,
  dataStatus,
  importInputRef,
  onAuthEmailChange,
  onExportCsv,
  onExportJson,
  onImportClick,
  onImportFile,
  onRefreshData,
  onSignIn,
  onSignOut,
  userEmail
}) {
  return (
    <section id="aboutPanel" className="panel is-active" aria-labelledby="aboutTitle">
      <div className="section">
        <h2 id="aboutTitle" className="form-title">
          About Vishala
        </h2>
        <p className="profile-name">Vishala Javvaji</p>
        <p className="profile-subtitle">Song collection</p>
        <p className="about-copy">
          I am Vishala Javvaji, and this is my devotional song collection. I am fluent in Hindi, Telugu, and
          English, and I hold a BA degree. I enjoy singing devotional songs, kolatam, and veena. I practice
          yoga, follow a healthy diet, and like to maintain a healthy lifestyle. I also love volunteering at
          temples, especially for events connected with devotional music, kolatam, and veena.
        </p>
        <AuthPanel
          adminProfile={adminProfile}
          authEmail={authEmail}
          authLoading={authLoading}
          backendEnabled={backendEnabled}
          onAuthEmailChange={onAuthEmailChange}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
          userEmail={userEmail}
        />
        <div className="backup-tools">
          <h3 className="subsection-title">Data Tools</h3>
          <p className="song-meta">{dataStatus}</p>
          <div className="backup-grid">
            <button className="primary" type="button" onClick={onRefreshData}>
              Refresh List
            </button>
            <button className="primary" type="button" onClick={onExportJson}>
              Export Backup
            </button>
            <button className="secondary" type="button" onClick={onExportCsv}>
              Export CSV
            </button>
            <button className="secondary" type="button" onClick={onImportClick}>
              Import Backup
            </button>
          </div>
        </div>
        <input
          ref={importInputRef}
          className="hidden-input"
          type="file"
          accept="application/json,.json"
          onChange={onImportFile}
        />
        <p className="notice">
          Tip: On your Pixel, use Chrome&apos;s keyboard microphone in the search box to speak a song name.
        </p>
      </div>
    </section>
  );
}
