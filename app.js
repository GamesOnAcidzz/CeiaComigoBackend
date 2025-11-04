import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import auth from "./Routers/auth.js";
import http from "http";
import userRestRoutes from "./Routers/userRestRouter.js";
import restaurantRoutes from './Routers/restaurantsRouter.js';
import userProfileRoutes from './Routers/userProfileRouter.js';
import userAccountRoutes from './Routers/userAccountRouter.js';
import tagRoutes from './Routers/tagRouter.js';
import { setupSocket } from "./socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

console.log(process.env.DATABASE);
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
const db = mongoose.connection
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));

app.use(express.json());
app.use('/api/auth', auth);
app.use('/api/userRest', userRestRoutes);
app.use('/api/userAccount', userAccountRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/userProfile', userProfileRoutes);
app.use('/api/tag', tagRoutes);

setupSocket(server);

server.listen(process.env.PORT, () => console.log("Server started"));

