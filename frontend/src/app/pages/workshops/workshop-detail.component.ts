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
  reviews: Review[] = [];  // ← Array que controla si mostrar "no reseñas" o lista
  averageRating: number = 0;
  showNoReviewsMessage: boolean = true;  // ← Controla el mensaje "no reseñas"


  // Formulario de nueva reseña
  newComment: string = '';
  newRating: number = 5;
  isSubmitting: boolean = false;  // ← Para mostrar loading en el botón

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
          this.loadWorkshop(id);
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

  loadReviews(): void {
    this.workshopsService.getReviews(this.workshopId).subscribe(reviews => {
      this.reviews = reviews;
    });
  }

  loadAverageRating(): void {
    this.workshopsService.getAverageRating(this.workshopId).subscribe(data => {
      this.averageRating = data.averageRating;
    });
  }

  addReview(): void {
    const reviewData = { comment: this.newComment, rating: this.newRating, userId: 'user123' };
    this.workshopsService.createReview(this.workshopId, reviewData).subscribe(() => {
      this.newComment = '';
      this.loadReviews();  // Recarga la lista
      this.loadAverageRating();
    });
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
        },
        error: (error: any) => {
          console.error('Error al cargar el taller:', error);
          this.error = 'No se pudo cargar la información del taller';
          this.isLoading = false;
        }
      });
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

getStarArray(rating: number): number[] {
  // Devuelve un array de números del 1 al 5
  return Array.from({ length: 5 }, (_, index) => index + 1);
}
}