import express, {Response, Request} from "express"
import cors from "cors"
import { connectDb } from "./config/db";
import "dotenv/config";

// app config
const app = express();
const PORT = 4000

// middleware
app.use(express.json());
app.use(cors())

// connect Database
connectDb()


app.get('/', (req: Request, res: Response) => {
    res.send("API Working")
})

app.listen(PORT, () => {
    console.log(process.env.MONGO_URI)
    console.log(`Server running on port http://localhost:${PORT}`);
})