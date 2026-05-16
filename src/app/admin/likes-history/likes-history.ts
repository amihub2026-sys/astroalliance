import {
  Component,
  OnInit,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule,
DatePipe
} from '@angular/common';

import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-likes-history',
  standalone: true,

  imports: [
    CommonModule,
    DatePipe
  ],

  templateUrl: './likes-history.html',
  styleUrls: ['./likes-history.scss']
})

export class LikesHistory implements OnInit {

  users: any[] = [];

  selectedHistory: any[] = [];

  usersWhoLiked: any[] = [];

  selectedUser: any = null;

  isLoading = true;

  
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

txt(en: string, ta: string): string {

  return this.currentLang === 'ta'
    ? ta
    : en;
}

v(en: any, ta: any): string {

  if (this.currentLang === 'ta') {

    return ta || en || '-';
  }

  return en || '-';
}

  async ngOnInit() {
    await this.loadUsers();
  }

 currentPage = 1;

pageSize = 10;

totalPages = 1;

async loadUsers() {

  this.isLoading = true;

  // LOAD ALL LIKES
  const { data: likesData, error } = await supabase
    .from('profile_likes')
    .select(`
      from_profile_id,
      to_profile_id
    `);

  if (error) {

    console.error(error);

    this.isLoading = false;

    return;
  }

  const likes = likesData || [];

  // GET UNIQUE PROFILE IDS
const uniqueIds = Array.from(
  new Set([

    ...likes.map(
      (x: any) =>
        x.from_profile_id
    ),

    ...likes.map(
      (x: any) =>
        x.to_profile_id
    )

  ])
).filter(Boolean);

  // PAGINATION
  const start = (this.currentPage - 1) * this.pageSize;

  const end = start + this.pageSize;

  const paginatedIds = uniqueIds.slice(start, end).filter(Boolean);

  // TOTAL PAGES
  this.totalPages = Math.max(
  1,
  Math.ceil(
    uniqueIds.length /
    this.pageSize
  )
);
console.log('UNIQUE IDS', uniqueIds);
console.log('PAGINATED IDS', paginatedIds);
  // LOAD ONLY LIKE RELATED USERS
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select(`
      profile_id,
      profile_code,
     full_name,
full_name_ta,
profile_image_url
    `)
.in(
  'profile_id',
  (paginatedIds.length
    ? paginatedIds
    : uniqueIds
  ).map(id => String(id).trim())
)
  const profilesList = profiles || [];
console.log(
  'PROFILES LIST',
  profilesList
);
 this.users = (profilesList || []).map(
  (profile: any) => {
    const sent = likes.filter(
      (x: any) =>
        x.from_profile_id === profile.profile_id
    ).length;

    const received = likes.filter(
      (x: any) =>
        x.to_profile_id === profile.profile_id
    ).length;

 return {
  ...profile,
  sent,
  received
};

  }
);

console.log(
  'FINAL USERS',
  this.users
);

  this.isLoading = false;
}
nextPage() {

  if (this.currentPage < this.totalPages) {

    this.currentPage++;

    this.loadUsers();
  }
}

previousPage() {

  if (this.currentPage > 1) {

    this.currentPage--;

    this.loadUsers();
  }
}

async viewHistory(user: any) {

 if (
  this.selectedUser?.profile_id ===
  user.profile_id
) {

  this.selectedUser = null;

this.selectedHistory = [];

this.usersWhoLiked = [];

return;

  return;
}

this.selectedUser = user;

this.selectedHistory = [];

this.usersWhoLiked = [];
const { data, error } = await supabase
  .from('profile_likes')
  .select(`
  like_id,
  created_at,
  from_profile_id,
  to_profile_id
`)
  .or(
    `from_profile_id.eq.${user.profile_id},to_profile_id.eq.${user.profile_id}`
  )
  .order('created_at', {
    ascending: false
  });

  if (error) {

    console.error(error);

    return;
  }
  console.log('LIKES DATA', data);

  const profileIds = Array.from(
  new Set([
    ...(data || []).map(x => x.from_profile_id),
    ...(data || []).map(x => x.to_profile_id)
  ])
);

const { data: profiles } = await supabase
  .from('user_profiles')
  .select(`
    profile_id,
    profile_code,
    full_name,
    full_name_ta
  `)
  .in('profile_id', profileIds);

  // LOAD ALL RELATED PROFILE IDS



this.selectedHistory =
  (data || [])
    .filter(item =>
      item.from_profile_id === user.profile_id
    )
    .map(item => {

      const matchedProfile =
        profiles?.find(
          p => p.profile_id === item.to_profile_id
        );

      return {

        ...item,

        to_profile: matchedProfile || null

      };

    });

this.usersWhoLiked =
  (data || [])
    .filter(item =>
      item.to_profile_id === user.profile_id
    )
    .map(item => {

      const matchedProfile =
        profiles?.find(
          p => p.profile_id === item.from_profile_id
        );

      return {

        ...item,

        from_profile: matchedProfile || null

      };

    });
this.selectedHistory = [...this.selectedHistory];

this.usersWhoLiked = [...this.usersWhoLiked];

this.cdr.detectChanges();

}
trackByLike(
  index: number,
  item: any
): string {

  return item.like_id;
}

}