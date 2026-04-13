import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { CommunityRedirectComponent } from './components/community-redirect/community-redirect.component';
import { CommunityWallComponent } from './components/community-wall/community-wall.component';

export const COMMUNITY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: CommunityRedirectComponent },
      { path: 'wall', component: CommunityWallComponent }
    ]
  }
];
