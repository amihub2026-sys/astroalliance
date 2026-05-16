import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  
  ],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss']
})
export class Payments implements OnInit {

  isLoading = true;

  searchTerm = '';

  payments: any[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadPayments();
  }

  async loadPayments(): Promise<void> {

    this.isLoading = true;

    const { data, error } = await supabase
      .from('payments')
      .select(`
        payment_id,
        user_id,
        amount,
        payment_status,
        payment_method,
        transaction_id,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Payments error:', error);
      this.payments = [];
    } else {
      this.payments = data || [];
    }

    this.isLoading = false;
  }

  get filteredPayments(): any[] {

    const term = this.searchTerm
      .trim()
      .toLowerCase();

    if (!term) {
      return this.payments;
    }

    return this.payments.filter(payment =>

      String(payment.user_id || '')
        .toLowerCase()
        .includes(term)

      ||

      String(payment.payment_status || '')
        .toLowerCase()
        .includes(term)

      ||

      String(payment.transaction_id || '')
        .toLowerCase()
        .includes(term)

      ||

      String(payment.payment_method || '')
        .toLowerCase()
        .includes(term)

    );
  }

  async refresh(): Promise<void> {
    await this.loadPayments();
  }

}