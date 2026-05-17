export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          احسب زكاتك بدقة
        </h1>
        <p className="mx-auto max-w-sm text-base text-muted-foreground sm:max-w-md sm:text-lg">
          يغطي جميع أنواع الأصول التسعة — بأسعار ذهب وفضة وعملات محدّثة
          يومياً، وحساب كامل للنصاب
        </p>
      </div>

      <a
        href="/calculator"
        className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        ابدأ الحساب
      </a>

      <p className="text-xs text-muted-foreground">
        بياناتك لا تغادر جهازك
      </p>
    </div>
  );
}
