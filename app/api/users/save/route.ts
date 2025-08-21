import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { googleId, name, email } = body;

    if (!googleId) {
      return NextResponse.json(
        { error: "googleId is required" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ googleId });
    let type = "user";
    if (!user) {
      user = await User.create({ googleId, name, email });
      console.log("New user created:", user);
      type = "created";
    }

    return NextResponse.json({ created: "successfull", type, user });
  } catch (err: any) {
    console.error("User save failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
