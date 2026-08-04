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

  // 第二步：选完菜 → 选分量/餐次
  if (selected) {
    return (
      <main className="flex min-h-screen flex-col items-center p-4">
        <div className="w-full max-w-md space-y-6 pt-6">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-400">
            ← 重选菜品
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{selected.name}</h1>
            <p className="text-sm text-gray-500">
              {selected.stall.canteen.name} {selected.stall.name} ·{" "}
              {Math.round(selected.kcal)} kcal/份
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">餐次</label>
            <div className="grid grid-cols-4 gap-2">
              {MEALS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMealType(m.value)}
                  className={`rounded border py-2 text-sm ${
                    mealType === m.value ? "bg-black text-white" : ""
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">分量</label>
            <div className="grid grid-cols-4 gap-2">
              {SERVINGS.map((s) => (
                <button
                  key={s}
                  onClick={() => setServings(s)}
                  className={`rounded border py-2 text-sm ${
                    servings === s ? "bg-black text-white" : ""
                  }`}
                >
                  {s} 份
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-lg font-medium">
            本餐 {Math.round(selected.kcal * servings)} kcal · 蛋白质{" "}
            {Math.round(selected.proteinG * servings)}g
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded bg-black py-3 text-white font-medium disabled:opacity-50"
          >
            {loading ? "记录中…" : "确认记录"}
          </button>
        </div>
      </main>
    );
  }

  // 第一步：搜菜
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md space-y-4 pt-6">
        <h1 className="text-xl font-bold">记一餐</h1>
        <input
          autoFocus
          type="search"
          placeholder="搜索菜品，如：鸡腿"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded border px-3 py-3 text-lg"
        />
        <div className="space-y-2">
          {dishes.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className="w-full flex items-center justify-between rounded border px-3 py-3 text-left"
            >
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-gray-500">
                  {d.stall.canteen.name} {d.stall.name}
                </p>
              </div>
              <span className="text-sm text-gray-600">
                {Math.round(d.kcal)} kcal
              </span>
            </button>
          ))}
          {dishes.length === 0 && query && (
            <p className="text-sm text-gray-400 text-center pt-4">
              没找到「{query}」——菜品库还在建设中
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
