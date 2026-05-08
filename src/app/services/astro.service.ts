import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AstroService {
  private readonly functionUrl =
    'https://rpblqmqzqmrdyrfgojpd.supabase.co/functions/v1/astro-match';

  private readonly anonKey =
    'sb_publishable_NE3BZDeOpJxje4FGHphTBg_TVoFeU6n';

  async getMatch(boy: any, girl: any) {
    try {
      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.anonKey,
          Authorization: `Bearer ${this.anonKey}`
        },
        body: JSON.stringify({
          male: boy,
          female: girl
        })
      });

      const text = await response.text();

      let result: any = null;
      try {
        result = JSON.parse(text);
      } catch {
        result = text;
      }

      if (!response.ok) {
        console.error('Astro API error response full:', JSON.stringify(result, null, 2));
        return null;
      }

      return result;
    } catch (error) {
      console.error('Astro API error:', error);
      return null;
    }
  }
}