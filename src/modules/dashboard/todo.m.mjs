import db from '#helper/db.mjs';
import config from '#config/app.config.json' assert { type: 'json' };

class todo {
  list = async (query = {}) => {
    try {
      const { id, name, inquiry, user } = query;
      const todo = await db.toDo.findMany({
        where: {
          user: {
            name: user,
          },
        },
      });
      return {
        status: true,
        data: todo?.map(({ id, createdAt, name, status, description, categoryName }) => ({
          id,
          createdAt,
          name,
          status,
          description,
          categoryName,
        })),
      };
    } catch (error) {
      if (config.debug) console.error(`list todo module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  detail = async (params = {}) => {
    try {
      const { id } = params;
      const detail = await db.toDo.findUniqueOrThrow({
        where: {
          id: Number(id) || undefined,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      return {
        status: true,
        data: detail,
      };
    } catch (error) {
      if (config.debug) console.error(`detail todo module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  add = async (body = {}) => {
    try {
      const { name, description, category, user } = body;
      const todo = await db.toDo.create({
        data: {
          name,
          description,
          status: 'todo',
          user: {
            connectOrCreate: {
              where: {
                name: user,
              },
              create: {
                name: user,
              },
            },
          },
          category: {
            connectOrCreate: {
              where: {
                name: category,
              },
              create: {
                name: category,
              },
            },
          },
        },
        select: {
          name: true,
          status: true,
        },
      });
      return {
        status: true,
        data: {
          name: todo.name,
          status: todo.status,
        },
      };
    } catch (error) {
      if (config.debug) console.error(`add todo module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  update = async (body = {}) => {
    try {
      const { id, name, description, status } = body;
      console.log(body);
      const update = await db.toDo.update({
        where: {
          id: +id,
        },
        data: {
          name,
          description,
          status,
        },
        select: {
          name: true,
          status: true,
        },
      });

      return {
        status: true,
        data: update,
      }
    } catch (error) {
      if (config.debug) console.error(`update todo module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
  delete = async (params = {}) => {
    try {
      const { id } = params;
      const del = await db.toDo.delete({
        where: {
          id: Number(id),
        },
      });
      return {
        status: true,
        data: del,
      };
    } catch (error) {
      if (config.debug) console.error(`delete todo module error`, error);
      return {
        status: false,
        error,
      };
    }
  };
}

export default new todo();
