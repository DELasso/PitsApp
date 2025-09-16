import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadWorkshopImages(files: File[]): Observable<any> {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    return this.http.post(`${this.apiUrl}/upload/workshop-images`, formData);
  }

  uploadPartImages(files: File[]): Observable<any> {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    return this.http.post(`${this.apiUrl}/upload/part-images`, formData);
  }

  uploadImages(files: File[], uploadType: 'workshop' | 'part'): Observable<any> {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    formData.append('uploadType', uploadType);

    return this.http.post(`${this.apiUrl}/upload/multiple`, formData);
  }

  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${environment.apiUrl.replace('/api', '')}${imagePath}`;
  }
}