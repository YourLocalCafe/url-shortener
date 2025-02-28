import express from "express";
import urlRoutes from "./routes/urlRoutes";
import cors from "cors";
import notFound from "./middleware/notFound";
import errorHandler from "./middleware/error";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/url", urlRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
