import { Router } from 'express';
import m$auth from '#module/auth.m.mjs';
import response from '#helper/response.mjs';

const AuthController = Router();

AuthController.post('/login', async (req, res, next) => {
  const c$login = await m$auth.login(req.body);
  response.send(res, c$login);
});

AuthController.post('/register', async (req, res, next) => {
  const c$register = await m$auth.register(req.body);
  response.send(res, c$register);
});

export { AuthController };
