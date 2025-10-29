import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Workshop } from '../../models/workshop.model';
import { WorkshopReview, WorkshopReviewsResponse } from '../../models/workshop-review.model';
import { WorkshopsService } from '../../services/workshops.service';
import { WorkshopReviewService } from '../../services/workshop-review.service';
import { FileUploadService } from '../../services/file-upload.service';
import { AuthService } from '../../services/auth.service';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-workshop-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, GoogleMapsModule],
  templateUrl: './workshop-detail.component.html',
  styleUrls: ['./workshop-detail.component.scss']
})
export class WorkshopDetailComponent implements OnInit, OnDestroy {
  workshop: Workshop | null = null;
  reviews: WorkshopReview[] = [];
  reviewForm: FormGroup;
  isLoading = true;
  isLoadingReviews = false;
  isSubmittingReview = false;
  error: string | null = null;
  reviewError: string | null = null;
  reviewSuccess: string | null = null;
  selectedRating = 0;
  hoverRating = 0;
  private destroy$ = new Subject<void>();

  // Configuración del mapa
  mapCenter: google.maps.LatLngLiteral = { lat: 6.2442, lng: -75.5812 };
  mapZoom = 15;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    zoomControl: true,
    scrollwheel: true
  };
  markerPosition: google.maps.LatLngLiteral = { lat: 6.2442, lng: -75.5812 };
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private workshopsService: WorkshopsService,
    private reviewService: WorkshopReviewService,
    private fileUploadService: FileUploadService,
    public authService: AuthService
  ) {
    this.reviewForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'];
        if (id) {
          this.loadWorkshop(id);
          this.loadReviews(id);
        } else {
          this.error = 'ID del taller no encontrado';
          this.isLoading = false;
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
          
          // Actualizar posición del mapa si tiene coordenadas válidas
          if (workshop.latitude && workshop.longitude && 
              workshop.latitude !== 0 && workshop.longitude !== 0) {
            this.mapCenter = { lat: workshop.latitude, lng: workshop.longitude };
            this.markerPosition = { lat: workshop.latitude, lng: workshop.longitude };
          }
        },
        error: (error: any) => {
          console.error('Error al cargar el taller:', error);
          this.error = 'No se pudo cargar la información del taller';
          this.isLoading = false;
        }
      });
  }

  private loadReviews(workshopId: string): void {
    this.isLoadingReviews = true;
    this.reviewService.getReviews(workshopId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.reviews = response.data.reviews;
            // Actualizar el rating del workshop con los datos más recientes
            if (this.workshop) {
              this.workshop.rating = response.data.averageRating;
              this.workshop.reviewCount = response.data.reviewCount;
            }
          }
          this.isLoadingReviews = false;
        },
        error: (error) => {
          console.error('Error al cargar reseñas:', error);
          this.isLoadingReviews = false;
        }
      });
  }

  hasUserReviewed(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    return this.reviews.some(review => review.userId === currentUser.id);
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
  }

  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }

  submitReview(): void {
    if (this.reviewForm.invalid || this.selectedRating === 0 || !this.workshop) {
      this.reviewError = 'Por favor, selecciona una calificación y escribe un comentario de al menos 10 caracteres.';
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.reviewError = 'Debes iniciar sesión para dejar una reseña.';
      return;
    }

    this.isSubmittingReview = true;
    this.reviewError = null;
    this.reviewSuccess = null;

    const reviewData = {
      rating: this.selectedRating,
      comment: this.reviewForm.value.comment
    };

    this.reviewService.createReview(this.workshop.id, reviewData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.reviewSuccess = 'Reseña agregada exitosamente';
            this.reviewForm.reset();
            this.selectedRating = 0;
            this.hoverRating = 0;
            this.loadReviews(this.workshop!.id);
            
            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => {
              this.reviewSuccess = null;
            }, 3000);
          }
          this.isSubmittingReview = false;
        },
        error: (error) => {
          console.error('Error al enviar reseña:', error);
          this.reviewError = error.error?.message || 'No se pudo agregar la reseña. Puede que ya hayas dejado una reseña para este taller.';
          this.isSubmittingReview = false;
        }
      });
  }

  deleteReview(reviewId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      return;
    }

    this.reviewService.deleteReview(reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && this.workshop) {
            this.loadReviews(this.workshop.id);
          }
        },
        error: (error) => {
          console.error('Error al eliminar reseña:', error);
          alert('No se pudo eliminar la reseña');
        }
      });
  }

  canDeleteReview(review: WorkshopReview): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === review.userId;
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

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }
}