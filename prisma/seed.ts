import { PrismaClient } from "@prisma/client";
import categories from "./cats.json";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
const prisma = new PrismaClient();

async function createCategories(
  categories: any,
  parentId: number | null = null,
) {
  for await (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        categoryId: parentId,
      },
    });

    if (category.children && category.children.length > 0) {
      await createCategories(category.children, createdCategory.id);
    }
  }
}

async function createMockUserAndAuctions(): Promise<number> {
  const existing = await prisma.user.findFirst({
    where: {
      email: "test@example.com",
    },
  });

  if (existing) {
    return 0;
  }

  const user = await prisma.user.create({
    data: {
      name: "test user",
      email: "test@example.com",
      passwords: {
        create: {
          hash: await bcrypt.hash("123", 123),
        },
      },
      emailVerified: new Date(),
    },
  });

  const cat = await prisma.category.findFirst({
    where: {
      parent: null,
    },
  });

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
          endTime: dayjs().add(12).toDate(),
          authorId: user.id,
          categoryId: cat?.id,
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
