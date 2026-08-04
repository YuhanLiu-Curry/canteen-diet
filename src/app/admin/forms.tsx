"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Canteen = { id: string; name: string; stalls: { id: string; name: string }[] };

async function post(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export function AddCanteenForm() {
  const [name, setName] = useState("");
  const [type, setType] = useState("canteen");
  const router = useRouter();

  return (
    <form
      className="flex gap-2 items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await post("/api/admin/canteens", { name, type })) {
          setName("");
          router.refresh();
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
  const router = useRouter();

  return (
    <form
      className="flex gap-2 items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await post("/api/admin/stalls", { name, canteenId })) {
          setName("");
          router.refresh();
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
  const [form, setForm] = useState({
    name: "", kcal: "", proteinG: "", carbsG: "", fatG: "", confidence: "estimated",
  });
  const router = useRouter();

  const stalls = canteens.find((c) => c.id === canteenId)?.stalls ?? [];

  function field(key: keyof typeof form, label: string, w = "flex-1") {
    return (
      <div className={w}>
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <input
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          required
          type={key === "name" ? "text" : "number"}
          step="0.1"
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
        const ok = await post("/api/admin/dishes", {
          name: form.name,
          stallId,
          kcal: Number(form.kcal),
          proteinG: Number(form.proteinG),
          carbsG: Number(form.carbsG),
          fatG: Number(form.fatG),
          confidence: form.confidence,
        });
        if (ok) {
          setForm({ name: "", kcal: "", proteinG: "", carbsG: "", fatG: "", confidence: form.confidence });
          router.refresh();
        }
      }}
    >
      <label className="block text-xs text-gray-500">新增菜品</label>
      <div className="flex gap-2">
        <select
          value={canteenId}
          onChange={(e) => { setCanteenId(e.target.value); setStallId(""); }}
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
          onChange={(e) => setStallId(e.target.value)}
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
      </div>
      <button className="rounded bg-black px-4 py-2 text-white text-sm">添加菜品</button>
    </form>
  );
}

type Correction = {
  id: string;
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
