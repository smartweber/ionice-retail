import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { UUID } from 'angular2-uuid'

/*
  Generated class for the AuthInterceptorProvider provider.
*/
@Injectable()
export class AuthInterceptorProvider implements HttpInterceptor {
  constructor() {

  }
  get token() {
    return localStorage.getItem('token')
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = this.token;
    let url = req.url;
    if ((token === null || token === 'null') && url.indexOf("/api/v1/cart") > -1) {
      url = url.replace('/api/v1/cart', `/api/v1/guest/cart/${this.sessionID}`);
    }
    const dupReq = req.clone({ url: url, headers: req.headers.set('Authorization', `Bearer ${token}`) });
    return next.handle(dupReq);
  }

  get sessionID() {
    let token = localStorage.getItem('session_id');
    if (token === null || token === 'null') {
      token = this.session
      localStorage.setItem('session_id', token)
    }
    return token;
  }
  get session() {
    return `guest-${UUID.UUID()}`;
  }
};