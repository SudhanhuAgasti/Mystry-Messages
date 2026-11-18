import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        email: {
          label: "Email or Username",
          type: "text",
          placeholder: "john@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "******",
        },
      },

      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            console.log("NextAuth authorize: No user found with identifier:", credentials.identifier);
            throw new Error("No user found with this email!");
          }

          if (!user.isVerified) {
            console.log("NextAuth authorize: User is not verified:", credentials.identifier);
            throw new Error("Please verify your account before login!");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password || ""
          );

          if (!isPasswordCorrect) {
            console.log("NextAuth authorize: Password incorrect for:", credentials.identifier);
            throw new Error("Incorrect password!");
          }

          return user;

        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await dbConnect();
        try {
          const existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser) {
            // Generate clean unique username from email or provider profile
            const baseUsername = user.email ? user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") : `user_${Date.now()}`;
            let username = baseUsername;
            let counter = 1;
            while (await UserModel.findOne({ username })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }

            const newUser = new UserModel({
              username,
              email: user.email,
              isVerified: true,
              isAcceptingMessage: true,
              message: [],
            });
            await newUser.save();
            user._id = newUser._id.toString();
            (user as any).username = newUser.username;
            (user as any).isVerified = newUser.isVerified;
            (user as any).isAcceptingMessage = newUser.isAcceptingMessage;
          } else {
            user._id = existingUser._id.toString();
            (user as any).username = existingUser.username;
            (user as any).isVerified = existingUser.isVerified;
            (user as any).isAcceptingMessage = existingUser.isAcceptingMessage;
          }
          return true;
        } catch (error) {
          console.error("Error saving OAuth user:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = (user as any).isVerified ?? true;
        token.isAcceptingMessage = (user as any).isAcceptingMessage ?? true;
        token.username = (user as any).username;
      }

      return token;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};