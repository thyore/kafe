import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({ 
  imports: [
    CommonModule,
    HomeRoutingModule, 
    AngularSvgIconModule.forRoot(),
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class HomeModule {}
