const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Return all invoices
router.get("/", async (req, res, next) => {
  const results = await db.query("Select * FROM invoices");
  return res.json({ invoice: results.rows });
});

// Return a single invoice by id
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const results = await db.query(`SELECT * FROM invoices WHERE id ='${id}'`);

  return res.json({ invoice: results.rows[0] });
});

// Post a new invoice
router.post("/", async (req, res, next) => {
  const { comp_Code, amt, paid, paid_date } = req.body;
  const results = await db.query(
    "INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ($1,$2,$3,$4) RETURNING *",
    [comp_Code, amt, paid, paid_date]
  );

  return res.status(201).json({ invoice: results.rows[0] });
});

// Editing a current company
router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { amt, paid, paid_date } = req.body;
  const results = await db.query(
    `UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id = '${id}' RETURNING *`,
    [amt, paid, paid_date]
  );

  return res.json({ company: results.rows[0] });
});

// Deleting an invoice
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const results = await db.query(`DELETE FROM invoices WHERE code = $1`, [id]);
  return res.json({ msg: "Deleted company" });
});

module.exports = router;
