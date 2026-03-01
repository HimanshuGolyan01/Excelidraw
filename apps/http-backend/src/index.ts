import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema, CreateChatSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors())
app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
        const user = await prisma.user.create({  
            data: {
                email: parsedData.data.username,
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    const user = await prisma.user.findFirst({ 
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    })

    if (!user) {
        res.status(403).json({
            message: "Not authorized"
        })
        return;
    }

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET);

    res.json({
        token,
        userId: user.id
    })
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    
    const userId = req.userId;

    try {
        const room = await prisma.room.create({  
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.post("/chat", middleware, async (req, res) => {
    const parsedData = CreateChatSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({ message: "Incorrect inputs" });
        return;
    }
    try {
        const chat = await prisma.chat.create({
            data: {
                roomId: parsedData.data.roomId,
                message: parsedData.data.message,
                userId: req.userId!
            }
        });
        res.json({ chat });
    } catch (e) {
        res.status(500).json({ message: "Failed to send message" });
    }
});

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = await prisma.chat.findMany({  
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 50
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
})

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prisma.room.findFirst({  
        where: {
            slug
        }
    });

    res.json({
        room
    })
})

const drawingStore = new Map<number, string>();

app.get("/draw/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);
    const strokes = drawingStore.get(roomId) || "[]";
    res.json({ strokes: JSON.parse(strokes) });
});

app.post("/draw/:roomId", middleware, async (req, res) => {
    const roomId = Number(req.params.roomId);
    const room = await prisma.room.findFirst({ where: { id: roomId } });
    if (!room || room.adminId !== req.userId) {
        return res.status(403).json({ message: "Only host can draw" });
    }
    const strokes = Array.isArray(req.body.strokes) ? req.body.strokes : req.body.strokes ? JSON.parse(req.body.strokes) : [];
    drawingStore.set(roomId, JSON.stringify(strokes));
    res.json({ ok: true });
});

app.listen(3001);