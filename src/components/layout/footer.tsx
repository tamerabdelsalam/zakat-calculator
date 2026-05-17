import { ShieldCheck } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-muted/30 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-4 text-center text-xs text-muted-foreground">
        {/* Religious disclaimer */}
        <p className="leading-relaxed">
          هذه الحاسبة تغطي الحالات العامة والشائعة.{" "}
          يرجى التواصل مع جهة أو دار فتوى شرعية حتى تتحقق من شروط وضوابط
          الزكاة الواجبة.
        </p>

        {/* Privacy signal */}
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>بياناتك لا تغادر جهازك — جميع الحسابات تتم في المتصفح</span>
        </div>

        <p>© {year} حاسبة الزكاة</p>
      </div>
    </footer>
  );
}
