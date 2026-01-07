import NextLink from "next/link";
import { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof NextLink>;

export default function Link({ href, prefetch = true, ...props }: LinkProps) {
  return <NextLink href={href} prefetch={prefetch} {...props} />;
}
