import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, BusinessType } from '../../models/auth.model';

@Component({
    selector: 'app-provider-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './provider-dashboard.component.html',
    styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit {
    user: User | null = null;
    workshopCount = 0;
    partsCount = 0;

    constructor(
        private authService: AuthService,
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

    private loadStats() {
        // TODO: Implementar llamadas a los servicios para obtener estadísticas
        // Por ahora, valores ficticios
        if (this.canManageWorkshops()) {
            this.workshopCount = 0; // workshopService.getWorkshopsByOwner(user.id).length
        }
        if (this.canManageParts()) {
            this.partsCount = 0; // partsService.getPartsByOwner(user.id).length
        }
    }
}