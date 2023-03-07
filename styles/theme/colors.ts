import type { DeepPartial, Theme } from "@chakra-ui/react";

/** extend additional color here */
const extendedColors: DeepPartial<
  Record<string, Theme["colors"]["blackAlpha"]>
> = {
  spxGray: {
    50: "#14181B",
    100: "#1A1E21",
    200: "#1E2023",
    300: "#2B2E32",
    400: "#4E5359",
    500: "#70899B",
    600: "#A0A7B8",
    700: "#C7D1E0",
    800: "#E5E0EB",
    900: "#F7FBFF",
  },
  spxGrayButton: {
    100: "#131416",
    200: "#232529",
    300: "#3f4147",
    400: "#646871",
    500: "#90949e",
    600: "#b8bdc7",
  },
};

/** override chakra colors here */
const overridenChakraColors: DeepPartial<Theme["colors"]> = {};

export const colors = {
  ...overridenChakraColors,
  ...extendedColors,
};
