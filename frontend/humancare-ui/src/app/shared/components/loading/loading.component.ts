import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() loading: boolean = true;
  @Input() overlay: boolean = false;
  @Input() fullscreen: boolean = false;
  @Input() diameter: number = 50;
  @Input() strokeWidth: number = 4;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() message: string = '';
}
