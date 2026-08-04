import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user?.isAdmin ? user : null;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  const { name, canteenId } = await request.json();
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed || !canteenId) {
    return NextResponse.json({ error: "名称和食堂必填" }, { status: 400 });
  }
  const exists = await prisma.stall.findFirst({
    where: { name: trimmed, canteenId },
  });
  if (exists) {
    return NextResponse.json({ error: `该食堂下已有「${trimmed}」窗口` }, { status: 409 });
  }
  const stall = await prisma.stall.create({ data: { name: trimmed, canteenId } });
  return NextResponse.json(stall);
}

// 删除空窗口（下有菜品时拒绝）
export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  const { id } = await request.json();
  const dishCount = await prisma.dish.count({ where: { stallId: id } });
  if (dishCount > 0) {
    return NextResponse.json(
      { error: `该窗口下还有 ${dishCount} 道菜品，先处理菜品再删窗口` },
      { status: 409 }
    );
  }
  await prisma.stall.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
