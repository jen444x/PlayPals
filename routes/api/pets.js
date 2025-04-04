var express = require("express");
const pool = require("../../sql/config.js");
const checkUserExists = require("../../middleware/checkUserExists.js");

var router = express.Router();

// Middleware to check if user exists
router.use("/:userId", checkUserExists);

// ADD A PET
router.post("/:userId", async (req, res) => {
  const breed = req.body.breed;
  const name = req.body.name;
  const userId = req.params.userId;

  // make sure a values were entered
  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  // check if user already has this pet
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count FROM pets WHERE "userId" = $1 AND "petName" = $2`,
      [userId, name]
    );

    if (result.rows[0].count > 0) {
      return res.status(400).json({ message: "Pet already exists." });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Error checking for existing pet." });
  }

  // CREATE A PET
  try {
    const newPet = await pool.query(
      `INSERT INTO pets ("petName", breed, "userId") VALUES ($1, $2, $3) RETURNING *`,
      [name, breed, userId]
    );

    res.status(201).json(newPet.rows[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Error adding new pet." });
  }
});

// GET ALL PETS
router.get("/", async (req, res) => {
  try {
    const allPets = await pool.query("Select * FROM pets");
    res.status(200).json(allPets.rows);
  } catch (error) {
    console.log("Error fetching all pets:", error.message);
    return res.status(500).json({ message: "Error retrieving pets." });
  }
});

// GET ALL PETS OF A USER
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  // get pets
  try {
    const pets = await pool.query(`SELECT * FROM pets WHERE "userId" = $1`, [
      userId,
    ]);

    // // check if user has no pets
    // if (pets.rows.length === 0) {
    //   return res.status(404).json({ message: "No pets found for this user" });
    // }
    return res.status(200).json(pets.rows);
  } catch (error) {
    console.log("Error fetching user pets:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while getting pets." });
  }
});

// GET A SINGLE PET
router.get("/:userId/:petId", async (req, res) => {
  const petId = req.params.petId;

  // check pet exists
  try {
    const pet = await pool.query('SELECT * FROM pets WHERE "petId" = $1', [
      petId,
    ]);

    if (pet.rows.length === 0) {
      return res.status(404).json({ message: "Pet not found." });
    }

    // return pet
    return res.status(200).json(pet.rows[0]);
  } catch (error) {
    console.log("Error checking pet:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while checking pet." });
  }
});

// UPDATE A PET
router.put("/:userId/:petId", async (req, res) => {
  const userId = req.params.userId;
  const petId = req.params.petId;

  let { name, breed } = req.body;

  // check values were provided
  if (!name && !breed) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  // check pet exists
  try {
    const pet = await pool.query('SELECT * FROM pets WHERE "petId" = $1', [
      petId,
    ]);

    if (pet.rows.length === 0) {
      return res.status(404).json({ message: "Pet not found." });
    }
  } catch (error) {
    console.log("Error checking pet:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while checking pet." });
  }
});

// DELETE A PET
router.delete("/:userId/:petId", async (req, res) => {
  const petId = req.params.petId;
  // check pet exists
  try {
    const pet = await pool.query("SELECT * FROM pets WHERE pid = $1", [petId]);

    if (pet.rows.length === 0) {
      return res.status(404).json({ message: "Pet not found." });
    }

    // delete pet
    await pool.query("DELETE FROM pets WHERE pid = $1", [petId]);
    res.status(200).json({ message: "Pet deleted successfully." });
  } catch (error) {
    console.log("Error deleting pet:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while deleting pet." });
  }
});

// DELETE MULTIPLE PETS?

module.exports = router;
