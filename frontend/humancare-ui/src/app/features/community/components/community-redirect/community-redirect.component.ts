import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community-redirect',
  standalone: true,
  template: ''
})
export class CommunityRedirectComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['/app/community/wall']);
  }
}
