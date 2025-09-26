import { Router } from "express";
import * as C from "./controllers/productos.controller.js";

const r = Router();
r.get("/health", (req,res)=>res.json({ ok:true }));
r.get("/productos", C.list);
r.get("/productos/:id", C.getById);
r.post("/productos", C.create);
r.patch("/productos/:id", C.patch);
r.delete("/productos/:id", C.remove);
r.post("/productos:bulk", C.bulkUpsert);
r.get("/admin/export", C.exportAll); // para pruebas locales

export default r;
