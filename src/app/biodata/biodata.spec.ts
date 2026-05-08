import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Biodata } from './biodata';

describe('Biodata', () => {
  let component: Biodata;
  let fixture: ComponentFixture<Biodata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Biodata],
    }).compileComponents();

    fixture = TestBed.createComponent(Biodata);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
