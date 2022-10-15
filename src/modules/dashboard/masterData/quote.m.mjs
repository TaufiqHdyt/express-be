import db from '#helper/db.mjs';
import config from '#config/app.config.json' assert { type: 'json' };

class _quote {
  list = async (query = {}) => {
    try {
      const quote = await db.quote.findMany({
        select: {
          id: true,
          text: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
      return {
        status: true,
        data: quote?.map((obj) => ({
          ...obj,
          author: obj?.author?.name,
        })),
      };
    } catch (error) {
      if (config.debug) console.error(`list quote module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  detail = async (params = {}) => {
    try {
      const { id } = params;
      const { author: { name }, ...quote} = await db.quote.findUniqueOrThrow({
        where: {
          id: Number(id),
        },
        select: {
          id: true,
          text: true,
          author: {
            select: {
              name: true,
            }
          },
        },
      });
      return {
        status: true,
        data: {
          ...quote,
          author: name,
        },
      };
    } catch (error) {
      if (config.debug) console.error(`detail quote module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  add = async (body = {}) => {
    try {
      const { text, author } = body;
      const add = await db.quote.create({
        data: {
          text,
          author: {
            connectOrCreate: {
              where: { name: author },
              create: {
                name: author,
                userRole: {
                  create: {
                    role: {
                      connect: {
                        id: 5,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      return {
        status: true,
        data: add,
      };
    } catch (error) {
      if (config.debug) console.error(`add quote module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  update = async (params = {}, body = {}) => {
    try {
      const { id } = params;
      const { text, author } = body;
      const update = await db.quote.update({
        where: {
          id: Number(id),
        },
        data: {
          text,
          author: {
            connectOrCreate: {
              where: { name: author },
              create: {
                name: author,
                userRole: {
                  create: {
                    role: {
                      connect: {
                        id: 5,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      return {
        status: true,
        data: update,
      };
    } catch (error) {
      if (config.debug) console.error(`update quote module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  delete = async (params = {}) => {
    try {
      const { id } = params;
      const del = await db.quote.delete({
        where: {
          id: Number(id),
        },
      });
      return {
        status: true,
        data: del,
      };
    } catch (error) {
      if (config.debug) console.error(`delete quote module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
}

export default new _quote();
