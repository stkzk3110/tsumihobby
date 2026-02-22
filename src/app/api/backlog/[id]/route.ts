import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/backlog/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.backlogItem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const {
    status,
    clearTimeMinutes,
    currentEpisode,
    totalEpisodes,
    currentPage,
    totalPages,
    startedAt,
    completedAt,
  } = body;

  const updated = await prisma.backlogItem.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(clearTimeMinutes !== undefined ? { clearTimeMinutes } : {}),
      ...(currentEpisode !== undefined ? { currentEpisode } : {}),
      ...(totalEpisodes !== undefined ? { totalEpisodes } : {}),
      ...(currentPage !== undefined ? { currentPage } : {}),
      ...(totalPages !== undefined ? { totalPages } : {}),
      ...(startedAt !== undefined ? { startedAt: new Date(startedAt) } : {}),
      ...(completedAt !== undefined ? { completedAt: completedAt ? new Date(completedAt) : null } : {}),
      // Auto-set timestamps based on status
      ...(status === "IN_PROGRESS" && !existing.startedAt
        ? { startedAt: new Date() }
        : {}),
      ...(status === "COMPLETED" && !existing.completedAt
        ? { completedAt: new Date() }
        : {}),
    },
  });

  return NextResponse.json({ item: updated });
}

// DELETE /api/backlog/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.backlogItem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.backlogItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
