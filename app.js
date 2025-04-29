import express from 'express';
import cors from 'cors';
import parcelsRouter from './routes/parcels.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', parcelsRouter);

export default app;
