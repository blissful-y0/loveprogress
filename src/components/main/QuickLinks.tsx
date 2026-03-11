import Image from "next/image";
import Link from "next/link";

const QUICK_LINKS = [
  {
    id: 1,
    icon: "/img/main/footer/twitter_1.png",
    alt: "Twitter",
    href: "https://x.com/phainaxa_event",
    external: true,
  },
  {
    id: 2,
    icon: "/img/main/footer/home.png",
    alt: "Home",
    href: "/",
    external: false,
  },
];

export default function QuickLinks() {
  return (
    <section className="w-full border-t border-border-light bg-bg-light">
      <div className="mx-auto max-w-[1280px] px-4 py-3 flex items-center justify-center gap-6">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <div className="relative w-[28px] h-[28px]">
              <Image
                src={link.icon}
                alt={link.alt}
                fill
                className="object-contain"
                sizes="28px"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
