"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, onLoadingStatusChange, ...props }, ref) => {
    const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(
      "loading"
    );

    React.useEffect(() => {
      if (!src || typeof src !== "string") {
        setStatus("error");
        onLoadingStatusChange?.("error");
        return;
      }

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setStatus("loaded");
        onLoadingStatusChange?.("loaded");
      };
      img.onerror = () => {
        setStatus("error");
        onLoadingStatusChange?.("error");
      };
    }, [src, onLoadingStatusChange]);

    if (status !== "loaded") {
      return null;
    }

    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
