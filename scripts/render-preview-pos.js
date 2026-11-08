const fs = require('fs');
const path = require('path');
const Module = require('module');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

async function main() {
  const filename = path.resolve('src/app/pos/page.jsx');
  const { transform } = require('next/dist/build/swc');
  const result = await transform(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: {
      parser: { syntax: 'ecmascript', jsx: true },
      transform: { react: { runtime: 'automatic' } }
    },
    module: { type: 'commonjs' }
  });

  const component = new Module(filename, module);
  component.filename = filename;
  component.paths = [path.resolve('node_modules')];
  const icons = await import('lucide-react');

  // Wrap every icon in a clean SVG function with proper Lucide paths
  const ICON_PATHS = {
    Home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    Store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>',
    UtensilsCrossed: '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/>',
    History: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    Receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v.5"/><path d="M12 6v.5"/>',
    Settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    Search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    Plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    Minus: '<path d="M5 12h14"/>',
    Trash2: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    Printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
    Banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    QrCode: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    X: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    ChevronRight: '<path d="m9 18 6-6-6-6"/>',
    CheckCircle2: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    RefreshCw: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  };

  const safeIcons = {};
  for (const [k, v] of Object.entries(icons)) {
    const rawPath = ICON_PATHS[k] || '<circle cx="12" cy="12" r="8" stroke="currentColor" opacity="0.25" />';
    safeIcons[k] = (props) => {
      return React.createElement('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: props.width || 24,
        height: props.height || 24,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: props.className || 'w-5 h-5',
        dangerouslySetInnerHTML: { __html: rawPath }
      });
    };
  }

  const mockNextImage = ({ unoptimized, ...props }) => React.createElement('img', props);
  const mockNextLink = ({ href, children, className }) => React.createElement('a', { href, className }, children);
  const mockNextAuth = {
    useSession: () => ({
      data: {
        user: {
          name: 'Tubagus Iqbal Husaeni',
          email: 'ikbalgsr46@gmail.com',
          role: 'cashier',
          image: null
        }
      },
      status: 'authenticated'
    }),
    signOut: () => {}
  };
  const mockRestaurantApi = {
    getMenuCategories: async () => ({ data: [] }),
    requestRestaurant: async () => ({})
  };

  const originalRequire = component.require.bind(component);
  component.require = name => {
    if (name === 'lucide-react') return safeIcons;
    if (name === 'next/image') return { default: mockNextImage, __esModule: true };
    if (name === 'next/link') return { default: mockNextLink, __esModule: true };
    if (name === 'next-auth/react') return mockNextAuth;
    if (name === '@/lib/restaurant-api') return mockRestaurantApi;
    return originalRequire(name);
  };

  component._compile(result.code, filename);

  const PosPage = component.exports.default || component.exports;

  // Realistic sample cart for preview
  const sampleCart = [
    {
      id: 'cart-1',
      name: 'Mie Elon Musk Lv 2',
      price: 15000,
      qty: 2,
      image: '/images/dinein/mie-gacoan.png',
      note: 'Level 2 Pedas Manis'
    },
    {
      id: 'cart-2',
      name: 'Udang Keju Goreng',
      price: 12000,
      qty: 1,
      image: '/images/dinein/udang-keju.png',
      note: 'Isi Keju Lumer (3 pcs)'
    },
    {
      id: 'cart-3',
      name: 'Es Gobak Sodor',
      price: 10000,
      qty: 1,
      image: '/images/dinein/es-gobak-sodor.png',
      note: 'Es Buah Segar'
    }
  ];

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(PosPage, { initialCart: sampleCart })
  );

  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <base href="http://localhost:3000/">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POSFood - Mie Elon Musk POS Kasir</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #1F1D2B; margin: 0; padding: 0; color: #fff; }
    /* Hide scrollbars */
    .pos-scrollbar::-webkit-scrollbar { display: none; }
    .pos-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  fs.writeFileSync('docs/preview-pos.html', fullHtml, 'utf8');
  console.log('SUCCESS: Generated docs/preview-pos.html, length:', fullHtml.length);
}

main().catch(console.error);
