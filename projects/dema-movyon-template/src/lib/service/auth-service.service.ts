import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, Observable } from 'rxjs';
import { LoginUser } from '../components/domain/class';
import { UserPermission } from '../components/domain/interface';
import { HttpUtils } from '../shared/utils/httpUtils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private noAuthURL = "http://localhost:8080";
  private apiURL = "http://localhost:8080/auth";

  constructor(
    private http: HttpClient,
    private cookieService: CookieService) { }

  login(loginUser: LoginUser): Observable<UserPermission> {
    return this.http.post<UserPermission>(this.noAuthURL + '/noAuth/login', loginUser)
      .pipe(catchError(err => { throw err; }));
  }

  logout(): Observable<void> {
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
      params: HttpUtils.createHttpParams({ token: this.getToken() })
    };
    return this.http.post<void>(this.apiURL + '/logout', null, options)
      .pipe(catchError(err => { throw err; }));
  }

  refreshToken(): Observable<UserPermission> {
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
      params: HttpUtils.createHttpParams({ token: this.getToken() })
    };
    return this.http.post<UserPermission>(this.noAuthURL + '/authRefresh/refreshToken', { refreshToken: this.getRefreshToken() }, options)
      .pipe(catchError(err => { throw err; }));
  }

  sendMailResetPassword(mail: string): Observable<void> {
    return this.http.post<void>(this.noAuthURL + '/noAuth/sendEmailResetPassword', { email: mail })
      .pipe(catchError(err => { throw err; }));
  }

  resetPassword(token: string, password: string): Observable<void> {
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
      params: HttpUtils.createHttpParams({ token: token })
    };
    return this.http.post<void>(this.apiURL + '/resetPassword', { newPassword: password }, options)
      .pipe(catchError(err => { throw err; }));
  }

  changePassword( newPassword: string, oldPassword: string): Observable<void> {
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
      params: HttpUtils.createHttpParams({ token: this.getToken() })
    };
    return this.http.post<void>(this.apiURL + '/changePassword',  {newPassword: newPassword, oldPassword: oldPassword} , options)
      .pipe(catchError(err => { throw err; }));
  }

  private getToken(): string {
    return this.cookieService.get('Token');
  }

  private getRefreshToken(): string {
    return this.cookieService.get('RefreshToken');
  }
}
