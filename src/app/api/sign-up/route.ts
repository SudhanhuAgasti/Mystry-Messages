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
        const existingUserByEmail = await UserModel.findOne({ email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists with this email"
                }, { status: 400 });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.username = username;
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpire = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpire: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                message: [],
            });
            await newUser.save();
        }

        // Print OTP to terminal for local development & testing
        console.log(`\n========================================`);
        console.log(`🔑 VERIFICATION CODE FOR [${username}] (${email}): ${verifyCode}`);
        console.log(`========================================\n`);

        //  Send Verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );

        if (!emailResponse.success) {
            console.warn("⚠️ Warning: Email sending failed, but OTP was printed to terminal above.");
        }

        return Response.json({
            success: true,
            message: "User registered successfully, Please verify your email"
        }, { status: 201 });

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