import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert profile if missing
    let profile = user.profile;
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId,
          displayName: user.name || "User",
          preferredCurrencySymbol: "$",
          themePreference: "dark",
        },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        preferredCurrencySymbol: profile.preferredCurrencySymbol,
        themePreference: profile.themePreference,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const body = await req.json();

    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { displayName, preferredCurrencySymbol, themePreference } = validation.data;

    // Execute atomic update for Profile and User name
    const [updatedProfile] = await prisma.$transaction([
      prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          displayName: displayName || "User",
          preferredCurrencySymbol: preferredCurrencySymbol || "$",
          themePreference: themePreference || "dark",
        },
        update: {
          ...(displayName ? { displayName } : {}),
          ...(preferredCurrencySymbol ? { preferredCurrencySymbol } : {}),
          ...(themePreference ? { themePreference } : {}),
        },
      }),
      ...(displayName
        ? [
            prisma.user.update({
              where: { id: userId },
              data: { name: displayName },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: {
        id: updatedProfile.id,
        displayName: updatedProfile.displayName,
        preferredCurrencySymbol: updatedProfile.preferredCurrencySymbol,
        themePreference: updatedProfile.themePreference,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
