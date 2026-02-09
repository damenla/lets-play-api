import { Request, Response } from 'express';
import { createApp } from './app.ts'

const app = createApp();
const port = process.env.PORT || 3000;

app.get('/', (_req: Request, res: Response) => {
  res.send('hello world');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
