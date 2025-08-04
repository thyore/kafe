import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TablePickerComponent } from '../../components/table-picker/table-picker.component';
import { SocketService } from 'src/app/services/socket.service';
import { Subscription } from 'rxjs';
import { DateOption, Reservation, TableOption, TimeSlot } from 'src/app/core/models/reservation.model';
import { generateUUID } from 'src/app/shared/utils/generateUUID';
import { tableWithDateAndTime } from './init.data';
import { ToastrService } from 'ngx-toastr';
import { emailValidator, nameValidator, phoneValidator } from 'src/app/shared/utils/validators';
import { formatPhoneNumber } from 'src/app/shared/helper/phone.helper';
import { countryCodes } from 'src/app/shared/utils/contants';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [AngularSvgIconModule, ButtonComponent, CommonModule, HeaderComponent, FormsModule, ReactiveFormsModule, TablePickerComponent],
})
export class BookingComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  submitted = signal(false);

  showTablePicker = signal(true);
  showCountryDropdown = signal(false);
  countrySearchTerm = signal('');

  selectedDate = signal<string>('');
  selectedTime = signal<string>('');
  selectedTable = signal<string>('');
  selectedCountryCode = signal<string>('+63');

  updatedReservations = signal<Reservation[]>([]);
  tableData = signal<TableOption[]>(structuredClone(tableWithDateAndTime));
  
  availableTables = computed(() => this.getTables());
  availableDates = computed(() => this.getDates());
  availableTimeSlots = computed(() => this.getTimeslots());

  filteredCountryCodes = computed(() => {
    const searchTerm = this.countrySearchTerm().toLowerCase();
    if (!searchTerm) return countryCodes;
    
    return countryCodes.filter(country => 
      country.country.toLowerCase().includes(searchTerm) ||
      country.code.includes(searchTerm)
    );
  });

  selectedCountryFlag = computed(() => {
    const country = countryCodes.find(c => c.code === this.selectedCountryCode());
    return country?.flag || '';
  });

  private reservationSubscription: Subscription = new Subscription();
  private formChangeSubscriptions: Subscription = new Subscription();

  constructor(private readonly fb: FormBuilder, private router: Router, private socketService: SocketService, private toastr: ToastrService) {}

  getPhoneNumberFormatter(event: any): void {
    const selectedCountryCode = this.selectedCountryCode();
    // Call the helper function to format the phone number
    formatPhoneNumber(event, selectedCountryCode, this.form);
  }

  // Method to select country code
  selectCountryCode(countryCode: string): void {
    this.selectedCountryCode.set(countryCode);
    this.showCountryDropdown.set(false);
    
    // Update phone number formatting without adding country code
    const currentValue = this.form.get('phoneNumber')?.value || '';
    const digitsOnly = currentValue.replace(/\D/g, '');
    
    let formattedValue = '';
    if (digitsOnly.length > 0) {
      if (digitsOnly.length <= 3) {
        formattedValue = digitsOnly;
      } else if (digitsOnly.length <= 6) {
        formattedValue = digitsOnly.substring(0, 3) + '-' + digitsOnly.substring(3);
      } else {
        formattedValue = digitsOnly.substring(0, 3) + '-' + digitsOnly.substring(3, 6) + '-' + digitsOnly.substring(6);
      }
    }
    
    this.form.get('phoneNumber')?.setValue(formattedValue);
  }

  // Method to toggle country dropdown
  toggleCountryDropdown(): void {
    this.showCountryDropdown.set(!this.showCountryDropdown());
    if (this.showCountryDropdown()) {
      this.countrySearchTerm.set('');
    }
  }

  // Method to search countries
  searchCountries(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.countrySearchTerm.set(target.value);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.listenForReservationUpdates();
    this.listenForFormChanges();
    this.setupClickOutsideListener();
  }

  ngOnDestroy(): void {
    this.reservationSubscription.unsubscribe();
    this.formChangeSubscriptions.unsubscribe();
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  private setupClickOutsideListener(): void {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.country-dropdown');
    const button = document.querySelector('.country-dropdown-button');
    
    if (dropdown && button && !dropdown.contains(target) && !button.contains(target)) {
      this.showCountryDropdown.set(false);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      bookingID: [generateUUID()],
      name: ['', [Validators.required, nameValidator]],
      email: ['', [Validators.required, Validators.email, emailValidator]],
      phoneNumber: ['', [Validators.required, phoneValidator]],
      partySize: [1, [Validators.required, Validators.min(1)]],
      hasChildren: [false],
      willSmoke: [false],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      selectedTable: ['', [Validators.required]]
    });
  }

  private listenForFormChanges(): void {
    // Reset table selection when party size, smoking preference, or children presence changes
    const partySize$ = this.form.get('partySize')?.valueChanges.subscribe(() => {
      this.resetTableSelection();
    });

    const willSmoke$ = this.form.get('willSmoke')?.valueChanges.subscribe(() => {
      this.resetTableSelection();
    });

    const hasChildren$ = this.form.get('hasChildren')?.valueChanges.subscribe(() => {
      this.resetTableSelection();
    });

    if (partySize$) this.formChangeSubscriptions.add(partySize$);
    if (willSmoke$) this.formChangeSubscriptions.add(willSmoke$);
    if (hasChildren$) this.formChangeSubscriptions.add(hasChildren$);
  }

  private resetTableSelection(): void {
    this.showTablePicker.set(true);
    this.selectedTable.set('');
    this.selectedDate.set('');
    this.selectedTime.set('');
    this.form.get('selectedTable')?.setValue('');
    this.form.get('date')?.setValue('');
    this.form.get('time')?.setValue('');
  }

  private listenForReservationUpdates(): void {
    
    // Listen for reservation updates
    this.reservationSubscription = this.socketService.on('getReservations')
      .subscribe({
        next: (reservations: Reservation[]) => {
          this.updatedReservations.set(reservations);
          this.updateAvailability(reservations);
        },
        error: (err) => console.error('Error receiving reservations:', err)
      });
    
    // Request initial reservations data from server
    setTimeout(() => {
      this.socketService.emit('getReservations', { requestId: generateUUID() });
    }, 500);
  }

  private updateAvailability(reservations: Reservation[]): void {
    const updatedData = structuredClone(this.tableData());
    
    updatedData.forEach(table => {
      let tableHasAvailableDates = false;
      
      table.dates.forEach(date => {
        let dateHasAvailableTimeslots = false;
        
        // Check the timeslots availability for each date
        date.timeSlots.forEach(slot => {
          const isTaken = reservations.some(reservation =>
            reservation.selectedTable === table.label &&
            reservation.date === date.value &&
            reservation.time === slot.value
          );
          
          slot.available = !isTaken;
          
          if (slot.available) {
            dateHasAvailableTimeslots = true;
          }
        });
        
        date.available = dateHasAvailableTimeslots;
        
        if (dateHasAvailableTimeslots) {
          tableHasAvailableDates = true;
        }
      });
      
      table.available = tableHasAvailableDates;
    });
    
    this.tableData.set(updatedData);
  }

  get f() {
    return this.form.controls;
  }
  
  onDateChange(date: string) {
    this.selectedDate.set(date);
    this.form.get('date')?.setValue(date);
    this.form.get('time')?.setValue(''); // Reset time when date changes
    this.selectedTime.set(''); // Reset selected time
  }

  onTimeChange(time: string) {
    this.selectedTime.set(time);
    this.form.get('time')?.setValue(time);
  }

  onSubmit() {
    // Set form values before validation (without modifying phone number yet)
    this.form.patchValue({
      date: this.selectedDate(),
      time: this.selectedTime(),
      selectedTable: this.selectedTable()
    });

    this.submitted.set(true);
    
    if (this.form.invalid) {
      return;
    }
    
    // Only add country code to phone number after validation passes
    const phoneNumber = this.form.get('phoneNumber')?.value || '';
    const fullPhoneNumber = this.selectedCountryCode() + ' ' + phoneNumber;
    
    const formValue = {
      ...this.form.value,
      phoneNumber: fullPhoneNumber
    };
    
    if (this.updatedReservations().some(reservation => 
      reservation.selectedTable === formValue.selectedTable && 
      reservation.date === formValue.date && 
      reservation.time === formValue.time
    )) {
      this.toastr.error('Sorry, this table is already booked for the selected date and time. Please choose another date and time.');
      this.selectedDate.set('');
      this.selectedTime.set('');
      return;
    }
    
    this.socketService.emit('reservation', formValue);
    this.router.navigate(['/receipt'], { queryParams: formValue })
      .then(() => 
        this.toastr.success('Reservation successful!')
      ).catch(err => console.error('Navigation failed:', err));
  }

  onTableSelect(table: string) {
    this.selectedTable.set(table);
    this.form.get('selectedTable')?.setValue(table);
    // Reset date when table is selected
    this.form.get('date')?.setValue('');
    this.selectedDate.set('');
    // Reset time when table is selected
    this.form.get('time')?.setValue('');
    this.selectedTime.set('');
    this.showTablePicker.set(false);
  }

  toggleTablePicker(show: boolean) {
    this.showTablePicker.set(show);
  }

  getTables(): TableOption[] {
    return this.tableData().map(table => ({
      label: table.label,
      image: table.image,
      maxSeats: table.maxSeats,
      childrenAllowed: table.childrenAllowed,
      smokingAllowed: table.smokingAllowed,
      available: table.available,
      dates: table.dates
    }));
  }

  getDates(): DateOption[] {
    const selectedTableValue = this.selectedTable();
    if (!selectedTableValue) return [];
    
    // Check availability of dates based on current reservations
    const tableEntry = this.tableData().find(table => table.label === selectedTableValue);
    return tableEntry?.dates || [];
  }
  
  getTimeslots(): TimeSlot[] {
    const selectedTableValue = this.selectedTable();
    const selectedDateValue = this.selectedDate();
    const currentReservations = this.updatedReservations();
    
    if (!selectedDateValue || !selectedTableValue) return [];
    
    const tableEntry = this.tableData().find(table => table.label === selectedTableValue);
    const dateEntry = tableEntry?.dates.find(date => date.value === selectedDateValue);
    
    if (!dateEntry?.timeSlots) return [];
    
    // Check availability of time slots based on current reservations
    return dateEntry.timeSlots.map(slot => ({
      value: slot.value,
      available: !currentReservations.some(reservation =>
        reservation.selectedTable === selectedTableValue &&
        reservation.date === selectedDateValue &&
        reservation.time === slot.value
      )
    }));
  }
}
