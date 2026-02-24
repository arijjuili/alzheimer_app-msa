import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      icon: 'people',
      title: 'Patient Management',
      description: 'Track patient records, appointments, and medical history with our comprehensive management system.'
    },
    {
      icon: 'security',
      title: 'Secure Access',
      description: 'Role-based authentication with Keycloak security ensures your data is protected at all times.'
    },
    {
      icon: 'sync',
      title: 'Care Coordination',
      description: 'Connect caregivers, doctors, and patients seamlessly for better healthcare outcomes.'
    },
    {
      icon: 'history',
      title: 'Audit Trails',
      description: 'Complete audit logs for compliance and transparency in all healthcare operations.'
    }
  ];
}
