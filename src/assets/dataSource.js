// You do not need to change anything in this file

import { faker } from "@faker-js/faker";

function generateAvatar() {
  return `https://i.pravatar.cc/96?u=${faker.string.uuid()}`;
}

function generateContact() {
  return {
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    phone: faker.phone.number(),
    avatar: generateAvatar(),
    email: faker.internet.email(),
    address: faker.location.city(),
  };
}

export const contacts = Array.from(new Array(100), () => generateContact());
