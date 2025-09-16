import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Workshop } from '../../models/workshop.model';
import { WorkshopsService } from '../../services/workshops.service';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-workshop-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workshop-detail.component.html',
  styleUrls: ['./workshop-detail.component.scss']
})
export class WorkshopDetailComponent implements OnInit, OnDestroy {
  workshop: Workshop | null = null;
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

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

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }
}