import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { supabase } from '../core/supabase.client';

@Component({
  selector: 'app-received-interests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './received-interests.html',
  styleUrls: ['./received-interests.scss']
})
export class ReceivedInterests implements OnInit {
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);

  isLoading = false;
  interests: any[] = [];

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;

    await this.loadReceivedInterests();
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

  async loadReceivedInterests(): Promise<void> {
    this.isLoading = true;
    this.interests = [];
    this.cdr.detectChanges();

    try {
      const storedUser = this.getStoredLoggedInUser();
      

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
    
      }

      const loggedUserId =
        storedUser?.user_id ||
        authData?.user?.id;

      

      if (!loggedUserId) {
        this.showMessage('User not found. Please login again.');
        return;
      }

      const { data: myProfile, error: myProfileError } = await supabase
        .from('user_profiles')
        .select('user_id, profile_code, full_name')
        .eq('user_id', loggedUserId)
        .maybeSingle();

    

      if (myProfileError) {
        this.showMessage(myProfileError.message);
        return;
      }

      if (!myProfile?.profile_code) {
        this.showMessage('Your profile code not found');
        return;
      }

      const { data, error } = await supabase
        .from('matrimony_interests')
        .select('*')
        .eq('to_profile_id', myProfile.profile_code)
        .order('created_at', { ascending: false });


      if (error) {
        this.showMessage(error.message);
        return;
      }

      const interestRows = data || [];

      const senderIds = interestRows
        .map((item: any) => item.from_user_id)
        .filter(Boolean);

      if (senderIds.length === 0) {
        this.interests = [];
        return;
      }

      const { data: senderProfiles, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          profile_code,
          full_name,
          age,
          city_text,
          state_text,
          occupation_text,
          education_text,
          profile_image_url
        `)
        .in('user_id', senderIds);

  

      if (profileError) {
       
      }

      this.interests = interestRows.map((item: any) => {
        const sender = (senderProfiles || []).find(
          (p: any) => p.user_id === item.from_user_id
        );

        return {
          ...item,
          sender
        };
      });

    } catch (err) {
      
      this.showMessage('Something went wrong. Check console.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  viewProfile(item: any): void {
    if (!item?.sender?.profile_code) {
      this.showMessage('Profile code missing');
      return;
    }

    this.router.navigate(['/profile-view'], {
      queryParams: {
        unlocked: true,
        profileId: item.sender.profile_code,
        profileName: item.sender.full_name
      }
    });
  }

  async updateStatus(item: any, statusCode: 'accepted' | 'rejected'): Promise<void> {
    const { error } = await supabase
      .from('matrimony_interests')
      .update({ status_code: statusCode })
      .eq('id', item.id);

    if (error) {
      
      this.showMessage('Failed to update interest');
      return;
    }

    item.status_code = statusCode;
    this.cdr.detectChanges();
  }
}