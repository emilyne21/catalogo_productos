import "dotenv/config";
import express from "express";
import morgan from "morgan";
import routes from "./routes.js";
import { connectMongo } from "./utils/mongo.js";

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(routes);

const PORT = process.env.PORT || 8083;
const MONGO_URI = process.env.MONGO_URI;

connectMongo(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Catalogo escuchando en :${PORT}`)))
  .catch(err => { console.error("Mongo error", err); process.exit(1); });
