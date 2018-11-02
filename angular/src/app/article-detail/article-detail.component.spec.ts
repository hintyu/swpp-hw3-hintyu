import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ArticleDetailComponent } from './article-detail.component';
import {ActivatedRouteStub} from "../activated-route-stub";
import {Article} from "../article";
import {ActivatedRoute, Router, Routes} from "@angular/router";
import {User} from "../user";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {UserService} from "../user.service";
import {ArticleService} from "../article.service";
import {APP_BASE_HREF} from "@angular/common";

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent
  let fixture: ComponentFixture<ArticleDetailComponent>
  let userServiceSpy
  let articleServiceSpy
  let routerSpy
  let activatedRoute: ActivatedRouteStub
  let expectedArticle : Article[] = [
    { id: 1, author_id: 1, title: 't1', content: 'c1' },
    { id: 2, author_id: 2, title: 't2', content: 'c2' },
  ]

  const routes: Routes = [
    {path: 'articles/detail', component: ArticleDetailComponent},
  ]

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub()
    userServiceSpy = jasmine.createSpyObj('UserService',
      ['getCurrentUser', 'signOut', 'findAuthor'])
    articleServiceSpy = jasmine.createSpyObj('ArticleService',
      ['addArticle'])
    userServiceSpy.getCurrentUser.and.returnValue(
      new User(1,'e','p','n',true))
    userServiceSpy.findAuthor.and.returnValue('n')
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule,
        RouterTestingModule.withRoutes(routes)
      ],
      declarations: [ ArticleDetailComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: UserService, useValue: userServiceSpy},
        { provide: ArticleService, useValue: articleServiceSpy},
        { provide: Router, useValue: routerSpy},
        { provide: APP_BASE_HREF, useValue : '/' }
      ]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleDetailComponent);
    component = fixture.componentInstance;
  });

});
