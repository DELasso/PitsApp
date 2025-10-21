import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { WorkshopsService } from '../../services/workshops.service';
import { Workshop } from '../../models/workshop.model';


@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  center = { lat: 6.2442, lng: -75.5812 }; // Medellín de ejemplo
  zoom = 13;
  markers: any[] = [];
  workshops: Workshop[] = [];
  selected: any = null;

  constructor(private workshopsService: WorkshopsService) {}

  ngOnInit() {
    // prueba sin backend
    /*
    this.workshopsService.getWorkshopsMocked().subscribe(data => {
      this.workshops = data;
      this.markers = data.map(w => ({
        position: { lat: w.latitude, lng: w.longitude },
        title: w.name,
        info: w
      }));
    });
*/
    // 🔹 Cuando tengas backend listo, reemplaza por esto:
    
    this.workshopsService.getCercanos(this.center.lat, this.center.lng).subscribe(data => {
      this.workshops = data;
      this.markers = data.map(w => ({
        position: { lat: w.latitude, lng: w.longitude },
        title: w.name,
        info: w
      }));
    });
    
  }

  selectMarker(marker: any) {
    this.selected = marker;
  }

  goToMarker(i: number) {
    const m = this.markers[i];
    this.center = m.position; // mueve el mapa al taller
    this.selectMarker(m);
  }
}