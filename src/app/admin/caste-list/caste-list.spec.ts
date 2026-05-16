import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasteList } from './caste-list';

describe('CasteList', () => {
  let component: CasteList;
  let fixture: ComponentFixture<CasteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasteList],
    }).compileComponents();

    fixture = TestBed.createComponent(CasteList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
