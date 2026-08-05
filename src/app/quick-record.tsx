"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Dish = {
  id: string;
  name: string;
  kcal: number;
  servingDesc?: string | null;
  stall: { name: string; canteen: { name: string } };
};

const MEAL_LABEL: Record<string, string> = {
  breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐",
};

export function QuickRecord() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [mealType, setMealType] = useState("lunch");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/records/recent").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setDishes(d);
    });
  }, []);

  async function quickAdd(dishId: string) {
    setLoadingId(dishId);
    await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishId, mealType, servings: 1 }),
    });
    setLoadingId(null);
    router.refresh();
  }

  if (dishes.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">快捷再记</h2>
        <div className="flex gap-1">
          {Object.entries(MEAL_LABEL).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setMealType(v)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                mealType === v ? "bg-brand text-white" : "bg-white text-gray-500"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dishes.map((d) => (
          <button
            key={d.id}
            onClick={() => quickAdd(d.id)}
            disabled={loadingId === d.id}
            className="shrink-0 rounded-2xl bg-white shadow-sm px-4 py-3 text-left active:bg-gray-50 disabled:opacity-50"
          >
            <p className="font-medium text-gray-900 text-sm whitespace-nowrap">{d.name}</p>
            <p className="text-xs text-brand font-semibold">{Math.round(d.kcal)} kcal</p>
          </button>
        ))}
      </div>
    </div>
  );
}
