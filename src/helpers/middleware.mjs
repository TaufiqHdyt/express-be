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
    },
  });
  const allowedPath = pathByRoleId?.filter(({ path }) =>
    targetUrl.startsWith(path)
  );
  return !!allowedPath.length;
};

const userCookie = async (req, res, next) => {
  const { cookies, originalUrl } = req;
  const sessionId = cookies?.sessionId ?? null;

  if (!sessionId) {
    response.send(res, {
      status: false,
      error: 'Not Authenticated, No Session',
    });
  }

  if (sessionId) {
    try {
      const { user, ...session } = await db.session.findUniqueOrThrow({
        where: {
          id: sessionId,
        },
        include: {
          user: {
            select: {
              username: true,
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
          },
        },
      });

      if (session.expiresAt.valueOf() < new Date()) {
        await db.session.delete({
          where: {
            id: session.id,
          },
        });
        res.clearCookie('sessionId');
        throw new Error('Session expired');
      }

      const isAllowed = await checkPermission(
        user.userRole[0].role.id,
        originalUrl
      );

      if (!isAllowed) {
        throw new Error('Not Permitted');
      }

      req.user = {
        ...user,
        userRole: undefined,
        role: user.userRole[0].role,
        session: session.id,
      };

      next();
    } catch (error) {
      if (config.debug)
        console.error(`userCookie middleware helper error`, error);
      response.send(res, {
        status: false,
        error,
      });
    }
  }
};

export default userCookie;
