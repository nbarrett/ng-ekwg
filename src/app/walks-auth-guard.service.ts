import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";

@Injectable()
export class WalksAuthGuard implements CanActivate {
  constructor(@Inject("LoggedInMemberService") private loggedInMemberService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    const allowed = this.loggedInMemberService.allowWalkAdminEdits();
    if (!allowed) {
      this.router.navigate(["/walks"]);
    }
    return allowed;
  }
}
