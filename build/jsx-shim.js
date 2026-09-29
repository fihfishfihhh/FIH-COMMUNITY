// Tiny JSX runtime for the browser build: React is loaded as a global (UMD) from index.html.
export const Fragment = React.Fragment;
export const jsx = (type, props, key) => React.createElement(type, { ...props, key });
export const jsxs = jsx;
