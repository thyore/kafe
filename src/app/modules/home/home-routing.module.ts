import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingComponent } from './pages/booking/booking.component';
import { HomeComponent } from './home.component';
import { LandingComponent } from './pages/landing/landing.component';
import { ReceiptComponent } from './pages/receipt/receipt.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'landing', pathMatch: 'full' },
      { path: 'landing', component: LandingComponent },
      { path: 'booking', component: BookingComponent },
      { path: 'receipt', component: ReceiptComponent },
      { path: '**', redirectTo: 'landing', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
