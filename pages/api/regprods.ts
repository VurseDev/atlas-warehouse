import type { NextApiRequest, NextApiResponse } from "next";

import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {name, code, supplier, description, image} = req.body

    if (!name || !code || !supplier || !description) {
         return res.status(400).json({ error: "Missing fields" });
    }

    await pool.query(
        "INSERT INTO products (name, code, supplier, description, image) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, code, supplier, description, image",
        [name, code, supplier, description, image || null]
    );

  } catch (error: any ) {
    console.error("Api Error: ", error)

    return res.status(500).json({error: "Internal server error"})
  }

   if (req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT id, name, code, supplier, description, image FROM products ORDER BY id DESC"
      );
      return res.status(200).json(result.rows);
    } catch (error: any) {
      console.error("API Error:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
