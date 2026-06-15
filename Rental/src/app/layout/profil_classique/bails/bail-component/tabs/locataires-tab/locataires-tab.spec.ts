import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocatairesTab } from './locataires-tab';

describe('LocatairesTab', () => {
  let component: LocatairesTab;
  let fixture: ComponentFixture<LocatairesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocatairesTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocatairesTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
