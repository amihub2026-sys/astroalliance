import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [

  {
    path: 'admin/profile/:id',
    renderMode: RenderMode.Server
  },

  {
    path: '**',
    renderMode: RenderMode.Prerender
  }

];