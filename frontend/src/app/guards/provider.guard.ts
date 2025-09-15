import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BusinessType, UserRole } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class ProviderGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const user = this.authService.getCurrentUser();

        if (!user) {
            this.router.navigate(['/auth/login']);
            return false;
        }

        if (user.role !== UserRole.PROVEEDOR) {
            this.router.navigate(['/']);
            return false;
        }

        return true;
    }
}

@Injectable({
    providedIn: 'root'
})
export class BusinessTypeGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const user = this.authService.getCurrentUser();

        if (!user) {
            this.router.navigate(['/auth/login']);
            return false;
        }

        if (user.role !== UserRole.PROVEEDOR) {
            this.router.navigate(['/']);
            return false;
        }

        // Obtener el tipo de negocio requerido desde los datos de la ruta
        const requiredBusinessType = route.data['businessType'] as BusinessType;

        if (!requiredBusinessType) {
            return true; // Si no se especifica tipo de negocio, permitir acceso
        }

        const userBusinessType = user.businessType;

        // Verificar si el usuario puede acceder según su tipo de negocio
        switch (requiredBusinessType) {
            case BusinessType.TALLER_MECANICO:
                return userBusinessType === BusinessType.TALLER_MECANICO ||
                    userBusinessType === BusinessType.TALLER_Y_REPUESTOS;

            case BusinessType.VENTA_REPUESTOS:
                return userBusinessType === BusinessType.VENTA_REPUESTOS ||
                    userBusinessType === BusinessType.TALLER_Y_REPUESTOS;

            case BusinessType.TALLER_Y_REPUESTOS:
                return userBusinessType === BusinessType.TALLER_Y_REPUESTOS;

            default:
                return false;
        }
    }
}