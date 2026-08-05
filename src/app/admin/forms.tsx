"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Canteen = { id: string; name: string; stalls: { id: string; name: string }[] };

async function post(url: string, body: object): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({}));
  return { ok: false, error: data.error ?? "操作失败" };
}

export function AddCanteenForm() {
  const [name, setName] = useState("");
  const [type, setType] = useState("canteen");
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <form
      className="flex gap-2 items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await post("/api/admin/canteens", { name, type });
        if (r.ok) {
          setName("");
          setError("");
          router.refresh();
        } else {
          setError(r.error ?? "");
        }
      }}
    >
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">新增食堂/便利店</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="如 五食堂 / 罗森（鼓楼店）"
          className="w-full rounded border px-2 py-2 text-sm"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="rounded border px-2 py-2 text-sm"
      >
        <option value="canteen">食堂</option>
        <option value="convenience_store">便利店</option>
      </select>
      <button className="rounded bg-black px-4 py-2 text-white text-sm">添加</button>
    </form>
  );
}

export function AddStallForm({ canteens }: { canteens: Canteen[] }) {
  const [name, setName] = useState("");
  const [canteenId, setCanteenId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <form
      className="flex gap-2 items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await post("/api/admin/stalls", { name, canteenId });
        if (r.ok) {
          setName("");
          setError("");
          router.refresh();
        } else {
          setError(r.error ?? "");
        }
      }}
    >
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">新增窗口/品类</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="如 川湘窗口 / 饭团"
          className="w-full rounded border px-2 py-2 text-sm"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <select
        value={canteenId}
        onChange={(e) => setCanteenId(e.target.value)}
        required
        className="rounded border px-2 py-2 text-sm"
      >
        <option value="">所属食堂</option>
        {canteens.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button className="rounded bg-black px-4 py-2 text-white text-sm">添加</button>
    </form>
  );
}

