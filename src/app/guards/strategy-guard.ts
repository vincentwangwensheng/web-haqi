import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {EditStrategyComponent} from '../main/apps/haqi/market-strategy/edit-strategy/edit-strategy.component';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable()
export class StrategyGuard implements CanDeactivate<EditStrategyComponent> {
    canDeactivate(component: EditStrategyComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot):
        Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (component.nodes.length > 0 && !component.finished && !component.isReload) {
            const observable = component.dialog.open(component.canLeave, {id: 'canLeave'}).afterClosed();
            observable.subscribe(res => {

            });
            return observable;
        } else {
            return true;
        }
    }
}
