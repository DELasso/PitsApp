import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Workshop } from '../../models/workshop.model';
import { WorkshopsService } from '../../services/workshops.service';
import { FileUploadService } from '../../services/file-upload.service';
import { Review } from '../../models/review.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workshop-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './workshop-detail.component.html',
  styleUrls: ['./workshop-detail.component.scss']
})
export class WorkshopDetailComponent implements OnInit, OnDestroy {
  // Propiedades del taller
  workshop: Workshop | null = null;
  workshopId: string = '';
  isLoading: boolean = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Propiedades para reseñas
  reviews: Review[] = []; // Inicializa vacío para que el backend lo llene
  averageRating: number = 0;
  showNoReviewsMessage: boolean = true; // Inicializa en true

  // Datos quemados como fallback (solo se usan si falla el backend)
  private defaultWorkshop: Workshop = {
    id: '1',
    name: 'Taller Rápido El Poblado',
    description: 'Taller especializado en mantenimiento automotriz general.',
    rating: 0,
    reviewCount: 0,
    neighborhood: 'El Poblado',
    city: 'Medellín',
    address: 'Calle 10 # 20-30',
    phone: '+57 300 1234567',
    email: 'contacto@tallerrapido.com',
    website: 'www.tallerrapido.com',
    services: ['Cambio de aceite', 'Alineación y balanceo'],
    specialties: ['Mecánica general'],
    workingHours: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
    latitude: 6.2442, // Coordenadas aproximadas de Medellín
    longitude: -75.5812,
    images: ['/default-image.jpg'] , // Ejemplo de imagen por defecto
    isActive: true // Ejemplo de estado
  };

  private defaultReviews: Review[] = [
    {
      id: 'rev1',
      comment: 'Excelente servicio, muy rápido y profesional.',
      rating: 5,
      userId: 'user123',
      createdAt: new Date('2025-09-22')
    },
    {
      id: 'rev2',
      comment: 'Bueno, pero tardaron un poco.',
      rating: 4,
      userId: 'user456',
      createdAt: new Date('2025-09-23')
    }
  ];

  // Formulario de nueva reseña
  newComment: string = '';
  newRating: number = 5;
  isSubmitting: boolean = false; // Para mostrar loading en el botón

  // Mensaje de éxito
  showSuccessMessage: boolean = false;
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workshopsService: WorkshopsService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'];
        if (id) {
          this.workshopId = id;
          this.loadWorkshop(id);
        } else {
          this.error = 'ID del taller no encontrado';
          this.isLoading = false;
          this.useDefaultData(); // Fallback si no hay ID
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWorkshop(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.workshopsService.getWorkshop(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workshop: Workshop) => {
          this.workshop = workshop;
          this.isLoading = false;
          this.loadReviews();
          this.loadAverageRating();
        },
        error: (error: any) => {
          console.error('Error al cargar el taller:', error);
          this.error = 'No se pudo cargar la información del taller';
          this.isLoading = false;
          this.useDefaultData(); // Fallback si falla la carga
        }
      });
  }

  loadReviews(): void {
    this.workshopsService.getReviews(this.workshopId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.updateReviewState();
        this.calculateAverageRating();
      },
      error: (error) => {
        console.error('Error al cargar reseñas:', error);
        this.error = 'No se pudieron cargar las reseñas';
        this.reviews = [...this.defaultReviews]; // Fallback a reseñas quemadas
        this.updateReviewState();
        this.calculateAverageRating();
      }
    });
  }

  loadAverageRating(): void {
    this.workshopsService.getAverageRating(this.workshopId).subscribe({
      next: (data) => {
        this.averageRating = data.averageRating;
      },
      error: (error) => {
        console.error('Error al cargar el promedio:', error);
        this.calculateAverageRating(); // Calcula con las reseñas locales
      }
    });
  }

  addReview(): void {
    if (!this.newComment.trim() || this.newRating < 1 || this.newRating > 5) {
      this.error = 'Por favor, completa todos los campos correctamente';
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const reviewData = {
      comment: this.newComment,
      rating: this.newRating,
      userId: 'test_user'
    };

    this.workshopsService.createReview(this.workshopId, reviewData).subscribe({
      next: (newReview) => {
        this.reviews.unshift(newReview);
        this.newComment = '';
        this.newRating = 5;
        this.isSubmitting = false;
        this.updateReviewState();
        this.calculateAverageRating();
        this.showSuccessMessage = true;
        this.successMessage = '¡Reseña agregada con éxito!';
        setTimeout(() => this.showSuccessMessage = false, 3000);
      },
      error: (error) => {
        console.error('Error al enviar al backend:', error);
        this.isSubmitting = false;
        this.error = 'No se pudo conectar con el backend. Reseña agregada localmente.';
        const newReview: Review = {
          id: 'rev_' + Date.now(),
          comment: this.newComment.trim(),
          rating: this.newRating,
          userId: 'temp_' + Date.now().toString().slice(-6),
          createdAt: new Date()
        };
        this.reviews.unshift(newReview);
        this.newComment = '';
        this.newRating = 5;
        this.updateReviewState();
        this.calculateAverageRating();
      }
    });
  }

  private updateReviewState(): void {
    this.showNoReviewsMessage = this.reviews.length === 0;
  }

  private calculateAverageRating(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }
    const sum = this.reviews.reduce((total, r) => total + r.rating, 0);
    this.averageRating = Number((sum / this.reviews.length).toFixed(1));
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }

  get characterCounterClass(): string {
    const length = this.newComment.length;
    if (length >= 450) return 'danger';
    if (length >= 400) return 'warning';
    return '';
  }

  getImageUrl(imagePath: string): string {
    return this.fileUploadService.getImageUrl(imagePath);
  }

  onCallClick(phone: string): void {
    window.open(`tel:${phone}`, '_self');
  }

  onEmailClick(email: string): void {
    window.open(`mailto:${email}`, '_self');
  }

  onWebsiteClick(website: string): void {
    if (website) {
      window.open(website.startsWith('http') ? website : `https://${website}`, '_blank');
    }
  }

  onDirectionsClick(): void {
    if (this.workshop?.latitude && this.workshop?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.workshop.latitude},${this.workshop.longitude}`;
      window.open(url, '_blank');
    }
  }

  goBack(): void {
    this.router.navigate(['/talleres']);
  }

  private useDefaultData(): void {
    if (!this.workshop) this.workshop = { ...this.defaultWorkshop };
    if (this.reviews.length === 0) this.reviews = [...this.defaultReviews];
    this.updateReviewState();
    this.calculateAverageRating();
  }
}