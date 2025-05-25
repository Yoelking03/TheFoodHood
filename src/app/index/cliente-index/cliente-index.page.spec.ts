import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteIndexPage } from './cliente-index.page';

describe('ClienteIndexPage', () => {
  let component: ClienteIndexPage;
  let fixture: ComponentFixture<ClienteIndexPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClienteIndexPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
