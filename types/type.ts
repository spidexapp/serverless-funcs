export type EVMChainConfig = {
	chainId: string;
	chainName: string;
	nativeCurrency: {
		name: string;
		decimals: number;
		symbol: string;
	};
	rpcUrls: string[];
};
