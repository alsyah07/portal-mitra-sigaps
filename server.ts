import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  const users = [
    {
      id_users: 1,
      code_customer: 'CUST001',
      nama_customer: 'Ali Hermansyah',
      email: 'hermansyahali07@gmail.com',
      password: 'password123', // In a real app, use hashing
      status: 1,
    },
    {
      id_users: 2,
      code_customer: 'CUST002',
      nama_customer: 'Driver Mitra',
      email: 'driver@mitra.com',
      password: 'password',
      status: 1,
    }
  ];

  const timesheets = [
    {
      id_timesheets_mitra: 1,
      employee_id: 'EMP001',
      code_customer: 'CUST001',
      time_entry: '2026-05-04 08:00',
      km_entry: '12000',
      time_exit: '2026-05-04 17:00',
      km_exit: '12150',
      status_approved: 0, // Pending
      task: 'Delivery to Site A',
      foto_km_in: null,
      foto_km_out: null,
      lat_masuk: '-6.200000',
      long_masuk: '106.816666',
      lat_keluar: '-6.200000',
      long_keluar: '106.816666',
      is_premium: 0,
      premium_name: '',
      is_vip: 0,
      vip_name: '',
      is_task: 1,
      created_at: new Date().toISOString(),
    },
    {
      id_timesheets_mitra: 2,
      employee_id: 'EMP002',
      code_customer: 'CUST001',
      time_entry: '2026-05-03 07:30',
      km_entry: '15500',
      time_exit: '2026-05-03 16:45',
      km_exit: '15620',
      status_approved: 1, // Approved
      task: 'Regional Transfer',
      foto_km_in: null,
      foto_km_out: null,
      lat_masuk: '-6.208800',
      long_masuk: '106.845600',
      lat_keluar: '-6.209800',
      long_keluar: '106.845900',
      is_premium: 1,
      premium_name: 'Fast Track',
      is_vip: 0,
      vip_name: '',
      is_task: 1,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ];

  // API Routes
  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.get('/api/timesheets', (req, res) => {
    res.json(timesheets);
  });

  app.put('/api/timesheets/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedData = req.body;
    const index = timesheets.findIndex(t => t.id_timesheets_mitra === id);

    if (index !== -1) {
      timesheets[index] = { ...timesheets[index], ...updatedData };
      res.json({ success: true, data: timesheets[index] });
    } else {
      res.status(404).json({ success: false, message: 'Timesheet not found' });
    }
  });

  app.post('/api/timesheets/approve', (req, res) => {
    const { id, status } = req.body;
    const index = timesheets.findIndex(t => t.id_timesheets_mitra === id);
    
    if (index !== -1) {
      timesheets[index].status_approved = status;
      res.json({ success: true, data: timesheets[index] });
    } else {
      res.status(404).json({ success: false, message: 'Timesheet not found' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
