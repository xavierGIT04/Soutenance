import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EcheancesPage } from './echeances.page';

describe('EcheancesPage', () => {
  let component: EcheancesPage;
  let fixture: ComponentFixture<EcheancesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EcheancesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
