import Image from "next/image";
import Link from "next/link";

const logos = {
  navbar: { src: "/logos/navbar-logo.png", width: 180, height: 48 },
  footer: { src: "/logos/footer-logo.png", width: 200, height: 56 },
  small: { src: "/logos/small-logo.png", width: 120, height: 40 },
} as const;

type LogoVariant = keyof typeof logos;

interface BrandLogoProps {
  variant: LogoVariant;
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export default function BrandLogo({
  variant,
  href,
  className = "",
  imageClassName = "",
  priority = false,
}: BrandLogoProps) {
  const { src, width, height } = logos[variant];

  const image = (
    <Image
      src={src}
      alt="SEROVA"
      width={width}
      height={height}
      className={`object-contain object-left ${imageClassName}`}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link href={href} className={`inline-flex items-center ${className}`}>
        {image}
      </Link>
    );
  }

  return <span className={`inline-flex items-center ${className}`}>{image}</span>;
}
