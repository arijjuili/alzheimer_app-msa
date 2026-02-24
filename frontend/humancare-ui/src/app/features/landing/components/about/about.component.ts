import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

interface Stat {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  stats: Stat[] = [
    { value: '1000+', label: 'Patients', icon: 'personal_injury' },
    { value: '500+', label: 'Caregivers', icon: 'medical_services' },
    { value: '99.9%', label: 'Uptime', icon: 'cloud_done' },
    { value: '50+', label: 'Hospitals', icon: 'local_hospital' }
  ];

  teamMembers: TeamMember[] = [
    { name: 'Dr. Sarah Johnson', role: 'Chief Medical Officer', avatar: 'SJ' },
    { name: 'Michael Chen', role: 'CEO & Founder', avatar: 'MC' },
    { name: 'Emily Rodriguez', role: 'Head of Technology', avatar: 'ER' },
    { name: 'Dr. James Wilson', role: 'Medical Advisor', avatar: 'JW' }
  ];
}
