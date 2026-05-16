import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-profile-views',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './profile-views.html',
  styleUrls: ['./profile-views.scss']
})
export class ProfileViews
implements OnInit, OnChanges {

  views: any[] = [];

  searchTerm = '';

  selectedHistory: any[] = [];

  selectedViewer: any = null;

  isLoading = false;

  constructor(

    
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}
get currentLang(): 'en' | 'ta' {

  if (typeof window === 'undefined') {
    return 'en';
  }

  const lang =
    localStorage.getItem('tm_language');

  return lang === 'ta'
    ? 'ta'
    : 'en';
}

v(en: any, ta: any): string {

  if (this.currentLang === 'ta') {

    return ta || en || '-';
  }

  return en || '-';
}
  async ngOnInit(): Promise<void> {

    await this.loadViews();
  }

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    console.log(
      'Profile view changes',
      changes
    );

    this.cdr.detectChanges();
  }

  openHistory(item: any): void {

    this.ngZone.run(() => {

      this.selectedViewer = item;

      this.selectedHistory =
        this.views.filter(v =>

          v.viewer?.profile_code ===
          item.viewer?.profile_code
        );

      this.cdr.detectChanges();
    });
  }

  get filteredViews() {

    const grouped = new Map();

    for (const item of this.views) {

     const key =
  item.viewer?.profile_code || '';

      if (!grouped.has(key)) {

        grouped.set(key, item);
      }
    }

    let result =
      Array.from(grouped.values());

    if (!this.searchTerm) {

      return result;
    }

    return result.filter(item =>

     (item.viewer?.full_name || '')
  .toLowerCase()
        .includes(
          this.searchTerm.toLowerCase()
        )

      ||

      (item.viewer?.profile_code || '')
  .toLowerCase()
        .includes(
          this.searchTerm.toLowerCase()
        )
    );
  }

  async loadViews(): Promise<void> {

    this.isLoading = true;

    const { data, error } = await supabase
      .from('profile_views')
      .select(`
        *,
viewer:user_profiles!fk_profile_views_viewer (

  full_name,
  full_name_ta,

  profile_code,

  profile_image_url,

  city_text,
  city_text_ta,

  religion_text,
  religion_text_ta
),

viewed:user_profiles!fk_profile_views_viewed (

  full_name,
  full_name_ta,

  profile_code,

  profile_image_url,

  city_text,
  city_text_ta,

  religion_text,
  religion_text_ta
)
      `)
      .order('viewed_at', {
        ascending: false
      });

    this.ngZone.run(() => {

      if (error) {

        console.error(error);

        this.isLoading = false;

        this.cdr.detectChanges();

        return;
      }

      this.views = data || [];

      console.log(this.views);

      this.isLoading = false;

      this.cdr.detectChanges();
    });
  }
}