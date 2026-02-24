import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss']
})
export class AppShellComponent {
  sidebarOpen$: Observable<boolean>;
  isHandset$: Observable<boolean>;

  constructor(
    private navigationService: NavigationService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.sidebarOpen$ = this.navigationService.sidebarOpen$;
    
    this.isHandset$ = this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.TabletPortrait
    ]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  onSidebarClosed(): void {
    // Sync the service state when sidebar closes (e.g., via backdrop click on mobile)
    if (this.navigationService.isSidebarOpen) {
      this.navigationService.closeSidebar();
    }
  }
}
