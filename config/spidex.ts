export const isTest = (host: string | null) => host && host.includes("test");

export const spidex = (host: string | null) => {
	if (host) {
		return {
			chainId: isTest(host) ? "0x2406" : "0x2397",
			chainName: `Spidex ${isTest(host) ? "Testnet" : "Devnet"}`,
			nativeCurrency: {
				name: "SPX",
				decimals: 18,
				symbol: "SPX",
			},
			rpcUrls: [
				isTest(host)
					? "https://eth-rpc.testnet.spidex.app"
					: "https://eth-rpc.devnet.spidex.app",
			],
		};
	} else {
		return null;
	}
};

export const getContract = (host: string | null) =>
	isTest(host)
		? "0x07b1ce5ba54a32aF726DbEEf56854963A4dC2b56"
		: "0x4bdD769577d3bb38fa1148480B68f0Dea1683D8F";
