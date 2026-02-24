import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(true);
  public sidebarOpen$: Observable<boolean> = this.sidebarOpenSubject.asObservable();

  constructor() {}

  toggleSidebar(): void {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.value);
  }

  openSidebar(): void {
    this.sidebarOpenSubject.next(true);
  }

  closeSidebar(): void {
    this.sidebarOpenSubject.next(false);
  }

  get isSidebarOpen(): boolean {
    return this.sidebarOpenSubject.value;
  }
}
