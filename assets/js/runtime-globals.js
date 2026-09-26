const IconBase = ({ children, size = 18 }) => (
  React.createElement(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
    children
  )
);

const makeIcon = (paths) => (props) => React.createElement(IconBase, { ...props }, ...paths.map((d) => React.createElement('path', { key: d, d })));

window.IconBase = IconBase;
window.IconHome = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'M3 11.5 12 4l9 7.5' }), React.createElement('path', { d: 'M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9' }));
window.IconDiscord = (p) => React.createElement(IconBase, { ...p }, React.createElement('rect', { x: 4, y: 6, width: 16, height: 11, rx: 4 }), React.createElement('path', { d: 'M8 20l2-3h4l2 3' }), React.createElement('circle', { cx: 9, cy: 11.5, r: 1, fill: 'currentColor', stroke: 'none' }), React.createElement('circle', { cx: 15, cy: 11.5, r: 1, fill: 'currentColor', stroke: 'none' }));
window.IconUpload = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'M12 16V6' }), React.createElement('path', { d: 'M7.5 10.5 12 6l4.5 4.5' }), React.createElement('path', { d: 'M5 18h14' }));
window.IconAward = (p) => React.createElement(IconBase, { ...p }, React.createElement('circle', { cx: 12, cy: 9, r: 5 }), React.createElement('path', { d: 'M9 13.5 8 21l4-2 4 2-1-7.5' }));
window.IconUsers = (p) => React.createElement(IconBase, { ...p }, React.createElement('circle', { cx: 9, cy: 8, r: 3 }), React.createElement('path', { d: 'M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6' }), React.createElement('circle', { cx: 17.5, cy: 9, r: 2.4 }), React.createElement('path', { d: 'M15.5 14.2c2.4.4 4.5 2.5 4.5 5.8' }));
window.IconHelper = (p) => React.createElement(IconBase, { ...p }, React.createElement('circle', { cx: 12, cy: 12, r: 9 }), React.createElement('circle', { cx: 12, cy: 12, r: 3.4 }), React.createElement('path', { d: 'm6.5 6.5 2.6 2.6M17.5 6.5l-2.6 2.6M6.5 17.5l2.6-2.6M17.5 17.5l-2.6-2.6' }));
window.IconFish = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'M3 12c3-4 8-6 12-3.5' }), React.createElement('path', { d: 'M15 8.5C19 8.5 21 12 21 12s-2 3.5-6 3.5c-4 0-9-2.5-12-3.5 1.4-1 3-1.7 4.6-2.2' }), React.createElement('circle', { cx: 16.3, cy: 10.6, r: 0.7, fill: 'currentColor', stroke: 'none' }));
window.IconLayers = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'm12 4 8 4.5-8 4.5-8-4.5Z' }), React.createElement('path', { d: 'm4 13 8 4.5 8-4.5' }));
window.IconPalette = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.9.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Z' }), React.createElement('circle', { cx: 7.5, cy: 9.5, r: 1.1, fill: 'currentColor', stroke: 'none' }), React.createElement('circle', { cx: 12, cy: 7.5, r: 1.1, fill: 'currentColor', stroke: 'none' }), React.createElement('circle', { cx: 16.5, cy: 9.5, r: 1.1, fill: 'currentColor', stroke: 'none' }));
window.IconCalendar = (p) => React.createElement(IconBase, { ...p }, React.createElement('rect', { x: 3.5, y: 5, width: 17, height: 15, rx: 2.5 }), React.createElement('path', { d: 'M8 3v4M16 3v4M3.5 10h17' }));
window.IconSearch = (p) => React.createElement(IconBase, { ...p }, React.createElement('circle', { cx: 11, cy: 11, r: 6.5 }), React.createElement('path', { d: 'm20 20-4-4' }));
window.IconX = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'M6 6l12 12M18 6 6 18' }));
window.IconPanel = (p) => React.createElement(IconBase, { ...p }, React.createElement('rect', { x: 3.5, y: 4, width: 17, height: 16, rx: 2.5 }), React.createElement('path', { d: 'M9.5 4v16' }));
window.IconChevronDown = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'm6 9 6 6 6-6' }));
window.IconPlus = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'M12 5v14M5 12h14' }));
window.IconCheck = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'm5 13 4 4 10-11' }));
window.IconSun = (p) => React.createElement(IconBase, { ...p }, React.createElement('circle', { cx: 12, cy: 12, r: 4 }), React.createElement('path', { d: 'M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4' }));
window.IconMoon = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z' }));
window.IconMegaphone = (p) => React.createElement(IconBase, { ...p }, React.createElement('path', { d: 'M3 10v4a1 1 0 0 0 1 1h2l1 4h2l-1-4h1l9 4V5l-9 4H4a1 1 0 0 0-1 1Z' }));
window.IconPlay = ({ size = 18 }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' }, React.createElement('path', { d: 'M8 5.5v13l11-6.5Z' }));

window.Modal = function Modal({ title, onClose, children, wide, z, hideClose }) {
  return React.createElement(
    'div',
    { className: 'fixed inset-0 ' + (z || 'z-50') + ' flex items-start sm:items-center justify-center p-4 overflow-y-auto backdrop-blur-sm', style: { background: 'rgba(10,10,14,0.5)' }, onClick: hideClose ? undefined : onClose },
    React.createElement(
      'div',
      { onClick: (e) => e.stopPropagation(), className: 'w-full ' + (wide ? 'max-w-xl' : 'max-w-sm') + ' rounded-2xl my-8 modal-pop backdrop-blur-xl', style: { background: 'var(--glass-bg-strong)', border: '1px solid var(--line)' } },
      React.createElement(
        'div',
        { className: 'flex items-center justify-between px-5 py-4', style: { borderBottom: '1px solid var(--line)' } },
        React.createElement('h2', { className: 'font-display font-semibold text-lg' }, title),
        !hideClose && React.createElement('button', { onClick: onClose, 'aria-label': 'Close', style: { color: 'var(--ink-soft)' } }, React.createElement(window.IconX, { size: 20 }))
      ),
      React.createElement('div', { className: 'p-5' }, children)
    )
  );
};

window.EmptyState = function EmptyState({ text }) {
  return React.createElement('div', { className: 'text-sm rounded-xl px-4 py-8 text-center', style: { color: 'var(--ink-faint)', border: '1px dashed var(--line-strong)' } }, text);
};

window.inputClass = 'w-full rounded-lg px-3 py-2 text-sm bg-transparent';
window.inputStyle = { border: '1px solid var(--line-strong)', color: 'var(--ink)' };
window.ROLE_LIST = ['Player', 'List Editor', 'Verification Mod', 'Super Admin'];
window.ROLE_META = { 'Super Admin': { label: 'Admin', fg: '#fff', bg: 'var(--ink)' }, 'Verification Mod': { label: 'Verifier', fg: 'var(--accent)', bg: 'var(--accent-soft)' }, 'List Editor': { label: 'Editor', fg: '#2f6fd6', bg: '#e8f0fd' } };
window.timeAgo = function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  return d + 'd ago';
};

