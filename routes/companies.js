const express = require('express')
const router = new express.Router()
const db = require('../db')
const ExpressError = require("../expressError")


// Return all companies
router.get("/", async(req, res, next) => {
    const results = await db.query("Select * FROM companies")

    return res.json({companies: results.rows})
})

// Return a single company by id
router.get("/:code", async(req, res, next) => {
    const {code} = req.params
    const results = await db.query(`SELECT * FROM companies WHERE code ='${code}'`)

    return res.json({company: results.rows[0]})
})

// Post a new company
router.post("/", async(req, res, next) => {
    const {code,name,description} = req.body
    const results = await db.query("INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING *", [code,name,description])

    return res.status(201).json({company: results.rows[0]})
})

// Editing a current company
router.patch("/:code", async(req, res, next) => {
    const {code} = req.params
    const {name, description} = req.body
    const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code = '${code}' RETURNING *`,[name, description])

    return res.json({company: results.rows[0]})

})

// Deleting a company
router.delete("/:code", async(req, res, next) => {
    const {code} = req.params
    const results = await db.query(`DELETE FROM companies WHERE code = $1`, [code])
    return res.json({msg:'Deleted company'})
})

module.exports = router;