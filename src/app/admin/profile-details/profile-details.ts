import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { supabase } from '../../core/supabase.client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-details.html',
  styleUrls: ['./profile-details.scss']
})
export class ProfileDetails implements OnInit, OnChanges {
  @Input() id = '';

  isLoading = true;
  profile: any = null;
get currentLang(): 'en' | 'ta' {
  if (typeof window === 'undefined') {
    return 'en';
  }

  return (localStorage.getItem('tm_language') as 'en' | 'ta') || 'en';
}

txt(en: string, ta: string): string {
  return this.currentLang === 'ta' ? ta : en;
}

v(en: any, ta: any): string {
  if (this.currentLang === 'ta') {
    return ta || en || '-';
  }

  return en || '-';
}

statusText(status: string): string {
  if (this.currentLang === 'en') {
    return status || 'Pending';
  }

  const map: any = {
    Pending: 'நிலுவையில்',
    Approved: 'ஒப்புதல்',
    Rejected: 'நிராகரிக்கப்பட்டது',
    Blocked: 'தடைசெய்யப்பட்டது',
    'Under Review': 'மதிப்பாய்வில்'
  };

  return map[status || 'Pending'] || status;
}
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    setTimeout(() => {
      this.loadFromRoute();
    }, 0);
  }
genderText(value: string): string {
  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Male: 'ஆண்',
    Female: 'பெண்',
    Other: 'மற்றவை'
  };

  return map[value] || value || '-';
}
dhoshamText(value: string): string {
  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Yes: 'உண்டு',
    No: 'இல்லை'
  };

  return map[value] || value || '-';
}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['id'] && this.id) {
      await this.loadProfile(this.id);
    }
  }

  async loadFromRoute(): Promise<void> {
    const urlParts = window.location.pathname.split('/');
    const urlId = urlParts[urlParts.length - 1];

    if (!urlId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    await this.loadProfile(urlId);
  }

  async loadProfile(id: string): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('profile_id', id)
      .single();

    this.profile = error ? null : data;
    this.isLoading = false;
    this.cdr.detectChanges();
  }

 async downloadBiodataPdf(): Promise<void> {
  const element = document.getElementById('biodataPdf');

  if (!element || !this.profile) {
   alert(
  this.currentLang === 'ta'
    ? 'பயோடேட்டா தயாராக இல்லை'
    : 'Biodata not ready'
);
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a3');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 8;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  const imgWidth = availableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const finalHeight = Math.min(imgHeight, availableHeight);

  pdf.addImage(
    imgData,
    'PNG',
    margin,
    margin,
    imgWidth,
    finalHeight
  );

  pdf.save(`${this.profile.profile_code || 'biodata'}.pdf`);
}

  async updateStatus(status: string): Promise<void> {
    if (!this.profile) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ profile_status: status })
      .eq('profile_id', this.profile.profile_id);

    if (error) {
     alert(
  this.currentLang === 'ta'
    ? 'நிலை புதுப்பிக்க முடியவில்லை'
    : 'Failed to update status'
);
      return;
    }

    this.profile.profile_status = status;
    this.cdr.detectChanges();

   alert(
  this.currentLang === 'ta'
    ? `சுயவிவரம் ${this.statusText(status)}`
    : `Profile ${status}`
);
  }

  onChartImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-avatar.png';
  }
}