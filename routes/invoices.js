const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Return all invoices
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("Select * FROM invoices");
    return res.json({ invoice: results.rows });
  } catch (error) {
    next(error);
  }
});

// Return a single invoice by id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`SELECT * FROM invoices WHERE id =$1`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`id of ${id} not found`, 404);
    }

    return res.json({ invoice: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Post a new invoice
router.post("/", async (req, res, next) => {
  try {
    const { comp_Code, amt, paid, paid_date } = req.body;
    const results = await db.query(
      "INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ($1,$2,$3,$4) RETURNING *",
      [comp_Code, amt, paid, paid_date]
    );

    return res.status(201).json({ invoice: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Editing a current invoice
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;
    let paid_date;
    if (paid == true) {
      paid_date = new Date().toJSON().slice(0, 10);
    } else {
      paid_date = req.params.paid_date;
    }
    const results = await db.query(
      `UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id =$4 RETURNING *`,
      [amt, paid, paid_date, id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`id of ${id} not found`, 404);
    }

    return res.json({ invoice: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Deleting an invoice
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`DELETE FROM invoices WHERE code = $1`, [
      id,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`id of ${id} not found`, 404);
    }
    return res.json({ msg: "Invoice company" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
