import { extendTheme } from "@chakra-ui/react";
import type { GlobalStyleProps } from "@chakra-ui/theme-tools";

import { colors } from "./colors";
import * as components from "./components";
import { config } from "./config";
import { fonts } from "./fonts";

const customTheme = extendTheme({
  fonts,
  colors,
  config,
  breakpoints: {
    sm: "320px",
    md: "768px",
    lg: "960px",
    xl: "1200px",
  },
  components: {
    ...components,
  },
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        bg: props.colorMode === "dark" ? "#101213" : "#fff",
      },
    }),
  },
});

export default customTheme;
