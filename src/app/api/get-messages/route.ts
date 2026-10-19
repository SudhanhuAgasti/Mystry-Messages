import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";
import { success } from "zod";

export async function GET(request:Request) {
  await  dbConnect();
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated !"
        }, { status: 401 })
    }
    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            );
        }

        if (!foundUser.message || foundUser.message.length === 0) {
            return Response.json(
                {
                    success: true,
                    messages: []
                },
                { status: 200 }
            );
        }

        const userWithMessages = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$message' },
            { $sort: { 'message.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$message' } } }
        ]);

        return Response.json(
            {
                success: true,
                messages: userWithMessages[0]?.messages || []
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching messages:", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error"
            },
            { status: 500 }
        );
    }
}