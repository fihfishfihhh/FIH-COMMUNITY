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
  return <Modal title="Log in" onClose={onClose}>
    <form onSubmit={submit}>
      <Field label="Username"><input required autoFocus autoComplete="username" className={inputClass} style={inputStyle} value={username} onChange={e=>setUsername(e.target.value)} /></Field>
      <Field label="Password"><input required type="password" autoComplete="current-password" className={inputClass} style={inputStyle} value={password} onChange={e=>setPassword(e.target.value)} /></Field>
      {error && <div className="text-xs font-semibold mb-3" style={{ color:"var(--danger)" }}>{error}</div>}
      <Button type="submit" variant="primary" className="w-full">Log in</Button>
      <p className="text-xs text-center mt-4" style={{ color:"var(--ink-soft)" }}>No account? <button type="button" onClick={onSwitch} className="font-semibold" style={{ color:"var(--accent)" }}>Register</button></p>
    </form>
  </Modal>;
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
  return <Modal title={step==="details" ? "Create an account" : "Verify your email"} onClose={onClose}>
    {step==="details" ? <form onSubmit={sendVerification}>
      <Field label="Username"><input required autoFocus autoComplete="username" className={inputClass} style={inputStyle} value={username} onChange={e=>setUsername(e.target.value)} /></Field>
      <Field label="Email"><input required type="email" autoComplete="email" className={inputClass} style={inputStyle} value={email} onChange={e=>setEmail(e.target.value)} /></Field>
      <Field label="Password"><input required type="password" autoComplete="new-password" minLength="8" className={inputClass} style={inputStyle} value={password} onChange={e=>setPassword(e.target.value)} /></Field>
      <Field label="Confirm password"><input required type="password" autoComplete="new-password" className={inputClass} style={inputStyle} value={confirm} onChange={e=>setConfirm(e.target.value)} /></Field>
      {error && <div className="text-xs font-semibold mb-3" style={{ color:"var(--danger)" }}>{error}</div>}
      <Button type="submit" variant="primary" className="w-full">Send verification code</Button>
      <p className="text-xs text-center mt-4" style={{ color:"var(--ink-soft)" }}>Already have an account? <button type="button" onClick={onSwitch} className="font-semibold" style={{ color:"var(--accent)" }}>Log in</button></p>
    </form> : <form onSubmit={verify}>
      <p className="text-sm mb-4" style={{ color:"var(--ink-soft)" }}>We sent a six-digit verification code to <strong style={{color:"var(--ink)"}}>{email}</strong>. Enter it to activate your account.</p>
      <Field label="Verification code"><input required autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength="6" className={inputClass} style={inputStyle} value={otp} onChange={e=>setOtp(e.target.value)} /></Field>
      {error && <div className="text-xs font-semibold mb-3" style={{ color:"var(--danger)" }}>{error}</div>}
      <Button type="submit" variant="primary" className="w-full">Verify & create account</Button>
      <button type="button" onClick={()=>{setSentOtp(String(Math.floor(100000+Math.random()*900000)));setOtp("");setError("");}} className="w-full mt-3 text-xs font-semibold" style={{color:"var(--accent)"}}>Resend code</button>
    </form>}
  </Modal>;
}
