const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

// Return all companies
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("Select * FROM companies");
    return res.json({ companies: results.rows });
  } catch (error) {
    next(error);
  }
});

// Return a single company by code
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const companyResult = await db.query(
      `SELECT * FROM companies WHERE code =$1`,
      [code]
    );
    const industry = await db.query(
      `SELECT * FROM company_industry WHERE company_code =$1`,
      [code]
    );

    if (companyResult.rows.length === 0) {
      throw new ExpressError(`code of ${code} not found`, 404);
    }

    const company = companyResult.rows[0];
    const industries = industry.rows;

    company.industries = [];

    for (let i = 0; i < industries.length; i++) {
      company.industries.push(industries[i]["industry_code"]);
    }

    return res.json({ company: company });
  } catch (error) {
    next(error);
  }
});

// Post a new company
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true });
    const results = await db.query(
      "INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING *",
      [code, name, description]
    );

    return res.status(201).json({ company: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Editing a current company
router.patch("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code =$3 RETURNING *`,
      [name, description, code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`code of ${code} not found`, 404);
    }

    return res.json({ company: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Deleting a company
router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`DELETE FROM companies WHERE code = $1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`code of ${code} not found`, 404);
    }
    return res.json({ msg: "Deleted company" });
  } catch (error) {
    next(error);
  }
});

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
router.post("/", async (req, res, next) => {
  try {
    const { company_code, industry_code } = req.body;

    const companyResult = db.query(`SELECT * FROM companies WHERE code=$1`, [
      company_code,
    ]);
    const industryResult = db.query(`SELECT * FROM industries WHERE code=$1`, [
      industry_code,
    ]);

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
