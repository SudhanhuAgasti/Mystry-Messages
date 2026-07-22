import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";


export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session?.user) {
        return Response.json({
            success: false,
            message: "Not authenticated !"
        }, { status: 401 })
    }
    const userId = user._id
    const { acceptmessages } = await request.json()

    try {

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptmessages },
            { new: true }
        )
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "failed to update user status to accept message "
            }, { status: 400 })
        }
        return Response.json({
            success: true,
            message: "Message acceptance status updated succesfull ! "
        }, { status: 200 })


    } catch (error) {
        console.error("Failed to update user status to accept  messages", error)

        return Response.json({
            success: false,
            message: "failed to update user status to accept message "
        }, { status: 500 })
    }
}

export async function GET(request: Request) {
    dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated !"
        }, { status: 401 })
    }

    const userId = user._id;
    try {

        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "failed to found  the user or user not found !"
            }, { status: 404 })
        }
        return Response.json({
            success: true,
            // message:"user found successfully !"
            isAcceptingMessage: foundUser.isAcceptingMessage
        }, { status: 201 })

    }
    catch (error) {
        console.error("Failed to update user status to accept  messages", error)

        return Response.json({
            success: false,
            message: "Error in getting message acceptances message . "
        }, { status: 500 })
    }
}
