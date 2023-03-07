// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "GET") {
		return res
			.status(405)
			.send({ code: -1, message: "Only GET requests allowed" } as any);
	}

	try {
		const snippets = await getFaunaList(req.query.ref as string);
		return res.status(200).json(snippets);
	} catch (err) {
		res.status(500).json({ msg: "Something went wrong." });
	}
};

const getFaunaList = async (ref: string) => {
	const { faunadb, faunaClient } = conncetFaunadb();
	const q = faunadb.query;

	const { data: pageTotal } = await faunaClient.query(
		q.Count(
			q.Map(
				q.Paginate(q.Documents(q.Collection("faucet"))),
				q.Lambda("doc", q.Get(q.Var("doc")))
			)
		)
	);

	const { data } = await faunaClient.query(
		q.Map(
			q.Paginate(q.Match(q.Index("desc_records")), {
				size: 5,
				after: [q.Ref(q.Collection("faucet"), ref ? ref : 0)],
			}),
			q.Lambda(["W", "X", "Y", "Z", "ref"], q.Get(q.Var("ref")))
		)
	);

	const records = data.map((record: any) => {
		const item = {
			id: record.ref.id,
			ts: record.ts,
			total: Math.ceil(pageTotal[0] / 5),
			...record.data,
		};
		return item;
	});

	return records;
};

export const conncetFaunadb = () => {
	const faunadb = require("faunadb");
	const faunaClient = new faunadb.Client({
		secret: process.env.FAUNA_SECRET,
		endpoint: "https://db.fauna.com/",
	});

	return { faunadb, faunaClient };
};

export default handler;
