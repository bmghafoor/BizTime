const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Return all industries
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("Select * FROM industries");
    return res.json({ industries: results.rows });
  } catch (error) {
    next(error);
  }
});

// Post a new industry
router.post("/", async (req, res, next) => {
  try {
    const { code, name } = req.body;
    const results = await db.query(
      "INSERT INTO industries (code,name) VALUES ($1,$2) RETURNING *",
      [code, name]
    );

    return res.status(201).json({ industry: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Associating an industry to a company
router.post("/associate", async (req, res, next) => {
  try {
    const { company_code, industry_code } = req.body;

    const companyResult = await db.query(
      `SELECT * FROM companies WHERE code=$1`,
      [company_code]
    );
    const industryResult = await db.query(
      `SELECT * FROM industries WHERE code=$1`,
      [industry_code]
    );

    if (companyResult.rows.length === 0) {
      throw new ExpressError(`Company with code ${company_code} not found`);
    }
    if (industryResult.rows.length === 0) {
      throw new ExpressError(`Industry with code ${industry_code} not found`);
    }

    const results = await db.query(
      "INSERT INTO company_industry (company_code,industry_code) VALUES ($1,$2) RETURNING *",
      [company_code, industry_code]
    );

    return res.status(201).json({ result: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
