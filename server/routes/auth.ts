import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readData, writeData, ensureDataDir } from '../utils/storage.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  await ensureDataDir();
  const users = await readData<any>('users.json');

  if (users.find((u: any) => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await writeData('users.json', users);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const users = await readData<any>('users.json');
  const user = users.find((u: any) => u.email === email);

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

export default router;
