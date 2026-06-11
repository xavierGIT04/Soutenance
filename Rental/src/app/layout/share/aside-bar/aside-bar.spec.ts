import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideBar } from './aside-bar';

describe('AsideBar', () => {
  let component: AsideBar;
  let fixture: ComponentFixture<AsideBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsideBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
