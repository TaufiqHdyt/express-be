import { AuthController } from '#controller/auth.c.mjs';
import { DropdownController } from '#controller/dropdown.c.mjs';

const baseRoutesArray = [['auth', AuthController]];

const apiRoutesArray = [['dropdown', DropdownController]];

const routes = (app) => {
  baseRoutesArray.forEach(([url, controller]) =>
    app.use(`/${url}`, controller)
  );
  apiRoutesArray.forEach(([url, controller]) =>
    app.use(`/api/${url}`, controller)
  );
};

export { routes };
