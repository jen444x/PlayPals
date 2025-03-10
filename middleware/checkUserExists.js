const pool = require("../sql/config.js");

const checkUserExists = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the user data to the request object for later use
    req.user = result.rows[0];
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log("Error checking user:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while checking user." });
  }
};

module.exports = checkUserExists;
