"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * next-themes injects a blocking <script> to prevent theme flash.
 * React 19 warns when that script re-renders on the client — mark it
 * non-executable consistently (SSR + client). The real blocking script
 * lives in root layout.tsx.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      scriptProps={{ type: "application/json", suppressHydrationWarning: true }}
    >
      {children}
    </NextThemesProvider>
  );
}
