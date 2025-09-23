import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleMapsService {
  private apiKey = process.env.GOOGLE_MAPS_API_KEY;

  constructor(private http: HttpService) {
    if (!this.apiKey) console.warn('GOOGLE_MAPS_API_KEY no está definida');
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
}
