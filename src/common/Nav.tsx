import Link from "next/link";
import Logo from "@/assets/icons/logo.svg";

const items = [
  ["", "Start"],
  ["/o-nas", "O nas"],
  ["/oferta", "Oferta"],
  ["/blog", "Blog"],
  ["/kontakt", "Kontakt"],
] as const;

interface NavProps {
  locale: string;
}

export function Nav({ locale }: NavProps) {
  return (
    <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Logo aria-hidden />
      {items.map(([href, label]) => (
        <Link key={href} href={`/${locale}${href}`} prefetch={false}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
