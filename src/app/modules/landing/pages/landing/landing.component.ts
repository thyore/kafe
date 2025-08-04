import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [AngularSvgIconModule, ButtonComponent, CommonModule],
})
export class LandingComponent {

  constructor(private router: Router) {}

  navigateToBookingPage() {
    this.router.navigate(['/booking']);
  }
}
