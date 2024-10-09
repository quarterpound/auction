import { PrismaClient } from "@prisma/client";
import categories from "./cats.json";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
const prisma = new PrismaClient();

async function createCategories(
  categories: any,
  parentId: string | null = null,
) {
  for await (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        categoryId: parentId?.toString(),
      },
    });

    if (category.children && category.children.length > 0) {
      await createCategories(category.children, createdCategory?.id ?? null);
    }
  }
}

async function createMockUserAndAuctions(): Promise<number> {
  const existing = await prisma.user.findFirst({
    where: {
      email: "test3@example.com",
    },
  });

  if (existing) {
    return 0;
  }

  const user = await prisma.user.create({
    data: {
      name: "test user",
      email: "test3@example.com",
      passwords: {
        create: {
          hash: await bcrypt.hash("123", 10),
        },
      },
      emailVerified: new Date(),
    },
  });

  console.log(user);

  const foundCats = await prisma.category.findMany({
    where: {
      parent: {
        isNot: null,
      },
    },
  });

  console.log(foundCats);

  const images = await prisma.$transaction(
    Array.from({ length: 120 }).map((item) =>
      prisma.asset.create({
        data: {
          name: faker.internet.displayName(),
          url: faker.image.urlPlaceholder({ width: 600, height: 400 }),
          smallUrl: faker.image.urlPlaceholder({ width: 60, height: 40 }),
          width: 600,
          height: 400,
          smallWidth: 60,
          smallHeight: 40,
        },
      }),
    ),
  );

  console.log(images);

  const f = await prisma.$transaction(
    Array.from({ length: 120 }).map((_, i) =>
      prisma.post.create({
        data: {
          name: faker.commerce.productName(),
          priceMin: parseFloat(faker.commerce.price({ min: 10 })),
          bidIncrement: 1,
          slug: faker.lorem.slug({ min: 4, max: 5 }),
          currency: "azn",
          description: faker.lorem.paragraphs({ min: 2, max: 10 }),
          descriptionHtml: faker.lorem.paragraphs({ min: 2, max: 10 }),
          endTime: dayjs()
            .add(Math.random() * 10 + 10, "days")
            .toDate(),
          authorId: user.id,
          categoryId: foundCats[i % foundCats.length]?.id,
          pending: false,
          AssetOnPost: {
            create: {
              assetId: images[i].id,
            },
          },
        },
      }),
    ),
  );

  console.log(f);
  return 0;
}

async function main() {
  await createMockUserAndAuctions();

  const data = await prisma.category.count();

  if (data !== 0) {
    await prisma.$disconnect();
    return 0;
  }
  await createCategories(categories);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
