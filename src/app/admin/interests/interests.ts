import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-interests',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './interests.html',

  styleUrls: ['./interests.scss'],



})
export class Interests
implements OnInit{

constructor(
  private cd: ChangeDetectorRef
) {}

  interests: any[] = [];
filteredInterests: any[] = [];
interestUsers: any[] = [];

  searchTerm = '';


  selectedHistory: any[] = [];

  selectedSender: any = null;



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
  await this.loadInterests();
}

openHistory(
  item: any,
  event?: Event
): void {

  event?.preventDefault();

  event?.stopPropagation();

  this.selectedSender =
    item.sender;

  this.selectedHistory =
    item.history
      ? [...item.history]
      : [];

  this.cd.detectChanges();

}
 async loadInterests(): Promise<void> {

  this.isLoading = true;

  const { data, error } = await supabase
    .from('matrimony_interests')
    .select('*')
    .order('created_at', {
      ascending: false
    });

    console.log('INTEREST DATA', data);
console.log('INTEREST ERROR', error);

  if (error) {

    console.error(error);

    this.isLoading = false;

    return;
  }

  // GET ALL PROFILES ONCE
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

const sender =
  profiles?.find(p =>

    p.user_id ===
    item.from_user_id
  );

const receiver =
  profiles?.find(p =>

    p.profile_code?.trim() ===
    item.to_profile_id?.trim()
  );

console.log('SENDER', sender);

console.log('RECEIVER', receiver);

   if (!sender || !receiver) {
  continue;
}

formatted.push({

  ...item,

  sender,

  receiver
});
  }

this.interests = formatted;

this.prepareInterestUsers();

this.isLoading = false;

this.cd.detectChanges();
}
prepareInterestUsers(): void {

  const grouped = new Map();

  for (const item of this.interests) {

    if (!item.sender) {
      continue;
    }

    const code =
      item.sender.profile_code;

    if (!grouped.has(code)) {

      grouped.set(code, {

        sender: item.sender,

        sent: 0,

        received: 0,

        accepted: 0,

        pending: 0,

        rejected: 0,

        history: []
      });
    }

    const user =
      grouped.get(code);

    user.sent++;

    if (
      item.status_code ===
      'accepted'
    ) {
      user.accepted++;
    }

    if (
      item.status_code ===
      'pending'
    ) {
      user.pending++;
    }

    if (
      item.status_code ===
      'rejected'
    ) {
      user.rejected++;
    }

    user.history.push(item);
  }

  for (const item of this.interests) {

    const receiverCode =
      item.receiver?.profile_code;

    if (
      receiverCode &&
      grouped.has(receiverCode)
    ) {

      grouped.get(receiverCode)
        .received++;
    }
  }

  this.interestUsers =
    Array.from(grouped.values());

let result =
  [...this.interestUsers];

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

this.filteredInterests = result;
}

  getStatus(status: string): string {

    switch (status) {

      case 'pending':
        return 'Pending';

      case 'accepted':
        return 'Accepted';

      case 'rejected':
        return 'Rejected';

      default:
        return 'Unknown';
    }
  }
trackByProfile(
  index: number,
  item: any
): string {

  return item.sender?.profile_code;

}
trackByHistory(
  index: number,
  item: any
): string {

  return item.id;

}

}
