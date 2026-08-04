"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FIELDS = [
  { value: "kcal", label: "热量" },
  { value: "proteinG", label: "蛋白质" },
  { value: "carbsG", label: "碳水" },
  { value: "fatG", label: "脂肪" },
  { value: "existence", label: "菜品不存在/已下架" },
];

export function CorrectionForm({
  dishId,
  dishName,
}: {
  dishId: string;
  dishName: string;
}) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState("kcal");
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/corrections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishId, field, oldValue, newValue, reason }),
    });
    setLoading(false);
    setSubmitted(true);
    router.refresh();
  }

  if (submitted) {
    return (
      <div className="rounded border border-green-200 bg-green-50 px-3 py-3 text-center text-sm">
        已提交纠错，感谢！管理员审核后会更新数据。
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded border py-2 text-sm text-gray-500"
      >
        数据不对？提交纠错
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded border p-4 space-y-3">
      <p className="font-medium text-sm">纠错「{dishName}」</p>

      <div>
        <label className="block text-xs text-gray-500 mb-1">哪个数据有问题</label>
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="w-full rounded border px-2 py-2 text-sm"
        >
          {FIELDS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {field !== "existence" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">当前值</label>
            <input
              value={oldValue}
              onChange={(e) => setOldValue(e.target.value)}
              placeholder="如 220"
              className="w-full rounded border px-2 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">你认为的正确值</label>
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
              placeholder="如 180"
              className="w-full rounded border px-2 py-2 text-sm"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-500 mb-1">理由（选填）</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="如：我问了窗口阿姨，一份其实只有 150g"
          rows={2}
          className="w-full rounded border px-2 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded bg-black py-2 text-white text-sm disabled:opacity-50"
        >
          {loading ? "提交中…" : "提交纠错"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border px-4 py-2 text-sm"
        >
          取消
        </button>
      </div>
    </form>
  );
}
