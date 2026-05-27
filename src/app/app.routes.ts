import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { Profiles } from './profiles/profiles';
import { Plans } from './plans/plans';
import { Biodata } from './biodata/biodata';
import { ProfileView } from './profile-view/profile-view';
import { MyBiodataComponent } from './my-biodata/my-biodata';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { PaymentPage } from './payment-page/payment-page';
import { Terms } from './terms/terms';
import { Admin } from './admin/admin';
import { ReceivedInterests } from './received-interests/received-interests';
import { SentInterests } from './sent-interests/sent-interests';
import { CanActivateChildFn } from '@angular/router';
export const routes: Routes = [
  { path: '', component: Home },

  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profiles', component: Profiles },

  { path: 'plans', component: Plans, canActivate: [authGuard] },
  { path: 'biodata', component: Biodata, canActivate: [authGuard] },
  { path: 'profile-view', component: ProfileView, canActivate: [authGuard] },
  { path: 'my-biodata', component: MyBiodataComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentPage, canActivate: [authGuard] },
  { path: 'terms', component: Terms },
{ path: 'received-interests', component: ReceivedInterests },
{ path: 'sent-interests', component: SentInterests },
{
  path: 'admin-login',
  loadComponent: () =>
    import('./admin-login/admin-login').then(m => m.AdminLogin)
},
{
  path: 'admin',
  canActivate: [adminGuard],
  canActivateChild: [adminGuard],
  loadComponent: () =>
    import('./admin/admin').then(m => m.Admin),
  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./admin/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
      path: 'profiles',
      loadComponent: () =>
        import('./admin/profiles/profiles').then(m => m.Profiles)
    },
    {
      path: 'plans',
      loadComponent: () =>
        import('./admin/plans/plans').then(m => m.Plans)
    },
    {
      path: 'subscriptions',
      loadComponent: () =>
        import('./admin/subscriptions/subscriptions').then(m => m.Subscriptions)
    },
    {
  path: 'user-plans',
  loadComponent: () =>
    import('./admin/user-plans/user-plans').then(m => m.UserPlans)
},
    {
      path: 'payments',
      loadComponent: () =>
        import('./admin/payments/payments').then(m => m.Payments)
    },
    {
      path: 'settings',
      loadComponent: () =>
        import('./admin/settings/settings').then(m => m.Settings)
    },

{
  path: 'caste-list',
  loadComponent: () =>
    import('./admin/caste-list/caste-list').then(m => m.CasteList)
},
{
  path: 'cities',
  loadComponent: () =>
    import('./admin/cities/cities')
      .then(m => m.Cities)
},
{
  path: 'profile-views',
  loadComponent: () =>
    import('./admin/profile-views/profile-views')
      .then(m => m.ProfileViews)
},

{
  path: 'interests',
  loadComponent: () =>
    import('./admin/interests/interests')
      .then(m => m.Interests)
},
{
  path: 'shortlists',
  loadComponent: () =>
    import('./admin/shortlists/shortlists')
      .then(m => m.Shortlists)
},
{
  path: 'likes-history',
  loadComponent: () =>
    import('./admin/likes-history/likes-history')
      .then(m => m.LikesHistory)
},
{
  path: 'admin-users',
  loadComponent: () =>
    import('./admin/admin-users/admin-users')
      .then(m => m.AdminUsers)
},
{
  path: 'create-biodata',
  component: Biodata
},

    {
  path: 'profile/:id',
  loadComponent: () =>
    import('./admin/profile-details/profile-details')
      .then(m => m.ProfileDetails)
},
  ]
},

  { path: '**', redirectTo: '' }
];