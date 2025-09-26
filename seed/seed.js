import "dotenv/config";
import { connectMongo } from "../src/utils/mongo.js";
import Producto from "../src/models/producto.model.js";
import { faker } from "@faker-js/faker";

const formas = ['tableta','capsula','jarabe','inyeccion','otro'];
const N = parseInt(process.env.SEED_N || '8000', 10);

const mkProducto = (i) => {
  const nombre = `Prod_${faker.commerce.productName()}_${i}`;
  const atc = faker.string.alphanumeric({ length: 7 }).toUpperCase();
  const presCount = faker.number.int({ min: 1, max: 3 });
  const presentaciones = Array.from({length: presCount}).map(()=>({
    gtin: faker.string.numeric({ length: 13 }),
    forma: faker.helpers.arrayElement(formas),
    concentracion: `${faker.number.int({min:1,max:1000})}${faker.helpers.arrayElement(['mg','mcg','ml'])}`,
    unidades_por_paquete: faker.number.int({ min: 1, max: 60 })
  }));
  return {
    _id: `P${i}`,
    nombre, atc, presentaciones,
    rx: faker.datatype.boolean(),
    termocadena: faker.datatype.boolean(),
    keywords: faker.lorem.words({ min: 2, max: 5 }).split(' ')
  };
};

const run = async () => {
  await connectMongo(process.env.MONGO_URI);
  await Producto.deleteMany({});
  const chunk = 1000;
  for (let i=1; i<=N; i+=chunk){
    const docs = Array.from({length: Math.min(chunk, N - i + 1)}, (_,k)=> mkProducto(i+k));
    await Producto.insertMany(docs, { ordered:false });
    console.log(`insertados: ${i+docs.length-1}`);
  }
  console.log('SEED OK');
  process.exit(0);
};
run().catch(e=>{console.error(e);process.exit(1);});
