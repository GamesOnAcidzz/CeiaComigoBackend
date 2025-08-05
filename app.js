import express from "express";
import mongoose from "mongoose";
import { error } from "node:console";
import dotenv from "dotenv";
import userClientRouter from "./Routers/userClientRouter.js";

dotenv.config();

const app = express();
console.log(process.env.DATABASE);
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
const db = mongoose.connection
db.on('erro', (error) => console.error(error));
db.once('open', () => console.log(error));

app.use(express.json());
app.use('/api/userClients', userClientRouter);
app.listen(process.env.PORT, () => console.log("Server started"));

