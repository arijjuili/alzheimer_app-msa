import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { MemoriesRedirectComponent } from './components/memories-redirect/memories-redirect.component';
import { MemoriesGalleryComponent } from './components/memories-gallery/memories-gallery.component';
import { MemoriesListComponent } from './components/memories-list/memories-list.component';

export const MEMORIES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: MemoriesRedirectComponent },
      { path: 'gallery', component: MemoriesGalleryComponent },
      { path: 'list', component: MemoriesListComponent }
    ]
  }
];
