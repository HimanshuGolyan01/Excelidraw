import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";

const app = express();
app.use(express.json());

app.post("/signup", (req, res) => {
    const data = CreateUserSchema.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: "incorrect input" });
    }

    return res.json({
        message: "signup successful",
        data: data.data
    });
});

app.post("/signin", (req, res) => {
    const userId = 1;

    const token = jwt.sign({ userId }, JWT_SECRET);

    return res.json({ token });
});

app.post("/room", middleware, (req, res) => {
    return res.json({
        roomId: 123
    });
});

app.listen(3000, () => console.log("server vibing on 3000"));
