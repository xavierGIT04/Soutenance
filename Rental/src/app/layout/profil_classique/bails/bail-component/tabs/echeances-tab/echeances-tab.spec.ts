import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcheancesTab } from './echeances-tab';

describe('EcheancesTab', () => {
  let component: EcheancesTab;
  let fixture: ComponentFixture<EcheancesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcheancesTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcheancesTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
