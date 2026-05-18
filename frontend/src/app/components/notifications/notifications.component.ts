import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faBell,
  faTrash,
  faWrench,
  faHandshake,
  faCheckDouble,
  faArrowRight,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { NotificationService } from "../../services/notification.service";
import {
  Notification,
  NotificationType,
} from "../../models/notification.model";

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.scss"],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  // FontAwesome icons
  faBell = faBell;
  faTrash = faTrash;
  faWrench = faWrench;
  faHandshake = faHandshake;
  faCheckDouble = faCheckDouble;
  faArrowRight = faArrowRight;
  faStar = faStar;

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private elementRef: ElementRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.notificationService.notifications
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications;
      });

    this.notificationService.unreadCount
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.unreadCount = count;
      });

    this.notificationService.fetchUnreadCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.notificationService
      .fetchNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  markAsRead(notification: Notification, event: Event): void {
    if (!notification.isRead) {
      this.notificationService
        .markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  markAllAsRead(): void {
    this.notificationService
      .markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  deleteOne(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService
      .deleteOne(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  deleteAll(): void {
    this.notificationService
      .deleteAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  navigateTo(notification: Notification, event: Event): void {
    event.stopPropagation();
    // Marcar como leída si no lo está
    if (!notification.isRead) {
      this.notificationService
        .markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    const route = this.getRouteForNotification(notification);
    this.router.navigateByUrl(route);
    this.isOpen = false;
  }

  getNotificationIcon(type: NotificationType | string) {
    if (type === NotificationType.NEW_SERVICE_REQUEST) {
      return this.faWrench;
    }
    if (type === NotificationType.BID_ACCEPTED) {
      return this.faStar;
    }
    return this.faHandshake;
  }

  getRouteForNotification(notification: Notification): string {
    // Proveedor: va al detalle de la solicitud disponible para ofertar
    if (notification.type === NotificationType.NEW_SERVICE_REQUEST) {
      if (notification.relatedId) {
        return `/servicios/disponibles/${notification.relatedId}`;
      }
      return "/servicios/disponibles";
    }
    // Cliente: va a ver las ofertas recibidas en su solicitud
    if (notification.type === NotificationType.NEW_BID_RECEIVED) {
      if (notification.relatedId) {
        return `/servicios/solicitud/${notification.relatedId}/ofertas`;
      }
      return "/servicios/mis-solicitudes";
    }
    // Proveedor: su oferta fue aceptada, va al detalle de la solicitud a realizar
    if (notification.type === NotificationType.BID_ACCEPTED) {
      if (notification.relatedId) {
        return `/servicios/disponibles/${notification.relatedId}`;
      }
      return "/servicios/mis-ofertas";
    }
    return "/servicios";
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "Ahora mismo";
    } else if (diffMinutes < 60) {
      return `hace ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    } else if (diffDays === 1) {
      return "ayer";
    } else if (diffDays < 7) {
      return `hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }
}
