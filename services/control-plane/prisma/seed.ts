import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SaaS control plane database...');

  // Upsert default Topup Website product
  const product = await prisma.product.upsert({
    where: { slug: 'topup-website' },
    update: {
      name: 'Topup Website',
      price: 49.0,
      active: true,
    },
    create: {
      name: 'Topup Website',
      slug: 'topup-website',
      price: 49.0,
      active: true,
    },
  });

  console.log(`Product "${product.name}" ready (id: ${product.id}).`);

  // Upsert default ProductVersion 1.0.0
  const version = await prisma.productVersion.upsert({
    where: {
      productId_version: {
        productId: product.id,
        version: '1.0.0',
      },
    },
    update: {
      dockerImageTag: 'topup-template:1.0.0',
      isDefault: true,
    },
    create: {
      productId: product.id,
      version: '1.0.0',
      dockerImageTag: 'topup-template:1.0.0',
      isDefault: true,
    },
  });

  console.log(`Product version "${version.version}" ready (image: ${version.dockerImageTag}).`);
}

main()
  .catch((e) => {
    console.error('Error seeding control plane:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
