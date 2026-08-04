"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Dish = {
  id: string;
  name: string;
  kcal: number;
  proteinG: number;
  stall: { name: string; canteen: { name: string } };
};

const MEALS = [
  { value: "breakfast", label: "早餐" },
  { value: "lunch", label: "午餐" },
  { value: "dinner", label: "晚餐" },
  { value: "snack", label: "加餐" },
];

const SERVINGS = [0.5, 1, 1.5, 2];

export default function AddRecordPage() {
  const [query, setQuery] = useState("");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selected, setSelected] = useState<Dish | null>(null);
  const [mealType, setMealType] = useState("lunch");
  const [servings, setServings] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch(`/api/dishes?q=${encodeURIComponent(query)}`);
      setDishes(await res.json());
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);
    await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishId: selected.id, mealType, servings }),
    });
    router.push("/");
    router.refresh();
  }

  // 第二步：选分量/餐次
  if (selected) {
    return (
      <main className="min-h-screen pb-8">
        <div className="mx-auto w-full max-w-md px-4 space-y-6 pt-6">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-400">
            ← 重选菜品
          </button>

          <div className="rounded-3xl bg-white shadow-sm p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{selected.name}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {selected.stall.canteen.name} {selected.stall.name}
            </p>
            <p className="text-brand font-semibold mt-2">
              {Math.round(selected.kcal)} kcal / 份
            </p>
          </div>

          <div className="rounded-3xl bg-white shadow-sm p-5">
            <label className="block text-sm font-medium mb-3">餐次</label>
            <div className="grid grid-cols-4 gap-2">
              {MEALS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMealType(m.value)}
                  className={`rounded-xl py-2.5 text-sm font-medium transition ${
                    mealType === m.value
                      ? "bg-brand text-white"
                      : "bg-gray-50 text-gray-600"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-sm p-5">
            <label className="block text-sm font-medium mb-3">分量</label>
            <div className="grid grid-cols-4 gap-2">
              {SERVINGS.map((s) => (
                <button
                  key={s}
                  onClick={() => setServings(s)}
                  className={`rounded-xl py-2.5 text-sm font-medium transition ${
                    servings === s ? "bg-brand text-white" : "bg-gray-50 text-gray-600"
                  }`}
                >
                  {s} 份
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-brand-soft p-4 text-center">
            <span className="text-brand-dark font-semibold">
              本餐 {Math.round(selected.kcal * servings)} kcal · 蛋白质{" "}
              {Math.round(selected.proteinG * servings)}g
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-brand py-4 text-white font-semibold shadow-lg active:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "记录中…" : "确认记录"}
          </button>
        </div>
      </main>
    );
  }

  // 第一步：搜菜
  return (
    <main className="min-h-screen pb-8">
      <div className="mx-auto w-full max-w-md px-4 space-y-4 pt-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-gray-400">←</button>
          <h1 className="text-xl font-bold">记一餐</h1>
        </div>
        <input
          autoFocus
          type="search"
          placeholder="搜索菜品，如：鸡腿"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl border-0 bg-white shadow-sm px-4 py-3.5 text-lg focus:ring-2 focus:ring-brand outline-none"
        />
        <div className="space-y-2">
          {dishes.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className="w-full flex items-center justify-between rounded-2xl bg-white shadow-sm px-4 py-3.5 text-left active:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{d.name}</p>
                <p className="text-xs text-gray-400">
                  {d.stall.canteen.name} {d.stall.name}
                </p>
              </div>
              <span className="text-sm font-semibold text-brand">
                {Math.round(d.kcal)} kcal
              </span>
            </button>
          ))}
          {dishes.length === 0 && query && (
            <p className="text-sm text-gray-400 text-center pt-8">
              没找到「{query}」——菜品库还在建设中
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
