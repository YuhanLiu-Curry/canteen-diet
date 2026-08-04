"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "注册失败");
      return;
    }

    // 注册成功后自动登录
    const login = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (login?.error) {
      router.push("/login");
    } else {
      router.push("/onboarding");
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">注册</h1>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <input
          type="text"
          placeholder="昵称（选填）"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          type="password"
          placeholder="密码（至少 6 位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {loading ? "注册中…" : "注册"}
        </button>
        <p className="text-sm text-center text-gray-500">
          已有账号？<Link href="/login" className="underline">去登录</Link>
        </p>
      </form>
    </main>
  );
}
