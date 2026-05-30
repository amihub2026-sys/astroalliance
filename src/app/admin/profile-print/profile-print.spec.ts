import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePrint } from './profile-print';

describe('ProfilePrint', () => {
  let component: ProfilePrint;
  let fixture: ComponentFixture<ProfilePrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePrint],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePrint);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
