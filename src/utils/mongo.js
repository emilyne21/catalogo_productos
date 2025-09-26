import mongoose from "mongoose";
export const connectMongo = async (uri) => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  return mongoose.connection;
};
