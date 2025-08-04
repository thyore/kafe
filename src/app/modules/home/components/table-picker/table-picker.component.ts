import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges, AfterViewInit, OnInit } from '@angular/core';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-table-picker',
  templateUrl: './table-picker.component.html',
  styleUrls: ['./table-picker.component.scss'],
  imports: [CommonModule, ButtonComponent, AngularSvgIconModule],
})
export class TablePickerComponent implements OnChanges, OnInit {
  
  selectedTable = signal<string>('');

  @Input({ required: true }) tables: { label: string; image: string; maxSeats: number; childrenAllowed: boolean; smokingAllowed: boolean }[] = [];
  @Input({ required: false }) partySize: number = 0;
  @Input({ required: false }) willSmoke: boolean = false;
  @Input({ required: false }) hasChildren: boolean = false;
  @Input({ required: false }) initialSelection: string = '';
  @Output() selectedTableChange = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {
    if (this.initialSelection) {
      this.selectedTable.set(this.initialSelection);
    }
  }

  setSelectedTable() {
    // Only emit if a table is selected
    if (this.selectedTable()) {
      this.selectedTableChange.emit(this.selectedTable());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['partySize'] || changes['willSmoke'] || changes['hasChildren']) {
      const selected = this.selectedTable();
      const selectedTableObj = this.tables.find(t => t.label === selected);
      if (!selected || (selectedTableObj && this.isDisabled(selectedTableObj))) {
        const nextAvailable = this.tables.find(t => !this.isDisabled(t));
        // Only emit if the selection actually changed
        if (nextAvailable && nextAvailable.label !== selected) {
          this.selectedTable.set(nextAvailable.label);
        } else if (!nextAvailable && selected) {
          this.selectedTable.set('');
        }
      }
    }
  }

  getSelectedImage() {
    return this.tables.find(t => t.label === this.selectedTable())?.image;
  }

  isDisabled(table: { maxSeats: number; childrenAllowed: boolean; smokingAllowed: boolean }) {
    if (this.partySize > table.maxSeats) return true;
    if (this.hasChildren && !table.childrenAllowed) return true;
    if (this.willSmoke && !table.smokingAllowed) return true;
    return false;
  }

  onClose() {
    // Just close without resetting the selection
    this.close.emit();
  }

  getSelectedTable() {
    return this.tables.find(t => t.label === this.selectedTable()) || null;
  }
}
