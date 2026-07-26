import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  priority?: boolean;
};

export function Logo({
  href = "/",
  className = "h-8 w-auto",
  priority = false,
}: LogoProps) {
  const image = (
    <Image
      src="/brand/logo.svg"
      alt="Mitoonito میتونی‌تو"
      width={180}
      height={40}
      className={className}
      priority={priority}
    />
  );

  if (!href) return image;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="میتونی‌تو">
      {image}
    </Link>
  );
}
