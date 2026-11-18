import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { moderateContent } from "@/lib/contentModeration";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { username, content } = body;

    const trimmedContent = typeof content === "string" ? content.trim() : "";
    if (!trimmedContent) {
      return Response.json(
        {
          success: false,
          message: "Message content cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 500) {
      return Response.json(
        {
          success: false,
          message: "Message exceeds 500 characters limit.",
        },
        { status: 400 }
      );
    }

    // 1. Check if recipient user exists
    const user = await UserModel.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: `User "@${username}" not found`,
        },
        { status: 404 }
      );
    }

    // 2. Check if recipient is accepting messages
    if (user.isAcceptingMessage === false) {
      return Response.json(
        {
          success: false,
          message: `User "@${username}" has temporarily turned off message reception in their dashboard.`,
        },
        { status: 403 }
      );
    }

    // 3. AI & Heuristic Content Moderation (Offensive / Abusive slang blocker)
    const moderation = await moderateContent(trimmedContent);
    if (!moderation.isSafe) {
      return Response.json(
        {
          success: false,
          message:
            moderation.reason ||
            "Your message was flagged for containing offensive, abusive, or inappropriate content.",
        },
        { status: 422 }
      );
    }

    // 4. Save sanitized message to database
    const newMessage = {
      content: trimmedContent,
      createdAt: new Date(),
    };

    user.message.push(newMessage as Message);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SendMessageAPI] Unexpected error adding message:", error);
    return Response.json(
      {
        success: false,
        message: "An internal server error occurred while sending the message.",
      },
      { status: 500 }
    );
  }
}
