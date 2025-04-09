var express = require("express");
const pool = require("../../sql/config.js");
const checkUserExists = require("../../middleware/checkUserExists.js");

var router = express.Router();

// Middleware to check if user exists
router.use("/:userId", checkUserExists);

// ADD A PET
router.post("/:userId", async (req, res) => {
  const name = req.body.name;
  const breed = req.body.breed;
  const birthday = req.body.birthday;
  const userId = req.params.userId;

  // If birthday is provided, convert to a Date object
  let parsedBirthday = null;
  if (birthday) {
    parsedBirthday = new Date(birthday);
  }

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
      `INSERT INTO pets ("petName", breed, "userId", birthday) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, breed, userId, parsedBirthday]
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

    // check if user has no pets
    if (pets.rows.length === 0) {
      return res.status(200).json([]); // just return an empty array
    }
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

  const { petName, breed, birthday, image } = req.body;
  ////// add images
  // check values were provided
  if (!petName && !breed && !birthday) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  try {
    // Check for duplicate pet name (same user, different pet)
    const duplicateCheck = await pool.query(
      `SELECT * FROM pets WHERE "userId" = $1 AND "petName" = $2 AND "petId" != $3`,
      [userId, petName, petId]
    );

    if (duplicateCheck.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "You already have another pet with this name." });
    }

    // check they dont have another pet named the new name
    // update pet
    const result = await pool.query(
      `UPDATE pets SET "petName" = $1, "breed" = $2, "birthday" = $3 WHERE "petId" = $4 AND "userId" = $5 RETURNING *`,
      [petName, breed, birthday, petId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Pet not found or unauthorized" });
    }

    res
      .status(200)
      .json({ message: "Pet updated successfully", pet: result.rows[0] });
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
