import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'dashboard',
  'checkout',
  'login',
  'logout',
  'order',
  'orders',
  'pricing',
  'provision',
  'provisioning',
  'root',
  'static',
  'traefik',
  'webhook',
  'webhooks',
  'www',
]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug')?.toLowerCase().trim();

    if (!slug) {
      return NextResponse.json(
        { available: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 2 || slug.length > 64) {
      return NextResponse.json(
        {
          available: false,
          error: 'Slug must be 2-64 characters with lowercase letters, numbers, and hyphens only.',
        },
        { status: 200 }
      );
    }

    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json(
        { available: false, error: `"${slug}" is a reserved system path.` },
        { status: 200 }
      );
    }

    const existingSite = await prisma.site.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingSite) {
      return NextResponse.json(
        { available: false, error: `The store slug "${slug}" is already taken.` },
        { status: 200 }
      );
    }

    return NextResponse.json({
      available: true,
      slug,
      message: `Store slug "${slug}" is available!`,
    });
  } catch (err: any) {
    console.error('[GET /api/sites/check-slug] Error:', err);
    return NextResponse.json(
      { available: false, error: 'Failed to verify slug availability' },
      { status: 500 }
    );
  }
}
