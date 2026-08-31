import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        <span class="font-semibold">{{ appName }}</span>
        <span>· {{ appShortName }}</span>
        <span>© {{ anio }}</span>
        <span class="text-muted-color">— Powered by Angular 21 · PrimeNG 21</span>
    </div>`,
})
export class AppFooter {
    readonly appName = environment.appName;
    readonly appShortName = environment.appShortName;
    readonly anio = new Date().getFullYear();
}
