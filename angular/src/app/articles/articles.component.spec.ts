import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ArticlesComponent } from './articles.component';
import { Router, ActivatedRoute, Routes} from '@angular/router';
import { ActivatedRouteStub } from '../activated-route-stub';
import { ArticleService } from "../article.service";
import { UserService } from "../user.service";
import { Article } from "../article";
import { User } from '../user';
import { APP_BASE_HREF} from '@angular/common';

describe('ArticlesComponent', () => {
  let component: ArticlesComponent;
  let fixture: ComponentFixture<ArticlesComponent>;
  let userServiceSpy
  let articleServiceSpy
  let routerSpy
  let activatedRoute: ActivatedRouteStub
  let signedInUser = new User(1,'e','p','n',true)
  const routes: Routes = [{path: 'articles', component: ArticlesComponent}]

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub()
    userServiceSpy = jasmine.createSpyObj('UserService',
      ['getCurrentUser', 'signOut'])
    articleServiceSpy = jasmine.createSpyObj('ArticleService',
      ['getArticleList'])
    userServiceSpy.getCurrentUser.and.returnValue(
      new User(1,'e','p','n',false))
    articleServiceSpy.getArticleList.and.returnValue([
      { id: 1, author_id: 1, title: 't1', content: 'c1' },
      { id: 2, author_id: 2, title: 't2', content: 'c2' },
    ])

    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes)
      ],
      declarations: [ ArticlesComponent ],
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
    fixture = TestBed.createComponent(ArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// it ngOninit should call userService.getCurrentUser
//    and gotoSignIn if not signed in
//    and call getArticleList to initialize articles
//    getArticleList should call articleService.getArticleList

// it sighOut should call userService.signOut
//    and router Navigate to ../sign_in

// it findauthor should call userService.findAuthor and return
// it createArticle should navigate to /create


