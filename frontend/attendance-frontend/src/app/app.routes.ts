import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentRegisterComponent } from './components/student-register/student-register.component';
import { FaceRecognitionComponent } from './components/face-recognition/face-recognition.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'register', component: StudentRegisterComponent },
  { path: 'recognize', component: FaceRecognitionComponent }
];
