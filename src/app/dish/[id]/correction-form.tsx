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

  const inputCls =
    "w-full rounded-xl border-0 bg-gray-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand outline-none";

  if (submitted) {
    return (
      <div className="rounded-2xl bg-brand-soft px-4 py-4 text-center text-sm text-brand-dark font-medium">
        已提交纠错，感谢！管理员审核后会更新数据。
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-white shadow-sm py-3 text-sm text-gray-500"
      >
        数据不对？提交纠错
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-white shadow-sm p-5 space-y-4">
      <p className="font-semibold text-sm">纠错「{dishName}」</p>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">哪个数据有问题</label>
        <select value={field} onChange={(e) => setField(e.target.value)} className={inputCls}>
          {FIELDS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {field !== "existence" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">当前值</label>
            <input value={oldValue} onChange={(e) => setOldValue(e.target.value)} placeholder="如 220" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">你认为的正确值</label>
            <input value={newValue} onChange={(e) => setNewValue(e.target.value)} required placeholder="如 180" className={inputCls} />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">理由（选填）</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="如：我问了窗口阿姨，一份其实只有 150g"
          rows={2}
          className={inputCls}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-brand py-2.5 text-white text-sm font-medium active:bg-brand-dark disabled:opacity-50"
        >
          {loading ? "提交中…" : "提交纠错"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-600"
        >
          取消
        </button>
      </div>
    </form>
  );
}
