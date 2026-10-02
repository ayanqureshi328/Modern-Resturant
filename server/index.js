import express from 'express';
import { MongoClient } from 'mongodb';
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 3002;
const mongoUri = process.env.MONGODB_URI;
const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const client = mongoUri ? new MongoClient(mongoUri) : null;
let connection;

app.use(express.json());

async function reservationsCollection() {
  if (!client) {
    throw new Error('Reservations are not configured. Set MONGODB_URI on the server.');
  }

  connection ??= client.connect();
  const database = await connection;
  return database.db(process.env.MONGODB_DB || 'savor').collection('reservations');
}

app.post('/api/reservations', async (request, response) => {
  const { name, email, phone, guests, date, time, notes } = request.body ?? {};
  const guestCount = Number(guests);
  const validEmail = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const parsedDate = typeof date === 'string' ? new Date(`${date}T00:00:00Z`) : null;
  const validDate = parsedDate && /^\d{4}-\d{2}-\d{2}$/.test(date)
    && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
  const validTime = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].includes(time);

  if (typeof name !== 'string' || !name.trim() || !validEmail || !validDate || !validTime
      || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 12) {
    return response.status(400).json({ error: 'Please check your details and try again.' });
  }

  try {
    const collection = await reservationsCollection();
    const reservation = {
      name: name.trim().slice(0, 120),
      email: email.trim().toLowerCase().slice(0, 254),
      phone: typeof phone === 'string' ? phone.trim().slice(0, 40) : '',
      guests: guestCount,
      date,
      time,
      notes: typeof notes === 'string' ? notes.trim().slice(0, 500) : '',
      status: 'requested',
      createdAt: new Date(),
    };
    const result = await collection.insertOne(reservation);
    return response.status(201).json({ id: result.insertedId.toString(), message: 'Your table is requested.' });
  } catch (error) {
    console.error('Could not save reservation:', error.message);
    return response.status(503).json({ error: 'We could not save your reservation just now. Please try again shortly.' });
  }
});

app.use(express.static(webRoot));

app.listen(port, () => {
  console.log(`Savor reservation API listening on http://localhost:${port}`);
});