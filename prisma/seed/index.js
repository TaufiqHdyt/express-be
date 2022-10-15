import db from '#helper/db.mjs';

import { roleData } from './data/auth/roles.mjs';
import { userData } from './data/auth/users.mjs';

import { quoteData } from './data/dashboard/masterData/quotes.mjs';

import m$role from '#module/dashboard/role.m.mjs';
import m$user from '#module/dashboard/user.m.mjs';

import m$quote from '#module/dashboard/masterData/quote.m.mjs';

async function main() {
  console.log(`Start seeding ...`);
  const createdData = {
    role: [],
    user: [],
    quote: [],
  };
  for (const r of roleData) {
    console.log(r);
    const { data } = await m$role.add({ ...r });
    createdData.role.push(data.name);
  }
  for (const u of userData) {
    const { data } = await m$user.add({ ...u });
    createdData.user.push(data.name);
  }
  for (const q of quoteData) {
    const { data } = await m$quote.add({ ...q });
    createdData.quote.push(data.id);
  }
  console.log(createdData);
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
