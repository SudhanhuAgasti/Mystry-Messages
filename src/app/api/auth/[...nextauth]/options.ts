import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions:NextAuthOptions={
    providers:[
        CredentialsProvider({
            id:"Credentials",
            name:"Credentilas",
            credentials:{
                email:{label:"Email",type:"text",placeholder:"John Deo"},
                Password:{label:"Password",type:"Password",placeholder:"*******"}
            },
            async authorize(credentials:any):Promise<any>{
                await dbConnect()
                try {
                const user = await UserModel.findOne({
                        $or:[
                            {email:credentials.identifier},
                            {username:credentials.identifier}
                        ]
                    })
                    if (!user) {
                        throw new Error('No user found with this email !')
                    } if(!user.isVerified) {
                        throw new Error('Please verify your account before login !')
                    }
                    await bcrypt.compare(credentials.Password,user.password)
                    if(isPasswordCorrect){
                        return user
                    }else{
                        throw new Error('Please Write correct password !')
                    }
                } catch (error:any) {
                    throw new Error(error);
                }
            }
        })
    ]
}