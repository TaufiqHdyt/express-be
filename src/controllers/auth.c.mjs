import { Router } from 'express';
import m$auth from '#module/auth.m.mjs';
import response from '#helper/response.mjs';
import userCookie from '#helper/middleware.mjs';
import config from '#config/app.config.json' assert { type: 'json' };

const AuthController = Router();

AuthController.post('/login', async (req, res, next) => {
  const { status, data, error } = await m$auth.login(req.body);
  if (status) {
    res.cookie('sessionId', data.sessionId, { maxAge: config.jwt.expired, httpOnly: !config.debug, secure: !config.debug, sameSite: true });
    response.send(res, { status, data: 'Login success!' });
  } else {
    response.send(res, { status, error });
  }
});

AuthController.get('/logout', userCookie, async (req, res, next) => {
  const c$logout = await m$auth.logout(req.user.session);
  res.clearCookie('sessionId');
  response.send(res, c$logout);
});

AuthController.post('/register', async (req, res, next) => {
  const c$register = await m$auth.register(req.body);
  response.send(res, c$register);
});

AuthController.get('/session', userCookie, async (req, res, next) => {
  const c$session = await m$auth.session(req.user);
  response.send(res, c$session);
});

export { AuthController };
