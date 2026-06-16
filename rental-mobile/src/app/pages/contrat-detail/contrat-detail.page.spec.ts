import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContratDetailPage } from './contrat-detail.page';

describe('ContratDetailPage', () => {
  let component: ContratDetailPage;
  let fixture: ComponentFixture<ContratDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
