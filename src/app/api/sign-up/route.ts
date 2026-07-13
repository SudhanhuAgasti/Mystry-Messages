// 1st api 
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";


import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password } = await request.json()
        const existingUserVerifiedByUser = await UserModel.findOne({
            username,
            isVerified: true
        })
        if (existingUserVerifiedByUser) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, { status: 400 })

        }
        const existingUserVerifiedByEmail = await UserModel.findOne({
            email,
            isVerified: true
        })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserVerifiedByEmail) {
            if (existingUserVerifiedByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exist wih this email"
                }, { status: 400 })

            } else {
                const hasedPassword = await bcrypt.hash(password, 10)
                existingUserVerifiedByEmail.password = hasedPassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpire = new Date(Date.now() + 360000)
                await existingUserVerifiedByEmail.save()
            }


        } else {
            const hasedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hasedPassword,
                verifyCode,
                verifyCodeExpire: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                message: [],
            })
            await newUser.save()
        }

        //  Send Verification eamail
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )


        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "User regisetred successfully, Please verify your email"
        }, { status: 202 })

    } catch (error) {
        console.error("Error registering user", error);
        return Response.json({
            success: false,
            message: "Error registering user !"
        },
            {
                status: 500
            })
    }

}