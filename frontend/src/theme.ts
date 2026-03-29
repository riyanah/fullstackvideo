import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', -apple-system, sans-serif`,
    body: `'Inter', -apple-system, sans-serif`,
    mono: `'JetBrains Mono', 'Fira Code', monospace`,
  },
  colors: {
    brand: {
      50: "#e6fffa",
      100: "#b2f5ea",
      200: "#81e6d9",
      300: "#4fd1c5",
      400: "#38b2ac",
      500: "#319795",
      600: "#2c7a7b",
      700: "#285e61",
      800: "#234e52",
      900: "#1d4044",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "whiteAlpha.900",
      },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: "gray.800",
          borderColor: "gray.700",
          borderWidth: "1px",
        },
      },
    },
  },
});

export default theme;
