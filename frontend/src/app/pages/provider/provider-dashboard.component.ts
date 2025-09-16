import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { WorkshopsService } from '../../services/workshops.service';
import { PartsService } from '../../services/parts.service';
import { User, BusinessType } from '../../models/auth.model';
import { Workshop } from '../../models/workshop.model';
import { Part } from '../../models/part.model';

@Component({
    selector: 'app-provider-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './provider-dashboard.component.html',
    styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit, OnDestroy {
    user: User | null = null;
    workshopCount = 0;
    partsCount = 0;
    loading = false;
    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private workshopsService: WorkshopsService,
        private partsService: PartsService,
        private router: Router
    ) { }

    ngOnInit() {
        this.user = this.authService.getCurrentUser();
        if (!this.user) {
            this.router.navigate(['/auth/login']);
            return;
        }

        // Cargar estadísticas
        this.loadStats();

        // Suscribirse a eventos de navegación para refrescar cuando se regrese al dashboard
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe((event: NavigationEnd) => {
                if (event.url === '/provider/dashboard') {
                    // Se regresó al dashboard, refrescar estadísticas
                    this.loadStats();
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    canManageWorkshops(): boolean {
        return this.user?.businessType === BusinessType.TALLER_MECANICO ||
            this.user?.businessType === BusinessType.TALLER_Y_REPUESTOS;
    }

    canManageParts(): boolean {
        return this.user?.businessType === BusinessType.VENTA_REPUESTOS ||
            this.user?.businessType === BusinessType.TALLER_Y_REPUESTOS;
    }

    isBothBusinessType(): boolean {
        return this.user?.businessType === BusinessType.TALLER_Y_REPUESTOS;
    }

    getBusinessTypeLabel(): string {
        switch (this.user?.businessType) {
            case BusinessType.TALLER_MECANICO:
                return 'Especialista en Talleres';
            case BusinessType.VENTA_REPUESTOS:
                return 'Proveedor de Repuestos';
            case BusinessType.TALLER_Y_REPUESTOS:
                return 'Negocio Completo';
            default:
                return 'Sin especificar';
        }
    }

    getBusinessTypeClass(): string {
        switch (this.user?.businessType) {
            case BusinessType.TALLER_MECANICO:
                return 'workshop-badge';
            case BusinessType.VENTA_REPUESTOS:
                return 'parts-badge';
            case BusinessType.TALLER_Y_REPUESTOS:
                return 'both-badge';
            default:
                return 'default-badge';
        }
    }

    navigateToWorkshops() {
        this.router.navigate(['/workshops']);
    }

    navigateToParts() {
        this.router.navigate(['/parts']);
    }

    createWorkshop() {
        this.router.navigate(['/workshops/create']);
    }

    createPart() {
        this.router.navigate(['/parts/create']);
    }

    refreshStats() {
        this.loadStats();
    }

    private loadStats() {
        if (!this.user?.id) return;

        this.loading = true;

        // Cargar cantidad de talleres si el usuario puede gestionarlos
        if (this.canManageWorkshops()) {
            this.workshopsService.getMyWorkshops()
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (workshops: Workshop[]) => {
                        this.workshopCount = workshops.length;
                        console.log(`📊 Talleres del proveedor: ${this.workshopCount}`);
                    },
                    error: (error: any) => {
                        console.error('Error cargando talleres:', error);
                        this.workshopCount = 0;
                    }
                });
        }

        // Cargar cantidad de repuestos si el usuario puede gestionarlos
        if (this.canManageParts()) {
            this.partsService.getMyParts()
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (parts: Part[]) => {
                        this.partsCount = parts.length;
                        console.log(`📊 Repuestos del proveedor: ${this.partsCount}`);
                        this.loading = false;
                    },
                    error: (error: any) => {
                        console.error('Error cargando repuestos:', error);
                        this.partsCount = 0;
                        this.loading = false;
                    }
                });
        } else {
            this.loading = false;
        }
    }
}