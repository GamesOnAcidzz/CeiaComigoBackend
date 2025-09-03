import express from "express";
import mongoose from "mongoose";
import { error } from "node:console";
import dotenv from "dotenv";
import authRoutes from "./Routers/auth.js";
import { authMiddleware } from './Middleware/authMiddleware.js';

dotenv.config();

const app = express();
console.log(process.env.DATABASE);
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
const db = mongoose.connection
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));

app.use(express.json());
app.use('/api/auth', authRoutes);
// Protected route example
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ message: `Welcome user ${req.userId}` });
});
app.listen(process.env.PORT, () => console.log("Server started"));

