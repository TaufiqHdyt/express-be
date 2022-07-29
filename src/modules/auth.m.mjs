import db from '#helper/db.mjs';
import config from '#config/app.config.json' assert { type: 'json' };

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class _auth {
  register = async (body = {}) => {
    try {
      const { name, email, password } = body;

      const check = await db.user.findUnique({
        where: {
          name,
        },
      });

      const pw = bcrypt.hashSync(password, 10);

      let user = {};

      if (check) {
        user = await db.user.update({
          where: {
            name,
          },
          data: {
            email,
            password: pw,
          },
          select: {
            id: true,
            name: true,
            userRole: {
              select: {
                roleName: true,
              },
            },
          },
        });
      } else {
        user = await db.user.create({
          data: {
            name,
            email,
            password: pw,
            userRole: {
              connect: {
                userName: name,
              },
            },
          },
          select: {
            id: true,
            name: true,
            userRole: {
              select: {
                roleName: true,
              },
            },
          },
        });
      }

      return {
        status: true,
        data: {
          name: user.name,
          role: user.userRole?.map(({ roleName }) => roleName),
        },
      };
    } catch (error) {
      if (config.debug) console.error(`register auth module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  login = async (body = {}) => {
    try {
      const { username, password } = body;
      const { expired, secret } = config.jwt;

      const check = await db.user.findUnique({
        where: {
          email: username,
        },
        select: {
          email: true,
          name: true,
          password: true,
          userRole: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!check) {
        return {
          status: false,
          code: 404,
          error: 'User not found',
        };
      }

      if (!bcrypt.compareSync(password, check.password)) {
        return {
          status: false,
          code: 401,
          error: 'Wrong password',
        };
      }

      const payload = {
        id: check.email,
        n: check.name,
        ri: check.userRole[0].role.id,
        r: check.userRole?.map(({ role }) => role.name).join(','),
      };

      const now = new Date();
      const token = jwt.sign(payload, secret, { expiresIn: String(expired) });
      const expiresAt = new Date(Date.now() + expired);

      await db.user.update({
        where: {
          name: check.name,
        },
        data: {
          lastLogin: now.toISOString(),
        },
      });

      return {
        status: true,
        data: { token, expiresAt },
      };
    } catch (error) {
      if (config.debug) console.error(`login auth module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
}

export default new _auth();
