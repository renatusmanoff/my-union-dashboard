import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { ApplicationStatus } from "@prisma/client";
import { emailNotificationService } from "@/lib/email-notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    // Проверяем права доступа
    if (!['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "Доступ запрещен. Только председатели могут изменять статус заявлений" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status, rejectionReason } = await request.json();

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: "Неверный статус" },
        { status: 400 }
      );
    }

    // Получаем заявление
    const application = await prisma.membershipApplication.findUnique({
      where: { id },
      include: {
        organization: true,
        user: true
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: "Заявление не найдено" },
        { status: 404 }
      );
    }

    // Проверяем права на изменение этого заявления
    let hasPermission = false;

    if (currentUser.role === 'SUPER_ADMIN') {
      hasPermission = true;
    } else if (currentUser.role === 'FEDERAL_CHAIRMAN') {
      hasPermission = true;
    } else if (currentUser.role === 'PRIMARY_CHAIRMAN') {
      hasPermission = application.organizationId === currentUser.organizationId;
    } else if (currentUser.role === 'LOCAL_CHAIRMAN') {
      if (!currentUser.organizationId) {
        hasPermission = false;
      } else {
        const localOrg = await prisma.organization.findUnique({
          where: { id: currentUser.organizationId },
          include: { children: true }
        });
        hasPermission = localOrg?.children.some(child => child.id === application.organizationId) || false;
      }
    } else if (currentUser.role === 'REGIONAL_CHAIRMAN') {
      if (!currentUser.organizationId) {
        hasPermission = false;
      } else {
        const regionalOrg = await prisma.organization.findUnique({
          where: { id: currentUser.organizationId },
          include: { 
            children: {
              include: { children: true }
            }
          }
        });
        const allChildIds = regionalOrg?.children.flatMap(child => [
          child.id,
          ...child.children.map(grandChild => grandChild.id)
        ]) || [];
        hasPermission = allChildIds.includes(application.organizationId);
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Нет прав для изменения этого заявления" },
        { status: 403 }
      );
    }

    // Обновляем статус заявления
    const updatedApplication = await prisma.membershipApplication.update({
      where: { id },
      data: {
        status: status as ApplicationStatus,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      },
      include: {
        organization: true,
        user: true
      }
    });

    // Если заявление одобрено, создаем пользователя (если его еще нет)
    if (status === 'APPROVED' && !application.user) {
      // Создаем пользователя на основе данных заявления
      const newUser = await prisma.user.create({
        data: {
          email: `${application.firstName.toLowerCase()}.${application.lastName.toLowerCase()}@${application.organization.name.toLowerCase().replace(/[^a-zа-я0-9]/g, '')}.ru`,
          password: 'temp_password', // Временный пароль, пользователь должен будет сменить
          firstName: application.firstName,
          lastName: application.lastName,
          middleName: application.middleName,
          phone: application.phone,
          role: 'PRIMARY_MEMBER',
          organizationId: application.organizationId,
          membershipValidated: true
        }
      });

      // Связываем заявление с пользователем
      await prisma.membershipApplication.update({
        where: { id },
        data: {
          userId: newUser.id
        }
      });
    }

    // Создаем уведомления
    if (application.user) {
      // Уведомляем пользователя о решении
      await prisma.notification.create({
        data: {
          type: status === 'APPROVED' ? 'MEMBERSHIP_APPROVED' : 'MEMBERSHIP_REJECTED',
          title: status === 'APPROVED' ? 'Заявление одобрено' : 'Заявление отклонено',
          message: status === 'APPROVED' 
            ? `Ваше заявление на вступление в профсоюз организации "${application.organization.name}" было одобрено.`
            : `Ваше заявление на вступление в профсоюз организации "${application.organization.name}" было отклонено.${rejectionReason ? ` Причина: ${rejectionReason}` : ''}`,
          recipientId: application.user.id,
          membershipApplicationId: application.id
        }
      });

      // Отправляем email уведомление пользователю
      if (application.user.email) {
        await emailNotificationService.sendNotification({
          type: status === 'APPROVED' ? 'MEMBERSHIP_APPROVED' : 'MEMBERSHIP_REJECTED',
          recipientName: `${application.firstName} ${application.lastName}`,
          recipientEmail: application.user.email,
          organizationName: application.organization.name,
          memberName: `${application.firstName} ${application.lastName} ${application.middleName || ''}`,
          rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
        });
      }
    }

    // Уведомляем председателя организации о новом члене (если одобрено)
    if (status === 'APPROVED') {
      const chairman = await prisma.user.findFirst({
        where: {
          organizationId: application.organizationId,
          role: 'PRIMARY_CHAIRMAN'
        }
      });

      if (chairman) {
        await prisma.notification.create({
          data: {
            type: 'NEW_MEMBER_REGISTRATION',
            title: 'Новый член профсоюза',
            message: `В вашу организацию "${application.organization.name}" вступил новый член профсоюза: ${application.firstName} ${application.lastName} ${application.middleName || ''}`,
            recipientId: chairman.id,
            membershipApplicationId: application.id
          }
        });

        // Отправляем email уведомление председателю
        if (chairman.email) {
          await emailNotificationService.sendNotification({
            type: 'NEW_MEMBER_REGISTRATION',
            recipientName: `${chairman.firstName} ${chairman.lastName}`,
            recipientEmail: chairman.email,
            organizationName: application.organization.name,
            memberName: `${application.firstName} ${application.lastName} ${application.middleName || ''}`
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: status === 'APPROVED' ? 'Заявление одобрено' : 'Заявление отклонено'
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении статуса заявления" },
      { status: 500 }
    );
  }
}
