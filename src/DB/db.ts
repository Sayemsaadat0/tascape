import { connect } from "mongoose";

const MONGO_URI =
  `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}` +
  `@cluster0.njebycd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log("MongoDB Connection Error: ", error));