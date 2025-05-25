import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminIndexPage } from './admin-index.page';

describe('AdminIndexPage', () => {
  let component: AdminIndexPage;
  let fixture: ComponentFixture<AdminIndexPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminIndexPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