function avatarColorFor(name) {
  const palette = ['#4634ff', '#1f9d6f', '#c9821c', '#d13a52', '#2f6fd6', '#7a3cff'];
  let hash = 0;
  for (let i = 0; i < (name || '?').length; i++) {
    hash = (name || '?').charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

window.Avatar = function Avatar({ name, size = 36, src }) {
  if (src) {
    return React.createElement('img', { src, alt: name, className: 'rounded-full object-cover shrink-0', style: { width: size, height: size } });
  }
  const color = avatarColorFor(name || '?');
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return React.createElement('div', { className: 'rounded-full flex items-center justify-center font-display font-semibold shrink-0', style: { width: size, height: size, background: color, color: '#fff', fontSize: size * 0.42 } }, initial);
};

window.BanBadge = function BanBadge() {
  return React.createElement('span', { className: 'text-[10px] font-bold px-1.5 py-0.5 rounded', style: { background: 'var(--danger)', color: '#fff' } }, 'BANNED');
};

window.Button = function Button({ children, variant = 'primary', onClick, type = 'button', disabled, className = '', size = 'md' }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed lift-hover relative overflow-hidden';
  const sizes = { md: 'px-4 py-2 text-sm', sm: 'px-3 py-1.5 text-xs' };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line-strong)' },
    ghost: { background: 'transparent', color: 'var(--ink-soft)' },
    soft: { background: 'var(--accent-soft)', color: 'var(--accent)' },
    danger: { background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' },
  };

  return React.createElement(
    'button',
    { type, disabled, onClick, className: base + ' ' + sizes[size] + ' ' + className + ' hover:opacity-90' + (variant === 'primary' ? ' btn-glow-primary' : ''), style: variants[variant] || variants.primary },
    children
  );
};

window.Field = function Field({ label, children }) {
  return React.createElement('label', { className: 'block mb-4' }, React.createElement('span', { className: 'block text-xs font-semibold mb-1.5', style: { color: 'var(--ink-soft)' } }, label), children);
};

window.AvatarFramed = function AvatarFramed({ name, size = 56, src, frameId }) {
  if (!frameId || frameId === 'none') return React.createElement(window.Avatar, { name, size, src });
  return React.createElement('div', { className: 'frame-' + frameId }, React.createElement(window.Avatar, { name, size, src }));
};

window.profileCardBlue = true;
