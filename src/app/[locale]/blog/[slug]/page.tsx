import { Article } from "@/common/Article";
import { slugs } from "@/common/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Article title={`Wpis: ${slug}`} length={60} />;
}
