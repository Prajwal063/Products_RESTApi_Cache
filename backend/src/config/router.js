import productRouter from "@/routes"; // Ensure this path is correct

export default function (app) {
  app.use("/", productRouter);
}
