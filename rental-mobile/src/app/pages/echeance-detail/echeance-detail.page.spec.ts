import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EcheanceDetailPage } from './echeance-detail.page';

describe('EcheanceDetailPage', () => {
  let component: EcheanceDetailPage;
  let fixture: ComponentFixture<EcheanceDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EcheanceDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
