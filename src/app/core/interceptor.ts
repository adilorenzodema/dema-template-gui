import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';



@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private authService: AuthService,
    private cookieService: CookieService,
    private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 500) { // not autorizeds
          this.snackBar.open(this.translateService.instant(error.error.errorCode),
            '✖',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'ERROR'
            });
          return throwError(() => error);
        } else if (error.status === 401) {
          return this.handle401Error(request, next);
        } else if (error.status === 403) { // non valido
          this.cookieService.delete('User');
          this.router.navigate(['/login']);
          return throwError(() => error);
        } /* else { // altri errori non mappati
          this.snackBar.open(this.translateService.instant("error.unknown"),
            '✖',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'ERROR'
            });
          return throwError(() => error);
        } */
        return throwError(() => error);
      }));
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      return this.authService.refreshToken().pipe(
        switchMap((user) => {
          this.isRefreshing = false;
          this.cookieService.set('User', JSON.stringify(user));
          return next.handle(request);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          console.log(error)
          return throwError(() => error);
        })
      );
    }
    return next.handle(request);
  }
}

