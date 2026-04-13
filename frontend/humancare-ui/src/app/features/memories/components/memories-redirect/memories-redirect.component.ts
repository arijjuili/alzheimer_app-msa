import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-memories-redirect',
  standalone: true,
  template: ''
})
export class MemoriesRedirectComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const roles = this.authService.getRoles();
    if (roles.includes(Role.PATIENT)) {
      this.router.navigate(['/app/memories/gallery']);
    } else {
      this.router.navigate(['/app/memories/list']);
    }
  }
}
