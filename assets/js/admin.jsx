/* Jery's role-gated administration surface is isolated from app orchestration. */
const { useState, useRef } = React;
window.AdminPanel = function AdminPanel({ onClose, users, session, role, auditLog, onBan, onUnban, onRoleChange, onExport, onImportFile, announcement, onSetAnnouncement, maintenanceOn, onToggleMaintenance }){
  const [tab, setTab] = useState("moderation");
  const [announceDraft, setAnnounceDraft] = useState(announcement ? announcement.text : "");
  const isSuper = role==="Super Admin";
  const fileRef = useRef(null);
  const tabs = [ { key:"moderation", label:"Moderation" }, { key:"roles", label:"Roles" }, { key:"announcement", label:"Announcement" }, { key:"audit", label:"Audit log" }, { key:"backup", label:"Backup" }, { key:"server", label:"Server" } ];
  return (
    <window.Modal title="Admin panel" onClose={onClose} wide>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: tab===t.key ? "var(--ink)" : "var(--bg-soft)", color: tab===t.key ? "var(--bg)" : "var(--ink-soft)" }}>{t.label}</button>
        ))}
      </div>
      {tab==="moderation" && ( !isSuper ? <window.EmptyState text="Only Super Admins can manage bans." /> : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {Object.keys(users).map(name=>{
            const u = users[name];
            return (
              <div key={name} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background:"var(--bg-soft)" }}>
                <window.Avatar name={name} size={28} src={u.avatar}/>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold flex items-center gap-1.5">{u.displayName||name} {u.banned && <window.BanBadge/>}</div>
                  <div className="text-[11px]" style={{ color:"var(--ink-faint)" }}>{u.role}</div>
                </div>
                {name===session ? <span className="text-[11px]" style={{ color:"var(--ink-faint)" }}>You</span>
                  : (u.banned ? <window.Button size="sm" variant="soft" onClick={()=>onUnban(name)}>Unban</window.Button> : <window.Button size="sm" variant="danger" onClick={()=>onBan(name)}>Ban</window.Button>)}
              </div>
            );
          })}
        </div>
      ))}
      {tab==="roles" && ( !isSuper ? <window.EmptyState text="Only Super Admins can change roles." /> : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {Object.keys(users).map(name=>(
            <div key={name} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background:"var(--bg-soft)" }}>
              <window.Avatar name={name} size={28} src={users[name].avatar}/>
              <div className="flex-1 text-sm font-semibold">{users[name].displayName||name}</div>
              <select value={users[name].role} onChange={e=>onRoleChange(name, e.target.value)} className="text-xs rounded-md px-2 py-1.5 bg-transparent" style={{ border:"1px solid var(--line-strong)" }}>
                {window.ROLE_LIST.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      ))}
      {tab==="announcement" && ( !isSuper ? <window.EmptyState text="Only Super Admins can post announcements." /> : (
        <div className="space-y-3">
          <p className="text-sm" style={{ color:"var(--ink-soft)" }}>Broadcast a dismissible banner to every visitor.</p>
          <textarea rows="3" maxLength="200" className={window.inputClass} style={window.inputStyle} value={announceDraft} onChange={e=>setAnnounceDraft(e.target.value)} placeholder="e.g. FIH Megacollab #2 submissions are now open!" />
          <div className="flex gap-2">
            <window.Button variant="primary" onClick={()=>onSetAnnouncement(announceDraft)}>Post announcement</window.Button>
            <window.Button variant="outline" onClick={()=>{ setAnnounceDraft(""); onSetAnnouncement(""); }}>Clear</window.Button>
          </div>
        </div>
      ))}
      {tab==="audit" && ( auditLog.length===0 ? <window.EmptyState text="No mod actions yet." /> : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {auditLog.map(a=>(
            <div key={a.id} className="text-sm rounded-lg px-3 py-2 flex items-center justify-between gap-2" style={{ background:"var(--bg-soft)" }}>
              <span>{a.text}</span>
              <span className="text-[11px] shrink-0" style={{ color:"var(--ink-faint)" }}>{window.timeAgo(a.ts)}</span>
            </div>
          ))}
        </div>
      ))}
      {tab==="backup" && ( !isSuper ? <window.EmptyState text="Only Super Admins can manage backups." /> : (
        <div className="space-y-3">
          <p className="text-sm" style={{ color:"var(--ink-soft)" }}>Export a full backup of users, levels, submissions, collabs and requests, or restore one.</p>
          <div className="flex gap-2 flex-wrap">
            <window.Button variant="primary" onClick={onExport}>Export JSON</window.Button>
            <window.Button variant="outline" onClick={()=>fileRef.current && fileRef.current.click()}>Import JSON</window.Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
          </div>
        </div>
      ))}
      {tab==="server" && ( !isSuper ? <window.EmptyState text="Only Super Admins can control the server." /> : (
        <div className="space-y-3">
          <p className="text-sm" style={{ color:"var(--ink-soft)" }}>Pausing the server exports a full backup and shows a maintenance screen to everyone except Super Admins.</p>
          <window.Button variant={maintenanceOn?"danger":"primary"} onClick={onToggleMaintenance}>{maintenanceOn ? "Resume server" : "Pause server"}</window.Button>
          {maintenanceOn && <div className="text-xs font-semibold" style={{ color:"var(--danger)" }}>Server is currently paused for standard users.</div>}
        </div>
      ))}
    </window.Modal>
  );
}

