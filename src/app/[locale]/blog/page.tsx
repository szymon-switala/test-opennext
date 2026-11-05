import Link from "next/link";
import { slugs } from "@/common/content";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <ul>
      {slugs.map((slug) => (
        <li key={slug}>
          <Link href={`/${locale}/blog/${slug}`} prefetch={false}>
            {slug}
          </Link>
        </li>
      ))}
    </ul>
  );
}
