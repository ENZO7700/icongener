import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root shell only. Layout lives on the route tree (MainLayoutComponent)
 * so we do not nest two layouts (which duplicated main/nav/h1 in the DOM).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent {
  title = 'icongener';
}
