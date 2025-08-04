import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePickerComponent } from './table-picker.component';

describe('TablePickerComponent', () => {
  let component: TablePickerComponent;
  let fixture: ComponentFixture<TablePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TablePickerComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