/* ---------------------------------- sidebar / topbar / bottombar ---------------------------------- */
function ProfileCard({ session, user, collapsed, points, onOpenSelf, avatarSrc, frameId, displayName }){
  if(!session){
    return collapsed ? null : (
      <div className="mx-3 mb-4 rounded-xl p-3 text-xs" style={{ background:"var(--sidebar-active)", color:"var(--sidebar-ink-soft)" }}>Sign in to track your progress and points.</div>
    );
  }
  const pct = Math.min(100, Math.round(((points||0) % 500)/500*100));
  return (
    <button onClick={onOpenSelf} className={"flex items-center gap-2.5 mx-3 mb-4 rounded-xl p-2.5 text-left w-[calc(100%-1.5rem)] "+(collapsed?"justify-center":"")} style={{ background:"var(--sidebar-active)" }}>
      <window.AvatarFramed name={session} size={collapsed?32:38} src={avatarSrc} frameId={frameId} />
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate" style={{ color:"var(--sidebar-ink)" }}>{displayName}</div>
          <div className="text-[11px] truncate mb-1" style={{ color:"var(--sidebar-ink-soft)" }}>{user.title}</div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.08)" }}><div className="h-full prog-fill" style={{ width:pct+"%", background:"var(--accent)" }} /></div>
          <div className="text-[10px] mt-1" style={{ color:"var(--sidebar-ink-soft)" }}>{(points||0).toLocaleString()} pts</div>
        </div>
      )}
    </button>
  );
}
const NAV_ITEMS = [
  { key:"home", labelKey:"home", icon:(props)=><window.IconHome {...props}/> },
  { key:"discord", labelKey:"discord", icon:(props)=><window.IconDiscord {...props}/> },
  { key:"submit", labelKey:"submit", icon:(props)=><window.IconUpload {...props}/> },
  { key:"creators", labelKey:"creators", icon:(props)=><window.IconAward {...props}/> },
  { key:"collab", labelKey:"collab", icon:(props)=><window.IconUsers {...props}/> },
  { key:"helper", labelKey:"helper", icon:(props)=><window.IconHelper {...props}/> },
  { key:"fish", labelKey:"fish", icon:(props)=><window.IconFish {...props}/> },
  { key:"other", labelKey:"other", icon:(props)=><window.IconLayers {...props}/> },
  { key:"events", labelKey:"events", icon:(props)=><window.IconCalendar {...props}/> },
  { key:"decorated", labelKey:"decorated", icon:(props)=><window.IconPalette {...props}/> },
];
