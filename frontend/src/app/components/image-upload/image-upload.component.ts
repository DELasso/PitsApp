import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements ControlValueAccessor {
  @Input() label = 'Imágenes';
  @Input() required = false;
  @Input() uploadType: 'workshop' | 'part' = 'workshop';
  @Output() imagesChanged = new EventEmitter<string[]>();

  imageUrls: string[] = [];
  isDragOver = false;
  isUploading = false;
  errorMessage = '';

  private onChange = (value: string[]) => {};
  private onTouched = () => {};

  constructor(private fileUploadService: FileUploadService) {}

  // ControlValueAccessor implementation
  writeValue(value: string[]): void {
    this.imageUrls = value || [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Drag and drop events
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.handleFiles(files);
  }

  private handleFiles(files: File[]): void {
    this.errorMessage = '';
    
    // Validar número de archivos
    if (this.imageUrls.length + files.length > 5) {
      this.errorMessage = 'Máximo 5 imágenes permitidas';
      return;
    }

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      this.errorMessage = 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)';
      return;
    }

    // Validar tamaño de archivos
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      this.errorMessage = 'Algunas imágenes superan el tamaño máximo de 5MB';
      return;
    }

    this.uploadFiles(files);
  }

  private uploadFiles(files: File[]): void {
    this.isUploading = true;
    
    this.fileUploadService.uploadImages(files, this.uploadType).subscribe({
      next: (response) => {
        if (response.success) {
          this.imageUrls = [...this.imageUrls, ...response.urls];
          this.onChange(this.imageUrls);
          this.imagesChanged.emit(this.imageUrls);
        }
        this.isUploading = false;
      },
      error: (error) => {
        console.error('Error uploading images:', error);
        this.errorMessage = 'Error al subir las imágenes. Intenta de nuevo.';
        this.isUploading = false;
      }
    });
  }

  removeImage(index: number): void {
    this.imageUrls.splice(index, 1);
    this.onChange(this.imageUrls);
    this.imagesChanged.emit(this.imageUrls);
    this.onTouched();
  }

  getImageUrl(url: string): string {
    return this.fileUploadService.getImageUrl(url);
  }
}