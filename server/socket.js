const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active visitors list for Colony Pulse (Live Resident Origins)
// Key: tenantId, Value: Object of sessionId -> visitor details
const activeVisitors = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Emit welcome event as expected by tests
  socket.emit('welcome', { message: 'Welcome to Bee Chat Socket Server!' });

  socket.on('test_connection', () => {
    socket.emit('welcome', { message: 'Test connection acknowledged' });
  });

  // Join rooms
  socket.on('join_tenant', (tenantId) => {
    socket.join(`tenant_${tenantId}`);
    console.log(`Socket ${socket.id} joined room tenant_${tenantId}`);
    
    // Send current active visitors list for this tenant
    const visitors = activeVisitors.get(Number(tenantId)) || {};
    socket.emit('live_visitors_list', Object.values(visitors));
  });

  socket.on('join_visitor', (sessionId) => {
    socket.join(`visitor_${sessionId}`);
    console.log(`Socket ${socket.id} joined room visitor_${sessionId}`);
  });

  // Handle active visitor tracking from the widget
  socket.on('visitor_activity', (data) => {
    // data: { tenantId, sessionId, country, browser, device, page, sessionDuration, ip, status, details }
    const { tenantId, sessionId } = data;
    if (!tenantId || !sessionId) return;
    
    const tId = Number(tenantId);
    if (!activeVisitors.has(tId)) {
      activeVisitors.set(tId, {});
    }
    
    // Add/Update visitor activity details
    const visitors = activeVisitors.get(tId);
    visitors[sessionId] = {
      ...data,
      lastSeen: Date.now()
    };
    
    // Broadcast active visitors list to the tenant's dashboard agents
    io.to(`tenant_${tId}`).emit('live_visitors_list', Object.values(visitors));
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Periodic cleanup of inactive visitors (no activity for 40s)
setInterval(() => {
  const now = Date.now();
  for (const [tenantId, visitors] of activeVisitors.entries()) {
    let changed = false;
    for (const [sessionId, details] of Object.entries(visitors)) {
      if (now - details.lastSeen > 40000) {
        delete visitors[sessionId];
        changed = true;
      }
    }
    if (changed) {
      io.to(`tenant_${tenantId}`).emit('live_visitors_list', Object.values(visitors));
    }
  }
}, 10000);

// REST API for PHP backend to push events
app.post('/notify', (req, res) => {
  const { tenantId, type, data } = req.body;
  if (!tenantId || !type) {
    return res.status(400).json({ error: 'Missing tenantId or type' });
  }

  // Broadcast to tenant agents
  io.to(`tenant_${tenantId}`).emit(type, data);
  console.log(`Broadcasted ${type} to tenant_${tenantId}:`, data);
  res.json({ success: true });
});

// REST API to broadcast to a specific visitor
app.post('/notify-visitor', (req, res) => {
  const { sessionId, type, data } = req.body;
  if (!sessionId || !type) {
    return res.status(400).json({ error: 'Missing sessionId or type' });
  }

  io.to(`visitor_${sessionId}`).emit(type, data);
  console.log(`Broadcasted ${type} to visitor_${sessionId}:`, data);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
