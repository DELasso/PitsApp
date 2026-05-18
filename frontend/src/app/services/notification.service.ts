import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
import {
  Notification,
  UnreadCountResponse,
} from "../models/notification.model";

@Injectable({ providedIn: "root" })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCount$ = new BehaviorSubject<number>(0);
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private pollingInterval: any = null;

  unreadCount = this.unreadCount$.asObservable();
  notifications = this.notifications$.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        const user = this.authService.getCurrentUser();
        if (user?.role === "proveedor" || user?.role === "cliente") {
          this.startPolling();
        }
      } else {
        this.stopPolling();
        this.unreadCount$.next(0);
        this.notifications$.next([]);
      }
    });
  }

  startPolling(intervalMs = 15000): void {
    // Ejecutar inmediatamente al iniciar
    this.fetchUnreadCount();

    // Limpiar intervalo previo si existía
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      this.fetchUnreadCount();
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  fetchNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap((notifications) => {
        this.notifications$.next(notifications);
      }),
      catchError(() => {
        return of([] as Notification[]);
      }),
    );
  }

  fetchUnreadCount(): void {
    this.http
      .get<UnreadCountResponse>(`${this.apiUrl}/unread-count`)
      .pipe(catchError(() => of({ count: 0 })))
      .subscribe((response) => {
        this.unreadCount$.next(response.count);
      });
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap((updatedNotification) => {
        // Actualizar la notificación localmente en el BehaviorSubject
        const current = this.notifications$.getValue();
        const updated = current.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        );
        this.notifications$.next(updated);
        // Actualizar el contador
        this.fetchUnreadCount();
      }),
      catchError(() => {
        // Devolver la notificación del estado local si falla
        const current = this.notifications$.getValue();
        const notif = current.find((n) => n.id === id);
        return of(notif as Notification);
      }),
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        this.unreadCount$.next(0);
        const current = this.notifications$.getValue();
        const updated = current.map((n) => ({ ...n, isRead: true }));
        this.notifications$.next(updated);
      }),
      catchError(() => of(undefined as void)),
    );
  }

  deleteOne(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.notifications$.getValue();
        const removed = current.filter((n) => n.id !== id);
        this.notifications$.next(removed);
        // Recalcular contador sin hacer llamada extra
        const unread = removed.filter((n) => !n.isRead).length;
        this.unreadCount$.next(unread);
      }),
      catchError(() => of(undefined as void)),
    );
  }

  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-all`).pipe(
      tap(() => {
        this.notifications$.next([]);
        this.unreadCount$.next(0);
      }),
      catchError(() => of(undefined as void)),
    );
  }
}
