/**
 * scripts/seed.ts — Seed Default Products and Versions for Control Plane
 */
import { prisma } from '../lib/prisma';

async function main() {
  console.log('==================================================');
  console.log('      CONTROL PLANE SEED INITIALIZATION           ');
  console.log('==================================================');

  // 1. Create or Update Default Free Product
  const product = await prisma.product.upsert({
    where: { slug: 'topup-store' },
    update: {
      name: 'Top-Up Game Store Template',
      price: 0.0,
      active: true,
    },
    create: {
      name: 'Top-Up Game Store Template',
      slug: 'topup-store',
      price: 0.0,
      active: true,
    },
  });

  console.log(`✓ Product ready: "${product.name}" (Price: $${product.price}) (ID: ${product.id})`);

  // 2. Create or Update Default Product Version
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

  console.log(`✓ Version ready: v${version.version} (Docker Tag: ${version.dockerImageTag})`);
  console.log('==================================================');
  console.log('  ✓ Control plane seeding completed successfully');
  console.log('==================================================');
}

main()
  .catch((err) => {
    console.error('✗ Seeding failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
