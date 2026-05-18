import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMyNotifications(@Request() req) {
    return this.notificationsService.findByUserId(req.user.userId);
  }

  @Get("unread-count")
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.findUnreadCount(
      req.user.userId,
    );
    return { count };
  }

  // IMPORTANTE: esta ruta debe ir ANTES de /:id/read para evitar conflictos
  @Patch("mark-all-read")
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Patch(":id/read")
  markAsRead(@Param("id") id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  // IMPORTANTE: esta ruta debe ir ANTES de /:id para evitar conflictos
  @Delete("delete-all")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAll(@Request() req) {
    return this.notificationsService.deleteAll(req.user.userId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param("id") id: string, @Request() req) {
    return this.notificationsService.delete(id, req.user.userId);
  }
}
