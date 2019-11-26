import { Injectable, Inject, PLATFORM_ID} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
<% if (authService === 'firebase')  { %>
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
<% } %>
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  <%- authService === 'firebase' ? "private user: Observable<firebase.User | null>;" : "" %>

  constructor(
    protected http: HttpClient,
    @Inject(PLATFORM_ID) private platformId,
    <%- authService==='auth0' ? "private configService: ConfigService," : ""%>
    <%- authService==='firebase' ? "private afAuth: AngularFireAuth" : ""%>
  ) {
    <% if(authService==='firebase'){ %>this.user = this.afAuth.authState;<%}%>
  }

  getAuth0Credentials() {<% if(authService==='auth0'){ %>
    return {
      'client_id': `${this.configService.clientId}`,
      'client_secret': `${this.configService.clientSecret}`,
      'audience': `${this.configService.domain}/api/v2/`,
      'grant_type': 'client_credentials'
    };<%}%>
  }

  getAuth0Token() <%- authService==='auth0' ? ": Observable<string>" : "" %>{<% if(authService==='auth0'){ %>
    const httpOptions = {
      headers : new HttpHeaders({
        'content-type': 'application/json'
      })
    };
    const httpParams = this.getAuth0Credentials();
    return this.http.post(`${this.configService.domain}/oauth/token`, httpParams, httpOptions)
      .pipe(
        map((data: any) => {
          return data.access_token;
        })
      );<%}%>
  }

  getAuth0UserInfo(token: string) {<% if(authService==='auth0'){%>
    const httpOptions = {
      headers : new HttpHeaders({
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.get(`${this.configService.domain}/userinfo`, httpOptions);<%}%>
  }

  createUser(user: any, access_token?: string) <%-authService==='firebase' ? ": Promise<firebase.auth.UserCredential>" : ""%> {<% if(authService==='auth0'){ %>
      let User = {
      email: `${user.email}`,
      password: `${user.password}`,
      email_verified: false,
      name: `${user.firstName}`,
      family_name: `${user.lastName}`,
      nickname: `${user.lastName}`,
      connection: 'Username-Password-Authentication',
      verify_email: true
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'content-type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      })
    };
    return this.http.post(`${this.configService.domain}/api/v2/users`, User, httpOptions);<%}%>
    <%if(authService==='firebase'){%>return this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password);<%}%>
  }

  loginUser(user: any)<%-authService==='firebase' ? ": Promise<firebase.auth.UserCredential>" : ""%> { <% if(authService==='auth0'){ %>
    const httpOptions = {
      headers : new HttpHeaders({
        'content-type': 'application/x-www-form-urlencoded'
      })
    };
    const httpParams = new HttpParams().append('username', `${user.email}`)
                                .append('password', `${user.password}`)
                                .append('audience', `${this.configService.domain}/api/v2/`)
                                .append('scope', 'openid profile email offline_access')
                                .append('client_id', `${this.configService.clientId}`)
                                .append('client_secret', `${this.configService.clientSecret}`)
                                .append('realm', 'employees')
                                .append('grant_type', 'password');
    return this.http.post(`${this.configService.domain}/oauth/token`, httpParams, httpOptions);<% } %>
    <%if(authService==='firebase'){%>return this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password)<%}%>
  }

  signOut()<%-authService==='firebase' ? ": Promise<void>" : ""%> {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('User')) {
        localStorage.removeItem('User');
      }
    }
    <%-authService==='firebase' ? "return this.afAuth.auth.signOut();" : ""%>
  }

  authWithFacebook()<%-authService==='firebase' ? ": Promise<firebase.auth.UserCredential>" : ""%> {<%if(authService==='firebase'){%>
    const provider: firebase.auth.FacebookAuthProvider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('user_birthday');
    return this.afAuth.auth.signInWithPopup(provider);<%}%>
  }

  authWithGoogle()<%-authService==='firebase' ? ": Promise<firebase.auth.UserCredential>" : ""%> {<%if(authService==='firebase'){%>
    const provider: firebase.auth.GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());<%}%>
  }

  getUser(id: string, token: string) {<%if(authService==='auth0'){%>
    const httpOptions = {
      headers : new HttpHeaders({
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.get(`${this.configService.domain}/api/v2/users/${id}`, httpOptions);<%}%>
  }

  <%-authService==='firebase' ? "get currentUser(): Observable<firebase.User | null> " : "currentUser() "%>{<%if(authService==='firebase'){%>
    return this.user;<%}%>
  }

  updateProfile<%- authService==='auth0' ? "(user: any, id: string, token: string) {" : " = (user: any): Promise<void> =>" %><% if(authService==='auth0'){ %>
    const httpParams = new HttpParams() .append('name', `${user.name}`)
                                        .append('family_name', `${user.family_name}`)
                                        .append('nickname', `${user.nickname}`);
    const httpOptions = {
      headers : new HttpHeaders({
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.patch(`${this.configService.domain}/api/v2/users/${id}`, httpParams, httpOptions);
  }<%}%><% if(authService==='firebase'){ %>
    this.afAuth.auth.currentUser
    ? this.afAuth.auth.currentUser.updateProfile({
      displayName: user.displayName
    })
    : Promise.resolve()
  <%}%>

  changePassword(user: any)<%-authService==='firebase' ? ": Promise<void>" : ""%> { <% if(authService==='auth0'){ %>
    const User = {
      email: `${user.email}`,
      connection: 'Username-Password-Authentication',
    };
    const httpOptions = {
      headers : new HttpHeaders({
        'content-type': 'application/json',
      })
    };
    return this.http.post(`${this.configService.domain}/dbconnections/change_password`, User, httpOptions);<%}%>
    <% if(authService==='firebase'){ %> return this.afAuth.auth.sendPasswordResetEmail(user.email);<%}%>
  }

}
