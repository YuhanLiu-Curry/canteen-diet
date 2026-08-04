// Mifflin-St Jeor 公式
export function calcTDEE(params: {
  gender: string;
  heightCm: number;
  weightKg: number;
  age: number;
}): number {
  const { gender, heightCm, weightKg, age } = params;
  const bmr =
    10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "male" ? 5 : -161);
  // 学生日常活动系数取 1.4（轻度活动）
  return Math.round(bmr * 1.4);
}

// 减脂速度对应每日缺口
export function calcDailyTarget(tdee: number, pace: string): number {
  const deficit = pace === "aggressive" ? 500 : 300;
  // 底线：不低于 1200 kcal
  return Math.max(tdee - deficit, 1200);
}
