import express from "express";
import { getUserClients, getUserClientById, createUserClient } from "../Controllers/userClientController.js";

const router = express.Router();

router.get('/', getUserClients);
router.get('/:id', getUserClientById);
router.post('/createUserClient', createUserClient);

export default router;
