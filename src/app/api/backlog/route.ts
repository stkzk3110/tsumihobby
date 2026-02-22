import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItemType, ItemStatus } from "@/generated/prisma/client";

// GET /api/backlog
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") as ItemType | null;
  const status = searchParams.get("status") as ItemStatus | null;

  const items = await prisma.backlogItem.findMany({
    where: {
      userId: session.user.id,
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json({ items });
}

// POST /api/backlog
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, title, imageUrl, externalId, description, metadata } = body;

  if (!type || !title) {
    return NextResponse.json({ error: "type and title are required" }, { status: 400 });
  }

  // Upsert: avoid duplicates by externalId + type
  const item = await prisma.backlogItem.upsert({
    where: {
      userId_externalId_type: {
        userId: session.user.id,
        externalId: externalId ?? title,
        type,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      type,
      title,
      imageUrl: imageUrl ?? null,
      externalId: externalId ?? title,
      description: description ?? null,
      metadata: metadata ?? undefined,
      status: "BACKLOG",
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
