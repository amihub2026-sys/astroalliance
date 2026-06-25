import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-profile-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-print.html',
  styleUrl: './profile-print.scss',
})
export class ProfilePrint implements OnInit {
  profile: any = null;
  isLoading = true;
  today = new Date();
  withPhoto = false;
  withAddress = true;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

ngOnInit(): void {
  const code = this.route.snapshot.paramMap.get('code') || '';

  this.withPhoto = this.route.snapshot.queryParamMap.get('photo') === '1';
  this.withAddress = this.route.snapshot.queryParamMap.get('address') === '1';

  this.loadProfile(code);
}

  async loadProfile(code: string): Promise<void> {
 const { data } = await supabase
  .from('user_profiles')
.select(`
  *,
  mst_colors (
    color_name,
    color_name_ta
  ),
  mst_kudumba_nilai (
    nilai_name,
    nilai_name_ta
  ),
  mst_marital_statuses (
    status_name,
    status_name_ta
  ),
  mst_religions (
    religion_name,
    religion_name_ta
  ),
  mst_castes (
    caste_name,
    caste_name_ta
  )
`)
  .eq('profile_code', code)
  .maybeSingle();

    this.zone.run(() => {
      this.profile = data;
      console.log('PRINT PROFILE:', this.profile);
console.log('marital_status_text_ta:', this.profile?.marital_status_text_ta);
console.log('religion_text_ta:', this.profile?.religion_text_ta);
console.log('caste_text_ta:', this.profile?.caste_text_ta);
console.log('rasi_text_ta:', this.profile?.rasi_text_ta);
console.log('lagnam_text_ta:', this.profile?.lagnam_text_ta);
      this.isLoading = false;
      this.cdr.detectChanges();

      if (typeof window !== 'undefined' && this.profile) {
       setTimeout(() => {
  const loadingText = document.querySelector('.print-loading');

  if (!loadingText) {
    window.print();
  }
}, 2000);
      }
    });
  }
v(en: any, ta: any): string {
  return ta || en || '-';
}
formatBirthTime(time: string): string {
  if (!time) return '-';

  const parts = time.split(':');
  let hour = Number(parts[0]);
  const minute = parts[1] || '00';

  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
}
formatThisaiIruppu(value: string): string {
  return (value || '')
    .replaceAll('வருடம்', 'வ')
    .replaceAll('மாதம்', 'மா')
    .replaceAll('நாள்', 'நா')
    .replaceAll('Year', 'Y')
    .replaceAll('Month', 'M')
    .replaceAll('Day', 'D');
}

getRasiChart(): string[] {

  const chart = this.profile?.rasi_chart;

  if (!chart) return Array(12).fill('');

  if (Array.isArray(chart)) {
    return chart;
  }

  try {
    const parsed = JSON.parse(chart);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return Array(12).fill('');
  } catch {
    return Array(12).fill('');
  }
}

getAmsamChart(): string[] {

  const chart = this.profile?.amsam_chart;

  if (!chart) return Array(12).fill('');

  if (Array.isArray(chart)) {
    return chart;
  }

  try {
    const parsed = JSON.parse(chart);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return Array(12).fill('');
  } catch {
    return Array(12).fill('');
  }
}
}