import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';
import { readData, writeData, ensureDataDir } from '../utils/storage.ts';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const tasks = await readData<any>('tasks.json');
  const userTasks = tasks.filter((t: any) => t.userId === req.user?.id);
  res.json(userTasks);
});

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { title, description, subject, deadline, priority, status } = req.body;

  await ensureDataDir();
  const tasks = await readData<any>('tasks.json');

  const newTask = {
    id: Date.now().toString(),
    userId: req.user?.id,
    title,
    description,
    subject,
    deadline,
    priority,
    status: status || 'Pending',
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  await writeData('tasks.json', tasks);
  res.status(201).json(newTask);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updates = req.body;

  const tasks = await readData<any>('tasks.json');
  const index = tasks.findIndex((t: any) => t.id === id && t.userId === req.user?.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
  await writeData('tasks.json', tasks);
  res.json(tasks[index]);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const tasks = await readData<any>('tasks.json');
  const filteredTasks = tasks.filter((t: any) => !(t.id === id && t.userId === req.user?.id));

  if (tasks.length === filteredTasks.length) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await writeData('tasks.json', filteredTasks);
  res.json({ message: 'Task deleted' });
});

export default router;
