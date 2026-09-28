const { useState, useEffect, useMemo, useRef } = React;

/* ---------------------------------- storage / utils ---------------------------------- */
function loadLS(key, fallback){
  try{ const raw = localStorage.getItem(key); if(!raw) return fallback; return JSON.parse(raw); }
  catch(e){ return fallback; }
}
function saveLS(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){ /* storage unavailable */ }
}
function timeAgo(ts){
  const diff = Math.max(0, Date.now()-ts);
  const m = Math.floor(diff/60000);
  if(m<1) return "just now";
  if(m<60) return m+"m ago";
  const h = Math.floor(m/60);
  if(h<24) return h+"h ago";
  const d = Math.floor(h/24);
  return d+"d ago";
}
function sanitizeText(str){
  if(typeof str !== "string") return "";
  return str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function useCountUp(target, duration=650){
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);
  useEffect(()=>{
    const start = prevRef.current;
    if(start===target) return;
    const startTime = performance.now();
    let raf;
    function tick(now){
      const p = Math.min(1, (now-startTime)/duration);
      const eased = 1-Math.pow(1-p,3);
      setValue(Math.round(start + (target-start)*eased));
      if(p<1){ raf = requestAnimationFrame(tick); }
      else { prevRef.current = target; setValue(target); }
    }
    raf = requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

/* ---------------------------------- i18n (nav + headers only) ---------------------------------- */
const I18N = {
  en: { home:"Home", discord:"Join Discord", submit:"Submit Level", creators:"Creator List", collab:"Collab Host", helper:"Find Helper", fish:"Fish List", other:"Other List", decorated:"Decorated Share", events:"Events", hidePanel:"Hide panel", showPanel:"Show panel", search:"Search players, levels, lists, collabs..." },
  vi: { home:"Trang chủ", discord:"Vào Discord", submit:"Nộp Level", creators:"DS Creator", collab:"Ghép Collab", helper:"Tìm Helper", fish:"Fish List", other:"List Khác", decorated:"Chia Sẻ Decor", events:"Sự Kiện", hidePanel:"Ẩn menu", showPanel:"Hiện menu", search:"Tìm người chơi, level, list, colab..." },
};

/* ---------------------------------- seed data ---------------------------------- */
const DIFF_ORDER = ["Easy Demon","Medium Demon","Hard Demon","Insane Demon","Extreme Demon"];
const DIFF_POINTS = { "Easy Demon":50, "Medium Demon":100, "Hard Demon":150, "Insane Demon":250, "Extreme Demon":400, "Challenge":80, "Platformer":80 };
const DIFF_COLOR = {
  "Easy Demon": { fg:"#1f9d6f", bg:"var(--success-soft)" },
  "Medium Demon": { fg:"#2f6fd6", bg:"#e8f0fd" },
  "Hard Demon": { fg:"#c9821c", bg:"var(--warn-soft)" },
  "Insane Demon": { fg:"#d13a52", bg:"var(--danger-soft)" },
  "Extreme Demon": { fg:"#7a3cff", bg:"var(--extreme-soft)" },
  "Challenge": { fg:"#2f6fd6", bg:"#e8f0fd" },
  "Platformer": { fg:"#1f9d6f", bg:"var(--success-soft)" },
  "Near Top 1 (Pointercrate)": { fg:"#7a3cff", bg:"var(--extreme-soft)" },
  "High Extreme Demon": { fg:"#d13a52", bg:"var(--danger-soft)" },
  "Medium Extreme Demon": { fg:"#c9821c", bg:"var(--warn-soft)" },
  "High Tier Extreme Demon": { fg:"#7a3cff", bg:"var(--extreme-soft)" },
  "High Medium Demon": { fg:"#2f6fd6", bg:"#e8f0fd" },
  "Low Extreme Demon": { fg:"#c9821c", bg:"var(--warn-soft)" },
  "Hard Demon (PC)": { fg:"#c9821c", bg:"var(--warn-soft)" },
  "Low Easy Demon": { fg:"#1f9d6f", bg:"var(--success-soft)" },
  "Main Level": { fg:"#1f9d6f", bg:"var(--success-soft)" },
};
const ROLE_OPTIONS_HELP = ["Playtester","Verifier","Decorator","Layout Builder","Other"];
const EVENT_CATEGORIES = ["Fun","Reward","Admin"];
const ROLE_LIST = ["Player","List Editor","Verification Mod","Super Admin"];
const COLLAB_COMPLETE_REWARD = 50;
const COLLAB_SHARE_THRESHOLD = 100;
const FRAME_CATALOG = [
  { id:"none", label:"No frame", threshold:0 },
  { id:"rose", label:"Rose frame", threshold:300 },
  { id:"neon", label:"Neon ring", threshold:800 },
  { id:"gold", label:"Gold ring", threshold:1500 },
];
const BANNER_CATALOG = [
  { id:"none", label:"Default", threshold:0 },
  { id:"blossom", label:"Blossom night", threshold:300 },
  { id:"waterlily", label:"Water lily", threshold:800 },
  { id:"autumn", label:"Autumn glow", threshold:1500 },
];
const SITE_BG_CATALOG = [
  { id:"default", label:"Default glow", threshold:0 },
  { id:"aurora", label:"Aurora", threshold:0 },
  { id:"blossom", label:"Blossom night", threshold:300 },
  { id:"waterlily", label:"Water lily", threshold:800 },
  { id:"autumn", label:"Autumn glow", threshold:1500 },
];

/* Real Fish List data — from SERVER_LEVEL_DATA / SERVER_OFFICIAL_WIKI. Point values are our own
   inferred game-balance numbers (the source docs specify Discord-role rewards, not numeric points);
   verification dates were not recorded in the source data so are left unset rather than invented. */
const FISH_LEVELS_REAL = [
  { id:"FL1", rank:1, name:"Death Space", creator:"Jery", verifier:"JEF", levelId:147242375, difficulty:"Near Top 1 (Pointercrate)", points:500, reward:"Role: @SPACE EMPIRE [VER 0.1]", special:true, date:null, verified:true, videoUrl:"https://youtube.com/shorts/fFfzHnPCnqI" },
  { id:"FL2", rank:2, name:"Defeated Fish", creator:"Jery", verifier:"Supper Fish", levelId:146685653, difficulty:"High Extreme Demon", points:460, reward:"Role: @DEAD FISH", special:true, date:null, verified:true, videoUrl:"https://youtube.com/shorts/OsJZEpfvJvc" },
  { id:"FL3", rank:3, name:"Red Fish", creator:"Supperfish & Jef", verifier:"Supperfish", levelId:146419394, difficulty:"Extreme Demon", points:420, reward:"Role: @FLYING FISH", special:true, date:null, verified:true, videoUrl:"https://youtube.com/shorts/QnnMgZG1HBw" },
  { id:"FL4", rank:4, name:"Cornfield Chase", creator:"Jery", verifier:"JEF", levelId:148393443, difficulty:"Medium Extreme Demon", points:380, reward:"\"they not bring us here to change the past\"", special:false, date:null, verified:true, videoUrl:"https://youtu.be/A2FXWvf-fvE" },
  { id:"FL5", rank:5, name:"Rofish", creator:"Jef", verifier:"Fish", levelId:147089282, difficulty:"High Tier Extreme Demon", points:350, reward:"\"Robo trai cay\"", special:false, date:null, verified:true, videoUrl:"https://youtube.com/shorts/NDcBP-6Zz0Q" },
  { id:"FL6", rank:6, name:"Raganwave", creator:"Fish", verifier:"Jery", levelId:147651904, difficulty:"Extreme Demon", points:320, reward:"\"pro wave\"", special:false, date:null, verified:true, videoUrl:"https://youtube.com/shorts/CbusWWjAEjs" },
  { id:"FL7", rank:7, name:"Wave So Hard", creator:"Supperfish & Jef", verifier:"Fish", levelId:146764711, difficulty:"Extreme Demon", points:300, reward:"\"singing it LOL\"", special:false, date:null, verified:true, videoUrl:"https://youtube.com/shorts/V2RO5E0K5e0" },
  { id:"FL8", rank:8, name:"Bad Memory", creator:"Big Brain", verifier:"Supperfish", levelId:146836512, difficulty:"Extreme Demon", points:280, reward:"\"+16 gb\"", special:false, date:null, verified:true, videoUrl:"https://youtube.com/shorts/ohF4W8-K2Wo" },
  { id:"FL9", rank:9, name:"Red Challenge", creator:"SussyBucac", verifier:"SussyBucac", levelId:146827852, difficulty:"High Medium Demon", points:220, reward:"", special:false, date:null, verified:true, videoUrl:"https://youtube.com/shorts/smk5Msz9OuI" },
  { id:"FL10", rank:10, name:"Robot Challenge", creator:"SussyBucac", verifier:"SussyBucac", levelId:130080679, difficulty:"Low Extreme Demon", points:200, reward:"\"beat ke me no\"", special:false, date:null, verified:true, videoUrl:"https://youtube.com/shorts/e67SEcUCIQY" },
  { id:"FL11", rank:11, name:"Nerfed Unknow", creator:"SkibidiKing", verifier:"Fish", levelId:147045377, difficulty:"Hard Demon (PC)", points:160, reward:"", special:false, date:null, verified:true, videoUrl:"https://youtube.com/shorts/7fqpHM8OxDM" },
  { id:"FL12", rank:12, name:"Ship Challenge", creator:"luopki", verifier:"luopki", levelId:143601336, difficulty:"Low Easy Demon", points:120, reward:"\"haha x4\"", special:false, date:null, verified:true, videoUrl:"https://youtube.com/shorts/Sq_EUa04Zm8" },
  { id:"FL13", rank:13, name:"Little Challenge", creator:"SussyBucac", verifier:"SussyBucac", levelId:140384773, difficulty:"Low Easy Demon", points:100, reward:"\"beat ke me no x2\"", special:false, date:null, verified:true, videoUrl:"https://youtube.com/shorts/CbusWWjAEjs?si=u6jNJdXfl-N8dJUH" },
  { id:"FL14", rank:14, name:"Stereo Madness", creator:"RobTop", verifier:"Official GD level", levelId:"Main level", difficulty:"Main Level", points:80, reward:"Role: @THE BEGINNING", special:true, date:null, verified:true, videoUrl:"" },
];
const SEED_LEVELS = FISH_LEVELS_REAL.map(l=>({ ...l }));
const SEED_FISH = FISH_LEVELS_REAL.map(l=>({ ...l }));
const OTHER_SUBLISTS_SEED = [
  { id:"OS1", title:"Challenge Levels", description:"Short, high-difficulty single-attempt style challenges submitted by the community.", gradient:["#2f6fd6","#7a3cff"], levels:[] },
  { id:"OS2", title:"Platformer Levels", description:"Exploration-focused platformers outside the main Fish List.", gradient:["#1f9d6f","#2f6fd6"], levels:[] },
];
const SEED_COLLABS = [];
const SEED_HELP = [];
const SEED_ACTIVITY = [];
const ROLE_HIERARCHY = [
  { name:"BIG FISH", desc:"Server Owner — absolute authority over all server configuration and policy." },
  { name:"FIRE", desc:"High-level executive role with broad administrative privileges." },
  { name:"SHARK", desc:"List Moderators (@SHARK) — maintain, verify and update the official level list." },
  { name:"DOLPHIN", desc:"Chat Moderators (@dophin) — keep chat in order and enforce rules." },
  { name:"Content Creator", desc:"Reserved for verified media content creators." },
  { name:"@SPACE EMPIRE [VER 0.1]", desc:"Highest achievement role — awarded for verifying Death Space." },
  { name:"@DEAD FISH", desc:"Awarded for verifying Defeated Fish." },
  { name:"@FLYING FISH", desc:"Awarded for verifying Red Fish." },
  { name:"@THE BEGINNING", desc:"Awarded for completing Stereo Madness." },
  { name:"Mini fish / Fish Friend / Little Fish", desc:"General engagement tiers from new member to active member." },
];

function makeUser(over){
  return {
    password:"fih2026", title:"Member", role:"Player", banned:false, banReason:"",
    discordTag:"", avatar:null, avatarChanges:0, bio:"", createdAt: Date.now()-30*86400000,
    displayName:"", pointsAdjustment:0, collabPoints:0, equippedFrame:"none", equippedBanner:"none", equippedSiteBg:"default",
    gdUsername:"", stars:0, moons:0, demonsBeaten:0, hardestDemon:"", creatorPointsStat:0,
    earlyMember:false, email:"", emailVerified:true, lastStatUpdate:null,
    ...over,
  };
}
const DEFAULT_USERS = {
  "Jery": makeUser({ password:"jery2026", title:"SEF Team — Founder", role:"Super Admin", discordTag:"Jery#0001", bio:"Founder & list admin of FIH Community.", displayName:"Jery", gdUsername:"Frefb (list)", stars:136, moons:0, demonsBeaten:8, hardestDemon:"Unknown 73%", creatorPointsStat:0, lastStatUpdate:Date.now(), createdAt:Date.now()-300*86400000 }),
  "Star": makeUser({ password:"star2026", title:"List Moderator", role:"Verification Mod", discordTag:"Star#0002", displayName:"Star", gdUsername:"Star2K", stars:3842, moons:274, demonsBeaten:58, hardestDemon:"Denouement", creatorPointsStat:0, lastStatUpdate:Date.now(), createdAt:Date.now()-260*86400000 }),
  "Falcon7": makeUser({ displayName:"Falcon7", gdUsername:"Faithon9", stars:281, moons:178, demonsBeaten:18, hardestDemon:"-Sirius- 0%-60%", earlyMember:true, lastStatUpdate:Date.now() }),
  "luopki": makeUser({ displayName:"luopki", gdUsername:"Luopki", stars:360, moons:17, demonsBeaten:24, hardestDemon:"55-100% Brutal", earlyMember:true, lastStatUpdate:Date.now() }),
  "LuxStarlight": makeUser({ displayName:"LuxStarlight", gdUsername:"LuxStarlightGD", stars:967, moons:100, demonsBeaten:20, hardestDemon:"Game Time", earlyMember:true, lastStatUpdate:Date.now() }),
  "KentoKazutowa": makeUser({ displayName:"Kento Kazutowa", gdUsername:"KentoKazutowa", stars:0, moons:0, demonsBeaten:0, hardestDemon:"41% Future Funk", earlyMember:true, lastStatUpdate:Date.now() }),
  "SupperFish": makeUser({ displayName:"Supper Fish", gdUsername:"[private]", stars:1379, moons:500, demonsBeaten:64, hardestDemon:"Swing", creatorPointsStat:1, earlyMember:true, lastStatUpdate:Date.now() }),
  "russianman": makeUser({ displayName:"russianman", gdUsername:"[private]", stars:723, moons:0, demonsBeaten:8, hardestDemon:"Stereo Extremeness", earlyMember:true, lastStatUpdate:Date.now() }),
  "halo": makeUser({ displayName:"halo", gdUsername:"Jkhalogd", stars:80, moons:0, demonsBeaten:2, hardestDemon:"Sakupen Egg", earlyMember:true, lastStatUpdate:Date.now() }),
  "FEMBOY": makeUser({ displayName:"FEMBOY", gdUsername:"SUSSYBUCAC", stars:659, moons:99, demonsBeaten:54, hardestDemon:"Blood Bath - Sonic Wave", earlyMember:true, lastStatUpdate:Date.now() }),
  "BH8BWILD": makeUser({ displayName:"BH8B WILD", gdUsername:"BH8B", stars:1849, moons:98, demonsBeaten:69, hardestDemon:"27% and 58%-100% Kuzureta", earlyMember:true, lastStatUpdate:Date.now() }),
};

const AVATAR_PALETTE = ["#4634ff","#1f9d6f","#c9821c","#d13a52","#2f6fd6","#7a3cff"];
function avatarColorFor(name){
  let hash = 0;
  for(let i=0;i<name.length;i++){ hash = name.charCodeAt(i) + ((hash<<5)-hash); }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
function discordTagFor(name){
  let h=0; for(let i=0;i<name.length;i++){ h = name.charCodeAt(i) + ((h<<5)-h); }
  const num = (Math.abs(h) % 9000)+1000;
  return name+"#"+num;
}

/* ---------------------------------- icons ---------------------------------- */
const IconBase = ({ children, size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const IconHome = (p) => <IconBase {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></IconBase>;
const IconDiscord = (p) => <IconBase {...p}><rect x="4" y="6" width="16" height="11" rx="4"/><path d="M8 20l2-3h4l2 3"/><circle cx="9" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="11.5" r="1" fill="currentColor" stroke="none"/></IconBase>;
const IconUpload = (p) => <IconBase {...p}><path d="M12 16V6"/><path d="M7.5 10.5 12 6l4.5 4.5"/><path d="M5 18h14"/></IconBase>;
const IconAward = (p) => <IconBase {...p}><circle cx="12" cy="9" r="5"/><path d="M9 13.5 8 21l4-2 4 2-1-7.5"/></IconBase>;
const IconUsers = (p) => <IconBase {...p}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9" r="2.4"/><path d="M15.5 14.2c2.4.4 4.5 2.5 4.5 5.8"/></IconBase>;
const IconHelper = (p) => <IconBase {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.4"/><path d="m6.5 6.5 2.6 2.6M17.5 6.5l-2.6 2.6M6.5 17.5l2.6-2.6M17.5 17.5l-2.6-2.6"/></IconBase>;
const IconFish = (p) => <IconBase {...p}><path d="M3 12c3-4 8-6 12-3.5"/><path d="M15 8.5C19 8.5 21 12 21 12s-2 3.5-6 3.5c-4 0-9-2.5-12-3.5 1.4-1 3-1.7 4.6-2.2"/><circle cx="16.3" cy="10.6" r=".6" fill="currentColor" stroke="none"/><path d="M21 12 23 9M21 12l2 3"/></IconBase>;
const IconLayers = (p) => <IconBase {...p}><path d="m12 4 8 4.5-8 4.5-8-4.5Z"/><path d="m4 13 8 4.5 8-4.5"/></IconBase>;
const IconPalette = (p) => <IconBase {...p}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.9.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Z"/><circle cx="7.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="7.5" r="1" fill="currentColor" stroke="none"/></IconBase>;
const IconCalendar = (p) => <IconBase {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></IconBase>;
const IconTrophy = (p) => <IconBase {...p}><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5a3 3 0 0 0 3 5M16 5h3a3 3 0 0 1-3 5"/><path d="M12 12v3M9 19h6M10 19v-3.5M14 19v-3.5"/></IconBase>;
const IconSearch = (p) => <IconBase {...p}><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/></IconBase>;
const IconX = (p) => <IconBase {...p}><path d="M6 6l12 12M18 6 6 18"/></IconBase>;
const IconPanel = (p) => <IconBase {...p}><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9.5 4v16"/></IconBase>;
const IconChevronDown = (p) => <IconBase {...p}><path d="m6 9 6 6 6-6"/></IconBase>;
const IconPlay = ({ size=18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5Z"/></svg>);
const IconPlus = (p) => <IconBase {...p}><path d="M12 5v14M5 12h14"/></IconBase>;
const IconCheck = (p) => <IconBase {...p}><path d="m5 13 4 4 10-11"/></IconBase>;
const IconSun = (p) => <IconBase {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></IconBase>;
const IconMoon = (p) => <IconBase {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></IconBase>;
const IconHeart = ({ size=16, filled }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.3s-7.4-4.5-9.7-9C.9 7.9 2.3 4.5 5.7 3.8c2.4-.5 4.4.8 6.3 3.1 1.9-2.3 3.9-3.6 6.3-3.1 3.4.7 4.8 4.1 3.4 7.5-2.3 4.5-9.7 9-9.7 9Z"/>
  </svg>
);
const IconMegaphone = (p) => <IconBase {...p}><path d="M3 10v4a1 1 0 0 0 1 1h2l1 4h2l-1-4h1l9 4V5l-9 4H4a1 1 0 0 0-1 1Z"/></IconBase>;

const DIAMOND = ({ size=32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g transform="rotate(45 50 50)">
      <rect x="18" y="18" width="64" height="64" rx="6" fill="var(--ink)"/>
      <rect x="34" y="34" width="32" height="32" rx="4" fill="var(--bg)"/>
      <rect x="45" y="45" width="10" height="10" rx="2" fill="var(--ink)"/>
    </g>
  </svg>
);
function FloatingIcons(){
  const icons = useMemo(()=>Array.from({ length:6 }, (_,i)=>({
    id:i, size:16+Math.random()*20, left:6+Math.random()*84, top:4+Math.random()*88,
    dur:(20+Math.random()*16).toFixed(1), delay:(Math.random()*6).toFixed(1), op:(0.05+Math.random()*0.05).toFixed(2),
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {icons.map(ic=>(
        <div key={ic.id} className="float-icon" style={{ left:ic.left+"%", top:ic.top+"%", width:ic.size, height:ic.size, opacity:ic.op, animationDuration:ic.dur+"s", animationDelay:ic.delay+"s" }}>
          <svg width={ic.size} height={ic.size} viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="6" transform="rotate(45 50 50)"/>
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- small ui ---------------------------------- */
function DifficultyBadge({ difficulty }){
  const c = DIFF_COLOR[difficulty] || { fg:"var(--ink-soft)", bg:"var(--bg-soft)" };
  return <span className="text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap" style={{ color:c.fg, background:c.bg }}>{difficulty}</span>;
}
function StatusBadge({ status }){
  const map = {
    Pending: { fg:"var(--warn)", bg:"var(--warn-soft)" },
    Accepted: { fg:"var(--success)", bg:"var(--success-soft)" },
    Approved: { fg:"var(--success)", bg:"var(--success-soft)" },
    Rejected: { fg:"var(--danger)", bg:"var(--danger-soft)" },
  };
  const c = map[status] || map.Pending;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color:c.fg, background:c.bg }}>{status}</span>;
}
function BanBadge(){ return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background:"var(--danger)", color:"#fff" }}>BANNED</span>; }
const ROLE_META = {
  "Super Admin": { label:"Admin", fg:"#fff", bg:"var(--ink)" },
  "Verification Mod": { label:"Verifier", fg:"var(--accent)", bg:"var(--accent-soft)" },
  "List Editor": { label:"Editor", fg:"#2f6fd6", bg:"#e8f0fd" },
};
function RoleBadge({ role }){ const m = ROLE_META[role]; if(!m) return null; return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background:m.bg, color:m.fg }}>{m.label}</span>; }
function CreatorBadge(){ return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background:"var(--success-soft)", color:"var(--success)" }}>Creator</span>; }
function EarlyMemberBadge(){ return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background:"var(--warn-soft)", color:"var(--warn)" }}>Early Member</span>; }
function VerifiedBadge({ verified }){
  return verified ? (
    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10" style={{ background:"var(--success)", color:"#fff" }}>
      <IconCheck size={10}/> Verified by mod
    </span>
  ) : (
    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full z-10" style={{ background:"var(--bg-card)", color:"var(--ink-faint)", border:"1px solid var(--line-strong)" }}>
      Not verified
    </span>
  );
}
function VerifiedTag({ verified }){
  return verified ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background:"var(--success)", color:"#fff" }}><IconCheck size={10}/> Verified by mod</span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center" style={{ background:"var(--bg-soft)", color:"var(--ink-faint)", border:"1px solid var(--line-strong)" }}>Not verified</span>
  );
}
function Avatar({ name, size=36, src }){
  const [broken, setBroken] = useState(false);
  if(src && !broken){
    return <img src={src} alt={name} onError={()=>setBroken(true)} className="rounded-full object-cover shrink-0" style={{ width:size, height:size }} />;
  }
  const color = avatarColorFor(name || "?");
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="rounded-full flex items-center justify-center font-display font-semibold shrink-0" style={{ width:size, height:size, background:color, color:"#fff", fontSize:size*0.42 }}>{initial}</div>
  );
}
function AvatarFramed({ name, size=56, src, frameId }){
  if(!frameId || frameId==="none") return <Avatar name={name} size={size} src={src} />;
  return (
    <div className={"frame-"+frameId}>
      <Avatar name={name} size={size} src={src} />
    </div>
  );
}
function Button({ children, variant="primary", onClick, type="button", disabled, className="", size="md" }){
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed lift-hover relative overflow-hidden";
  const sizes = { md:"px-4 py-2 text-sm", sm:"px-3 py-1.5 text-xs" };
  const variants = {
    primary: { background:"var(--accent)", color:"#fff" },
    outline: { background:"transparent", color:"var(--ink)", border:"1px solid var(--line-strong)" },
    ghost: { background:"transparent", color:"var(--ink-soft)" },
    soft: { background:"var(--accent-soft)", color:"var(--accent)" },
    danger: { background:"transparent", color:"var(--danger)", border:"1px solid var(--danger)" },
  };
  function handleClick(e){
    if(!disabled){
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const span = document.createElement("span");
      span.className = "ripple-el";
      span.style.width = span.style.height = size+"px";
      span.style.left = (e.clientX-rect.left-size/2)+"px";
      span.style.top = (e.clientY-rect.top-size/2)+"px";
      span.style.background = variant==="primary" ? "rgba(255,255,255,0.45)" : "rgba(70,52,255,0.16)";
      btn.appendChild(span);
      setTimeout(()=>{ if(span.parentNode) span.parentNode.removeChild(span); }, 620);
    }
    if(onClick) onClick(e);
  }
  return (
    <button type={type} disabled={disabled} onClick={handleClick} className={base+" "+sizes[size]+" "+className+" hover:opacity-90"+(variant==="primary"?" btn-glow-primary":"")} style={variants[variant]}>
      {children}
    </button>
  );
}
function Field({ label, children }){
  return (
    <label className="block mb-4">
      <span className="block text-xs font-semibold mb-1.5" style={{ color:"var(--ink-soft)" }}>{label}</span>
      {children}
    </label>
  );
}
const inputClass = "w-full rounded-lg px-3 py-2 text-sm bg-transparent";
const inputStyle = { border:"1px solid var(--line-strong)", color:"var(--ink)" };

function Modal({ title, onClose, children, wide, z, hideClose }){
  return (
    <div className={"fixed inset-0 "+(z||"z-50")+" flex items-start sm:items-center justify-center p-4 overflow-y-auto backdrop-blur-sm"} style={{ background:"rgba(10,10,14,0.5)" }} onClick={hideClose ? undefined : onClose}>
      <div onClick={(e)=>e.stopPropagation()} className={"w-full "+(wide?"max-w-xl":"max-w-sm")+" rounded-2xl my-8 modal-pop backdrop-blur-xl"} style={{ background:"var(--glass-bg-strong)", border:"1px solid var(--line)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:"1px solid var(--line)" }}>
          <h2 className="font-display font-semibold text-lg">{title}</h2>
          {!hideClose && <button onClick={onClose} aria-label="Close" style={{ color:"var(--ink-soft)" }}><IconX size={20}/></button>}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function EmptyState({ text }){
  return <div className="text-sm rounded-xl px-4 py-8 text-center" style={{ color:"var(--ink-faint)", border:"1px dashed var(--line-strong)" }}>{text}</div>;
}

function Badge({ children, tone="neutral" }){
  const tones = {
    neutral:{ background:"var(--bg-soft)", color:"var(--ink-soft)" },
    success:{ background:"var(--success-soft)", color:"var(--success)" },
    warning:{ background:"var(--warn-soft)", color:"var(--warn)" },
    danger:{ background:"var(--danger-soft)", color:"var(--danger)" },
  };
  return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={tones[tone]||tones.neutral}>{children}</span>;
}

// Shared UI contract for independently bundled auth/admin surfaces. Keep these assignments
// after each definition so modules can safely resolve the values at render time.
window.IconHome = IconHome;
window.IconDiscord = IconDiscord;
window.IconUpload = IconUpload;
window.IconAward = IconAward;
window.IconUsers = IconUsers;
window.IconHelper = IconHelper;
window.IconFish = IconFish;
window.IconLayers = IconLayers;
window.IconCalendar = IconCalendar;
window.IconPalette = IconPalette;
window.Modal = Modal;
window.EmptyState = EmptyState;
window.Avatar = Avatar;
window.AvatarFramed = AvatarFramed;
window.Button = Button;
window.Badge = Badge;
window.Field = Field;
window.BanBadge = BanBadge;
window.ROLE_LIST = ROLE_LIST;
window.ROLE_META = ROLE_META;
window.inputClass = inputClass;
window.inputStyle = inputStyle;
window.timeAgo = timeAgo;
function PromptModal({ title, label, defaultValue, onSubmit, onClose, placeholder, multiline, z }){
  const [value, setValue] = useState(defaultValue || "");
  function submit(e){ e.preventDefault(); onSubmit(value); onClose(); }
  return (
    <Modal title={title} onClose={onClose} z={z}>
      <form onSubmit={submit}>
        <Field label={label}>
          {multiline ? (
            <textarea rows="3" className={inputClass} style={inputStyle} value={value} onChange={e=>setValue(e.target.value)} placeholder={placeholder} autoFocus />
          ) : (
            <input className={inputClass} style={inputStyle} value={value} onChange={e=>setValue(e.target.value)} placeholder={placeholder} autoFocus />
          )}
        </Field>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">Confirm</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
function ConfirmModal({ title, message, danger, onConfirm, onClose, z }){
  return (
    <Modal title={title||"Are you sure?"} onClose={onClose} z={z}>
      <p className="text-sm mb-5" style={{ color:"var(--ink-soft)" }}>{message}</p>
      <div className="flex gap-2">
        <Button variant={danger?"danger":"primary"} onClick={()=>{ onConfirm(); onClose(); }}>Confirm</Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}
function RulesPanel({ title, rules }){
  return (
    <div className="rounded-xl p-4 lift-hover" style={{ background:"var(--bg-card)", border:"1px solid var(--line)" }}>
      <h3 className="font-display font-semibold text-sm mb-2">{title}</h3>
      <ul className="text-xs space-y-1.5" style={{ color:"var(--ink-soft)" }}>
        {rules.map((r,i)=><li key={i}>{i+1}. {r}</li>)}
      </ul>
    </div>
  );
}
function StatBars({ stats }){
  const max = Math.max(1, ...stats.map(s=>s.value));
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setMounted(true), 60); return ()=>clearTimeout(t); }, []);
  return (
    <div className="space-y-2.5">
      {stats.map(s=>(
        <div key={s.label}>
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1" style={{ color:"var(--ink-soft)" }}>
            <span>{s.label}</span><span>{s.value.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:"var(--bg-soft)" }}>
            <div className="h-full rounded-full prog-fill" style={{ width:(mounted ? Math.min(100,(s.value/max)*100) : 0)+"%", background:s.color||"var(--accent)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function ConfettiBurst(){
  const particles = useMemo(()=> Array.from({ length:26 }, (_,i)=>({
    id:i, left: 34+Math.random()*32, bg: AVATAR_PALETTE[i%AVATAR_PALETTE.length],
    delay: (Math.random()*0.18).toFixed(2), dur: (0.9+Math.random()*0.7).toFixed(2),
    rot: Math.round(Math.random()*360), dx: Math.round(Math.random()*180-90),
  })), []);
  return (
    <div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">
      {particles.map(p=>(
        <span key={p.id} className="confetti-piece" style={{ left:p.left+"%", top:"38%", background:p.bg, animationDelay:p.delay+"s", animationDuration:p.dur+"s", "--dx":p.dx+"px", "--rot":p.rot+"deg" }} />
      ))}
    </div>
  );
}
function ToastStack({ toasts, dismiss }){
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-xs w-full">
      {toasts.map(t=>(
        <div key={t.id} className="toast-in rounded-lg px-4 py-3 text-sm font-medium shadow-lg flex items-center gap-2" style={{ background:"var(--ink)", color:"var(--bg)" }}>
          <IconCheck size={16}/>
          <span className="flex-1">{t.text}</span>
          <button onClick={()=>dismiss(t.id)} style={{ opacity:0.6 }}><IconX size={14}/></button>
        </div>
      ))}
    </div>
  );
}
function ThemeToggle({ theme, setTheme }){
  return (
    <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 lift-hover"
      style={{ border:"1px solid var(--line-strong)", color:"var(--ink-soft)" }} aria-label="Toggle theme">
      {theme==="dark" ? <IconSun size={16}/> : <IconMoon size={16}/>}
    </button>
  );
}
function LazyVideo(){
  const [playing, setPlaying] = useState(false);
  if(playing){
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5" style={{ background:"var(--ink)", color:"var(--bg)" }}>
        <div className="w-2 h-2 rounded-full pulse-dot" style={{ background:"var(--accent)" }} />
        <span className="text-[11px] font-medium" style={{ color:"rgba(255,255,255,0.7)" }}>Now playing (demo footage)</span>
      </div>
    );
  }
  return (
    <button onClick={()=>setPlaying(true)} className="w-11 h-11 rounded-full flex items-center justify-center lift-hover" style={{ background:"var(--bg-card)", color:"var(--ink)", border:"1px solid var(--line-strong)" }} aria-label="Play video">
      <IconPlay size={16}/>
    </button>
  );
}
function ListControls({ sortBy, setSortBy, diffFilter, setDiffFilter, difficulties }){
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="text-xs font-semibold rounded-lg px-2.5 py-2 bg-transparent" style={{ border:"1px solid var(--line-strong)", color:"var(--ink-soft)" }}>
        <option value="rank">Sort: Rank</option>
        <option value="points">Sort: Points (highest)</option>
        <option value="date">Sort: Date verified (newest)</option>
      </select>
      <select value={diffFilter} onChange={e=>setDiffFilter(e.target.value)} className="text-xs font-semibold rounded-lg px-2.5 py-2 bg-transparent" style={{ border:"1px solid var(--line-strong)", color:"var(--ink-soft)" }}>
        <option value="All">All difficulties</option>
        {difficulties.map(d=><option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  );
}
function CommentSection({ targetType, targetId, ctx }){
  const { comments, session, isMod, onAddComment, onDeleteComment, likes, onToggleLike, avatarSrc, onOpenProfile, nameFor } = ctx;
  const [text, setText] = useState("");
  const list = comments.filter(c=>c.targetType===targetType && c.targetId===targetId).sort((a,b)=>a.ts-b.ts);
  function submit(e){
    e.preventDefault();
    if(!session || !text.trim()) return;
    onAddComment({ id:"CM"+Date.now()+Math.random(), targetType, targetId, author:session, text:text.trim().slice(0,500), ts:Date.now() });
    setText("");
  }
  return (
    <div className="mt-5 pt-5" style={{ borderTop:"1px solid var(--line)" }}>
      <div className="text-xs font-semibold mb-3" style={{ color:"var(--ink-soft)" }}>Comments ({list.length})</div>
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {list.length===0 ? <div className="text-xs" style={{ color:"var(--ink-faint)" }}>No comments yet. Be the first to say something.</div> : list.map(c=>{
          const likeKey = "comment:"+c.id;
          const likedByMe = session && (likes[likeKey]||[]).includes(session);
          const likeCount = (likes[likeKey]||[]).length;
          const canDelete = session && (session===c.author || isMod);
          return (
            <div key={c.id} className="flex gap-2.5">
              <button onClick={()=>onOpenProfile(c.author)}><Avatar name={c.author} size={26} src={avatarSrc(c.author)} /></button>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <button onClick={()=>onOpenProfile(c.author)} className="hover:underline">{nameFor(c.author)}</button>
                  <span className="font-normal" style={{ color:"var(--ink-faint)" }}>{timeAgo(c.ts)}</span>
                </div>
                <div className="text-sm" style={{ color:"var(--ink)" }}>{c.text}</div>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={()=>session && onToggleLike(likeKey)} className="text-[11px] font-semibold flex items-center gap-1" style={{ color: likedByMe ? "var(--danger)" : "var(--ink-faint)" }}>
                    <IconHeart filled={likedByMe} size={12}/> {likeCount>0 ? likeCount : ""}
                  </button>
                  {canDelete && <button onClick={()=>onDeleteComment(c.id)} className="text-[11px] font-semibold" style={{ color:"var(--danger)" }}>Delete</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {session ? (
        <form onSubmit={submit} className="flex gap-2">
          <input className={inputClass} style={inputStyle} placeholder="Add a comment..." value={text} onChange={e=>setText(e.target.value)} maxLength={500} />
          <Button size="sm" variant="primary" type="submit">Post</Button>
        </form>
      ) : <div className="text-xs" style={{ color:"var(--ink-faint)" }}>Sign in to comment.</div>}
    </div>
  );
}

/* ---------------------------------- level card / list ---------------------------------- */
function LevelCard({ level, ctx, scope, sublistId, index=0 }){
  const canEdit = ctx && ctx.canEditLists;
  const likeKey = "level:"+level.id;
  const likedByMe = ctx.session && (ctx.likes[likeKey]||[]).includes(ctx.session);
  const likeCount = (ctx.likes[likeKey]||[]).length;
  return (
    <div className="rounded-xl overflow-hidden flex flex-col lift-hover stagger-item" style={{ background:"var(--bg-card)", border:"1px solid var(--line)", animationDelay:(index*0.05)+"s" }}>
      <div className="aspect-video flex items-center justify-center relative" style={{ background:"var(--bg-soft)" }}>
        {level.special && <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full z-10" style={{ background:"var(--ink)", color:"var(--bg)" }}>Special</span>}
        <VerifiedBadge verified={level.verified} />
        {level.videoUrl ? (
          <a href={level.videoUrl} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full flex items-center justify-center lift-hover" style={{ background:"var(--bg-card)", color:"var(--ink)", border:"1px solid var(--line-strong)" }} aria-label="Watch verification video">
            <IconPlay size={16}/>
          </a>
        ) : <LazyVideo />}
      </div>
      <div className="p-3.5 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold" style={{ color:"var(--ink-faint)" }}>#{level.rank}</div>
            <div className="font-display font-semibold leading-tight">{level.name}</div>
          </div>
          <DifficultyBadge difficulty={level.difficulty} />
        </div>
        <div className="text-xs" style={{ color:"var(--ink-soft)" }}>by {level.creator} &middot; verified by {level.verifier}</div>
        {level.reward && <div className="text-[11px] font-semibold" style={{ color:"var(--accent)" }}>Reward: {level.reward}</div>}
        <div className="flex items-center justify-between mt-auto pt-2 text-xs" style={{ borderTop:"1px solid var(--line)", color:"var(--ink-faint)" }}>
          <span className="font-mono">ID {level.levelId}</span>
          <div className="flex items-center gap-2.5">
            <button onClick={()=>ctx.session && ctx.onToggleLike(likeKey)} className="flex items-center gap-1" style={{ color: likedByMe ? "var(--danger)" : "var(--ink-faint)" }} aria-label="Like level">
              <IconHeart filled={likedByMe} size={13}/> {likeCount>0 ? likeCount : ""}
            </button>
            {level.verified ? <span className="font-semibold" style={{ color:"var(--accent)" }}>{level.points} pts</span> : <span style={{ color:"var(--ink-faint)" }}>No points yet</span>}
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <button onClick={()=>ctx.onOpenLevel(level.id, scope, sublistId)} className="text-[11px] font-semibold" style={{ color:"var(--ink-soft)" }}>View &amp; comment</button>
          {canEdit && (
            <button onClick={()=>ctx.onToggleVerified(scope, level.id, sublistId)} className="text-[11px] font-semibold" style={{ color:"var(--accent)" }}>
              {level.verified ? "Mark unverified" : "Mark verified"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
function LevelGrid({ levels, query, ctx, scope, sublistId, sortBy="rank", diffFilter="All" }){
  const filtered = useMemo(()=>{
    let list = levels;
    if(query){ const q = query.toLowerCase(); list = list.filter(l => l.name.toLowerCase().includes(q) || l.creator.toLowerCase().includes(q) || l.verifier.toLowerCase().includes(q)); }
    if(diffFilter && diffFilter!=="All") list = list.filter(l=>l.difficulty===diffFilter);
    list = [...list];
    if(sortBy==="points") list.sort((a,b)=> b.points-a.points);
    else if(sortBy==="date") list.sort((a,b)=> (b.date?new Date(b.date).getTime():0) - (a.date?new Date(a.date).getTime():0));
    else list.sort((a,b)=> a.rank-b.rank);
    return list;
  }, [levels, query, diffFilter, sortBy]);
  if(filtered.length===0) return <EmptyState text="No levels match your search."/>;
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))" }}>
      {filtered.map((l,i) => <LevelCard key={l.id} level={l} ctx={ctx} scope={scope} sublistId={sublistId} index={i} />)}
    </div>
  );
}
function LevelDetailModal({ level, scope, sublistId, ctx, onClose }){
  const likeKey = "level:"+level.id;
  const likedByMe = ctx.session && (ctx.likes[likeKey]||[]).includes(ctx.session);
  const likeCount = (ctx.likes[likeKey]||[]).length;
  const originCollab = level.fromCollabId ? ctx.collabs.find(c=>c.id===level.fromCollabId) : null;
  const canRename = ctx.isSuperAdmin || (originCollab && originCollab.host===ctx.session);
  const [action, setAction] = useState(null);
  return (
    <Modal title={level.name} onClose={onClose} wide>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <DifficultyBadge difficulty={level.difficulty}/>
        <VerifiedTag verified={level.verified} />
        {level.special && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:"var(--ink)", color:"var(--bg)" }}>Special</span>}
      </div>
      <div className="text-sm space-y-1 mb-4" style={{ color:"var(--ink-soft)" }}>
        <div>Creator: <span style={{ color:"var(--ink)" }}>{level.creator}</span></div>
        <div>Verifier: <span style={{ color:"var(--ink)" }}>{level.verifier}</span></div>
        <div>Level ID: <span className="font-mono" style={{ color:"var(--ink)" }}>{level.levelId}</span></div>
        <div>Ranking: <span style={{ color:"var(--ink)" }}>Top {level.rank} in {scope==="fish"?"Fish List":scope==="other"?"Other List":"the list"}</span></div>
        <div>Points: <span style={{ color:"var(--ink)" }}>{level.verified ? level.points : "Awarded once verified"}</span></div>
        {level.reward && <div>Reward: <span style={{ color:"var(--ink)" }}>{level.reward}</span></div>}
        {level.videoUrl && <div><a href={level.videoUrl} target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color:"var(--accent)" }}>Watch verification video</a></div>}
      </div>
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <button onClick={()=>ctx.session && ctx.onToggleLike(likeKey)} className="text-xs font-semibold flex items-center gap-1.5" style={{ color: likedByMe ? "var(--danger)" : "var(--ink-soft)" }}>
          <IconHeart filled={likedByMe} size={14}/> {likeCount} {likeCount===1?"like":"likes"}
        </button>
        {ctx.canEditLists && (
          <button onClick={()=>ctx.onToggleVerified(scope, level.id, sublistId)} className="text-xs font-semibold" style={{ color:"var(--accent)" }}>
            {level.verified ? "Mark as not verified" : "Mark as verified by mod"}
          </button>
        )}
        {canRename && (
          <button onClick={()=>setAction({ type:"rename" })} className="text-xs font-semibold" style={{ color:"var(--ink-soft)" }}>Rename level</button>
        )}
        {ctx.isSuperAdmin && (
          <button onClick={()=>setAction({ type:"delete" })} className="text-xs font-semibold" style={{ color:"var(--danger)" }}>Delete level</button>
        )}
      </div>
      <CommentSection targetType="level" targetId={level.id} ctx={ctx} />
      {action && action.type==="rename" && (
        <PromptModal z="z-[55]" title="Rename level" label="New level name" defaultValue={level.name}
          onSubmit={(v)=>{ if(v.trim()) ctx.onRenameLevel(scope, level.id, sublistId, v.trim()); }} onClose={()=>setAction(null)} />
      )}
      {action && action.type==="delete" && (
        <ConfirmModal z="z-[55]" title="Delete level" message="Delete this level entirely? This cannot be undone." danger
          onConfirm={()=>{ ctx.onDeleteLevel(scope, level.id, sublistId); onClose(); }} onClose={()=>setAction(null)} />
      )}
    </Modal>
  );
}

/* ---------------------------------- pages ---------------------------------- */
function HomePage({ levels, query, ctx }){
  const [sortBy, setSortBy] = useState("rank");
  const [diffFilter, setDiffFilter] = useState("All");
  const specials = levels.filter(l=>l.special);
  return (
    <div className="grid xl:grid-cols-[1fr_280px] gap-8">
      <div className="space-y-10">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl">Recent verification &mdash; all lists</h1>
          <p className="text-sm mt-1 mb-4" style={{ color:"var(--ink-soft)" }}>The official FIH Fish List, kept in sync with the server's verification channel.</p>
          <ListControls sortBy={sortBy} setSortBy={setSortBy} diffFilter={diffFilter} setDiffFilter={setDiffFilter} difficulties={Array.from(new Set(levels.map(l=>l.difficulty)))} />
          <LevelGrid levels={levels} query={query} ctx={ctx} scope="home" sortBy={sortBy} diffFilter={diffFilter} />
        </div>
        {!query && specials.length>0 && (
          <div>
            <h2 className="font-display font-semibold text-xl">Main server special</h2>
            <p className="text-sm mt-1 mb-4" style={{ color:"var(--ink-soft)" }}>Flagship levels and milestone achievements on the FIH server.</p>
            <LevelGrid levels={specials} query="" ctx={ctx} scope="home" />
          </div>
        )}
        <div className="rounded-xl flex items-center justify-center text-xs font-semibold py-10" style={{ border:"1px dashed var(--line-strong)", color:"var(--ink-faint)" }}>Ad space</div>
      </div>
      <div>
        <h3 className="font-display font-semibold text-sm mb-3">Live activity</h3>
        <div className="space-y-2">
          {ctx.activityFeed.length===0 ? <div className="text-xs" style={{ color:"var(--ink-faint)" }}>No activity yet — actions on the site will show up here.</div> : ctx.activityFeed.slice(0,8).map(a=>(
            <div key={a.id} className="text-xs rounded-lg px-3 py-2" style={{ background:"var(--bg-soft)", color:"var(--ink-soft)" }}>
              <div>{a.text}</div>
              <div className="mt-1" style={{ color:"var(--ink-faint)" }}>{timeAgo(a.ts)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function DiscordPage(){
  const [tab, setTab] = useState("community");
  const rules = [
    "Unedited video: continuous recording from run start to the end screen — no cuts, splices, or speed edits.",
    "Audible clicks: live microphone audio of physical clicks/taps is required — faked click tracks are banned.",
    "High-tier runs need raw footage (30fps+, Drive/Mega) with an on-screen FPS counter.",
    "Only Geode and Mega Hack are approved QoL mods — Noclip, Auto-play, Speedhack, or a Hitbox viewer means an immediate ban.",
    "Runs must use the official server level or an approved LDM copy that doesn't change gameplay or difficulty.",
    "Fake or rejected runs are just excluded from the list, never punished or leaked — staff who leak private submissions face immediate demotion.",
  ];
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex gap-1.5">
        <button onClick={()=>setTab("community")} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: tab==="community"?"var(--ink)":"var(--bg-soft)", color: tab==="community"?"var(--bg)":"var(--ink-soft)" }}>Community</button>
        <button onClick={()=>setTab("wiki")} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: tab==="wiki"?"var(--ink)":"var(--bg-soft)", color: tab==="wiki"?"var(--bg)":"var(--ink-soft)" }}>Wiki Server</button>
      </div>
      {tab==="community" ? (
        <div className="space-y-8">
          <div className="rounded-2xl p-6 sm:p-8" style={{ background:"var(--ink)", color:"var(--bg)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:"rgba(255,255,255,0.12)" }}><IconDiscord size={22}/></div>
              <div>
                <div className="font-display font-semibold text-lg">FIH Community</div>
                <div className="text-xs" style={{ color:"rgba(255,255,255,0.6)" }}>Geometry Dash creator &amp; collab hub</div>
              </div>
            </div>
            <div className="text-sm mb-5" style={{ color:"rgba(255,255,255,0.75)" }}>
              Official YouTube: <a href="https://www.youtube.com/@Verybigfishintheworld" target="_blank" rel="noopener noreferrer" className="underline font-semibold">@Verybigfishintheworld</a>
            </div>
            <a href="https://discord.gg/j6esvgubn" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="!bg-white !text-black">Join the Discord</Button>
            </a>
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg mb-3">Verification rules</h2>
            <ol className="space-y-2.5">
              {rules.map((r,i)=>(
                <li key={i} className="flex gap-3 text-sm">
                  <span className="font-display font-semibold shrink-0" style={{ color:"var(--ink-faint)" }}>{String(i+1).padStart(2,"0")}</span>
                  <span style={{ color:"var(--ink-soft)" }}>{r}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="font-display font-semibold text-lg mb-3">Role hierarchy</h2>
            <div className="space-y-2">
              {ROLE_HIERARCHY.map(r=>(
                <div key={r.name} className="rounded-lg px-3 py-2.5" style={{ background:"var(--bg-soft)" }}>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs mt-0.5" style={{ color:"var(--ink-soft)" }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg mb-3">FIH AGENT bot systems (reference)</h2>
            <p className="text-xs mb-3" style={{ color:"var(--ink-faint)" }}>These run on FIH's separate Discord bot (coded by Jery), not on this website — shown here as reference documentation.</p>
            <div className="space-y-3 text-sm" style={{ color:"var(--ink-soft)" }}>
              <div className="rounded-lg px-3 py-2.5" style={{ background:"var(--bg-soft)" }}>
                <div className="font-semibold mb-1" style={{ color:"var(--ink)" }}>TeMoney economy</div>
                New members start with 1,000 TeMoney. Trade 5 assets (MOON, DOGE2, SRVX, MEME, GOLD) via /market; dividend assets pay out every 24h; Black Cat Loans via /borrow at 5%/day interest.
              </div>
              <div className="rounded-lg px-3 py-2.5" style={{ background:"var(--bg-soft)" }}>
                <div className="font-semibold mb-1" style={{ color:"var(--ink)" }}>Jail &amp; rehabilitation</div>
                15 warnings (/warn) triggers automatic jail. Release via typing challenges, puzzles/trivia, a GD level beat (!gdlevel), or paying off any outstanding loan.
              </div>
              <div className="rounded-lg px-3 py-2.5" style={{ background:"var(--bg-soft)" }}>
                <div className="font-semibold mb-1" style={{ color:"var(--ink)" }}>Zombie Apocalypse engine</div>
                8 maps, 8 explorable facilities, survival stats (hunger/thirst/stamina/bone injury), zombie raid combat, scouting, trading and PvP. Join via /zjoin.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function ChecklistModal({ submission, onClose, onToggleChecklist, onDecide, onToggleFlag }){
  const items = [
    { key:"footage", label:"Raw footage attached" },
    { key:"mic", label:"Microphone clicks audible" },
    { key:"fps", label:"FPS counter visible" },
    { key:"client", label:"Approved client/mod used" },
  ];
  return (
    <Modal title={"Inspect: "+submission.name} onClose={onClose} wide>
      <div className="text-sm mb-4 space-y-1" style={{ color:"var(--ink-soft)" }}>
        <div>Player: <span style={{ color:"var(--ink)" }}>{submission.playerName}</span></div>
        <div>Percentage: <span style={{ color:"var(--ink)" }}>{submission.percentage}%</span></div>
        <div className="pt-1">Difficulty: <DifficultyBadge difficulty={submission.difficulty} /></div>
        <div className="flex gap-3 pt-1">
          <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color:"var(--accent)" }}>Watch video</a>
          {submission.rawFootageUrl && <a href={submission.rawFootageUrl} target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color:"var(--accent)" }}>Raw footage</a>}
        </div>
      </div>
      <div className="text-xs font-semibold mb-2" style={{ color:"var(--ink-soft)" }}>Anti-cheat checklist</div>
      <div className="space-y-2 mb-5">
        {items.map(it=>(
          <label key={it.key} className="flex items-center gap-2.5 text-sm rounded-lg px-3 py-2" style={{ background:"var(--bg-soft)" }}>
            <input type="checkbox" checked={!!submission.checklist[it.key]} onChange={()=>onToggleChecklist(submission.id, it.key)} />
            {it.label}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={()=>{ onDecide(submission.id, "Approved"); onClose(); }}>Approve</Button>
        <Button variant="danger" onClick={()=>{ onDecide(submission.id, "Rejected"); onClose(); }}>Reject</Button>
        <Button variant={submission.flagged ? "soft" : "outline"} onClick={()=>onToggleFlag(submission.id)}>{submission.flagged ? "Clear flag" : "Flag as suspicious"}</Button>
      </div>
    </Modal>
  );
}
function SubmitPage({ session, submissions, addSubmission, canModerateSubs, onDecideSubmission, onToggleFlag, onToggleChecklist, ctx }){
  const [name,setName]=useState("");
  const [playerName,setPlayerName]=useState(session||"");
  const [percentage,setPercentage]=useState(100);
  const [difficulty,setDifficulty]=useState(DIFF_ORDER[0]);
  const [videoUrl,setVideoUrl]=useState("");
  const [rawFootageUrl,setRawFootageUrl]=useState("");
  const [inspecting,setInspecting]=useState(null);
  const [renamingId,setRenamingId]=useState(null);

  function submit(e){
    e.preventDefault();
    if(!session || !name.trim() || !videoUrl.trim()) return;
    addSubmission({
      id:"S"+Date.now(), name:name.trim(), playerName:(playerName.trim()||session), percentage:Number(percentage)||0,
      difficulty, videoUrl:videoUrl.trim(), rawFootageUrl:rawFootageUrl.trim(), submittedBy:session, status:"Pending", flagged:false,
      checklist:{ footage:false, mic:false, fps:false, client:false },
      date:new Date().toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})
    });
    setName(""); setVideoUrl(""); setRawFootageUrl(""); setPercentage(100);
  }

  const mine = submissions.filter(s=>s.submittedBy===session);
  const inspectingSub = inspecting ? submissions.find(s=>s.id===inspecting) : null;

  return (
    <div className="grid lg:grid-cols-[1fr_1fr_0.85fr] gap-8 items-start">
      <div className="rounded-xl p-5 lift-hover" style={{ background:"var(--bg-card)", border:"1px solid var(--line)" }}>
        <h2 className="font-display font-semibold text-lg mb-1">Submit a level</h2>
        <p className="text-sm mb-5" style={{ color:"var(--ink-soft)" }}>Levels enter the review queue before points are awarded.</p>
        {!session ? <EmptyState text="Sign in to submit a level." /> : (
          <form onSubmit={submit}>
            <Field label="Level name"><input required className={inputClass} style={inputStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="Level name" /></Field>
            <Field label="Player name"><input className={inputClass} style={inputStyle} value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder={session} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Percentage achieved"><input type="number" min="0" max="100" className={inputClass} style={inputStyle} value={percentage} onChange={e=>setPercentage(e.target.value)} /></Field>
              <Field label="Difficulty">
                <select className={inputClass} style={inputStyle} value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
                  {DIFF_ORDER.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Video link (YouTube/Twitch)"><input required className={inputClass} style={inputStyle} value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." /></Field>
            <Field label="Raw footage link (Drive/Mega)"><input className={inputClass} style={inputStyle} value={rawFootageUrl} onChange={e=>setRawFootageUrl(e.target.value)} placeholder="https://drive.google.com/..." /></Field>
            <Button type="submit" variant="primary" className="w-full">Submit for review</Button>
          </form>
        )}
      </div>

      <div>
        <h2 className="font-display font-semibold text-lg mb-1">{session ? "Your submissions" : "Submissions"}</h2>
        <p className="text-sm mb-4" style={{ color:"var(--ink-soft)" }}>{session ? "Track the status of levels you've sent in." : "Sign in to see your submission history."}</p>
        <div className="space-y-3">
          {(!session || mine.length===0) ? <EmptyState text={session ? "No submissions yet." : "Nothing to show."} /> : mine.map(s=>(
            <div key={s.id} className="rounded-xl p-4 lift-hover" style={{ background:"var(--bg-card)", border:"1px solid var(--line)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display font-semibold text-sm">{s.name}</div>
                  <div className="text-xs mt-0.5" style={{ color:"var(--ink-soft)" }}>{s.difficulty} &middot; {s.percentage}% &middot; {s.date}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {s.flagged && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background:"var(--danger)", color:"#fff" }}>FLAGGED</span>}
                  <StatusBadge status={s.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="rounded-xl p-4 mb-6" style={{ background:"var(--bg-card)", border:"1px solid var(--line)" }}>
          <h3 className="font-display font-semibold text-sm mb-2">Channel rules: list and complete</h3>
          <ol className="text-xs space-y-1.5" style={{ color:"var(--ink-soft)" }}>
            <li>1. Unedited video from run start to end screen — no cuts or speed edits.</li>
            <li>2. Live microphone click audio required — faked click tracks are banned.</li>
            <li>3. High-tier runs need raw footage (30fps+) with an on-screen FPS counter.</li>
            <li>4. Only Geode and Mega Hack are approved — Noclip/Auto-play/Speedhack = instant ban.</li>
            <li>5. Official server level or an approved LDM copy only.</li>
            <li>6. Fake runs are simply rejected, never punished or leaked — confidentiality is absolute.</li>
          </ol>
          <a href="https://discord.gg/j6esvgubn" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color:"var(--accent)" }}>
            <IconDiscord size={14}/> Open rules channel on Discord
          </a>
        </div>
        {canModerateSubs && (
          <div>
            <h3 className="font-display font-semibold text-sm mb-2">Review queue (mod view)</h3>
            <div className="space-y-2">
              {submissions.length===0 ? <EmptyState text="Queue is empty." /> : submissions.map(s=>(
                <div key={s.id} className="rounded-lg p-3 flex items-center justify-between gap-2" style={{ background:"var(--bg-soft)" }}>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{s.name}</div>
                    <div className="text-[11px]" style={{ color:"var(--ink-faint)" }}>{s.submittedBy}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {s.flagged && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background:"var(--danger)", color:"#fff" }}>FLAGGED</span>}
                    <StatusBadge status={s.status} />
                    {ctx.isSuperAdmin && <button onClick={()=>setRenamingId(s.id)} className="text-[11px] font-semibold" style={{ color:"var(--ink-soft)" }}>Rename</button>}
                    <Button size="sm" variant="outline" onClick={()=>setInspecting(s.id)}>Inspect</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {inspectingSub && <ChecklistModal submission={inspectingSub} onClose={()=>setInspecting(null)} onToggleChecklist={onToggleChecklist} onDecide={onDecideSubmission} onToggleFlag={onToggleFlag} />}
      {renamingId && (()=>{ const rs = submissions.find(s=>s.id===renamingId); return rs ? (
        <PromptModal title="Rename submission" label="New name" defaultValue={rs.name}
          onSubmit={(v)=>{ if(v.trim()) ctx.onRenameSubmission(rs.id, v.trim()); }} onClose={()=>setRenamingId(null)} />
      ) : null; })()}
    </div>
  );
}
function CreatorsPage({ query, users, ctx }){
  const memberNames = Object.keys(users);
  const filteredMembers = useMemo(()=>{
    if(!query) return memberNames;
    const q = query.toLowerCase();
    return memberNames.filter(n=> n.toLowerCase().includes(q) || (users[n].displayName||"").toLowerCase().includes(q));
  }, [memberNames, query]);

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Creator list</h1>
      <p className="text-sm mb-6" style={{ color:"var(--ink-soft)" }}>Registered FIH players and moderators, ranked by community points.</p>
      {filteredMembers.length===0 ? <EmptyState text="No members match your search." /> : (
        <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))" }}>
          {filteredMembers.map((name,i)=>{
            const u = users[name];
            const points = ctx.computeUserPoints(name);
            return (
              <div key={name} className="rounded-xl p-4 lift-hover stagger-item" style={{ background:"var(--bg-card)", border:"1px solid var(--line)", animationDelay:(i*0.05)+"s" }}>
                <div className="flex items-center gap-3">
                  <button onClick={()=>ctx.onOpenProfile(name)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                    <AvatarFramed name={name} size={40} src={ctx.avatarSrc(name)} frameId={u.equippedFrame} />
                    <div className="min-w-0">
                      <div className="font-display font-semibold flex items-center gap-1.5 truncate">{ctx.nameFor(name)} {u.banned && <BanBadge/>}</div>
                      <div className="flex gap-1 mt-0.5 flex-wrap"><RoleBadge role={u.role} />{u.earlyMember && <EarlyMemberBadge/>}</div>
                    </div>
                  </button>
                  <div className="text-right shrink-0">
                    <div className="font-display font-semibold text-sm" style={{ color:"var(--accent)" }}>{points.toLocaleString()}</div>
                    <div className="text-[10px]" style={{ color:"var(--ink-faint)" }}>points</div>
                  </div>
                </div>
                {u.gdUsername && <div className="text-[11px] mt-2" style={{ color:"var(--ink-faint)" }}>In-game: {u.gdUsername}</div>}
                {ctx.isSuperAdmin && name!==ctx.session && (
                  <div className="mt-3 pt-3" style={{ borderTop:"1px solid var(--line)" }}>
                    {u.banned ? <Button size="sm" variant="soft" onClick={()=>ctx.onBanToggle(name,false)}>Unban</Button> : <Button size="sm" variant="danger" onClick={()=>ctx.onBanToggle(name,true)}>Ban</Button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function CreateCollabModal({ onClose, onCreate }){
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slots, setSlots] = useState(5);
  const [genre, setGenre] = useState(DIFF_ORDER[2]);
  const [deadline, setDeadline] = useState("");
  function submit(e){ e.preventDefault(); if(!name.trim()) return; onCreate({ name:name.trim(), description:description.trim(), slots:Number(slots)||1, genre, deadline:deadline || "TBD" }); }
  return (
    <Modal title="Host a new collab" onClose={onClose} wide>
      <form onSubmit={submit}>
        <Field label="Collab name"><input required className={inputClass} style={inputStyle} value={name} onChange={e=>setName(e.target.value)} /></Field>
        <Field label="Description"><textarea rows="3" className={inputClass} style={inputStyle} value={description} onChange={e=>setDescription(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Total slots"><input type="number" min="1" className={inputClass} style={inputStyle} value={slots} onChange={e=>setSlots(e.target.value)} /></Field>
          <Field label="Difficulty / genre">
            <select className={inputClass} style={inputStyle} value={genre} onChange={e=>setGenre(e.target.value)}>
              {DIFF_ORDER.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Deadline"><input type="date" className={inputClass} style={inputStyle} value={deadline} onChange={e=>setDeadline(e.target.value)} /></Field>
        <Button type="submit" variant="primary" className="w-full">Create collab</Button>
      </form>
    </Modal>
  );
}
function CollabCard({ collab, session, ctx, onRequest, onDecide, onBan, onUnban, index=0 }){
  const isHost = session && session===collab.host;
  const myRequest = collab.requests.find(r=>r.username===session);
  const full = collab.filled >= collab.slots;
  const banned = collab.banned || [];
  const iAmBanned = session && banned.includes(session);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  return (
    <div className="rounded-xl p-4 lift-hover stagger-item" style={{ background:"var(--bg-card)", border:"1px solid var(--line)", animationDelay:(index*0.06)+"s" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display font-semibold">{collab.name}</div>
          <div className="text-xs mt-0.5" style={{ color:"var(--ink-soft)" }}>
            Hosted by <button onClick={()=>ctx.onOpenProfile(collab.host)} className="font-semibold hover:underline" style={{ color:"var(--ink-soft)" }}>{ctx.nameFor(collab.host)}</button> &middot; due {collab.deadline}
          </div>
        </div>
        <DifficultyBadge difficulty={collab.genre} />
      </div>
      <p className="text-sm mt-3" style={{ color:"var(--ink-soft)" }}>{collab.description}</p>
      <div className="flex items-center gap-2 mt-3 text-xs font-semibold" style={{ color:"var(--ink-faint)" }}>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"var(--bg-soft)" }}>
          <div className="h-full prog-fill" style={{ width:(Math.min(100,(collab.filled/collab.slots)*100))+"%", background:"var(--accent)" }} />
        </div>
        <span>{collab.filled}/{collab.slots} slots</span>
      </div>
      <div className="mt-4">
        {isHost ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background:"var(--bg-soft)", color:"var(--ink-soft)" }}>Host owner</span>
        : !session ? <span className="text-xs" style={{ color:"var(--ink-faint)" }}>Sign in to request to join</span>
        : iAmBanned ? <span className="text-xs font-semibold" style={{ color:"var(--danger)" }}>You're banned from this collab</span>
        : myRequest ? <StatusBadge status={myRequest.status} />
        : full ? <span className="text-xs" style={{ color:"var(--ink-faint)" }}>Collab is full</span>
        : <Button size="sm" variant="soft" onClick={()=>onRequest(collab.id)}>Request to join</Button>}
      </div>
      {isHost && collab.requests.length>0 && (
        <div className="mt-4 pt-4 space-y-2" style={{ borderTop:"1px solid var(--line)" }}>
          <div className="text-xs font-semibold" style={{ color:"var(--ink-soft)" }}>Join requests</div>
          {collab.requests.map(r=>(
            <div key={r.username} className="flex items-center justify-between gap-2">
              <button onClick={()=>ctx.onOpenProfile(r.username)} className="flex items-center gap-2 text-sm"><Avatar name={r.username} size={22} src={ctx.avatarSrc(r.username)}/>{ctx.nameFor(r.username)}</button>
              <div className="flex items-center gap-1.5">
                {r.status==="Pending" ? (
                  <>
                    <Button size="sm" variant="soft" onClick={()=>onDecide(collab.id, r.username, "Accepted")}>Accept</Button>
                    <Button size="sm" variant="ghost" onClick={()=>onDecide(collab.id, r.username, "Rejected")}>Reject</Button>
                  </>
                ) : <StatusBadge status={r.status} />}
                <button onClick={()=>onBan(collab.id, r.username)} className="text-[11px] font-semibold" style={{ color:"var(--danger)" }}>Ban</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {isHost && banned.length>0 && (
        <div className="mt-4 pt-4 space-y-2" style={{ borderTop:"1px solid var(--line)" }}>
          <div className="text-xs font-semibold" style={{ color:"var(--ink-soft)" }}>Banned from this collab</div>
          {banned.map(name=>(
            <div key={name} className="flex items-center justify-between gap-2 text-sm">
              <span>{name}</span>
              <button onClick={()=>onUnban(collab.id, name)} className="text-[11px] font-semibold" style={{ color:"var(--accent)" }}>Unban</button>
            </div>
          ))}
        </div>
      )}
      {collab.completed ? (
        <div className="mt-4"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background:"var(--success)", color:"#fff" }}><IconCheck size={10}/> Completed &amp; verified</span></div>
      ) : (ctx.canModerateSubs || ctx.isSuperAdmin) && (
        <div className="mt-4 pt-4" style={{ borderTop:"1px solid var(--line)" }}>
          <Button size="sm" variant="primary" onClick={()=>ctx.onMarkCollabComplete(collab.id)}>Mark collab complete (verified by mod)</Button>
        </div>
      )}
      {ctx.isSuperAdmin && (
        <button onClick={()=>setConfirmingDelete(true)} className="text-[11px] font-semibold mt-3" style={{ color:"var(--danger)" }}>Delete collab</button>
      )}
      <CommentSection targetType="collab" targetId={collab.id} ctx={ctx} />
      {confirmingDelete && (
        <ConfirmModal title="Delete collab" message="Delete this collab entirely? This cannot be undone." danger
          onConfirm={()=>ctx.onDeleteCollab(collab.id)} onClose={()=>setConfirmingDelete(false)} />
      )}
    </div>
  );
}
function CollabPage({ session, collabs, query, ctx, onRequest, onDecide, onCreate, onBan, onUnban }){
  const [showCreate, setShowCreate] = useState(false);
  const filtered = useMemo(()=>{
    if(!query) return collabs;
    const q = query.toLowerCase();
    return collabs.filter(c=>c.name.toLowerCase().includes(q) || c.host.toLowerCase().includes(q));
  }, [collabs, query]);
  const hosted = collabs.filter(c=>c.host===session);
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Collab host</h1>
          <p className="text-sm" style={{ color:"var(--ink-soft)" }}>Find open collabs or host your own.</p>
        </div>
        <Button variant="primary" onClick={()=> session ? setShowCreate(true) : ctx.pushToast("Sign in to host a collab.")}><IconPlus size={16}/> Host a collab</Button>
      </div>
      <div className="mb-6"><RulesPanel title="Collab rules" rules={["Hosts must keep slot counts accurate.","No ghosting accepted members — communicate delays.","Credit every contributor when the collab is completed.","Mods may remove inactive hosts after 30 days of silence."]} /></div>
      {session && hosted.length>0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg mb-3">Your hosted collabs</h2>
          <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))" }}>
            {hosted.map((c,i)=><CollabCard key={c.id} index={i} collab={c} session={session} ctx={ctx} onRequest={onRequest} onDecide={onDecide} onBan={onBan} onUnban={onUnban} />)}
          </div>
        </div>
      )}
      <h2 className="font-display font-semibold text-lg mb-3">Open collabs</h2>
      {filtered.filter(c=>c.host!==session).length===0 ? <EmptyState text={collabs.length===0 ? "No collabs yet — be the first to host one." : "No collabs match your search."} /> : (
        <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.filter(c=>c.host!==session).map((c,i)=><CollabCard key={c.id} index={i} collab={c} session={session} ctx={ctx} onRequest={onRequest} onDecide={onDecide} onBan={onBan} onUnban={onUnban} />)}
        </div>
      )}
      {showCreate && <CreateCollabModal onClose={()=>setShowCreate(false)} onCreate={(data)=>{ onCreate(data); setShowCreate(false); }} />}
    </div>
  );
}
function HelperPage({ session, helpRequests, addHelpRequest, query, ctx }){
  const [showPost,setShowPost]=useState(false);
  const [role,setRole]=useState("Playtester");
  const [levelName,setLevelName]=useState("");
  const [description,setDescription]=useState("");
  const [roleFilter,setRoleFilter]=useState("All");
  const filtered = useMemo(()=>{
    let list = helpRequests;
    if(roleFilter!=="All") list = list.filter(h=>h.role===roleFilter);
    if(query){ const q=query.toLowerCase(); list = list.filter(h=>h.levelName.toLowerCase().includes(q)||h.postedBy.toLowerCase().includes(q)||h.role.toLowerCase().includes(q)); }
    return list;
  }, [helpRequests, query, roleFilter]);
  function submit(e){
    e.preventDefault();
    if(!levelName.trim()) return;
    addHelpRequest({ id:"H"+Date.now(), role, levelName:levelName.trim(), description:description.trim(), postedBy:session });
    setLevelName(""); setDescription(""); setShowPost(false);
  }
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Find helper</h1>
          <p className="text-sm" style={{ color:"var(--ink-soft)" }}>Playtesters, verifiers, decorators and layout builders looking for work.</p>
        </div>
        <Button variant="primary" onClick={()=> session ? setShowPost(true) : ctx.pushToast("Sign in to post a request.")}><IconPlus size={16}/> Post a request</Button>
      </div>
      <div className="mb-5"><RulesPanel title="Find helper rules" rules={["Be specific about what you need and your timeline.","Don't post the same request in multiple roles.","Helpers: only accept work you can realistically finish.","Take payment or reward disputes to Discord mods, not here."]} /></div>
      <div className="flex flex-wrap gap-1.5 mb-6">
        {["All",...ROLE_OPTIONS_HELP].map(r=>(
          <button key={r} onClick={()=>setRoleFilter(r)} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: roleFilter===r ? "var(--ink)" : "var(--bg-soft)", color: roleFilter===r ? "var(--bg)" : "var(--ink-soft)" }}>{r}</button>
        ))}
      </div>
      {filtered.length===0 ? <EmptyState text={helpRequests.length===0 ? "No requests yet — be the first to post one." : "No open requests."} /> : (
        <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))" }}>
          {filtered.map((h,i)=>(
            <div key={h.id} className="rounded-xl p-4 lift-hover stagger-item" style={{ background:"var(--bg-card)", border:"1px solid var(--line)", animationDelay:(i*0.05)+"s" }}>
              <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background:"var(--accent-soft)", color:"var(--accent)" }}>{h.role}</span>
              <div className="font-display font-semibold mt-2">{h.levelName}</div>
              <p className="text-sm mt-1" style={{ color:"var(--ink-soft)" }}>{h.description}</p>
              <button onClick={()=>ctx.onOpenProfile(h.postedBy)} className="flex items-center gap-2 mt-3 text-xs" style={{ color:"var(--ink-faint)" }}><Avatar name={h.postedBy} size={20} src={ctx.avatarSrc(h.postedBy)}/> posted by {ctx.nameFor(h.postedBy)}</button>
            </div>
          ))}
        </div>
      )}
      {showPost && (
        <Modal title="Post a help request" onClose={()=>setShowPost(false)}>
          <form onSubmit={submit}>
            <Field label="Role needed">
              <select className={inputClass} style={inputStyle} value={role} onChange={e=>setRole(e.target.value)}>
                {ROLE_OPTIONS_HELP.map(r=><option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Level name"><input required className={inputClass} style={inputStyle} value={levelName} onChange={e=>setLevelName(e.target.value)} /></Field>
            <Field label="Description"><textarea rows="3" className={inputClass} style={inputStyle} value={description} onChange={e=>setDescription(e.target.value)} /></Field>
            <Button type="submit" variant="primary" className="w-full">Post request</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function ListPage({ title, subtitle, levels, query, ctx, scope }){
  const [sortBy, setSortBy] = useState("rank");
  const [diffFilter, setDiffFilter] = useState("All");
  const difficulties = useMemo(()=>Array.from(new Set(levels.map(l=>l.difficulty))), [levels]);
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">{title}</h1>
      <p className="text-sm mb-4" style={{ color:"var(--ink-soft)" }}>{subtitle}</p>
      <ListControls sortBy={sortBy} setSortBy={setSortBy} diffFilter={diffFilter} setDiffFilter={setDiffFilter} difficulties={difficulties} />
      <LevelGrid levels={levels} query={query} ctx={ctx} scope={scope} sortBy={sortBy} diffFilter={diffFilter} />
    </div>
  );
}
function OtherListPage({ sublists, query, ctx }){
  const [openId, setOpenId] = useState(null);
  const [sortBy, setSortBy] = useState("rank");
  const [diffFilter, setDiffFilter] = useState("All");
  const open = sublists.find(s=>s.id===openId);
  const openDifficulties = open ? Array.from(new Set(open.levels.map(l=>l.difficulty))) : [];
  const filteredSublists = useMemo(()=>{
    if(!query) return sublists;
    const q = query.toLowerCase();
    return sublists.filter(s=> s.title.toLowerCase().includes(q) || s.levels.some(l=>l.name.toLowerCase().includes(q)));
  }, [sublists, query]);
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Other list</h1>
      <p className="text-sm mb-6" style={{ color:"var(--ink-soft)" }}>Secondary rankings, grouped by category. Empty until the community submits real entries.</p>
      <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))" }}>
        {filteredSublists.map((s,i)=>(
          <div key={s.id} className="rounded-xl overflow-hidden lift-hover stagger-item" style={{ background:"var(--bg-card)", border:"1px solid var(--line)", animationDelay:(i*0.06)+"s" }}>
            <div className="h-24" style={{ background:"linear-gradient(135deg,"+s.gradient[0]+","+s.gradient[1]+")" }} />
            <div className="p-4">
              <div className="font-display font-semibold">{s.title}</div>
              <p className="text-xs mt-1 mb-3" style={{ color:"var(--ink-soft)" }}>{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color:"var(--ink-faint)" }}>{s.levels.length} levels</span>
                <Button size="sm" variant="soft" onClick={()=>setOpenId(s.id)}>View list</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <Modal title={open.title} onClose={()=>setOpenId(null)} wide>
          {open.levels.length===0 ? <EmptyState text="No levels here yet." /> : (
            <>
              <ListControls sortBy={sortBy} setSortBy={setSortBy} diffFilter={diffFilter} setDiffFilter={setDiffFilter} difficulties={openDifficulties} />
              <LevelGrid levels={open.levels} query="" ctx={ctx} scope="other" sublistId={open.id} sortBy={sortBy} diffFilter={diffFilter} />
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
function EventsPage({ session, ctx, events, onCreateEvent, onJoinEvent, onSetWinner, onDeleteEvent }){
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Fun");
  const [reward, setReward] = useState("");
  const [rewardPoints, setRewardPoints] = useState(0);

  function submit(e){
    e.preventDefault();
    if(!title.trim()) return;
    onCreateEvent({ title:title.trim(), description:description.trim(), category, reward:reward.trim(), rewardPoints:Number(rewardPoints)||0 });
    setTitle(""); setDescription(""); setReward(""); setRewardPoints(0); setCategory("Fun"); setShowCreate(false);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Events</h1>
          <p className="text-sm" style={{ color:"var(--ink-soft)" }}>Fun, reward and admin events from the FIH server.</p>
        </div>
        <Button variant="primary" onClick={()=> session ? setShowCreate(true) : ctx.pushToast("Sign in to create an event.")}><IconPlus size={16}/> New event</Button>
      </div>
      {events.length===0 ? <EmptyState text="No events yet — be the first to host one." /> : (
        <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))" }}>
          {events.map((ev,i)=>{
            const joined = session && ev.entries.includes(session);
            const canManage = session && (session===ev.host || ctx.isSuperAdmin);
            return (
              <div key={ev.id} className="rounded-xl p-4 lift-hover stagger-item" style={{ background:"var(--bg-card)", border:"1px solid var(--line)", animationDelay:(i*0.06)+"s" }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                      background: ev.category==="Admin" ? "var(--ink)" : ev.category==="Reward" ? "var(--warn-soft)" : "var(--accent-soft)",
                      color: ev.category==="Admin" ? "#fff" : ev.category==="Reward" ? "var(--warn)" : "var(--accent)"
                    }}>{ev.category} Event</span>
                    <div className="font-display font-semibold mt-1.5">{ev.title}</div>
                  </div>
                  {ctx.isSuperAdmin && <button onClick={()=>onDeleteEvent(ev.id)} className="text-[11px] font-semibold" style={{ color:"var(--danger)" }}>Delete</button>}
                </div>
                <p className="text-sm mt-2" style={{ color:"var(--ink-soft)" }}>{ev.description}</p>
                {ev.reward && <div className="text-[11px] font-semibold mt-2" style={{ color:"var(--accent)" }}>Reward: {ev.reward}{ev.rewardPoints>0?" ("+ev.rewardPoints+" pts)":""}</div>}
                <div className="flex items-center justify-between mt-3 text-xs" style={{ color:"var(--ink-faint)" }}>
                  <span>Hosted by {ctx.nameFor(ev.host)}</span>
                  <span>{ev.entries.length} joined</span>
                </div>
                {ev.winner ? (
                  <div className="mt-3 rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-semibold" style={{ background:"var(--success-soft)", color:"var(--success)" }}>
                    <IconTrophy size={16}/> Winner: {ctx.nameFor(ev.winner)}
                  </div>
                ) : (
                  <div className="mt-3">
                    {!session ? <span className="text-xs" style={{ color:"var(--ink-faint)" }}>Sign in to join</span>
                    : joined ? <StatusBadge status="Accepted" />
                    : <Button size="sm" variant="soft" onClick={()=>onJoinEvent(ev.id)}>Join event</Button>}
                  </div>
                )}
                {canManage && !ev.winner && ev.entries.length>0 && (
                  <EventWinnerPicker event={ev} ctx={ctx} onSetWinner={onSetWinner} />
                )}
              </div>
            );
          })}
        </div>
      )}
      {showCreate && (
        <Modal title="Create an event" onClose={()=>setShowCreate(false)} wide>
          <form onSubmit={submit}>
            <Field label="Category">
              <select className={inputClass} style={inputStyle} value={category} onChange={e=>setCategory(e.target.value)}>
                {EVENT_CATEGORIES.filter(c=> c!=="Admin" || ctx.isSuperAdmin).map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Title"><input required className={inputClass} style={inputStyle} value={title} onChange={e=>setTitle(e.target.value)} /></Field>
            <Field label="Description"><textarea rows="3" className={inputClass} style={inputStyle} value={description} onChange={e=>setDescription(e.target.value)} /></Field>
            {category==="Reward" && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Reward description"><input className={inputClass} style={inputStyle} value={reward} onChange={e=>setReward(e.target.value)} placeholder="e.g. custom role" /></Field>
                <Field label="Reward points"><input type="number" min="0" className={inputClass} style={inputStyle} value={rewardPoints} onChange={e=>setRewardPoints(e.target.value)} /></Field>
              </div>
            )}
            <Button type="submit" variant="primary" className="w-full">Create event</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function EventWinnerPicker({ event, ctx, onSetWinner }){
  const [pick, setPick] = useState(event.entries[0]||"");
  return (
    <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop:"1px solid var(--line)" }}>
      <select value={pick} onChange={e=>setPick(e.target.value)} className="text-xs rounded-md px-2 py-1.5 bg-transparent flex-1" style={{ border:"1px solid var(--line-strong)" }}>
        {event.entries.map(name=><option key={name} value={name}>{ctx.nameFor(name)}</option>)}
      </select>
      <Button size="sm" variant="primary" onClick={()=>pick && onSetWinner(event.id, pick)}>Set winner</Button>
    </div>
  );
}
function DecoratedSharePage({ session, ctx, posts, onAddPost }){
  const collabPts = session && ctx.users[session] ? (ctx.users[session].collabPoints||0) : 0;
  const eligible = session && collabPts >= COLLAB_SHARE_THRESHOLD;
  const [title,setTitle]=useState("");
  const [body,setBody]=useState("");
  function submit(e){
    e.preventDefault();
    if(!eligible || !title.trim()) return;
    onAddPost({ id:"DP"+Date.now(), author:session, title:title.trim(), body:body.trim(), ts:Date.now() });
    setTitle(""); setBody("");
  }
  return (
    <div className="grid lg:grid-cols-[1fr_260px] gap-8 items-start">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Decorated style share</h1>
        <p className="text-sm mb-6" style={{ color:"var(--ink-soft)" }}>Creators share decoration and layout techniques with the community.</p>
        {!session ? <EmptyState text="Sign in to view and share techniques." /> : !eligible ? (
          <EmptyState text={"Earn "+COLLAB_SHARE_THRESHOLD+" Collab Points (from completed collabs) to unlock posting and viewing here. You currently have "+collabPts+"."} />
        ) : (
          <div>
            <form onSubmit={submit} className="rounded-xl p-4 mb-6 lift-hover" style={{ background:"var(--bg-card)", border:"1px solid var(--line)" }}>
              <Field label="Title"><input required className={inputClass} style={inputStyle} value={title} onChange={e=>setTitle(e.target.value)} maxLength={100} /></Field>
              <Field label="Technique / write-up"><textarea rows="4" className={inputClass} style={inputStyle} value={body} onChange={e=>setBody(e.target.value)} maxLength={1000} /></Field>
              <Button type="submit" variant="primary">Share technique</Button>
            </form>
            <div className="space-y-3">
              {posts.length===0 ? <EmptyState text="No posts yet — be the first to share." /> : posts.map((p,i)=>(
                <div key={p.id} className="rounded-xl p-4 lift-hover stagger-item" style={{ background:"var(--bg-card)", border:"1px solid var(--line)", animationDelay:(i*0.05)+"s" }}>
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={()=>ctx.onOpenProfile(p.author)} className="flex items-center gap-2 text-xs font-semibold" style={{ color:"var(--ink-soft)" }}>
                      <Avatar name={p.author} size={22} src={ctx.avatarSrc(p.author)}/>{ctx.nameFor(p.author)} <span className="font-normal" style={{ color:"var(--ink-faint)" }}>{timeAgo(p.ts)}</span>
                    </button>
                    {(ctx.isSuperAdmin || p.author===session) && <button onClick={()=>ctx.onDeleteDecoratedPost(p.id)} className="text-[11px] font-semibold" style={{ color:"var(--danger)" }}>Delete</button>}
                  </div>
                  <div className="font-display font-semibold mt-2">{p.title}</div>
                  <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color:"var(--ink-soft)" }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <RulesPanel title="Decorated share rules" rules={["Only share techniques you're willing to have copied.","No begging for collabs or self-promo spam.","Credit any level the screenshots come from.","Be constructive — this isn't a critique thread."]} />
    </div>
  );
}

/* ---------------------------------- auth / stats form ---------------------------------- */
function GdStatsForm({ initial, onSubmit, onClose, mandatory, z }){
  const [displayName, setDisplayName] = useState(initial.displayName||"");
  const [gdUsername, setGdUsername] = useState(initial.gdUsername||"");
  const [stars, setStars] = useState(initial.stars||0);
  const [moons, setMoons] = useState(initial.moons||0);
  const [demonsBeaten, setDemonsBeaten] = useState(initial.demonsBeaten||0);
  const [hardestDemon, setHardestDemon] = useState(initial.hardestDemon||"");
  const [creatorPointsStat, setCreatorPointsStat] = useState(initial.creatorPointsStat||0);
  function submit(e){
    e.preventDefault();
    onSubmit({ displayName, gdUsername, stars, moons, demonsBeaten, hardestDemon, creatorPointsStat });
    onClose();
  }
  return (
    <Modal title="Player info" onClose={mandatory ? ()=>{} : onClose} hideClose={mandatory} wide z={z}>
      <div className="text-xs font-semibold mb-4 rounded-lg px-3 py-2" style={{ background:"var(--warn-soft)", color:"var(--warn)" }}>
        (Note: Neu may khong thanh that thi con ca khong thich may)
      </div>
      <form onSubmit={submit}>
        <Field label="Player name (will show on the web!)"><input required className={inputClass} style={inputStyle} value={displayName} onChange={e=>setDisplayName(e.target.value)} /></Field>
        <Field label="Username in game"><input required className={inputClass} style={inputStyle} value={gdUsername} onChange={e=>setGdUsername(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Star"><input type="number" min="0" className={inputClass} style={inputStyle} value={stars} onChange={e=>setStars(e.target.value)} /></Field>
          <Field label="Moon"><input type="number" min="0" className={inputClass} style={inputStyle} value={moons} onChange={e=>setMoons(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Demon beat"><input type="number" min="0" className={inputClass} style={inputStyle} value={demonsBeaten} onChange={e=>setDemonsBeaten(e.target.value)} /></Field>
          <Field label="Creator point"><input type="number" min="0" className={inputClass} style={inputStyle} value={creatorPointsStat} onChange={e=>setCreatorPointsStat(e.target.value)} /></Field>
        </div>
        <Field label="Hardest"><input className={inputClass} style={inputStyle} value={hardestDemon} onChange={e=>setHardestDemon(e.target.value)} /></Field>
        <p className="text-[11px] mb-4" style={{ color:"var(--danger)" }}>Updating unrealistic/fake stats compared to in-game data will lead to a PERMANENT BAN upon audit. Stats can only be updated once every 7 days.</p>
        <Button type="submit" variant="primary" className="w-full">Save</Button>
      </form>
    </Modal>
  );
}
function ProfileModal({ username, ctx, onClose }){
  const { users, session, computeUserPoints, computeVerifiedCount, computeCompletedCount, computeHostedCount, submissions, activityFeed, onUpdateProfile, avatarSrc, nameFor, isSuperAdmin, onSubmitGdStats } = ctx;
  const u = users[username];
  const isSelf = username===session && !!u;
  const points = u ? computeUserPoints(username) : 0;
  const title = u ? u.title : "Community member";
  const role = u ? u.role : null;
  const banned = u ? u.banned : false;
  const verifiedCount = computeVerifiedCount(username);
  const completedCount = computeCompletedCount(username);
  const hostedCount = computeHostedCount(username);
  const collabPts = u ? (u.collabPoints||0) : 0;
  const history = submissions.filter(s=>s.submittedBy===username);
  const myActivity = activityFeed.filter(a=>a.text.includes(username)).slice(0,5);
  const isCreatorBadge = verifiedCount>0 || completedCount>0;

  const [bioDraft, setBioDraft] = useState(u ? (u.bio||"") : "");
  const [urlDraft, setUrlDraft] = useState("");
  const [action, setAction] = useState(null);
  const [editingStats, setEditingStats] = useState(false);
  const fileRef = useRef(null);
  const changesUsed = u ? (u.avatarChanges||0) : 0;
  const changesLeft = Math.max(0, 3-changesUsed);
  const daysSinceUpdate = u && u.lastStatUpdate ? (Date.now()-u.lastStatUpdate)/86400000 : Infinity;
  const canUpdateStats = daysSinceUpdate>=7;

  function handleFile(e){
    const file = e.target.files && e.target.files[0];
    if(!file || changesLeft<=0) return;
    const reader = new FileReader();
    reader.onload = () => onUpdateProfile(username, { avatar: reader.result, avatarChanges: changesUsed+1 });
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  function handleUrlSave(){
    if(!urlDraft.trim() || changesLeft<=0) return;
    onUpdateProfile(username, { avatar: urlDraft.trim(), avatarChanges: changesUsed+1 });
    setUrlDraft("");
  }
  function saveBio(){ onUpdateProfile(username, { bio: bioDraft.slice(0,250) }); }

  if(!u) return (
    <Modal title="Player profile" onClose={onClose} wide>
      <EmptyState text="This account no longer exists." />
    </Modal>
  );

  const bannerId = u.equippedBanner||"none";
  const headerSubColor = bannerId!=="none" ? "rgba(255,255,255,0.75)" : "var(--ink-soft)";
  const headerFaintColor = bannerId!=="none" ? "rgba(255,255,255,0.55)" : "var(--ink-faint)";

  return (
    <Modal title="Player profile" onClose={onClose} wide>
      <div className={"flex items-start gap-4 mb-5 rounded-xl "+(bannerId!=="none" ? "banner-"+bannerId+" p-4" : "")}>
        <AvatarFramed name={username} size={56} src={avatarSrc(username)} frameId={u.equippedFrame||"none"} />
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-lg flex items-center gap-2 flex-wrap" style={bannerId!=="none"?{color:"#fff"}:{}}>{nameFor(username)} {banned && <BanBadge/>}</div>
          <div className="text-xs" style={{ color:headerSubColor }}>@{username} &middot; {title}{u.discordTag ? " \u00b7 "+u.discordTag : ""}</div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">{role && <RoleBadge role={role} />}{u.earlyMember && <EarlyMemberBadge/>}{isCreatorBadge && <CreatorBadge/>}</div>
          <div className="text-[11px] mt-1.5" style={{ color:headerFaintColor }}>Member since {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}) : "unknown"}{banned && u.banReason ? " · Ban reason: "+u.banReason : ""}</div>
          {(role==="Super Admin" || role==="Verification Mod") && u.gdUsername && <div className="text-[11px] mt-0.5" style={{ color:headerFaintColor }}>List account: {u.gdUsername}</div>}
        </div>
      </div>

      {isSuperAdmin && !isSelf && (
        <div className="rounded-lg p-3 mb-5 flex flex-wrap gap-2" style={{ background:"var(--danger-soft)" }}>
          <Button size="sm" variant="outline" onClick={()=>setAction({ type:"rename" })}>Rename user</Button>
          <Button size="sm" variant="outline" onClick={()=>setAction({ type:"setPoints" })}>Set points</Button>
          <Button size="sm" variant="outline" onClick={()=>setAction({ type:"setCollabPoints" })}>Set collab points</Button>
          {!u.banned ? (
            <Button size="sm" variant="danger" onClick={()=>setAction({ type:"ban" })}>Ban user</Button>
          ) : (
            <Button size="sm" variant="soft" onClick={()=>ctx.onBanToggle(username,false)}>Unban</Button>
          )}
          <Button size="sm" variant="danger" onClick={()=>setAction({ type:"deleteUser" })}>Delete user</Button>
        </div>
      )}

      {isSelf && (
        <div className="mb-4">
          <Field label="Display name">
            <input className={inputClass} style={inputStyle} defaultValue={u.displayName||username} maxLength={40}
              onBlur={(e)=>{ const v=e.target.value.trim(); if(v && v!==(u.displayName||username)) onUpdateProfile(username,{displayName:v}); }} />
          </Field>
        </div>
      )}

      <div className="mb-5">
        {isSelf ? (
          <Field label={"About me ("+bioDraft.length+"/250)"}>
            <textarea rows="3" maxLength="250" className={inputClass} style={inputStyle} value={bioDraft} onChange={e=>setBioDraft(e.target.value.slice(0,250))} />
            <div className="mt-2"><Button size="sm" variant="primary" onClick={saveBio}>Save bio</Button></div>
          </Field>
        ) : (
          <p className="text-sm" style={{ color:"var(--ink-soft)" }}>{u.bio || "No bio yet."}</p>
        )}
      </div>

      <div className="rounded-lg p-3 mb-5" style={{ background:"var(--bg-soft)" }}>
        <div className="text-xs font-semibold mb-2">Geometry Dash stats</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs" style={{ color:"var(--ink-soft)" }}>
          <div>In-game: <span style={{ color:"var(--ink)" }}>{u.gdUsername||"—"}</span></div>
          <div>Stars: <span style={{ color:"var(--ink)" }}>{(u.stars||0).toLocaleString()}</span></div>
          <div>Moons: <span style={{ color:"var(--ink)" }}>{(u.moons||0).toLocaleString()}</span></div>
          <div>Demons beaten: <span style={{ color:"var(--ink)" }}>{u.demonsBeaten||0}</span></div>
          <div>Hardest: <span style={{ color:"var(--ink)" }}>{u.hardestDemon||"—"}</span></div>
          <div>Creator pts: <span style={{ color:"var(--ink)" }}>{u.creatorPointsStat||0}</span></div>
        </div>
        {isSelf && (
          <div className="mt-3 pt-3" style={{ borderTop:"1px solid var(--line)" }}>
            {canUpdateStats ? (
              <Button size="sm" variant="outline" onClick={()=>setEditingStats(true)}>Update stats</Button>
            ) : (
              <div className="text-[11px]" style={{ color:"var(--ink-faint)" }}>You can update your stats again in {Math.max(1,Math.ceil(7-daysSinceUpdate))} day(s).</div>
            )}
          </div>
        )}
      </div>

      {isSelf && (
        <div className="rounded-lg p-3 mb-5" style={{ background:"var(--bg-soft)" }}>
          <div className="text-xs font-semibold mb-2">Cosmetics</div>
          <div className="text-[11px] mb-2" style={{ color:"var(--ink-soft)" }}>Unlock frames and banners by earning points.</div>
          <div className="mb-3">
            <div className="text-[11px] font-semibold mb-1" style={{ color:"var(--ink-faint)" }}>Avatar frame</div>
            <div className="flex flex-wrap gap-1.5">
              {FRAME_CATALOG.map(f=>{
                const unlocked = points>=f.threshold;
                const active = (u.equippedFrame||"none")===f.id;
                return (
                  <button key={f.id} disabled={!unlocked} onClick={()=>onUpdateProfile(username,{equippedFrame:f.id})}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full disabled:opacity-40"
                    style={{ background: active?"var(--accent)":"var(--bg-card)", color: active?"#fff":"var(--ink-soft)", border:"1px solid var(--line-strong)" }}>
                    {f.label}{!unlocked?" ("+f.threshold+" pts)":""}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-3">
            <div className="text-[11px] font-semibold mb-1" style={{ color:"var(--ink-faint)" }}>Profile banner</div>
            <div className="flex flex-wrap gap-1.5">
              {BANNER_CATALOG.map(b=>{
                const unlocked = points>=b.threshold;
                const active = (u.equippedBanner||"none")===b.id;
                return (
                  <button key={b.id} disabled={!unlocked} onClick={()=>onUpdateProfile(username,{equippedBanner:b.id})}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full disabled:opacity-40"
                    style={{ background: active?"var(--accent)":"var(--bg-card)", color: active?"#fff":"var(--ink-soft)", border:"1px solid var(--line-strong)" }}>
                    {b.label}{!unlocked?" ("+b.threshold+" pts)":""}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold mb-1" style={{ color:"var(--ink-faint)" }}>Site background (applies while you're signed in)</div>
            <div className="flex flex-wrap gap-1.5">
              {SITE_BG_CATALOG.map(bg=>{
                const unlocked = points>=bg.threshold;
                const active = (u.equippedSiteBg||"default")===bg.id;
                return (
                  <button key={bg.id} disabled={!unlocked} onClick={()=>onUpdateProfile(username,{equippedSiteBg:bg.id})}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full disabled:opacity-40"
                    style={{ background: active?"var(--accent)":"var(--bg-card)", color: active?"#fff":"var(--ink-soft)", border:"1px solid var(--line-strong)" }}>
                    {bg.label}{!unlocked?" ("+bg.threshold+" pts)":""}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isSelf && (
        <div className="rounded-lg p-3 mb-5" style={{ background:"var(--bg-soft)" }}>
          <div className="text-xs font-semibold mb-2">Profile picture</div>
          {changesLeft<=0 ? (
            <div className="text-xs font-semibold" style={{ color:"var(--danger)" }}>Maximum avatar changes (3/3) reached for this account.</div>
          ) : (
            <div>
              <div className="flex gap-2 flex-wrap mb-2">
                <Button size="sm" variant="outline" onClick={()=>fileRef.current && fileRef.current.click()}>Upload image</Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
              <div className="flex gap-2">
                <input className={inputClass} style={inputStyle} placeholder="or paste an image URL" value={urlDraft} onChange={e=>setUrlDraft(e.target.value)} />
                <Button size="sm" variant="soft" onClick={handleUrlSave}>Set</Button>
              </div>
              <div className="text-[11px] mt-2" style={{ color:"var(--ink-faint)" }}>Avatar changes remaining: {changesLeft}/3</div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[["Points", useCountUp(points)], ["Collab pts", useCountUp(collabPts)], ["Completed", useCountUp(completedCount)], ["Verified", useCountUp(verifiedCount)], ["Hosted", useCountUp(hostedCount)]].map(([label,val])=>(
          <div key={label} className="rounded-lg p-3 text-center lift-hover" style={{ background:"var(--bg-soft)" }}>
            <div className="font-display font-semibold text-lg count-pulse" key={label+"-"+val}>{val.toLocaleString()}</div>
            <div className="text-[11px]" style={{ color:"var(--ink-faint)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="text-xs font-semibold mb-2" style={{ color:"var(--ink-soft)" }}>Stats overview</div>
        <StatBars stats={[
          { label:"Demon points", value:points, color:"var(--accent)" },
          { label:"Collab points", value:collabPts, color:"var(--success)" },
          { label:"Verified levels", value:verifiedCount, color:"#2f6fd6" },
          { label:"Hosted collabs", value:hostedCount, color:"var(--warn)" },
        ]} />
      </div>

      {myActivity.length>0 && (
        <div className="mb-6">
          <div className="text-xs font-semibold mb-2" style={{ color:"var(--ink-soft)" }}>Recent activity</div>
          <div className="space-y-1.5">
            {myActivity.map(a=>(
              <div key={a.id} className="text-xs rounded-lg px-3 py-2 flex items-center justify-between gap-2" style={{ background:"var(--bg-soft)", color:"var(--ink-soft)" }}>
                <span>{a.text}</span><span style={{ color:"var(--ink-faint)" }} className="shrink-0">{timeAgo(a.ts)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs font-semibold mb-2" style={{ color:"var(--ink-soft)" }}>Submission history</div>
        {history.length===0 ? <EmptyState text="No submissions yet." /> : (
          <div className="space-y-2">
            {history.map(s=>(
              <div key={s.id} className="flex items-center justify-between gap-2 text-sm rounded-lg px-3 py-2" style={{ background:"var(--bg-soft)" }}>
                <span>{s.name}</span>
                <div className="flex items-center gap-1.5">
                  {s.flagged && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background:"var(--danger)", color:"#fff" }}>FLAGGED</span>}
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingStats && (
        <GdStatsForm z="z-[55]" initial={u} onSubmit={(vals)=>ctx.onSubmitGdStats(username, vals)} onClose={()=>setEditingStats(false)} />
      )}
      {action && action.type==="rename" && (
        <PromptModal z="z-[55]" title="Rename user" label={"New display name for "+username} defaultValue={u.displayName||username}
          onSubmit={(v)=>{ if(v.trim()) ctx.onAdminRenameUser(username, v.trim()); }} onClose={()=>setAction(null)} />
      )}
      {action && action.type==="setPoints" && (
        <PromptModal z="z-[55]" title="Set points" label={"Total points for "+username} defaultValue={String(points)}
          onSubmit={(v)=>{ if(v!==""&&!isNaN(Number(v))) ctx.onAdminSetPoints(username, Number(v)); }} onClose={()=>setAction(null)} />
      )}
      {action && action.type==="setCollabPoints" && (
        <PromptModal z="z-[55]" title="Set collab points" label={"Collab points for "+username} defaultValue={String(collabPts)}
          onSubmit={(v)=>{ if(v!==""&&!isNaN(Number(v))) ctx.onAdminSetCollabPoints(username, Number(v)); }} onClose={()=>setAction(null)} />
      )}
      {action && action.type==="ban" && (
        <PromptModal z="z-[55]" title="Ban user" label="Ban reason (optional)" placeholder="e.g. repeated harassment" multiline
          onSubmit={(v)=>ctx.onAdminBanWithReason(username, v)} onClose={()=>setAction(null)} />
      )}
      {action && action.type==="deleteUser" && (
        <ConfirmModal z="z-[55]" title="Delete user" message={"Permanently delete "+username+"'s account? This cannot be undone."} danger
          onConfirm={()=>{ ctx.onDeleteUser(username); onClose(); }} onClose={()=>setAction(null)} />
      )}
    </Modal>
  );
}
window.ProfileCard = function ProfileCard({ session, user, collapsed, points, onOpenSelf, avatarSrc, frameId, displayName }){
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

function Sidebar({ page, setPage, collapsed, setCollapsed, session, user, points, onOpenSelf, avatarSrc, frameId, displayName, lang }){
  const t = I18N[lang] || I18N.en;
  return (
    <div className={"shrink-0 flex flex-col py-4 transition-all duration-300 ease-out "+(collapsed?"w-[72px]":"w-[240px]")} style={{ background:"var(--sidebar-bg)" }}>
      <button onClick={()=>setCollapsed(!collapsed)} title={collapsed?t.showPanel:t.hidePanel} className={"flex items-center gap-2 mx-3 mb-5 px-2 py-1.5 rounded-md text-[11px] font-semibold tracking-wide "+(collapsed?"justify-center":"")} style={{ color:"var(--sidebar-ink-soft)" }}>
        <IconPanel size={16}/>{!collapsed && <span>{t.hidePanel}</span>}
      </button>
      {window.ProfileCard ? <window.ProfileCard session={session} user={user} collapsed={collapsed} points={points} onOpenSelf={onOpenSelf} avatarSrc={avatarSrc} frameId={frameId} displayName={displayName} /> : null}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item=>{
          const Icon = item.icon;
          const active = page===item.key;
          return (
            <button key={item.key} onClick={()=>setPage(item.key)} className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors "+(collapsed?"justify-center":"")+(active?" nav-active-glow":"")}
              style={{ background: active ? "var(--sidebar-active)" : "transparent", color: active ? "var(--sidebar-ink)" : "var(--sidebar-ink-soft)" }} title={collapsed ? t[item.labelKey] : undefined}>
              <Icon size={18}/>{!collapsed && <span>{t[item.labelKey]}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
const SEARCH_TYPES = ["Player","Level","List","Collab","Etc"];
function TopBar({ page, query, setQuery, searchType, setSearchType, session, currentUser, onLogout, onOpenLogin, onOpenRegister, theme, setTheme, onOpenProfile, onOpenAdmin, onOpenChangePw, showAdminEntry, avatarSrc, displayName, lang }){
  const [menuOpen, setMenuOpen] = useState(false);
  const t = I18N[lang] || I18N.en;
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-16 shrink-0 backdrop-blur-lg" style={{ background:"var(--glass-bg)", borderBottom:"1px solid var(--line)" }}>
      <div className="flex items-center gap-2 shrink-0">
        <div key={"logo-"+page} className="icon-spin"><DIAMOND size={26}/></div>
        <span className="font-display font-semibold text-base hidden sm:inline">FIH Community</span>
      </div>
      <div className="flex-1 flex items-center gap-1 max-w-xl ml-2">
        <div className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2" style={{ background:"var(--bg-soft)" }}>
          <IconSearch size={16} className="shrink-0" />
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} className="bg-transparent outline-none text-sm w-full" style={{ color:"var(--ink)" }} />
        </div>
        <select value={searchType} onChange={e=>setSearchType(e.target.value)} className="hidden md:block text-xs font-semibold rounded-lg px-2 py-2.5 bg-transparent" style={{ border:"1px solid var(--line-strong)", color:"var(--ink-soft)" }}>
          {SEARCH_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <div className="shrink-0 relative">
        {!session ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onOpenLogin}>Log in</Button>
            <Button variant="primary" size="sm" onClick={onOpenRegister}>Register</Button>
          </div>
        ) : (
          <div>
            <button onClick={()=>setMenuOpen(!menuOpen)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full lift-hover" style={{ border:"1px solid var(--line)" }}>
              <Avatar name={session} size={28} src={avatarSrc} /><span className="text-sm font-semibold hidden sm:inline">{displayName}</span><IconChevronDown size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden z-40 backdrop-blur-xl modal-pop" style={{ background:"var(--glass-bg-strong)", border:"1px solid var(--line)" }} onMouseLeave={()=>setMenuOpen(false)}>
                <div className="px-3.5 py-3" style={{ borderBottom:"1px solid var(--line)" }}>
                  <div className="text-sm font-semibold flex items-center gap-1.5">{displayName} {currentUser.banned && <BanBadge/>}</div>
                  <div className="text-xs" style={{ color:"var(--ink-soft)" }}>{currentUser.title}</div>
                </div>
                <button onClick={()=>{ onOpenProfile(session); setMenuOpen(false); }} className="w-full text-left px-3.5 py-2.5 text-sm font-medium">View profile</button>
                {showAdminEntry && <button onClick={()=>{ onOpenAdmin(); setMenuOpen(false); }} className="w-full text-left px-3.5 py-2.5 text-sm font-medium">Admin panel</button>}
                <button onClick={()=>{ onOpenChangePw(); setMenuOpen(false); }} className="w-full text-left px-3.5 py-2.5 text-sm font-medium">Change password</button>
                <button onClick={()=>{ onLogout(); setMenuOpen(false); }} className="w-full text-left px-3.5 py-2.5 text-sm font-medium" style={{ color:"var(--danger)" }}>Log out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function BottomBar({ lang, setLang, session, bgId, setBgId, unlockedBgIds }){
  return (
    <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2 backdrop-blur-lg" style={{ background:"var(--glass-bg)", borderTop:"1px solid var(--line)" }}>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] mr-1" style={{ color:"var(--ink-faint)" }}>Language:</span>
        <button onClick={()=>setLang("en")} className="text-[11px] font-semibold px-2 py-1 rounded-md" style={{ background: lang==="en"?"var(--ink)":"transparent", color: lang==="en"?"var(--bg)":"var(--ink-soft)" }}>EN</button>
        <button onClick={()=>setLang("vi")} className="text-[11px] font-semibold px-2 py-1 rounded-md" style={{ background: lang==="vi"?"var(--ink)":"transparent", color: lang==="vi"?"var(--bg)":"var(--ink-soft)" }}>VI</button>
      </div>
      {session && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px]" style={{ color:"var(--ink-faint)" }}>Background:</span>
          {SITE_BG_CATALOG.filter(b=>unlockedBgIds.includes(b.id)).map(b=>(
            <button key={b.id} onClick={()=>setBgId(b.id)} className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: bgId===b.id?"var(--accent)":"var(--bg-soft)", color: bgId===b.id?"#fff":"var(--ink-soft)" }}>{b.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- app ---------------------------------- */
function App(){
  const [page, setPage] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("Level");
  const [theme, setThemeState] = useState(()=>loadLS("fih_theme","light"));
  const [lang, setLangState] = useState(()=>loadLS("fih_lang","en"));

  const [users, setUsers] = useState(()=>loadLS("fih_users", DEFAULT_USERS));
  const [session, setSession] = useState(()=>loadLS("fih_session", null));
  const [submissions, setSubmissions] = useState(()=>loadLS("fih_submissions", []));
  const [collabs, setCollabs] = useState(()=>loadLS("fih_collabs", SEED_COLLABS));
  const [helpRequests, setHelpRequests] = useState(()=>loadLS("fih_help", SEED_HELP));
  const [levelsHome, setLevelsHome] = useState(()=>loadLS("fih_levels_home", SEED_LEVELS));
  const [levelsFish, setLevelsFish] = useState(()=>loadLS("fih_levels_fish", SEED_FISH));
  const [otherSublists, setOtherSublists] = useState(()=>loadLS("fih_other_sublists", OTHER_SUBLISTS_SEED));
  const [auditLog, setAuditLog] = useState(()=>loadLS("fih_audit", []));
  const [activityFeed, setActivityFeed] = useState(()=>loadLS("fih_activity", SEED_ACTIVITY));
  const [comments, setComments] = useState(()=>loadLS("fih_comments", []));
  const [likes, setLikes] = useState(()=>loadLS("fih_likes", {}));
  const [announcement, setAnnouncementState] = useState(()=>loadLS("fih_announcement", null));
  const [dismissedTs, setDismissedTs] = useState(()=>loadLS("fih_announcement_seen", 0));
  const [decoratedPosts, setDecoratedPosts] = useState(()=>loadLS("fih_decorated", []));
  const [events, setEvents] = useState(()=>loadLS("fih_events", []));
  const [maintenanceOn, setMaintenanceOn] = useState(()=>loadLS("fih_maintenance", false));

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMandatoryStats, setShowMandatoryStats] = useState(false);
  const [profileTarget, setProfileTarget] = useState(null);
  const [levelDetail, setLevelDetail] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confettiKey, setConfettiKey] = useState(0);

  function pushToast(text){
    const id = "T"+Date.now()+Math.random();
    setToasts(prev=>[...prev, { id, text }]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)), 3200);
  }
  function dismissToast(id){ setToasts(prev=>prev.filter(t=>t.id!==id)); }
  function setTheme(t){ setThemeState(t); }
  function setLang(l){ setLangState(l); }
  function celebrate(){ const k=Date.now(); setConfettiKey(k); setTimeout(()=>setConfettiKey(prev=> prev===k ? 0 : prev), 1500); }

  useEffect(()=>saveLS("fih_users", users), [users]);
  useEffect(()=>saveLS("fih_session", session), [session]);
  useEffect(()=>saveLS("fih_submissions", submissions), [submissions]);
  useEffect(()=>saveLS("fih_collabs", collabs), [collabs]);
  useEffect(()=>saveLS("fih_help", helpRequests), [helpRequests]);
  useEffect(()=>saveLS("fih_levels_home", levelsHome), [levelsHome]);
  useEffect(()=>saveLS("fih_levels_fish", levelsFish), [levelsFish]);
  useEffect(()=>saveLS("fih_other_sublists", otherSublists), [otherSublists]);
  useEffect(()=>saveLS("fih_audit", auditLog), [auditLog]);
  useEffect(()=>saveLS("fih_activity", activityFeed), [activityFeed]);
  useEffect(()=>saveLS("fih_comments", comments), [comments]);
  useEffect(()=>saveLS("fih_likes", likes), [likes]);
  useEffect(()=>saveLS("fih_announcement", announcement), [announcement]);
  useEffect(()=>saveLS("fih_announcement_seen", dismissedTs), [dismissedTs]);
  useEffect(()=>saveLS("fih_decorated", decoratedPosts), [decoratedPosts]);
  useEffect(()=>saveLS("fih_events", events), [events]);
  useEffect(()=>saveLS("fih_maintenance", maintenanceOn), [maintenanceOn]);
  useEffect(()=>{ saveLS("fih_theme", theme); document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(()=>saveLS("fih_lang", lang), [lang]);

  function logAudit(text){ setAuditLog(prev=>[{ id:"A"+Date.now()+Math.random(), ts:Date.now(), text }, ...prev].slice(0,200)); }
  function logActivity(text){ setActivityFeed(prev=>[{ id:"F"+Date.now()+Math.random(), ts:Date.now(), text }, ...prev].slice(0,50)); }

  function handleRegister(username, password, email){
    const newUser = makeUser({ password, email, emailVerified:true, displayName:username, createdAt:Date.now(), lastStatUpdate:null, title:"Newcomer", discordTag:discordTagFor(username) });
    setUsers(prev=>({ ...prev, [username]: newUser }));
    setSession(username);
    setShowRegister(false);
    pushToast("Welcome to FIH, "+username+"!");
    celebrate();
    setShowMandatoryStats(true);
  }
  function handleLogin(username){ setSession(username); setShowLogin(false); }
  function handleLogout(){ setSession(null); }
  function updateProfile(username, patch){
    const clean = { ...patch };
    if(clean.bio!==undefined) clean.bio = sanitizeText(clean.bio).slice(0,250);
    if(clean.displayName!==undefined) clean.displayName = sanitizeText(clean.displayName).slice(0,40);
    setUsers(prev=>({ ...prev, [username]: { ...prev[username], ...clean } }));
    pushToast("Profile updated.");
  }
  function submitGdStats(username, values){
    const clean = {
      displayName: sanitizeText(values.displayName||username).slice(0,40),
      gdUsername: sanitizeText(values.gdUsername).slice(0,40),
      stars: Math.max(0, Number(values.stars)||0),
      moons: Math.max(0, Number(values.moons)||0),
      demonsBeaten: Math.max(0, Number(values.demonsBeaten)||0),
      hardestDemon: sanitizeText(values.hardestDemon).slice(0,60),
      creatorPointsStat: Math.max(0, Number(values.creatorPointsStat)||0),
      lastStatUpdate: Date.now(),
    };
    setUsers(prev=>({ ...prev, [username]: { ...prev[username], ...clean } }));
    pushToast("Stats updated!");
  }

  function addSubmission(s){
    const clean = { ...s, name:sanitizeText(s.name), playerName:sanitizeText(s.playerName) };
    setSubmissions(prev=>[clean, ...prev]);
    logActivity(clean.playerName+" submitted \""+clean.name+"\" for review.");
    pushToast("Submission received!");
  }
  function addHelpRequest(h){
    const clean = { ...h, levelName:sanitizeText(h.levelName), description:sanitizeText(h.description) };
    setHelpRequests(prev=>[clean, ...prev]);
    pushToast("Request posted!");
  }
  function addDecoratedPost(p){
    const clean = { ...p, title:sanitizeText(p.title).slice(0,100), body:sanitizeText(p.body).slice(0,1000) };
    setDecoratedPosts(prev=>[clean, ...prev]);
    logActivity(clean.author+" shared a decorating technique: \""+clean.title+"\".");
    pushToast("Post shared!");
  }
  function deleteDecoratedPost(id){ setDecoratedPosts(prev=>prev.filter(p=>p.id!==id)); pushToast("Post deleted."); }
  function addEvent(data){
    if(!session) return;
    const clean = {
      id:"EV"+Date.now(), title:sanitizeText(data.title).slice(0,100), description:sanitizeText(data.description).slice(0,600),
      category:data.category, reward:sanitizeText(data.reward||"").slice(0,100), rewardPoints:Math.max(0,Number(data.rewardPoints)||0),
      host:session, ts:Date.now(), entries:[], winner:null,
    };
    setEvents(prev=>[clean, ...prev]);
    logActivity(session+" created a "+clean.category.toLowerCase()+" event: \""+clean.title+"\".");
    pushToast("Event created!");
  }
  function joinEvent(id){
    if(!session) return;
    setEvents(prev=>prev.map(e=> e.id===id && !e.entries.includes(session) ? { ...e, entries:[...e.entries, session] } : e));
    pushToast("Joined event!");
  }
  function setEventWinner(id, username){
    const ev = events.find(e=>e.id===id);
    if(!ev) return;
    setEvents(prev=>prev.map(e=> e.id===id ? { ...e, winner:username } : e));
    if(ev.category==="Reward" && ev.rewardPoints>0){
      setUsers(prev=>({ ...prev, [username]: { ...prev[username], pointsAdjustment:(prev[username].pointsAdjustment||0)+ev.rewardPoints } }));
    }
    logAudit((session||"Host")+" set "+username+" as the winner of \""+ev.title+"\".");
    logActivity(username+" won the event \""+ev.title+"\"!");
    pushToast(username+" is the winner!");
    celebrate();
  }
  function deleteEventAdmin(id){ setEvents(prev=>prev.filter(e=>e.id!==id)); pushToast("Event deleted."); }

  function requestJoin(collabId){
    let blocked = false;
    setCollabs(prev=>prev.map(c=>{
      if(c.id!==collabId) return c;
      if((c.banned||[]).includes(session)){ blocked = true; return c; }
      if(c.requests.some(r=>r.username===session)) return c;
      return { ...c, requests:[...c.requests, { username:session, status:"Pending" }] };
    }));
    if(!blocked) pushToast("Request sent!");
  }
  function decideRequest(collabId, username, status){
    const collab = collabs.find(c=>c.id===collabId);
    setCollabs(prev=>prev.map(c=>{
      if(c.id!==collabId) return c;
      const requests = c.requests.map(r=> r.username===username ? { ...r, status } : r);
      const filled = status==="Accepted" ? Math.min(c.slots, c.filled+1) : c.filled;
      return { ...c, requests, filled };
    }));
    if(status==="Accepted" && collab) logActivity(username+" joined "+collab.name+".");
    pushToast("Request "+status.toLowerCase()+".");
  }
  function createCollab(data){
    const clean = { ...data, name:sanitizeText(data.name), description:sanitizeText(data.description) };
    setCollabs(prev=>[{ id:"C"+Date.now(), filled:1, requests:[], banned:[], completed:false, host:session, ...clean }, ...prev]);
    logActivity(session+" is hosting a new collab: "+clean.name+".");
    pushToast("Collab created!");
  }
  function banFromCollab(collabId, username){
    setCollabs(prev=>prev.map(c=>{
      if(c.id!==collabId) return c;
      const wasAccepted = c.requests.find(r=>r.username===username && r.status==="Accepted");
      const requests = c.requests.filter(r=>r.username!==username);
      const banned = Array.from(new Set([...(c.banned||[]), username]));
      const filled = wasAccepted ? Math.max(1, c.filled-1) : c.filled;
      return { ...c, requests, banned, filled };
    }));
    logAudit((session||"Host")+" banned "+username+" from a collab.");
    pushToast(username+" banned from this collab.");
  }
  function unbanFromCollab(collabId, username){
    setCollabs(prev=>prev.map(c=> c.id!==collabId ? c : { ...c, banned:(c.banned||[]).filter(u=>u!==username) }));
    logAudit((session||"Host")+" unbanned "+username+" from a collab.");
    pushToast(username+" unbanned.");
  }
  function markCollabComplete(collabId){
    const collab = collabs.find(c=>c.id===collabId);
    if(!collab || collab.completed) return;
    const recipients = Array.from(new Set([collab.host, ...collab.requests.filter(r=>r.status==="Accepted").map(r=>r.username)]));
    setUsers(prev=>{
      const next = { ...prev };
      recipients.forEach(name=>{
        if(next[name]) next[name] = { ...next[name], collabPoints:(next[name].collabPoints||0)+COLLAB_COMPLETE_REWARD };
      });
      return next;
    });
    const newLevel = {
      id:"CV"+collabId, rank: levelsHome.length+1, name: collab.name, creator: collab.host, verifier: session||"Mod",
      levelId: Math.floor(Math.random()*90000000)+10000000, difficulty: collab.genre, points: DIFF_POINTS[collab.genre]||150,
      special:true, date:null, verified:true, fromCollabId: collabId
    };
    setLevelsHome(prev=>[...prev, newLevel]);
    setCollabs(prev=>prev.map(c=> c.id===collabId ? { ...c, completed:true, completedAt:Date.now() } : c));
    logAudit((session||"Mod")+" marked collab \""+collab.name+"\" complete and verified it as a level.");
    logActivity("\""+collab.name+"\" was completed and verified! "+recipients.length+" contributor(s) earned Collab Points.");
    pushToast("Collab marked complete — Collab Points awarded!");
    celebrate();
  }
  function deleteCollabAdmin(id){ setCollabs(prev=>prev.filter(c=>c.id!==id)); logAudit((session||"Admin")+" deleted a collab."); pushToast("Collab deleted."); }

  function decideSubmission(id, status){
    const sub = submissions.find(s=>s.id===id);
    setSubmissions(prev=>prev.map(s=> s.id===id ? { ...s, status } : s));
    if(sub){
      logAudit((session||"Mod")+" "+(status==="Approved"?"approved":"rejected")+" \""+sub.name+"\" ("+sub.playerName+").");
      if(status==="Approved"){ logActivity(sub.playerName+" had \""+sub.name+"\" verified by a mod."); celebrate(); }
    }
    pushToast("Submission "+status.toLowerCase()+".");
  }
  function toggleFlag(id){ setSubmissions(prev=>prev.map(s=> s.id===id ? { ...s, flagged: !s.flagged } : s)); pushToast("Flag updated."); }
  function toggleChecklistItem(id, key){ setSubmissions(prev=>prev.map(s=> s.id===id ? { ...s, checklist:{...s.checklist, [key]: !s.checklist[key]} } : s)); }
  function renameSubmission(id, newName){
    const clean = sanitizeText(newName).slice(0,80);
    if(!clean.trim()) return;
    setSubmissions(prev=>prev.map(s=> s.id===id ? { ...s, name:clean } : s));
    pushToast("Submission renamed.");
  }

  function allListLevels(){ return [...levelsHome, ...levelsFish, ...otherSublists.flatMap(s=>s.levels)]; }
  function getLevelByRef(scope, id, sublistId){
    if(scope==="home") return levelsHome.find(l=>l.id===id) || null;
    if(scope==="fish") return levelsFish.find(l=>l.id===id) || null;
    if(scope==="other"){ const s = otherSublists.find(s=>s.id===sublistId); return s ? (s.levels.find(l=>l.id===id) || null) : null; }
    return null;
  }
  function computeUserPointsBase(username){
    const fromLevels = allListLevels().filter(l=> l.verified && (l.creator===username || l.verifier===username)).reduce((sum,l)=>sum+l.points,0);
    const fromSubs = submissions.filter(s=>s.submittedBy===username && s.status==="Approved").reduce((sum,s)=> sum + (DIFF_POINTS[s.difficulty]||0), 0);
    return fromLevels + fromSubs;
  }
  function computeUserPoints(username){
    const u = users[username];
    return computeUserPointsBase(username) + (u && u.pointsAdjustment ? u.pointsAdjustment : 0);
  }
  function computeVerifiedCount(username){ return allListLevels().filter(l=>l.verified && (l.creator===username||l.verifier===username)).length; }
  function computeCompletedCount(username){ return submissions.filter(s=>s.submittedBy===username && s.status==="Approved").length; }
  function computeHostedCount(username){ return collabs.filter(c=>c.host===username).length; }

  function toggleLevelVerified(scope, levelId, sublistId){
    if(scope==="home") setLevelsHome(prev=> prev.map(l=> l.id===levelId ? {...l, verified:!l.verified} : l));
    else if(scope==="fish") setLevelsFish(prev=> prev.map(l=> l.id===levelId ? {...l, verified:!l.verified} : l));
    else if(scope==="other") setOtherSublists(prev=> prev.map(s=> s.id===sublistId ? {...s, levels:s.levels.map(l=>l.id===levelId?{...l,verified:!l.verified}:l)} : s));
    pushToast("Verification status updated.");
  }
  function renameLevel(scope, id, sublistId, newName){
    const clean = sanitizeText(newName).slice(0,80);
    if(!clean.trim()) return;
    if(scope==="home") setLevelsHome(prev=>prev.map(l=>l.id===id?{...l,name:clean}:l));
    else if(scope==="fish") setLevelsFish(prev=>prev.map(l=>l.id===id?{...l,name:clean}:l));
    else if(scope==="other") setOtherSublists(prev=>prev.map(s=>s.id===sublistId?{...s,levels:s.levels.map(l=>l.id===id?{...l,name:clean}:l)}:s));
    logAudit((session||"Admin")+" renamed a level to \""+clean+"\".");
    pushToast("Level renamed.");
  }
  function deleteLevel(scope, id, sublistId){
    if(scope==="home") setLevelsHome(prev=>prev.filter(l=>l.id!==id));
    else if(scope==="fish") setLevelsFish(prev=>prev.filter(l=>l.id!==id));
    else if(scope==="other") setOtherSublists(prev=>prev.map(s=>s.id===sublistId?{...s,levels:s.levels.filter(l=>l.id!==id)}:s));
    logAudit((session||"Admin")+" deleted a level.");
    pushToast("Level deleted.");
  }
  function banUserGlobal(username){
    setUsers(prev=> ({ ...prev, [username]: { ...prev[username], banned:true } }));
    logAudit((session||"Admin")+" banned "+username+".");
    pushToast(username+" has been banned.");
  }
  function unbanUserGlobal(username){
    setUsers(prev=> ({ ...prev, [username]: { ...prev[username], banned:false, banReason:"" } }));
    logAudit((session||"Admin")+" unbanned "+username+".");
    pushToast(username+" has been unbanned.");
  }
  function adminBanWithReason(username, reason){
    setUsers(prev=>({ ...prev, [username]: { ...prev[username], banned:true, banReason:sanitizeText(reason||"").slice(0,200) } }));
    logAudit((session||"Admin")+" banned "+username+(reason?(" — reason: "+reason):"")+".");
    pushToast(username+" has been banned.");
  }
  function changeUserRole(username, role){
    setUsers(prev=>({ ...prev, [username]: { ...prev[username], role } }));
    logAudit((session||"Admin")+" set "+username+"'s role to "+role+".");
    pushToast(username+"'s role updated.");
  }
  function adminRenameUser(username, newName){
    const clean = sanitizeText(newName).slice(0,40);
    setUsers(prev=>({ ...prev, [username]: { ...prev[username], displayName:clean } }));
    logAudit((session||"Admin")+" renamed "+username+" to \""+clean+"\".");
    pushToast("Display name updated.");
  }
  function adminSetPoints(username, newTotal){
    const base = computeUserPointsBase(username);
    const adjustment = newTotal - base;
    setUsers(prev=>({ ...prev, [username]: { ...prev[username], pointsAdjustment:adjustment } }));
    logAudit((session||"Admin")+" set "+username+"'s points to "+newTotal+".");
    pushToast(username+"'s points updated.");
  }
  function adminSetCollabPoints(username, newVal){
    setUsers(prev=>({ ...prev, [username]: { ...prev[username], collabPoints:Math.max(0,Number(newVal)||0) } }));
    logAudit((session||"Admin")+" set "+username+"'s collab points to "+newVal+".");
    pushToast(username+"'s collab points updated.");
  }
  function deleteUserAdmin(username){
    setUsers(prev=>{ const next={...prev}; delete next[username]; return next; });
    logAudit((session||"Admin")+" deleted user "+username+"'s account.");
    pushToast(username+"'s account was deleted.");
  }
  function toggleLike(key){
    if(!session) return;
    setLikes(prev=>{
      const arr = prev[key] || [];
      const has = arr.includes(session);
      const next = has ? arr.filter(u=>u!==session) : [...arr, session];
      return { ...prev, [key]: next };
    });
  }
  function addComment(c){
    const clean = { ...c, text:sanitizeText(c.text) };
    setComments(prev=>[...prev, clean]);
    pushToast("Comment posted!");
  }
  function deleteComment(id){ setComments(prev=>prev.filter(c=>c.id!==id)); pushToast("Comment deleted."); }
  function setAnnouncementText(text){
    if(!text.trim()){ setAnnouncementState(null); logAudit((session||"Admin")+" cleared the announcement."); pushToast("Announcement cleared."); return; }
    setAnnouncementState({ text:sanitizeText(text.trim()).slice(0,200), ts:Date.now() });
    logAudit((session||"Admin")+" posted an announcement.");
    pushToast("Announcement posted.");
  }
  function dismissAnnouncement(){ if(announcement) setDismissedTs(announcement.ts); }
  function toggleMaintenance(){
    if(!maintenanceOn){
      handleExport();
      setMaintenanceOn(true);
      logAudit((session||"Admin")+" paused the server (maintenance mode).");
      pushToast("Server paused. Backup exported.");
    } else {
      setMaintenanceOn(false);
      logAudit((session||"Admin")+" resumed the server.");
      pushToast("Server resumed.");
    }
  }

  async function handleExport(){
    const payload = { users, submissions, collabs, helpRequests, levelsHome, levelsFish, otherSublists, auditLog, activityFeed, comments, likes, decoratedPosts, exportedAt:new Date().toISOString() };
    const json = JSON.stringify(payload, null, 2);
    try{
      if(typeof window!=="undefined" && window.claude && typeof window.claude.use==="function"){
        const downloads = await window.claude.use("downloads");
        if(downloads){ await downloads.save({ filename:"fih-community-backup.json", data: json }); pushToast("Backup exported."); return; }
      }
    }catch(e){ /* fall through to browser fallback */ }
    try{
      const blob = new Blob([json], { type:"application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "fih-community-backup.json";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      pushToast("Backup exported.");
    }catch(e){ pushToast("Export isn't available in this view."); }
  }
  function handleImportFile(e){
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const data = JSON.parse(reader.result);
        if(data.users) setUsers(data.users);
        if(data.submissions) setSubmissions(data.submissions);
        if(data.collabs) setCollabs(data.collabs);
        if(data.helpRequests) setHelpRequests(data.helpRequests);
        if(data.levelsHome) setLevelsHome(data.levelsHome);
        if(data.levelsFish) setLevelsFish(data.levelsFish);
        if(data.otherSublists) setOtherSublists(data.otherSublists);
        if(data.auditLog) setAuditLog(data.auditLog);
        if(data.activityFeed) setActivityFeed(data.activityFeed);
        if(data.comments) setComments(data.comments);
        if(data.likes) setLikes(data.likes);
        if(data.decoratedPosts) setDecoratedPosts(data.decoratedPosts);
        pushToast("Backup restored.");
      }catch(err){ pushToast("That file couldn't be read as a backup."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const currentUser = session ? users[session] : null;
  const role = currentUser ? currentUser.role : null;
  const canEditLists = role==="List Editor" || role==="Super Admin";
  const canModerateSubs = role==="Verification Mod" || role==="Super Admin";
  const isSuperAdmin = role==="Super Admin";
  const showAdminEntry = canEditLists || canModerateSubs || isSuperAdmin;

  const ctx = {
    session, users, collabs, canEditLists, canModerateSubs, isSuperAdmin, isMod: showAdminEntry,
    onToggleVerified: toggleLevelVerified,
    onOpenProfile: (name)=>setProfileTarget(name),
    onOpenLevel: (id, scope, sublistId)=>setLevelDetail({ id, scope, sublistId }),
    computeUserPoints, computeVerifiedCount, computeCompletedCount, computeHostedCount,
    onBanToggle: (name, banned)=> banned ? banUserGlobal(name) : unbanUserGlobal(name),
    onUpdateProfile: updateProfile, onSubmitGdStats: submitGdStats,
    activityFeed, submissions,
    comments, onAddComment: addComment, onDeleteComment: deleteComment,
    likes, onToggleLike: toggleLike,
    avatarSrc: (name)=> (users[name] && users[name].avatar) || undefined,
    nameFor: (name)=> (users[name] && users[name].displayName) || name,
    onAdminSetPoints: adminSetPoints, onAdminSetCollabPoints: adminSetCollabPoints,
    onAdminRenameUser: adminRenameUser, onAdminBanWithReason: adminBanWithReason,
    onDeleteLevel: deleteLevel, onDeleteCollab: deleteCollabAdmin, onDeleteUser: deleteUserAdmin,
    onMarkCollabComplete: markCollabComplete, onRenameLevel: renameLevel, onRenameSubmission: renameSubmission,
    onDeleteDecoratedPost: deleteDecoratedPost, pushToast,
  };

  const levelDetailLevel = levelDetail ? getLevelByRef(levelDetail.scope, levelDetail.id, levelDetail.sublistId) : null;
  const selfDisplayName = session ? ctx.nameFor(session) : "";
  const selfFrame = currentUser ? (currentUser.equippedFrame||"none") : "none";
  const equippedBgId = currentUser ? (currentUser.equippedSiteBg||"default") : "default";
  const siteBgClass = equippedBgId==="default" ? "aesthetic-bg" : "sitebg-"+equippedBgId;
  const selfPoints = session ? computeUserPoints(session) : 0;
  const unlockedBgIds = SITE_BG_CATALOG.filter(b=>b.threshold<=selfPoints).map(b=>b.id);

  let content;
  switch(page){
    case "home": content = <HomePage levels={levelsHome} query={query} ctx={ctx} />; break;
    case "discord": content = <DiscordPage />; break;
    case "submit": content = <SubmitPage session={session} submissions={submissions} addSubmission={addSubmission} canModerateSubs={canModerateSubs} onDecideSubmission={decideSubmission} onToggleFlag={toggleFlag} onToggleChecklist={toggleChecklistItem} ctx={ctx} />; break;
    case "creators": content = <CreatorsPage query={query} users={users} ctx={ctx} />; break;
    case "collab": content = <CollabPage session={session} collabs={collabs} query={query} ctx={ctx} onRequest={requestJoin} onDecide={decideRequest} onCreate={createCollab} onBan={banFromCollab} onUnban={unbanFromCollab} />; break;
    case "helper": content = <HelperPage session={session} helpRequests={helpRequests} addHelpRequest={addHelpRequest} query={query} ctx={ctx} />; break;
    case "fish": content = <ListPage title="Fish List" subtitle="The official FIH server level ranking." levels={levelsFish} query={query} ctx={ctx} scope="fish" />; break;
    case "other": content = <OtherListPage sublists={otherSublists} query={query} ctx={ctx} />; break;
    case "events": content = <EventsPage session={session} ctx={ctx} events={events} onCreateEvent={addEvent} onJoinEvent={joinEvent} onSetWinner={setEventWinner} onDeleteEvent={deleteEventAdmin} />; break;
    case "decorated": content = <DecoratedSharePage session={session} ctx={ctx} posts={decoratedPosts} onAddPost={addDecoratedPost} />; break;
    default: content = null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {announcement && announcement.ts>dismissedTs && (
        <div className="banner-drop flex items-center gap-3 px-4 sm:px-6 py-2.5 text-sm font-medium shrink-0" style={{ background:"var(--ink)", color:"var(--bg)" }}>
          <IconMegaphone size={16} className="shrink-0"/>
          <span className="flex-1">{announcement.text}</span>
          <button onClick={dismissAnnouncement} aria-label="Dismiss announcement"><IconX size={16}/></button>
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} session={session} user={currentUser || { title:"" }}
          points={selfPoints} onOpenSelf={()=>session && setProfileTarget(session)} avatarSrc={ctx.avatarSrc(session)} frameId={selfFrame} displayName={selfDisplayName} lang={lang} />
        <div className={"flex-1 flex flex-col min-w-0 relative "+siteBgClass}>
          <TopBar page={page} query={query} setQuery={setQuery} searchType={searchType} setSearchType={setSearchType}
            session={session} currentUser={currentUser || { title:"", banned:false }} onLogout={handleLogout}
            onOpenLogin={()=>setShowLogin(true)} onOpenRegister={()=>setShowRegister(true)}
            theme={theme} setTheme={setTheme}
            onOpenProfile={(name)=>setProfileTarget(name)} onOpenAdmin={()=>setShowAdmin(true)} onOpenChangePw={()=>setShowChangePw(true)} showAdminEntry={showAdminEntry} avatarSrc={ctx.avatarSrc(session)} displayName={selfDisplayName} lang={lang} />
          <main key={page} className="flex-1 overflow-y-auto p-5 sm:p-8 relative">
            <FloatingIcons />
            <div className="relative z-10 animate-fadein">{content}</div>
          </main>
        </div>
      </div>
      <BottomBar lang={lang} setLang={setLang} session={session} bgId={equippedBgId} setBgId={(id)=>session && updateProfile(session,{equippedSiteBg:id})} unlockedBgIds={unlockedBgIds} />

      {showLogin && <window.LoginModal users={users} onClose={()=>setShowLogin(false)} onSwitch={()=>{ setShowLogin(false); setShowRegister(true); }} onLogin={handleLogin} />}
      {showRegister && <window.RegisterModal users={users} onClose={()=>setShowRegister(false)} onSwitch={()=>{ setShowRegister(false); setShowLogin(true); }} onRegister={handleRegister} />}
      {showChangePw && session && users[session] && <window.ChangePasswordModal user={users[session]} onClose={()=>setShowChangePw(false)} onChangePassword={(pw)=>{ setUsers(prev=>({ ...prev, [session]: { ...prev[session], password:pw } })); pushToast("Password updated."); }} />}
      {showAdmin && <window.AdminPanel onClose={()=>setShowAdmin(false)} users={users} session={session} role={role} auditLog={auditLog} onBan={banUserGlobal} onUnban={unbanUserGlobal} onRoleChange={changeUserRole} onExport={handleExport} onImportFile={handleImportFile} announcement={announcement} onSetAnnouncement={setAnnouncementText} maintenanceOn={maintenanceOn} onToggleMaintenance={toggleMaintenance} />}
      {profileTarget && <ProfileModal username={profileTarget} ctx={ctx} onClose={()=>setProfileTarget(null)} />}
      {levelDetailLevel && <LevelDetailModal level={levelDetailLevel} scope={levelDetail.scope} sublistId={levelDetail.sublistId} ctx={ctx} onClose={()=>setLevelDetail(null)} />}
      {showMandatoryStats && currentUser && (
        <GdStatsForm mandatory initial={currentUser} onSubmit={(vals)=>submitGdStats(session, vals)} onClose={()=>setShowMandatoryStats(false)} />
      )}
      <ToastStack toasts={toasts} dismiss={dismissToast} />
      {confettiKey ? <ConfettiBurst key={confettiKey} /> : null}

      {maintenanceOn && !isSuperAdmin && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center backdrop-blur-xl p-6" style={{ background:"rgba(10,10,14,0.55)" }}>
          <div className="max-w-sm text-center rounded-2xl p-8 modal-pop" style={{ background:"var(--glass-bg-strong)", border:"1px solid var(--line)" }}>
            <div className="font-display font-semibold text-xl mb-2">Server maintenance</div>
            <p className="text-sm" style={{ color:"var(--ink-soft)" }}>FIH Community is temporarily paused for updates. Please check back shortly.</p>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

// Final safety assignment for module consumers and for alternate bundle load orders.
Object.assign(window, {
  ProfileCard: window.ProfileCard, Modal, EmptyState, Avatar, AvatarFramed, Button, Badge,
  Field, BanBadge, ROLE_LIST, ROLE_META, inputClass, inputStyle, timeAgo,
  IconHome, IconDiscord, IconUpload, IconAward, IconUsers, IconHelper,
  IconFish, IconLayers, IconCalendar, IconPalette,
});
