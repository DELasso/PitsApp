import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class MapsService {
   private apiKey = process.env.GOOGLE_MAPS_API_KEY;

  constructor(private http: HttpService) {
    if (!this.apiKey) {
      console.warn('⚠️ GOOGLE_MAPS_API_KEY no está definida en el entorno');
    } else {
      console.log('✅ GOOGLE_MAPS_API_KEY cargada correctamente');
    }
  }

  async nearby(lat: number, lng: number, radius = 5000, type = 'car_repair') {
    if (!lat || !lng) throw new BadRequestException('lat y lng son requeridos');
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${this.apiKey}`;
    
    const resp = await firstValueFrom(this.http.get(url));
    const data = resp.data;

    const results = (data.results || []).map((r: any) => {
      const photoRef = r.photos?.[0]?.photo_reference;
      return {
        name: r.name,
        place_id: r.place_id,
        lat: r.geometry?.location?.lat,
        lng: r.geometry?.location?.lng,
        vicinity: r.vicinity,
        rating: r.rating,
        user_ratings_total: r.user_ratings_total,
        types: r.types,
        photoUrl: photoRef
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${this.apiKey}`
          : null
      };
    });

    return { results, next_page_token: data.next_page_token || null };
  }

  async getCoordinates(address: string) {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.status !== 'OK') {
        return { error: 'No se encontraron coordenadas', status: data.status };
      }

      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } catch (error) {
      console.error('Error al obtener coordenadas:', error);
      throw new Error('Error al consultar Google Maps API');
    }
  }
}
