// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Web3 from "web3";
import requestIp from "request-ip";
import abi from "../../../abi/erc20.json";
import { conncetFaunadb } from "./history";

const web3 = new Web3(
	new Web3.providers.HttpProvider(process.env.DOMAIN as string)
);

const chainId = process.env.CHAIN_Id;
const from = process.env.FROM_ACCOUNT;
const spx_count = process.env.SPX_COUNT;
const USDC_COUNT = process.env.USDC_COUNT;
const privateKey = process.env.PRIVATE_KEY;
const usdcTokenAddress = process.env.USDC_TOKEN_ADDRESS;

const Tx = require("ethereumjs-tx");

type Data = {
	name: string;
};

class faucetController {
	async coins(req: any) {
		const { faunadb, faunaClient } = conncetFaunadb();
		const q = faunadb.query;

		const ip = requestIp.getClientIp(req);
		const reqBody = req.body;
		const address = reqBody.address;

		const { data } = await faunaClient.query(
			q.Map(
				q.Paginate(q.Match(q.Index("record_by_address"), address)),
				q.Lambda("X", q.Get(q.Var("X")))
			)
		);

		const now = new Date().getTime();
		const addressLastRecord = data[0];

		if (addressLastRecord && now - addressLastRecord.ts / 1000 < 86400000) {
			return {
				code: -1,
				msg: "Address has already collected",
				data: {},
			};
		}

		const spxRes = await this.spx(address);
		const usdcRes = await this.usdc(address);

		if (spxRes.code === 0 && usdcRes.code === 0) {
			await faunaClient.query(
				q.Create(q.Collection("faucet"), {
					data: {
						address: address,
						ip: ip,
						twitter: "1103",
					},
				})
			);
			return {
				code: 0,
				msg: "success",
				data: {
					usdc: usdcRes,
					spx: spxRes,
				},
			};
		} else {
			return {
				code: -1,
				msg: spxRes?.code === -1 ? spxRes.msg : usdcRes.msg,
				data: {},
			};
		}
	}

	async spx(address: string) {
		try {
			const nonce = await web3.eth.getTransactionCount(from as string);
			const rawTx = {
				nonce,
				gasPrice: 7 * 1e9,
				gasLimit: 21000,
				to: address,
				value: Number(spx_count) * 1e18,
			};

			const signedTx = await web3.eth.accounts.signTransaction(
				rawTx,
				privateKey as string
			);
			const result = await web3.eth.sendSignedTransaction(
				signedTx.rawTransaction as string
			);

			return { code: 0, data: result, msg: "success" };
		} catch (error: any) {
			return { code: -1, data: {}, msg: error.toString() };
		}
	}

	async usdc(address: string) {
		try {
			const myContract = new web3.eth.Contract(abi as any, usdcTokenAddress);
			const nonce = await web3.eth.getTransactionCount(from as string);

			const rawTx = {
				chainId: web3.utils.toHex(chainId as string),
				from,
				to: usdcTokenAddress,
				nonce: web3.utils.toHex(nonce),
				gasPrice: web3.utils.toHex(7 * 1e9),
				gasLimit: web3.utils.toHex(300000),
				value: "0x0",
				data: myContract.methods
					.transfer(address, Number(USDC_COUNT) * 1e6)
					.encodeABI(), // ERC20转账
			};

			const tx = new Tx(rawTx);
			tx.sign(Buffer.from(privateKey as string, "hex"));
			const serializedTx = tx.serialize();

			const result = await web3.eth.sendSignedTransaction(
				"0x" + serializedTx.toString("hex")
			);

			return { code: 0, data: result, msg: "success" };
		} catch (error: any) {
			// console.log(error);
			return { code: -1, data: {}, msg: error.toString() };
		}
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== "POST") {
		res
			.status(405)
			.send({ code: -1, message: "Only POST requests allowed" } as any);
		return;
	}

	const faucet = new faucetController();
	const result = await faucet.coins(req);

	res.status(200).json(result as any);
}
