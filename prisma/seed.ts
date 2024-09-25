import { PrismaClient } from "@prisma/client";
import categories from "./cats.json";
const prisma = new PrismaClient();

async function createCategories(
  categories: any,
  parentId: number | null = null,
) {
  const data = await prisma.category.count();

  if (data !== 0) {
    await prisma.$disconnect();
    return 0;
  }

  for (const category of categories) {
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

async function main() {
  await createCategories(categories);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
