import { prisma } from "@/lib/prisma";

// 系统级容器：所有个人自定义菜挂在同一个特殊食堂/窗口下，用 Dish.userId 区分归属
const PERSONAL_CANTEEN = "__personal__";
const PERSONAL_STALL = "__personal__";

export async function getPersonalStallId(): Promise<string> {
  let canteen = await prisma.canteen.findFirst({ where: { name: PERSONAL_CANTEEN } });
  if (!canteen) {
    canteen = await prisma.canteen.create({
      data: { name: PERSONAL_CANTEEN, type: "canteen" },
    });
  }
  let stall = await prisma.stall.findFirst({
    where: { name: PERSONAL_STALL, canteenId: canteen.id },
  });
  if (!stall) {
    stall = await prisma.stall.create({
      data: { name: PERSONAL_STALL, canteenId: canteen.id },
    });
  }
  return stall.id;
}

// 公共菜 + 指定用户个人菜的查询条件
export function dishVisibleTo(userId: string | null) {
  return userId
    ? { OR: [{ userId: null }, { userId }] }
    : { userId: null };
}
