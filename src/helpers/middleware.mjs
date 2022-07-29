import jwt from 'jsonwebtoken';
import config from '#config/app.config.json' assert { type: 'json' };
import db from '#helper/db.mjs';
import response from '#helper/response.mjs';

const checkPermission = async (roleId = 6, targetUrl) => {
  const pathByRoleId = await db.access.findMany({
    where: {
      roleId,
    },
    select: {
      path: true,
    }
  });
  const allowedPath = pathByRoleId?.filter(({ path }) => targetUrl.startsWith(path));
  return !!allowedPath.length;
};

const userSession = async (req, res, next) => {
  const { headers, originalUrl, protocol } = req;
  const token = headers?.authorization?.startsWith('Bearer')
    ? headers?.authorization?.split(' ')[1]
    : null;

  if (!token) {
    response.send(res, {
      status: false,
      error: 'Not Authenticated, No Token',
    });
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const isAllowed = await checkPermission(decoded.ri, originalUrl);

      if (!isAllowed) {
        response.send(res, {
          status: false,
          error: 'Not Permitted',
        });
        return false;
      }

      const user = await db.user.findUnique({
        where: {
          email: decoded.id,
        },
        select: {
          id: true,
          name: true,
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

      if (!user) {
        response.send(res, {
          status: false,
          error: 'Not Authorized',
        });
      }

      req.baseUrl = `${protocol}://${req.get('host')}`;

      req.user = {
        ...user,
        role: user.userRole[0].role,
      };

      next();
    } catch (error) {
      if (config.debug) console.error(`userSession middleware helper error`, error);
      response.send(res, {
        status: false,
        error,
      });
    }
  }
};

export default userSession;
