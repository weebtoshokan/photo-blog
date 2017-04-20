import {NgModule} from '@angular/core';
import {HttpModule, JsonpModule} from '@angular/http';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Http} from '@angular/http';
import {Title} from '@angular/platform-browser';
import {CoreModule, EnvService} from '../core';
import {GalleryModule, NoticesModule} from '../lib';
import {
    ApiService,
    ApiErrorHandler as BaseApiErrorHandler,
    AppService,
    AuthService,
    AuthProviderService,
    LocalStorageService,
    LockProcessServiceProvider,
    LockerServiceProvider,
    NavigatorServiceProvider,
    PagerServiceProvider,
    ScrollFreezerService,
    TitleService,
    UserDataProviderService,
} from './services';
import {ApiErrorHandler} from './services/api-error-handler';

@NgModule({
    imports: [
        HttpModule,
        JsonpModule,
        CommonModule,
        FormsModule,
        CoreModule,
        GalleryModule,
        NoticesModule,
    ],
    exports: [
        HttpModule,
        JsonpModule,
        CommonModule,
        FormsModule,
        CoreModule,
        GalleryModule,
        NoticesModule,
    ],
    providers: [
        {
            provide: ApiService,
            useFactory: getApiService,
            deps: [Http, BaseApiErrorHandler, AppService, AuthProviderService],
        },
        {provide: BaseApiErrorHandler, useClass: ApiErrorHandler},
        {provide: AppService, useFactory: getAppService, deps: [EnvService]},
        AuthService,
        AuthProviderService,
        LocalStorageService,
        LockProcessServiceProvider,
        LockerServiceProvider,
        NavigatorServiceProvider,
        PagerServiceProvider,
        ScrollFreezerService,
        {provide: TitleService, useFactory: getTitleService, deps: [Title, AppService]},
        UserDataProviderService,
    ],
})
export class SharedModule {
}

export function getApiService(http:Http, errorHandler:BaseApiErrorHandler, app:AppService, authProvider:AuthProviderService) {
    return new ApiService(http, errorHandler, app.getApiUrl(), () => {
        const headers = {'Accept': 'application/json'};
        if (authProvider.hasAuth()) {
            headers['Authorization'] = `Bearer ${authProvider.getAuthApiToken()}`;
        }
        return headers;
    }, () => {
        return app.inDebugMode() ? {'XDEBUG_SESSION_START': 'START'} : {};
    });
}

export function getAppService(env:EnvService) {
    return new AppService(env);
}

export function getTitleService(title:Title, app:AppService) {
    return new TitleService(title, app.getName());
}
