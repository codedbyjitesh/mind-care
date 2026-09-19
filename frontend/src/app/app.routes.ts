import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ResourcesComponent } from './components/resources/resources.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MoodComponent } from './components/mood/mood.component';
import { StressComponent } from './components/stress/stress.component';
import { JournalComponent } from './components/journal/journal.component';
import { HistoryComponent } from './components/history/history.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { WellnessTipsComponent } from './components/wellness/wellness.component';
import { MeditationComponent } from './components/meditation/meditation.component';
import { SleepComponent } from './components/sleep/sleep.component';
import { HabitComponent } from './components/habits/habits.component';
import { GoalComponent } from './components/goals/goals.component';
import { NotificationComponent } from './components/notifications/notifications.component';
import { HelpComponent } from './components/help/help.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AdminComponent } from './components/admin/admin.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Public Routes
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'help', component: HelpComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Protected Student Wellness Routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'mood', component: MoodComponent, canActivate: [authGuard] },
  { path: 'stress', component: StressComponent, canActivate: [authGuard] },
  { path: 'journal', component: JournalComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'wellness', component: WellnessTipsComponent, canActivate: [authGuard] },
  { path: 'meditation', component: MeditationComponent, canActivate: [authGuard] },
  { path: 'sleep', component: SleepComponent, canActivate: [authGuard] },
  { path: 'habits', component: HabitComponent, canActivate: [authGuard] },
  { path: 'goals', component: GoalComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },

  // Protected Admin CMS Console
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },

  // Fallback
  { path: '**', redirectTo: '' }
];
