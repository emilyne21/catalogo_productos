import slugify from "slugify";
import Producto from "../models/producto.model.js";
import { productoSchema } from "../utils/validate.js";

export const list = async (req, res) => {
  const { query, atc, rx, termocadena, page = 1, pageSize = 20 } = req.query;
  const filter = {};
  if (atc) filter.atc = atc.toUpperCase();
  if (rx !== undefined) filter.rx = rx === "true";
  if (termocadena !== undefined) filter.termocadena = termocadena === "true";
  if (query) filter.$text = { $search: query };
  const limit = Math.min(100, Math.max(1, +pageSize));
  const skip = (Math.max(1, +page) - 1) * limit;
  const [items, total] = await Promise.all([
    Producto.find(filter, query ? { score: { $meta: "textScore" } } : {})
      .sort(query ? { score: { $meta: "textScore" } } : { nombre: 1 })
      .skip(skip).limit(limit).lean(),
    Producto.countDocuments(filter)
  ]);
  res.json({ page:+page, pageSize:limit, total, items });
};

export const getById = async (req, res) => {
  const doc = await Producto.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: "No encontrado" });
  res.json(doc);
};

export const create = async (req, res) => {
  const { value, error } = productoSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validación fallida", details: error.details });
  const payload = {
    _id: value.id,
    nombre: value.nombre,
    atc: value.atc,
    presentaciones: value.presentaciones,
    rx: value.rx,
    termocadena: value.termocadena,
    keywords: value.keywords,
    slug: slugify(`${value.nombre}-${value.atc}`, { lower: true, strict: true })
  };
  const created = await Producto.create(payload);
  res.status(201).json(created);
};

export const patch = async (req, res) => {
  const updates = req.body;
  if (updates.nombre || updates.atc) {
    updates.slug = slugify(`${updates.nombre || ''}-${updates.atc || ''}`, { lower: true, strict: true });
  }
  const doc = await Producto.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ message: "No encontrado" });
  res.json(doc);
};

export const remove = async (req, res) => {
  const ok = await Producto.findByIdAndDelete(req.params.id);
  if (!ok) return res.status(404).json({ message: "No encontrado" });
  res.json({ deleted: true });
};

export const bulkUpsert = async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [];
  if (!items.length) return res.status(400).json({ message: "Arreglo vacío" });
  const ops = items.map(x => ({
    updateOne: {
      filter: { _id: x.id },
      update: {
        $set: {
          nombre: x.nombre, atc: x.atc,
          presentaciones: x.presentaciones, rx: x.rx,
          termocadena: x.termocadena, keywords: x.keywords || [],
          slug: slugify(`${x.nombre}-${x.atc}`, { lower: true, strict: true })
        }
      },
      upsert: true
    }
  }));
  const result = await Producto.bulkWrite(ops, { ordered: false });
  res.json({ upserted: result.upsertedCount, modified: result.modifiedCount, matched: result.matchedCount });
};

export const exportAll = async (req, res) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  const cursor = Producto.find().cursor();
  for await (const doc of cursor) { res.write(JSON.stringify(doc)+'\n'); }
  res.end();
};
