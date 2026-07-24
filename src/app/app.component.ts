import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  template: `
    <app-main-layout></app-main-layout>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'icongener';
  
  constructor() {}
  
  ngOnInit(): void {
    // App initialization
  }
}
