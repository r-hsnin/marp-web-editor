import app from './app';

const port = 3001;
console.log(`Server is running on http://localhost:${port}`);

export default {
  fetch: app.fetch,
  port,
};
