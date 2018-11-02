import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

// Imports for loading & configuring the in-memory web api
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';
import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ArticlesComponent } from './articles/articles.component';
import { ArticleCreateComponent } from './article-create/article-create.component';
import { ArticleDetailComponent } from './article-detail/article-detail.component';
import { ArticleEditComponent } from './article-edit/article-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    ArticlesComponent,
    ArticleCreateComponent,
    ArticleDetailComponent,
    ArticleEditComponent
  ],
  imports: [
    RouterModule,
    AppRoutingModule,
    NgbModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(
        InMemoryDataService, { dataEncapsulation: false }
    ),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
