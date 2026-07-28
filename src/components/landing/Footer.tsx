import Link from "next/link";
import { brand } from "@/data/content";
import {
  CalendarDays,
  AtSign,
  LayoutDashboard,
  MapPin,
  Phone,
  Sparkles,
  Users,
} from "@/lib/icons";

const nav = [
  { href: "/#servicos", label: "Serviços", icon: Sparkles },
  { href: "/#equipe", label: "Equipe", icon: Users },
  { href: "/agendar", label: "Agendar", icon: CalendarDays },
  { href: "/dashboard", label: "Área da clínica", icon: LayoutDashboard },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--nude-deep)] px-5 py-14 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="display text-3xl tracking-[0.12em] text-[var(--gold)]">
            {brand.monogram}
          </p>
          <p className="display mt-3 text-xl text-[var(--chocolate)]">
            {brand.name}
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            {brand.subtitle}
          </p>
          <p className="script mt-6 text-2xl text-[var(--gold)]">
            {brand.tagline}
          </p>
        </div>

        <div>
          <p className="eyebrow">Navegação</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 text-sm text-[var(--brown)] no-underline hover:text-[var(--chocolate)]"
              >
                <Icon size={14} strokeWidth={1.7} className="text-[var(--gold-dim)]" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">Contato</p>
          <div className="mt-4 space-y-3 text-sm text-[var(--brown)]">
            <p className="inline-flex items-start gap-2">
              <MapPin size={14} strokeWidth={1.7} className="mt-0.5 shrink-0 text-[var(--gold-dim)]" />
              {brand.address.full}
            </p>
            <p className="inline-flex items-center gap-2">
              <Phone size={14} strokeWidth={1.7} className="text-[var(--gold-dim)]" />
              {brand.phone}
            </p>
            <a
              href={brand.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[var(--chocolate)] underline-offset-4 hover:underline"
            >
              <AtSign size={14} strokeWidth={1.7} className="text-[var(--gold-dim)]" />
              @{brand.instagram.split("/").filter(Boolean).pop()}
            </a>
          </div>
        </div>
      </div>
      <div className="gold-line mx-auto mt-12 max-w-7xl" />
      <p className="mx-auto mt-6 max-w-7xl text-center text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">
        © {new Date().getFullYear()} {brand.fullName}
      </p>
    </footer>
  );
}
