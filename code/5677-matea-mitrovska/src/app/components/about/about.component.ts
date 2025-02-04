import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  studentName = 'Matea Mitrovska';
  studentId = '5677';
  currentYear = new Date().getFullYear();
  githubRepo = 'https://github.com/sweko/internet-programming-ntrlawkwna';

  // Additional information about the project
  projectDetails = {
    course: 'Internet Programming',
    university: 'UACS',
    projectType: 'Final Exam',
    technologies: [
      'Angular',
      'TypeScript',
      'HTML',
      'CSS',
      'REST API'
    ],
    features: [
      'Movie Management (CRUD operations)',
      'Movie Details with Cast Information',
      'Genre Management',
      'Statistics Dashboard',
      'Responsive Design'
    ]
  };
}
