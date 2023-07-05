import * as dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "dev"}`})

import express from "express";
import cors from "cors"

import router from "./router"
import errorMiddleware from "./Middleware/Error"
import cookieParser from "cookie-parser"


import socket from "./socket";

if (!process.env.PORT) process.exit(1)

const PORT: number = parseInt(process.env.PORT as string, 10)

const app = express()

const corsOptions = {
  origin: true,
  credentials: true,
};
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())

app.use('/api', router)
app.use('/images', express.static('storage/images'))
app.use('/files', express.static('storage/files'))
app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  socket
})