"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteRecordButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/records/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-gray-300 hover:text-red-500"
    >
      删
    </button>
  );
}
