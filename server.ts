import app from "./src/app.js";
import connectDB from "./src/config/database.js";

connectDB()
  .then(() => {
    console.log("database connected successfully.");
    app.listen(7777, () => {
      console.log("server running on http://localhost:7777");
    });
  })
  .catch(() => {
    console.log("database is not connected!");
  });
