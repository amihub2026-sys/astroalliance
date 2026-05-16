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
  selector: 'app-cities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './cities.html',
  styleUrls: ['./cities.scss']
})
export class Cities implements OnInit {

 countries: any[] = [];

states: any[] = [];

cities: any[] = [];

  selectedStateId = '';

  cityName = '';
  cityNameTa = '';

  stateName = '';
  stateNameTa = '';
  countryId = '';

countryName = '';

countryNameTa = '';

editingCountryId = '';

  editingCityId = '';
  editingStateId = '';

activeTab: 'country' | 'state' | 'city' = 'country';

countryPage = 0;

statePage = 0;

cityPage = 0;

pageSize = 10;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {

  await this.loadCountries();

await this.loadStates();

await this.loadCities();
  }
async loadCountries() {

  const { data } = await supabase
    .from('mst_countries')
    .select('*')
   .order('country_name')
.range(
  this.countryPage * this.pageSize,
  (this.countryPage + 1) * this.pageSize - 1
);

  this.countries = data || [];

  this.cdr.detectChanges();
}
  async loadStates() {

    const { data } = await supabase
      .from('mst_states')
      .select('*')
  .order('state_name')
.range(
  this.statePage * this.pageSize,
  (this.statePage + 1) * this.pageSize - 1
);

    this.states = data || [];

    this.cdr.detectChanges();
  }
async addCountry() {

  if (!this.countryName) {

    alert('Enter country name');

    return;
  }

  const payload = {
    country_name: this.countryName,
    country_name_ta: this.countryNameTa
  };

  let error;

  if (this.editingCountryId) {

    const response = await supabase
      .from('mst_countries')
      .update(payload)
      .eq('country_id', this.editingCountryId);

    error = response.error;

  } else {

    const response = await supabase
      .from('mst_countries')
      .insert([payload]);

    error = response.error;
  }

  if (error) {

    alert(error.message);

    return;
  }

  alert(
    this.editingCountryId
      ? 'Country Updated'
      : 'Country Added'
  );

  this.resetCountryForm();

  await this.loadCountries();
}

editCountry(country: any) {

  this.editingCountryId = country.country_id;

  this.countryName = country.country_name;

  this.countryNameTa =
    country.country_name_ta || '';
}

async deleteCountry(countryId: string) {

  const ok = confirm(
    'Delete this country?'
  );

  if (!ok) return;

  await supabase
    .from('mst_countries')
    .delete()
    .eq('country_id', countryId);

  await this.loadCountries();
}

resetCountryForm() {

  this.editingCountryId = '';

  this.countryName = '';

  this.countryNameTa = '';
}
  async loadCities() {

    const { data } = await supabase
      .from('mst_cities')
      .select(`
        *,
        mst_states (
          state_name
        )
      `)
   .order('city_name')
.range(
  this.cityPage * this.pageSize,
  (this.cityPage + 1) * this.pageSize - 1
);

    this.cities = data || [];

    this.cdr.detectChanges();
  }
nextStatePage() {

  this.statePage++;

  this.loadStates();
}

prevStatePage() {

  if (this.statePage > 0) {

    this.statePage--;

    this.loadStates();
  }
}

nextCityPage() {

  this.cityPage++;

  this.loadCities();
}

prevCityPage() {

  

  if (this.cityPage > 0) {

    this.cityPage--;

    this.loadCities();
  }
}
  async addCity() {

    if (!this.selectedStateId || !this.cityName) {

      alert('Fill city fields');

      return;
    }

    const payload = {
      state_id: this.selectedStateId,
      city_name: this.cityName.trim(),
      city_name_ta: this.cityNameTa.trim()
    };

    let error;

    if (this.editingCityId) {

      const response = await supabase
        .from('mst_cities')
        .update(payload)
        .eq('city_id', this.editingCityId);

      error = response.error;

    } else {

      const response = await supabase
        .from('mst_cities')
        .insert([payload]);

      error = response.error;
    }

    if (error) {

      alert(error.message);

      return;
    }

    alert(
      this.editingCityId
        ? 'City Updated'
        : 'City Added'
    );

    this.resetCityForm();

    await this.loadCities();
  }

  editCity(city: any) {

    this.editingCityId = city.city_id;

    this.selectedStateId = city.state_id;

    this.cityName = city.city_name;

    this.cityNameTa = city.city_name_ta || '';
  }

  nextCountryPage() {

  this.countryPage++;

  this.loadCountries();
}

prevCountryPage() {

  if (this.countryPage > 0) {

    this.countryPage--;

    this.loadCountries();
  }
}

  async deleteCity(cityId: string) {

    const ok = confirm(
      'Delete this city?'
    );

    if (!ok) return;

    await supabase
      .from('mst_cities')
      .delete()
      .eq('city_id', cityId);

    await this.loadCities();
  }

  resetCityForm() {

    this.editingCityId = '';

    this.selectedStateId = '';

    this.cityName = '';

    this.cityNameTa = '';
  }

  async addState() {

    if (!this.stateName) {

      alert('Enter state name');

      return;
    }

    const payload = {
      country_id: this.countryId,
      state_name: this.stateName,
      state_name_ta: this.stateNameTa
    };

    let error;

    if (this.editingStateId) {

      const response = await supabase
        .from('mst_states')
        .update(payload)
        .eq('state_id', this.editingStateId);

      error = response.error;

    } else {

      const response = await supabase
        .from('mst_states')
        .insert([payload]);

      error = response.error;
    }

    if (error) {

      alert(error.message);

      return;
    }

    alert(
      this.editingStateId
        ? 'State Updated'
        : 'State Added'
    );

    this.resetStateForm();

    await this.loadStates();
  }

  editState(state: any) {

    this.editingStateId = state.state_id;

    this.stateName = state.state_name;

    this.stateNameTa =
      state.state_name_ta || '';

    this.countryId = state.country_id;
  }

  async deleteState(stateId: string) {

    const ok = confirm(
      'Delete this state?'
    );

    if (!ok) return;

    await supabase
      .from('mst_states')
      .delete()
      .eq('state_id', stateId);

    await this.loadStates();
  }

  resetStateForm() {

    this.editingStateId = '';

    this.stateName = '';

    this.stateNameTa = '';

    this.countryId = '';
  }
}