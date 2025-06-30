const connectDB = require("./db/db");
const app = require("../backend/app");
require("dotenv").config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`mongo DB connection faile !!! ${err}`);
  });
