import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-shortlists',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './shortlists.html',
  styleUrls: ['./shortlists.scss']
})
export class Shortlists
implements OnInit {
  constructor(
  private cd: ChangeDetectorRef
) {}

  shortlists: any[] = [];

  filteredShortlists: any[] = [];

  selectedHistory: any[] = [];

  selectedUser: any = null;

  searchTerm = '';

  isLoading = false;
get currentLang(): 'en' | 'ta' {

  if (
    typeof window === 'undefined'
  ) {
    return 'en';
  }

  return (
    localStorage.getItem(
      'tm_language'
    ) as 'en' | 'ta'
  ) || 'en';
}
  async ngOnInit(): Promise<void> {

    await this.loadShortlists();
  }

  async loadShortlists(): Promise<void> {

    this.isLoading = true;

    const { data, error } = await supabase
      .from('matrimony_shortlists')
      .select('*')
      .order('created_at', {
        ascending: false
      });

    if (error) {

      console.error(error);

      this.isLoading = false;

      return;
    }

    // GET ALL PROFILES
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select(`
        profile_id,
        user_id,
        full_name,
full_name_ta,
profile_code
      `);

    const formatted: any[] = [];

    for (const item of data || []) {

      // sender
      const sender =
        profiles?.find(p =>

          p.user_id === item.user_id
        );

      // receiver
     const receiver =
  profiles?.find(p =>

    p.profile_code === item.profile_id
  );

      if (!sender || !receiver) {
  continue;
}

formatted.push({

  ...item,

  sender,

  receiver
});
    }

    this.shortlists = formatted;

    this.filterShortlists();

this.isLoading = false;

this.cd.detectChanges();  }

  filterShortlists(): void {

    const grouped = new Map();

    for (const item of this.shortlists) {

      const key =
        item.sender?.profile_code;

      if (!grouped.has(key)) {

        grouped.set(key, item);
      }
    }

    let result =
      Array.from(grouped.values());

    if (this.searchTerm) {

      result = result.filter(item =>

        item.sender?.full_name
          ?.toLowerCase()
          .includes(
            this.searchTerm.toLowerCase()
          )

        ||

        item.sender?.profile_code
          ?.toLowerCase()
          .includes(
            this.searchTerm.toLowerCase()
          )
      );
    }

    this.filteredShortlists = result;
  }

openHistory(item: any, event?: Event): void {

  event?.preventDefault();
  event?.stopPropagation();

  this.selectedUser = item;

  this.selectedHistory =
    this.shortlists.filter(s =>

      s.sender?.profile_code ===
      item.sender?.profile_code

      ||

      s.receiver?.profile_code ===
      item.sender?.profile_code
    );

  this.cd.detectChanges();
}
}
