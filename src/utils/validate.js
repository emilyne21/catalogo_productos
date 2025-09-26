import Joi from "joi";
export const productoSchema = Joi.object({
  id: Joi.string().alphanum().min(2).max(32).required(),
  nombre: Joi.string().min(3).max(120).required(),
  atc: Joi.string().uppercase().pattern(/^[A-Z0-9]{5,10}$/).required(),
  rx: Joi.boolean().required(),
  termocadena: Joi.boolean().required(),
  keywords: Joi.array().items(Joi.string().min(2)).default([]),
  presentaciones: Joi.array().min(1).items(
    Joi.object({
      gtin: Joi.string().min(8).max(20).required(),
      forma: Joi.string().valid('tableta','capsula','jarabe','inyeccion','otro').required(),
      concentracion: Joi.string().min(1).max(50).required(),
      unidades_por_paquete: Joi.number().integer().min(1).required()
    })
  ).required()
});
