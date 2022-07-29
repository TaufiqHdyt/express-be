import db from '#helper/db.mjs';
import config from '#config/app.config.json' assert { type: 'json' };

import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

import {
  object,
  string,
} from 'yup';

const schema = object({
  name: string().label('Name').when(('$register', ([register], schema) => register ? schema.required() : schema)),
  username: string().label('Username').required(),
  password: string().label('Password').required(),
  role: string().label('Password'),
});

// extend session time to additional
// hour: k * min * second * ms
const refreshTime = 2 * 60 * 60 * 1000;

class _auth {
  register = async (body = {}) => {
    try {
      const { name, username, password, role } = body;

      await schema.validate(body, { context: { register: true } });

      const check = await db.user.findUnique({
        where: {
          name,
        },
      });

      if (check?.username) {
        throw new Error('User already registered');
      }

      const pw = bcrypt.hashSync(password, 10);

      let user = {};

      if (check) {
        user = await db.user.update({
          where: {
            name,
          },
          data: {
            username,
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
            username,
            password: pw,
            userRole: {
              connectOrCreate: {
                where: {
                  userName: name,
                },
                create: {
                  role: {
                    connect: {
                      name: role ?? 'User',
                    },
                  },
                },
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

      await schema.validate(body);

      const check = await db.user.findUnique({
        where: {
          username,
        },
        select: {
          username: true,
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

      const expiresAt = new Date(Date.now() + refreshTime);
      const sessionId = crypto.randomUUID();

      await db.session.create({
        data: {
          id: sessionId,
          expiresAt,
          username,
        },
      });

      return {
        status: true,
        data: { sessionId, expiresAt },
      };
    } catch (error) {
      if (config.debug) console.error(`login auth module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  logout = async (session) => {
    try {
      await db.session.delete({
        where: {
          id: session,
        },
      });
      return {
        status: true,
        data: 'Logout success',
      };
    } catch (error) {
      if (config.debug) console.error(`logout auth module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  session = async (user = {}) => {
    try {
      await db.session.update({
        where: {
          id: user.session,
        },
        data: {
          expiresAt: new Date(Date.now() + refreshTime),
        },
      });
      return {
        status: true,
        data: {
          ...user,
          role: user.role.name,
          session: undefined,
        },
      };
    } catch (error) {
      if (config.debug) console.error(`session auth module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
}

export default new _auth();
