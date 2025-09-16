import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token del servicio de autenticación
    const token = this.authService.getToken();
    
    console.log('AuthInterceptor - URL:', req.url);
    console.log('AuthInterceptor - Token disponible:', !!token);
    
    // Si hay token, agregar el header Authorization
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('AuthInterceptor - Headers agregados:', authReq.headers.get('Authorization'));
      return next.handle(authReq);
    }
    
    console.log('AuthInterceptor - Sin token, enviando request sin modificar');
    // Si no hay token, enviar la request sin modificar
    return next.handle(req);
  }
}