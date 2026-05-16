import {
  Component,
  OnInit,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-caste-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './caste-list.html',
  styleUrls: ['./caste-list.scss']
})
export class CasteList implements OnInit {

  castes: any[] = [];
  religions: any[] = [];

  isLoading = true;

  showForm = false;

  isEdit = false;

  selectedId = '';

  searchTerm = '';
currentPage = 1;

itemsPerPage = 10;
isSaving = false;

constructor(
  private ngZone: NgZone,
  private cd: ChangeDetectorRef
) {}
  formData: any = {
    religion_id: '',
    caste_code: '',
    caste_name: '',
    caste_name_ta: '',
    sort_order: 0,
    is_active: true
  };

  async ngOnInit(): Promise<void> {

    await this.loadReligions();

    await this.loadCastes();
  }

  async loadReligions(): Promise<void> {

    const { data } = await supabase
      .from('mst_religions')
      .select('*')
      .eq('is_active', true)
      .order('religion_name');

    this.religions = data || [];
  }

  async loadCastes(): Promise<void> {

    this.isLoading = true;

    const { data, error } = await supabase
      .from('mst_castes')
      .select(`
        *,
        mst_religions (
          religion_name
        )
      `)
      .order('sort_order', { ascending: true });

  this.ngZone.run(() => {

  if (!error) {

    this.castes = data || [];

  } else {

    console.error('Caste load error:', error);

    this.castes = [];

  }

  this.isLoading = false;

  this.cd.detectChanges();

});
  }

  openAdd(): void {

    this.isEdit = false;

    this.showForm = true;

    this.formData = {
      religion_id: '',
      caste_code: '',
      caste_name: '',
      caste_name_ta: '',
      sort_order: 0,
      is_active: true
    };
  }

  editCaste(item: any): void {

    this.isEdit = true;

    this.showForm = true;

    this.selectedId = item.caste_id;

    this.formData = {
      religion_id: item.religion_id,
      caste_code: item.caste_code,
      caste_name: item.caste_name,
      caste_name_ta: item.caste_name_ta,
      sort_order: item.sort_order,
      is_active: item.is_active
    };
  }

  async saveCaste(): Promise<void> {

    if (this.isSaving) {
  return;
}

this.isSaving = true;

    if (!this.formData.religion_id || !this.formData.caste_name) {

alert('Please fill required fields');

this.isSaving = false;

return;
    }

    if (this.isEdit) {

      await supabase
        .from('mst_castes')
        .update(this.formData)
        .eq('caste_id', this.selectedId);

    } else {

  const { error } = await supabase
  .from('mst_castes')
  .insert([this.formData]);

if (error) {

  console.error(error);

  alert(error.message);

  this.isSaving = false;

  return;
}
    }
this.currentPage = 1;
 this.showForm = false;

const { data: latestData } = await supabase
  .from('mst_castes')
  .select(`
    *,
    mst_religions (
      religion_name
    )
  `)
  .order('sort_order', { ascending: true });

this.ngZone.run(() => {

  this.castes = latestData || [];

  this.showForm = false;

  this.isLoading = false;

  this.cd.detectChanges();
  this.isSaving = false;

});
  }

  async toggleStatus(item: any): Promise<void> {

    await supabase
      .from('mst_castes')
      .update({
        is_active: !item.is_active
      })
      .eq('caste_id', item.caste_id);

   await this.loadCastes();

this.ngZone.run(() => {

  this.cd.detectChanges();

});
  }
get totalPages(): number {

  return Math.ceil(this.filteredCastes.length / this.itemsPerPage);

}

get paginatedCastes(): any[] {

  const start =
    (this.currentPage - 1) * this.itemsPerPage;

  return this.filteredCastes.slice(
    start,
    start + this.itemsPerPage
  );

}

nextPage(): void {

  if (this.currentPage < this.totalPages) {

    this.currentPage++;

  }

}

prevPage(): void {

  if (this.currentPage > 1) {

    this.currentPage--;

  }

}
  get filteredCastes(): any[] {

    if (!this.searchTerm) {

      return this.castes;
    }

    return this.castes.filter(x =>

      x.caste_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||

      x.caste_name_ta?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||

      x.caste_code?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

}