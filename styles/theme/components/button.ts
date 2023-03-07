import type { ComponentStyleConfig } from "@chakra-ui/react";

export const Button: ComponentStyleConfig = {
  baseStyle: {
    // borderRadius: "full",
    color: "white",
  },
  variants: {
    whitePrimary: {
      bg: "white",
      color: "black",
      _hover: {
        bg: "whiteAlpha.800",
      },
      _disabled: {
        bg: "spxGray.300",
        opacity: 0.9,
        color: "spxGray.400",
        _hover: {
          bg: "spxGray.300 !important",
        },
      },
      _active: {
        bg: "whiteAlpha.700",
      },
    },
    greenPrimary: {
      bg: "#25a27a",
      color: "#fff",
      _hover: {
        bg: "#2aba8c",
      },
      _active: {
        bg: "#30c193",
      },
      _disabled: {
        bg: "spxGray.300",
        opacity: 0.9,
        color: "spxGray.400",
        _hover: {
          bg: "spxGray.300 !important",
        },
      },
    },
    redPrimary: {
      bg: "#e84143",
      color: "#fff",
      _hover: {
        bg: "#fc5355",
      },
      _active: {
        bg: "#fb696b",
      },
      _disabled: {
        bg: "spxGray.300",
        opacity: 0.9,
        color: "spxGray.400",
        _hover: {
          bg: "spxGray.300 !important",
        },
      },
    },
  },
};
