import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, map, startWith, shareReplay } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { User, MenuItem } from '../../../shared/models/user.model';
import { MenuService } from '../../../core/services/menu.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  menuItems$: Observable<MenuItem[]>;
  currentUser$: Observable<User | null>;
  isHandset$: Observable<boolean>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private menuService: MenuService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    this.menuItems$ = this.menuService.getMenuItemsForUser(this.authService.getCurrentUser());
    this.currentUser$ = this.authService.getCurrentUser$();
    
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit(): void {
    // Subscribe to user changes to update menu items
    this.authService.getCurrentUser$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.menuItems$ = this.menuService.getMenuItemsForUser(user);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getInitials(user: User): string {
    if (!user) return '';
    const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  getPrimaryRole(user: User): string {
    if (!user || !user.roles || user.roles.length === 0) return 'User';
    const rolePriority = ['ADMIN', 'DOCTOR', 'CAREGIVER', 'PATIENT'];
    for (const role of rolePriority) {
      if (user.roles.includes(role as any)) {
        return role.toLowerCase();
      }
    }
    return user.roles[0].toLowerCase();
  }

  isDividerNeeded(item: MenuItem, isLast: boolean): boolean {
    // Add divider after specific menu sections
    const dividerAfter = ['Dashboard', 'Profile', 'Appointments', 'Schedule', 'Medical Records'];
    return !isLast && dividerAfter.includes(item.label);
  }
}
