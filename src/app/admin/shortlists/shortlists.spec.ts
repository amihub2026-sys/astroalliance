import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Shortlists } from './shortlists';

describe('Shortlists', () => {
  let component: Shortlists;
  let fixture: ComponentFixture<Shortlists>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shortlists],
    }).compileComponents();

    fixture = TestBed.createComponent(Shortlists);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
