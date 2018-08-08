import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
<% if (imports && imports.awsStorage) { %>
import { CapStorageAWS } from 'cap-storage-aws';

import { PhotoListPage } from '../pages/photo-list/photo-list';
import { PhotoUploadPage } from '../pages/photo-upload/photo-upload';
<% } -%>
<% if (imports && imports.auth) { %>
import { AuthenticationModule } from 'cap-authorization';

import { ChangePasswordPage } from './../pages/change-password/change-password';
import { RegisterPage } from './../pages/register/register';
import { LoginPage } from './../pages/login/login';
<% } -%>
import { AppComponent } from './app.component';
import { HomePage } from '../pages/home/home';

@NgModule({
  declarations: [
    AppComponent,
    HomePage<%- imports ?  ',' : '' -%>
    <% if (imports && imports.awsStorage) { %>
    PhotoListPage,
    PhotoUploadPage<%- imports && imports.awsStorage && imports.auth ?  ',' : '' -%>
    <% } -%>
    <% if (imports && imports.auth) { %>
    ChangePasswordPage,
    RegisterPage,
    LoginPage
    <% } %>
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(AppComponent)<%- typeof imports !== 'undefined' ? "," : "" -%>
    <% if (imports && imports.awsStorage) { %>
    CapStorageAWS.forRoot({
      bucket: 'aws-bucket',
      accessKeyId: 'aws-key',
      secretAccessKey: 'aws-secret',
      region: 'aws-region',
      folder: 'aws-folder'
    })<%- imports.auth ?  ',' : '' -%>
    <% } -%>
    <% if (imports && imports.auth) { %>
    AuthenticationModule.forRoot({
      apiUrl: 'apiUrl',
      loginEndpoint: 'loginEndPoint'
    })
    <% } %>
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AppComponent,
    HomePage<%- imports ?  ',' : '' -%>
    <% if (imports && imports.awsStorage) { %>
    PhotoListPage,
    PhotoUploadPage<%- imports.auth ?  ',' : '' -%>
    <% } -%>
    <% if (imports && imports.auth) { %>
    ChangePasswordPage,
    RegisterPage,
    LoginPage
    <% } %>
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class AppModule {}

