import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {BpmnComponent} from '../main/apps/bpmn/bpmn.component';
import {Observable} from 'rxjs';

@Injectable()
export class BpmnGuard implements CanDeactivate<BpmnComponent> {
    canDeactivate(component: BpmnComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot):
        Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (component.unSaved) {
            return component.dialog.open(component.confirm).afterClosed();
        } else {
            return true;
        }
    }

}
