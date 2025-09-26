import mongoose from "mongoose";

const PresentacionSchema = new mongoose.Schema({
  gtin: { type: String, required: true, index: true },
  forma: { type: String, required: true, enum: ['tableta','capsula','jarabe','inyeccion','otro'] },
  concentracion: { type: String, required: true },
  unidades_por_paquete: { type: Number, min: 1, required: true }
}, { _id: false });

const ProductoSchema = new mongoose.Schema({
  _id: { type: String, alias: 'id_producto' },
  nombre: { type: String, required: true, trim: true },
  atc: { type: String, required: true, uppercase: true, match: /^[A-Z0-9]{5,10}$/ },
  presentaciones: { type: [PresentacionSchema], default: [], validate: v => v.length > 0 },
  rx: { type: Boolean, default: false },
  termocadena: { type: Boolean, default: false },
  keywords: { type: [String], default: [] },
  slug: { type: String, unique: true }
}, { timestamps: true, versionKey: false });

ProductoSchema.index({ nombre: 'text', keywords: 'text', atc: 'text' });
ProductoSchema.index({ atc: 1 });
ProductoSchema.index({ 'presentaciones.gtin': 1 }, { unique: true });

export default mongoose.model('Producto', ProductoSchema);
