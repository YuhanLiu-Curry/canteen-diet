import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 创建食堂（含便利店 type=convenience_store）
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { name, type } = await request.json();
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) return NextResponse.json({ error: "名称必填" }, { status: 400 });

  const exists = await prisma.canteen.findFirst({ where: { name: trimmed } });
  if (exists) {
    return NextResponse.json({ error: `「${trimmed}」已存在` }, { status: 409 });
  }

  const canteen = await prisma.canteen.create({
    data: { name: trimmed, type: type ?? "canteen" },
  });
  return NextResponse.json(canteen);
}

// 删除空食堂（下有菜品时拒绝，防历史记录断裂）
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await request.json();
  const dishCount = await prisma.dish.count({
    where: { stall: { canteenId: id } },
  });
  if (dishCount > 0) {
    return NextResponse.json(
      { error: `该食堂下还有 ${dishCount} 道菜品，先处理菜品再删食堂` },
      { status: 409 }
    );
  }
  await prisma.canteen.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const canteens = await prisma.canteen.findMany({
    include: { stalls: { include: { dishes: true } } },
  });
  return NextResponse.json(canteens);
}
