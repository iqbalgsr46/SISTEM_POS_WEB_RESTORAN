const fs = require('fs');
const path = require('path');
const Module = require('module');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

async function main() {
  const filename = path.resolve('src/features/admin/admin-dashboard.jsx');
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
  component.paths = module.paths;
  const icons = await import('lucide-react');
  const originalRequire = component.require.bind(component);
  component.require = name => name === 'lucide-react' ? icons : originalRequire(name);
  component._compile(result.code, filename);

  const AdminDashboard = component.exports.default || component.exports;

  const mockOrders = [
    { id: 'ORD-101', ticketNumber: '#0101', customerName: 'Tubagus Iqbal', tableNumber: '04', totalAmount: 45000, paymentStatus: 'paid', status: 'COOKING', source: 'Dine-In (QR)' },
    { id: 'ORD-102', ticketNumber: '#0102', customerName: 'Budi Santoso', tableNumber: null, totalAmount: 78000, paymentStatus: 'paid', status: 'READY', source: 'Takeaway' },
    { id: 'ORD-103', ticketNumber: '#0103', customerName: 'Siti Rahma', tableNumber: '02', totalAmount: 32000, paymentStatus: 'paid', status: 'COMPLETED', source: 'Dine-In (QR)' },
    { id: 'ORD-104', ticketNumber: '#0104', customerName: 'Ahmad Fauzi', tableNumber: '08', totalAmount: 112000, paymentStatus: 'paid', status: 'COOKING', source: 'Dine-In (QR)' },
    { id: 'ORD-105', ticketNumber: '#0105', customerName: 'Dewi Lestari', tableNumber: null, totalAmount: 54000, paymentStatus: 'paid', status: 'READY', source: 'Takeaway' },
  ];

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AdminDashboard, {
      initialTab: 'Akun Staf',
      session: {
        user: {
          name: 'Tubagus Iqbal Husaeni',
          email: 'ikbalgsr46@gmail.com',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        }
      },
      resources: {
        orders: { data: mockOrders },
        stock: {
          data: [
            { id: 1, name: 'Mie Hompimpa Lv 1-4', category: 'Mie', available: true },
            { id: 2, name: 'Mie Gacoan Lv 1-4', category: 'Mie', available: true },
            { id: 3, name: 'Pangsit Goreng', category: 'Dimsum', available: true },
            { id: 4, name: 'Udang Keju', category: 'Dimsum', available: false },
          ]
        },
        tables: {
          data: Array.from({ length: 16 }, (_, i) => ({
            id: i + 1,
            number: String(i + 1).padStart(2, '0'),
            status: i === 1 ? 'occupied' : i === 3 ? 'cleaning' : i === 7 ? 'occupied' : 'available',
            ticket: i === 1 ? '#0101' : null
          }))
        },
        menu: { data: [] },
        accounts: {
          data: [
            { id: 1, name: 'Tubagus Iqbal Husaeni', email: 'ikbalgsr46@gmail.com', role: 'admin', status: 'approved' },
            { id: 2, name: 'devtech tiga', email: 'devtechtiga@gmail.com', role: 'cashier', status: 'approved' },
            { id: 3, name: 'devtech 12', email: 'devtechduabelas@gmail.com', role: 'kitchen', status: 'approved' },
            { id: 4, name: 'Ahmad Fauzi', email: 'ahmadfauzi@gmail.com', role: 'cashier', status: 'pending' },
          ]
        }
      },
      updatedAt: new Date().toISOString()
    })
  );

  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard Preview - Axiom Concentric Bezel</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #070A11; margin: 0; padding: 0; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  fs.writeFileSync('docs/preview-admin.html', fullHtml, 'utf8');
  console.log('SUCCESS: Generated docs/preview-admin.html, length:', fullHtml.length);
}

main().catch(console.error);
