import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentInterests } from './sent-interests';

describe('SentInterests', () => {
  let component: SentInterests;
  let fixture: ComponentFixture<SentInterests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentInterests],
    }).compileComponents();

    fixture = TestBed.createComponent(SentInterests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
