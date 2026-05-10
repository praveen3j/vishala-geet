import { ADMIN_USERS } from "../lib/admins.js";

export default function AuthPanel({
  adminProfile,
  authEmail,
  authLoading,
  backendEnabled,
  onAuthEmailChange,
  onSignIn,
  onSignOut,
  userEmail
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSignIn();
  }

  return (
    <div className="backup-tools">
      <h3 className="subsection-title">Admin Access</h3>
      <p className="song-meta">
        Search is open to everyone. Only Praveen and Vishala can add, edit, or delete shared songs.
      </p>
      {!backendEnabled && (
        <p className="notice">
          Backend is not configured yet. Add Supabase keys before admin login is enabled.
        </p>
      )}
      {backendEnabled && adminProfile && (
        <div className="admin-card">
          <p>
            Signed in as <strong>{adminProfile.name}</strong> ({userEmail})
          </p>
          <button className="secondary" type="button" onClick={onSignOut} disabled={authLoading}>
            Sign Out
          </button>
        </div>
      )}
      {backendEnabled && userEmail && !adminProfile && (
        <div className="admin-card">
          <p>{userEmail} is signed in, but this email is not an admin.</p>
          <button className="secondary" type="button" onClick={onSignOut} disabled={authLoading}>
            Sign Out
          </button>
        </div>
      )}
      {backendEnabled && !userEmail && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="field is-compact">
            <label htmlFor="adminEmail">Admin email</label>
            <input
              id="adminEmail"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={ADMIN_USERS.map((admin) => admin.email).join(" or ")}
              value={authEmail}
              onChange={(event) => onAuthEmailChange(event.target.value)}
            />
          </div>
          <button className="primary" type="submit" disabled={authLoading}>
            Send Sign-In Link
          </button>
        </form>
      )}
    </div>
  );
}
