import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { supabase } from '../core/supabase.client';

@Component({
  selector: 'app-sent-interests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sent-interests.html',
  styleUrls: ['./sent-interests.scss']
})
export class SentInterests implements OnInit, OnDestroy {
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);

  isLoading = false;
  interests: any[] = [];
  private interestChannel: any;

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;

    setTimeout(async () => {
      await this.loadSentInterests();
      this.listenInterestUpdates();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.interestChannel) {
      supabase.removeChannel(this.interestChannel);
    }
  }

  private showMessage(message: string): void {
    if (this.isBrowser) {
      window.alert(message);
    } else {
    
    }
  }

  private getStoredLoggedInUser(): any | null {
    if (!this.isBrowser) return null;

    try {
      const raw = localStorage.getItem('matrimony_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-avatar.png';
  }

  async loadSentInterests(): Promise<void> {
    this.isLoading = true;
    this.interests = [];
    this.cdr.detectChanges();

    try {
      const storedUser = this.getStoredLoggedInUser();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
      }

      const loggedUserId =
        storedUser?.user_id ||
        sessionData?.session?.user?.id;

   

      if (!loggedUserId) {
        this.showMessage('User not found');
        return;
      }

      const { data, error } = await supabase
        .from('matrimony_interests')
        .select('*')
        .eq('from_user_id', loggedUserId)
        .order('created_at', { ascending: false });


      if (error) {
        this.showMessage(error.message);
        return;
      }

      const interestRows = data || [];

      const profileCodes = interestRows
        .map((i: any) => i.to_profile_id)
        .filter(Boolean);

      if (profileCodes.length === 0) {
        this.interests = [];
        return;
      }

      const { data: receiverProfiles, error: receiverError } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          profile_code,
          full_name,
          age,
          city_text,
          state_text,
          occupation_text,
          profile_image_url
        `)
        .in('profile_code', profileCodes);

   

      if (receiverError) {
        console.error('Receiver profiles error:', receiverError);
      }

      this.interests = interestRows.map((item: any) => {
        const receiver = (receiverProfiles || []).find(
          (p: any) => p.profile_code === item.to_profile_id
        );

        return {
          ...item,
          receiver
        };
      });

    } catch (err) {
      console.error(err);
      this.showMessage('Something went wrong');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  viewProfile(item: any): void {
    if (!item?.receiver?.profile_code) {
      this.showMessage('Profile not found');
      return;
    }

    this.router.navigate(['/profile-view'], {
      queryParams: {
        unlocked: true,
        profileId: item.receiver.profile_code,
        profileName: item.receiver.full_name
      }
    });
  }

  listenInterestUpdates(): void {
    if (this.interestChannel) {
      supabase.removeChannel(this.interestChannel);
    }

    this.interestChannel = supabase
      .channel('sent-interests-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matrimony_interests'
        },
        async (payload: any) => {
          
          await this.loadSentInterests();
        }
      )
      .subscribe();
  }
}