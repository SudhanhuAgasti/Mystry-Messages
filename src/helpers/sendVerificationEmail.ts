import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string,
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from:"you@example.com",
            to:email,
            subject:"Mystry-Message Verification ode",
            react:VerificationEmail({username,otp:verifyCode}),
        });
        return{success:true,message:"Verifiaction email send successfully !"}
    } catch (emailError) {
        console.error("Error sending verifiacton Email",emailError)
        return {success:false, message:"failed to send verifiaction email !"}
    }
}