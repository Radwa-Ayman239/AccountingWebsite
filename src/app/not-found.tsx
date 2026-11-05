import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">الصفحة غير موجودة | Page Not Found</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.
      </p>
      <Link href="/dashboard">
        <Button>العودة للرئيسية (Back to Home)</Button>
      </Link>
    </div>
  );
}
