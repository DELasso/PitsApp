import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../../common/supabase/supabase.service";
import { Notification, NotificationType } from "./entities/notification.entity";
import { CreateNotificationDto } from "./dto/create-notification.dto";

@Injectable()
export class NotificationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private mapToNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: data.is_read,
      relatedId: data.related_id ?? undefined,
      relatedType: data.related_type ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        is_read: false,
        related_id: dto.relatedId ?? null,
        related_type: dto.relatedType ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }

    return this.mapToNotification(data);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }

    return data.map((n) => this.mapToNotification(n));
  }

  async findUnreadCount(userId: string): Promise<number> {
    const supabase = this.supabaseService.getClient();

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      throw new Error(`Error counting unread notifications: ${error.message}`);
    }

    return count ?? 0;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const supabase = this.supabaseService.getClient();

    // Verificar que la notificación existe y pertenece al usuario
    const { data: existing, error: findError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      throw new NotFoundException(`Notificación ${id} no encontrada`);
    }

    if (existing.user_id !== userId) {
      throw new ForbiddenException(
        "No tienes permiso para marcar esta notificación",
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Error marking notification as read: ${error?.message}`);
    }

    return this.mapToNotification(data);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      throw new Error(
        `Error marking all notifications as read: ${error.message}`,
      );
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { data: existing, error: findError } = await supabase
      .from("notifications")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      throw new NotFoundException(`Notificación ${id} no encontrada`);
    }

    if (existing.user_id !== userId) {
      throw new ForbiddenException(
        "No tienes permiso para eliminar esta notificación",
      );
    }

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  async deleteAll(userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Error deleting all notifications: ${error.message}`);
    }
  }

  async notifyProvidersNewServiceRequest(
    serviceRequestId: string,
    serviceType: string,
    description: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { data: providers, error } = await supabase
      .from("users")
      .select("id")
      .eq("role", "proveedor");

    if (error || !providers || providers.length === 0) {
      console.log("No se encontraron proveedores para notificar");
      return;
    }

    const serviceTypeLabels: Record<string, string> = {
      home_service: "Servicio a domicilio",
      tow_truck: "Grúa",
      express_oil_change: "Cambio de aceite express",
      mechanical_diagnosis: "Diagnóstico mecánico",
      specific_repair: "Reparación",
      emergency_service: "Servicio de emergencia",
      tire_change: "Cambio de llanta",
      battery_service: "Cambio de batería",
      other: "Otro",
    };
    const serviceLabel = serviceTypeLabels[serviceType] || serviceType;
    const shortDescription =
      description.length > 80
        ? `${description.substring(0, 80)}...`
        : description;

    const notifications = providers.map((provider) => ({
      user_id: provider.id,
      type: NotificationType.NEW_SERVICE_REQUEST,
      title: `Nueva solicitud: ${serviceLabel}`,
      message: shortDescription,
      is_read: false,
      related_id: serviceRequestId,
      related_type: "service_request",
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      throw new Error(`Error notifying providers: ${insertError.message}`);
    }
  }

  async notifyClientNewBid(
    clientId: string,
    serviceRequestId: string,
    providerName: string,
    amount: number,
  ): Promise<void> {
    const formattedAmount = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);

    await this.create({
      userId: clientId,
      type: NotificationType.NEW_BID_RECEIVED,
      title: "Nueva oferta recibida",
      message: `${providerName} ha enviado una oferta de ${formattedAmount} para tu solicitud.`,
      relatedId: serviceRequestId,
      relatedType: "service_request",
    });
  }

  async notifyProviderBidAccepted(
    providerId: string,
    serviceRequestId: string,
    clientName: string,
    serviceType: string,
  ): Promise<void> {
    const serviceTypeLabels: Record<string, string> = {
      home_service: "Servicio a domicilio",
      tow_truck: "Grúa / Remolque",
      express_oil_change: "Cambio de aceite express",
      mechanical_diagnosis: "Diagnóstico mecánico",
      specific_repair: "Reparación específica",
      emergency_service: "Servicio de emergencia",
      tire_change: "Cambio de llanta",
      battery_service: "Servicio de batería",
      other: "Otro",
    };
    const serviceLabel = serviceTypeLabels[serviceType] || serviceType;

    await this.create({
      userId: providerId,
      type: NotificationType.BID_ACCEPTED,
      title: "¡Tu oferta fue aceptada!",
      message: `${clientName} aceptó tu oferta para el servicio de ${serviceLabel}. Prepárate para realizar el trabajo.`,
      relatedId: serviceRequestId,
      relatedType: "service_request",
    });
  }
}
