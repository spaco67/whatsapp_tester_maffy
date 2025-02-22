"use client";

import { TamaguiProvider, Theme } from "tamagui";
import config from "../tamagui.config";
import { NextThemeProvider, useRootTheme } from "@tamagui/next-theme";

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useRootTheme();

  return (
    <NextThemeProvider onChangeTheme={setTheme}>
      <TamaguiProvider config={config} defaultTheme={theme}>
        <Theme name={theme}>{children}</Theme>
      </TamaguiProvider>
    </NextThemeProvider>
  );
}
