import type { ReactNode } from "react";
import { Counter } from "@/common/Counter";
import { locales } from "@/common/content";
import { Nav } from "@/common/Nav";

export const dynamic = "error";
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale}>
      <body style={{ maxWidth: 760, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
        <Nav locale={locale} />
        <Counter />
        {children}
      </body>
    </html>
  );
}
