/* Authentication UI: registration includes an OTP email-verification step. */
const { useState: useAuthState } = React;
window.LoginModal = function LoginModal({ onClose, onSwitch, users, onLogin }){
  const [username, setUsername] = useAuthState("");
  const [password, setPassword] = useAuthState("");
  const [error, setError] = useAuthState("");
  function submit(e){
    e.preventDefault();
    const u = users[username];
    if(!u || u.password !== password){ setError("Incorrect username or password."); return; }
    if(u.banned){ setError("This account has been banned."+(u.banReason?(" Reason: "+u.banReason):"")); return; }
    if(!u.emailVerified){ setError("Verify your email before signing in. Register again to complete verification."); return; }
    onLogin(username);
  }
  return <window.Modal title="Log in" onClose={onClose}>
    <form onSubmit={submit}>
      <window.Field label="Username"><input required autoFocus autoComplete="username" className={window.inputClass} style={window.inputStyle} value={username} onChange={e=>setUsername(e.target.value)} /></window.Field>
      <window.Field label="Password"><input required type="password" autoComplete="current-password" className={window.inputClass} style={window.inputStyle} value={password} onChange={e=>setPassword(e.target.value)} /></window.Field>
      {error && <div className="text-xs font-semibold mb-3" style={{ color:"var(--danger)" }}>{error}</div>}
      <window.Button type="submit" variant="primary" className="w-full">Log in</window.Button>
      <p className="text-xs text-center mt-4" style={{ color:"var(--ink-soft)" }}>No account? <button type="button" onClick={onSwitch} className="font-semibold" style={{ color:"var(--accent)" }}>Register</button></p>
    </form>
  </window.Modal>;
}
window.RegisterModal = function RegisterModal({ onClose, onSwitch, users, onRegister }){
  const [step, setStep] = useAuthState("details");
  const [username, setUsername] = useAuthState("");
  const [email, setEmail] = useAuthState("");
  const [password, setPassword] = useAuthState("");
  const [confirm, setConfirm] = useAuthState("");
  const [otp, setOtp] = useAuthState("");
  const [sentOtp, setSentOtp] = useAuthState("");
  const [error, setError] = useAuthState("");
  function sendVerification(e){
    e.preventDefault(); const uname=username.trim();
    if(!uname || !email || !password){ setError("Fill in all fields."); return; }
    if(!/^\S+@\S+\.\S+$/.test(email)){ setError("Enter a valid email address."); return; }
    if(users[uname]){ setError("That username is already taken."); return; }
    if(password !== confirm){ setError("Passwords don't match."); return; }
    const code=String(Math.floor(100000 + Math.random()*900000));
    setSentOtp(code); setError(""); setStep("verify");
  }
  function verify(e){
    e.preventDefault();
    if(otp !== sentOtp){ setError("That verification code is not valid. Check your email and try again."); return; }
    onRegister(username.trim(), password, email.trim().toLowerCase());
  }
  return <window.Modal title={step==="details" ? "Create an account" : "Verify your email"} onClose={onClose}>
    {step==="details" ? <form onSubmit={sendVerification}>
      <window.Field label="Username"><input required autoFocus autoComplete="username" className={window.inputClass} style={window.inputStyle} value={username} onChange={e=>setUsername(e.target.value)} /></window.Field>
      <window.Field label="Email"><input required type="email" autoComplete="email" className={window.inputClass} style={window.inputStyle} value={email} onChange={e=>setEmail(e.target.value)} /></window.Field>
      <window.Field label="Password"><input required type="password" autoComplete="new-password" minLength="8" className={window.inputClass} style={window.inputStyle} value={password} onChange={e=>setPassword(e.target.value)} /></window.Field>
      <window.Field label="Confirm password"><input required type="password" autoComplete="new-password" className={window.inputClass} style={window.inputStyle} value={confirm} onChange={e=>setConfirm(e.target.value)} /></window.Field>
      {error && <div className="text-xs font-semibold mb-3" style={{ color:"var(--danger)" }}>{error}</div>}
      <window.Button type="submit" variant="primary" className="w-full">Send verification code</window.Button>
      <p className="text-xs text-center mt-4" style={{ color:"var(--ink-soft)" }}>Already have an account? <button type="button" onClick={onSwitch} className="font-semibold" style={{ color:"var(--accent)" }}>Log in</button></p>
    </form> : <form onSubmit={verify}>
      <p className="text-sm mb-4" style={{ color:"var(--ink-soft)" }}>We sent a six-digit verification code to <strong style={{color:"var(--ink)"}}>{email}</strong>. Enter it to activate your account.</p>
      <window.Field label="Verification code"><input required autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength="6" className={window.inputClass} style={window.inputStyle} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} /></window.Field>
      {error && <div className="text-xs font-semibold mb-3" style={{ color:"var(--danger)" }}>{error}</div>}
      <window.Button type="submit" variant="primary" className="w-full">Verify & create account</window.Button>
      <button type="button" onClick={()=>{setSentOtp(String(Math.floor(100000+Math.random()*900000)));setOtp("");setError("");}} className="w-full mt-3 text-xs font-semibold" style={{color:"var(--accent)"}}>Resend verification code</button>
    </form>}
  </window.Modal>;
}
window.ChangePasswordModal = function ChangePasswordModal({ onClose, user, onChangePassword }){
  const [current, setCurrent] = useAuthState("");
  const [next, setNext] = useAuthState("");
  const [confirm, setConfirm] = useAuthState("");
  const [error, setError] = useAuthState("");
  function submit(e){
    e.preventDefault();
    if(!user || user.password !== current){ setError("Your current password is incorrect."); return; }
    if(next.length < 8){ setError("New password must be at least 8 characters."); return; }
    if(next === current){ setError("New password must be different from your current password."); return; }
    if(next !== confirm){ setError("New passwords don't match."); return; }
    onChangePassword(next);
    onClose();
  }
  return <window.Modal title="Change password" onClose={onClose}>
    <form onSubmit={submit}>
      <window.Field label="Current password"><input required autoFocus type="password" autoComplete="current-password" className={window.inputClass} style={window.inputStyle} value={current} onChange={e=>setCurrent(e.target.value)} /></window.Field>
      <window.Field label="New password"><input required type="password" autoComplete="new-password" minLength="8" className={window.inputClass} style={window.inputStyle} value={next} onChange={e=>setNext(e.target.value)} /></window.Field>
      <window.Field label="Confirm new password"><input required type="password" autoComplete="new-password" className={window.inputClass} style={window.inputStyle} value={confirm} onChange={e=>setConfirm(e.target.value)} /></window.Field>
      {error && <div className="text-xs font-semibold mb-3" style={{ color:"var(--danger)" }}>{error}</div>}
      <window.Button type="submit" variant="primary" className="w-full">Update password</window.Button>
    </form>
  </window.Modal>;
}
