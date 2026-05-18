import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CartService } from "./services/cart.service";
import { AuthService } from "./services/auth.service";
import { CartSummary } from "./models/cart.model";
import { User, UserRole } from "./models/auth.model";
import { AiChatComponent } from "./components/ai-chat/ai-chat.component";
import { UiOverlayComponent } from "./components/ui-overlay/ui-overlay.component";
import { NotificationsComponent } from "./components/notifications/notifications.component";
import { NotificationService } from "./services/notification.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    FontAwesomeModule,
    UiOverlayComponent,
    AiChatComponent,
    NotificationsComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit, OnDestroy {
  title = "PitsApp";
  faShoppingCart = faShoppingCart;
  UserRole = UserRole;
  cartSummary: CartSummary | null = null;
  currentUser: User | null = null;
  isLoggedIn = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadCartSummary();
    this.loadAuthState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCartSummary(): void {
    this.cartService
      .getCartSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe((summary) => {
        this.cartSummary = summary;
      });
  }

  private loadAuthState(): void {
    // Suscribirse al estado de autenticación
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      });

    // Suscribirse al usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  logout(): void {
    this.authService.logout();
  }

  getUserHomeRoute(): string {
    if (this.currentUser?.role === UserRole.CLIENTE) {
      return "/cliente/vehiculos";
    }

    return "/provider/dashboard";
  }

  redirectToHome(event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl("/");
  }
}