export function AddDishForm({ canteens }: { canteens: Canteen[] }) {
  const [canteenId, setCanteenId] = useState("");
  const [stallId, setStallId] = useState("");
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [lastAdded, setLastAdded] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", kcal: "", proteinG: "", carbsG: "", fatG: "", confidence: "estimated", servingDesc: "",
  });
  const router = useRouter();

  const stalls = canteens.find((c) => c.id === canteenId)?.stalls ?? [];
  const locked = stallId !== ""; // 已选窗口后进入批量模式，锁定食堂/窗口

  function field(key: keyof typeof form, label: string, w = "flex-1", optional = false) {
    return (
      <div className={w}>
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <input
          ref={key === "name" ? nameRef : undefined}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          required={!optional}
          type={key === "name" || key === "servingDesc" ? "text" : "number"}
          step="0.1"
          placeholder={key === "servingDesc" ? "如 1根35g（空=按100g）" : ""}
          className="w-full rounded border px-2 py-2 text-sm"
        />
      </div>
    );
  }

  return (
    <form
      className="rounded border p-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await post("/api/admin/dishes", {
          name: form.name,
          stallId,
          kcal: Number(form.kcal),
          proteinG: Number(form.proteinG),
          carbsG: Number(form.carbsG),
          fatG: Number(form.fatG),
          confidence: form.confidence,
          servingDesc: form.servingDesc,
        });
        if (r.ok) {
          setLastAdded(form.name);
          setCount((n) => n + 1);
          setError("");
          // 批量模式：保留食堂/窗口/置信度，清空菜名/营养值/规格
          setForm({ name: "", kcal: "", proteinG: "", carbsG: "", fatG: "", confidence: form.confidence, servingDesc: "" });
          nameRef.current?.focus();
          router.refresh();
        } else {
          setError(r.error ?? "");
        }
      }}
    >
      <div className="flex items-center justify-between">
        <label className="block text-xs text-gray-500">批量录入菜品</label>
        {count > 0 && (
          <span className="text-xs text-brand-dark">
            已录 {count} 道{lastAdded ? `，刚录「${lastAdded}」` : ""}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <select
          value={canteenId}
          onChange={(e) => { setCanteenId(e.target.value); setStallId(""); setCount(0); }}
          required
          className="rounded border px-2 py-2 text-sm"
        >
          <option value="">食堂</option>
          {canteens.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={stallId}
          onChange={(e) => { setStallId(e.target.value); setCount(0); }}
          required
          className="rounded border px-2 py-2 text-sm"
        >
          <option value="">窗口</option>
          {stalls.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={form.confidence}
          onChange={(e) => setForm({ ...form, confidence: e.target.value })}
          className="rounded border px-2 py-2 text-sm"
        >
          <option value="estimated">估算</option>
          <option value="calibrated">已校准</option>
          <option value="label">包装标签</option>
        </select>
      </div>
      <div className="flex gap-2">
        {field("name", "菜名", "flex-[2]")}
        {field("kcal", "kcal")}
        {field("proteinG", "蛋白质g")}
        {field("carbsG", "碳水g")}
        {field("fatG", "脂肪g")}
        {field("servingDesc", "规格(可空)", "flex-[1.5]", true)}
      </div>
      <button className="rounded bg-black px-4 py-2 text-white text-sm">
        {locked ? "添加并继续下一道" : "添加菜品"}
      </button>
    </form>
  );
}

type CanteenFull = {
  id: string;
  name: string;
  type: string;
  stalls: { id: string; name: string; dishes: { id: string }[] }[];
};

export function DeleteManager({ canteens }: { canteens: CanteenFull[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function del(url: string, id: string) {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setError("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "删除失败");
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-500">{error}</p>}
      {canteens.map((c) => {
        const totalDishes = c.stalls.reduce((n, s) => n + s.dishes.length, 0);
        return (
          <div key={c.id} className="rounded border p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {c.name}
                <span className="text-xs text-gray-400 ml-2">{totalDishes} 道菜</span>
              </span>
              {totalDishes === 0 && (
                <button
                  onClick={() => del("/api/admin/canteens", c.id)}
                  className="text-xs text-red-500"
                >
                  删除
                </button>
              )}
            </div>
            {c.stalls.map((s) => (
              <div key={s.id} className="flex items-center justify-between pl-3 text-sm text-gray-500">
                <span>
                  {s.name}
                  <span className="text-xs text-gray-400 ml-2">{s.dishes.length} 道菜</span>
                </span>
                {s.dishes.length === 0 && (
                  <button
                    onClick={() => del("/api/admin/stalls", s.id)}
                    className="text-xs text-red-500"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

type Correction = {  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string | null;
  dish: { id: string; name: string };
  user: { email: string; nickname: string | null };
};

export function CorrectionQueue({ corrections }: { corrections: Correction[] }) {
  const router = useRouter();

  async function review(id: string, action: "approve" | "reject") {
    await fetch(`/api/admin/corrections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  if (corrections.length === 0) {
    return <p className="text-sm text-gray-400">暂无待审核纠错</p>;
  }

  return (
    <div className="space-y-2">
      {corrections.map((c) => (
        <div key={c.id} className="rounded border p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              {c.dish.name} · {c.field}
            </span>
            <span className="text-gray-400 text-xs">
              {c.user.nickname ?? c.user.email}
            </span>
          </div>
          {c.field !== "existence" ? (
            <p className="text-sm">
              {c.oldValue || "?"} → <span className="font-medium">{c.newValue}</span>
            </p>
          ) : (
            <p className="text-sm text-red-500">用户反馈：菜品不存在/已下架</p>
          )}
          {c.reason && <p className="text-xs text-gray-500">理由：{c.reason}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => review(c.id, "approve")}
              className="rounded bg-black px-3 py-1 text-white text-xs"
            >
              通过（更新数据）
            </button>
            <button
              onClick={() => review(c.id, "reject")}
              className="rounded border px-3 py-1 text-xs"
            >
              驳回
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
