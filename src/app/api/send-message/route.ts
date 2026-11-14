import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request: Request) {

    await dbConnect();

    const { username, content } = await request.json()
    try {
        // Find user case-insensitively or exact
        const user = await UserModel.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') }
        });
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: `User "@${username}" not found`
                }, { status: 404 }
            )
        }

        // is user accepting the messages (treat undefined as true by default)
        if (user.isAcceptingMessage === false) {
            return Response.json(
                {
                    success: false,
                    message: `User "@${username}" is currently not accepting messages.`
                }, { status: 403 }
            )
        }


        const newMessage = { content, createdAt: new Date() }
        user.message.push(newMessage as Message)
        await user.save()
        return Response.json(
            {
                success: true,
                message: "Message sent successfully !"
            }, { status: 200 }
        )
    }
    catch (error) {
        console.log("Eror adding messages ", error)
        return Response.json(
            {
                success: false,
                message: "internal server error "
            }, { status: 500 }
        )
    }

}