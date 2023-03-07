import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import React from "react";
import customTheme from "../styles/theme";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={customTheme}>
			<Component {...pageProps} />
		</ChakraProvider>
	);
}
