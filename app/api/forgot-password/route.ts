import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email обязателен" },
        { status: 400 }
      );
    }

    // Найти пользователя по email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Всегда возвращаем успех для безопасности (не раскрываем, существует ли пользователь)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Если пользователь с таким email существует, инструкции по сбросу пароля будут отправлены"
      });
    }

    // Генерируем токен сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 час

    // Сохраняем токен в базе данных
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Отправляем email с инструкциями
    const emailSent = await sendPasswordResetEmail(
      user.email,
      user.firstName,
      user.lastName,
      resetToken
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Ошибка при отправке email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Инструкции по сбросу пароля отправлены на ваш email"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
