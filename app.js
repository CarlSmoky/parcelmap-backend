import express from 'express';
import cors from 'cors';
import parcelsRouter from './routes/parcels.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', parcelsRouter);

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  const response = {
    error: err.message || 'Internal Server Error'
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(err.status || 500).json(response);
});

export default app;
