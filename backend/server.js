const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
let db;
let clientsCollection;

const connectMongoDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
    await client.connect();
    db = client.db(process.env.DATABASE_NAME);
    clientsCollection = db.collection(process.env.COLLECTION_NAME);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: db ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// CRUD API Routes for Clients

// GET /api/clients - Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await clientsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Transform MongoDB _id to match frontend expectations
    const transformedClients = clients.map(client => ({
      ...client,
      id: client._id.toString(),
      createdAt: new Date(client.createdAt),
      updatedAt: new Date(client.updatedAt)
    }));
    
    res.json(transformedClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// POST /api/clients - Create new client
app.post('/api/clients', async (req, res) => {
  try {
    const now = new Date();
    const newClient = {
      ...req.body,
      createdAt: now,
      updatedAt: now
    };

    // Check for duplicate phone number
    const existingClient = await clientsCollection.findOne({ phone: newClient.phone });
    if (existingClient) {
      return res.status(400).json({ error: 'A client with this phone number already exists' });
    }

    const result = await clientsCollection.insertOne(newClient);
    const insertedClient = {
      ...newClient,
      _id: result.insertedId,
      id: result.insertedId.toString()
    };

    res.status(201).json(insertedClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PUT /api/clients/:id - Update client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Remove _id and id from updates
    delete updateData._id;
    delete updateData.id;

    const result = await clientsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Fetch and return updated client
    const updatedClient = await clientsCollection.findOne({ _id: new ObjectId(id) });
    res.json({
      ...updatedClient,
      id: updatedClient._id.toString()
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id - Delete client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await clientsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// GET /api/clients/search?q= - Search clients
app.get('/api/clients/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const clients = await clientsCollection
      .find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    const transformedClients = clients.map(client => ({
      ...client,
      id: client._id.toString()
    }));

    res.json(transformedClients);
  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({ error: 'Failed to search clients' });
  }
});

// Start server
const startServer = async () => {
  await connectMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 INKFLOW CRM Backend running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DATABASE_NAME}`);
    console.log(`🔗 Frontend CORS: ${process.env.CORS_ORIGIN}`);
  });
};

startServer().catch(console.error);