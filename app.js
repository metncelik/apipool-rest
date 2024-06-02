import express from 'express';
import bodyParser from 'body-parser';
import { setContentType } from './middlewares/setContentType.js';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { CLIENT_URL, PORT } from './config.js';
import authRouter from './routes/authRoute.js';
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import apisRouter from './routes/apisRoute.js';
import apiKeysRouter from './routes/apiKeysRoute.js';
import storageRouter from './routes/storageRouter.js';
import indexRouter from './routes/indexRouter.js';

const app = express();

app.use(cookieParser())
app.use(cors({
    origin: CLIENT_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));
app.use(bodyParser.json({limit: "10mb"}));
app.use(bodyParser.urlencoded({ extended: true, type: "application/json" }));
app.use(setContentType);

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/apis", apisRouter);
app.use("/user", userRouter);
app.use("/api-keys", apiKeysRouter);
app.use("/storage", express.static("public"), storageRouter);

app.use("*", (req, res) => res.status(404).send({ message: "Not found" }));

app.use((err, req, res, next) => {
    if (err.name == "JsonWebTokenError") {
        return res.status(401).send({
            message: "Refresh token is invalid. (jwt)",
        });
    }

    if (err.name == "TokenExpiredError") {
        return res.status(401).send({
            message: "Token expired.",
        });
    }

    if (err.code === '23505') {
        return res.status(400).send({ message: "Already exists!" });
    }

    res.status(500).send({ message: err.toString() });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});