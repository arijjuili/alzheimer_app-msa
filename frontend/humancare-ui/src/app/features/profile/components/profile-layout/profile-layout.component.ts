import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './profile-layout.component.html',
  styleUrls: ['./profile-layout.component.scss']
})
export class ProfileLayoutComponent implements OnInit {
  navLinks = [
    { path: 'view', label: 'View Profile', icon: 'person', hidden: false },
    { path: 'edit', label: 'Edit Profile', icon: 'edit', hidden: false },
    { path: 'audit', label: 'Audit Log', icon: 'history', hidden: true }
  ];

  activeLink = 'view';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Show audit tab only for non-patient roles
    const user = this.authService.getCurrentUser();
    const isPatientOnly = user?.roles?.length === 1 && user.roles.includes('PATIENT' as any);
    this.navLinks[2].hidden = isPatientOnly;

    // Track active link based on current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        const activeLink = this.navLinks.find(link => url.includes(link.path));
        if (activeLink) {
          this.activeLink = activeLink.path;
        }
      });
  }
}
