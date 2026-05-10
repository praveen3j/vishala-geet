import { ADMIN_USERS } from "../lib/admins.js";

export default function AuthPanel({
  adminProfile,
  authEmail,
  authLoading,
  authOtp,
  authStep,
  backendEnabled,
  onAuthEmailChange,
  onAuthOtpChange,
  onRequestOtp,
  onSignOut,
  onUseAnotherEmail,
  onVerifyOtp,
  userEmail
}) {
  function handleEmailSubmit(event) {
    event.preventDefault();
    onRequestOtp();
  }

  function handleCodeSubmit(event) {
    event.preventDefault();
    onVerifyOtp();
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
      {backendEnabled && !userEmail && authStep === "email" && (
        <form className="admin-form" onSubmit={handleEmailSubmit}>
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
            Send OTP Code
          </button>
        </form>
      )}
      {backendEnabled && !userEmail && authStep === "code" && (
        <form className="admin-otp-form" onSubmit={handleCodeSubmit}>
          <p className="song-meta">Enter the code sent to {authEmail.trim().toLowerCase()}.</p>
          <div className="admin-form">
            <div className="field is-compact">
              <label htmlFor="adminOtp">OTP code</label>
              <input
                id="adminOtp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength="8"
                pattern="[0-9]*"
                placeholder="12345678"
                value={authOtp}
                onChange={(event) => onAuthOtpChange(event.target.value.replace(/\D/g, "").slice(0, 8))}
              />
            </div>
            <button className="primary" type="submit" disabled={authLoading}>
              Verify Code
            </button>
          </div>
          <div className="actions admin-auth-actions">
            <button className="secondary" type="button" onClick={onRequestOtp} disabled={authLoading}>
              Resend Code
            </button>
            <button className="quiet" type="button" onClick={onUseAnotherEmail} disabled={authLoading}>
              Change Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
