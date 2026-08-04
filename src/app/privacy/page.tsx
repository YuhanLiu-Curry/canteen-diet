export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md space-y-4 pt-8 text-sm leading-6">
        <h1 className="text-xl font-bold">隐私政策</h1>
        <p>更新日期：2026-08-04</p>

        <h2 className="font-semibold pt-2">我们收集什么</h2>
        <p>
          注册时收集你的邮箱、昵称；使用时收集你主动填写的身高、体重、目标体重、
          性别、年龄，以及你的饮食记录。
        </p>

        <h2 className="font-semibold pt-2">用于什么</h2>
        <p>
          上述数据仅用于计算你的每日热量目标并展示饮食记录，不会用于任何其他用途，
          不会出售或分享给第三方。
        </p>

        <h2 className="font-semibold pt-2">你的权利</h2>
        <p>
          你可以随时停止使用。如需删除账号及全部数据，请联系我们，我们将在 7 天内处理。
        </p>

        <h2 className="font-semibold pt-2">数据安全</h2>
        <p>
          密码经 bcrypt 加密存储，我们无法查看你的明文密码。身高体重等数据仅本人可见。
        </p>
      </div>
    </main>
  );
}
