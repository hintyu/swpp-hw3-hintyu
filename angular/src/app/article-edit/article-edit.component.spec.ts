import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ArticleEditComponent } from './article-edit.component';
import {ActivatedRouteStub} from "../activated-route-stub";
import {Article} from "../article";
import {ActivatedRoute, Router, Routes} from "@angular/router";
import {User} from "../user";
import {RouterTestingModule} from "@angular/router/testing";
import {UserService} from "../user.service";
import {ArticleService} from "../article.service";
import {APP_BASE_HREF} from "@angular/common";


describe('ArticleEditComponent', () => {
  let component: ArticleEditComponent
  let fixture: ComponentFixture<ArticleEditComponent>
  let userServiceSpy
  let articleServiceSpy
  let routerSpy
  let activatedRoute: ActivatedRouteStub
  let expectedArticle: Article[] = [
    {id: 1, author_id: 1, title: 't1', content: 'c1'},
    {id: 2, author_id: 2, title: 't2', content: 'c2'},
  ]

  const routes: Routes = [
    {path: 'articles/edit', component: ArticleEditComponent},
  ]

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub()
    userServiceSpy = jasmine.createSpyObj('UserService',
      ['getCurrentUser', 'signOut', 'findAuthor'])
    articleServiceSpy = jasmine.createSpyObj('ArticleService',
      ['addArticle'])
    userServiceSpy.getCurrentUser.and.returnValue(
      new User(1, 'e', 'p', 'n', true))
    userServiceSpy.findAuthor.and.returnValue('n')
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule,
        RouterTestingModule.withRoutes(routes)
      ],
      declarations: [ArticleEditComponent],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        {provide: UserService, useValue: userServiceSpy},
        {provide: ArticleService, useValue: articleServiceSpy},
        {provide: Router, useValue: routerSpy},
        {provide: APP_BASE_HREF, useValue: '/'}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleEditComponent)
    component = fixture.componentInstance
  });

  it('signOut should call userService to signOut', async(()=>{
    component.signOut()
    expect(userServiceSpy.signOut).toHaveBeenCalled()
    fixture.whenStable().then(()=>{
      // send user to ../sign_in
      const routerSpy = fixture.debugElement.injector.get(Router);
      let navigateSpy = routerSpy.navigate as jasmine.Spy
      expect(navigateSpy).toHaveBeenCalled()
    })
  }))

  it('gotoSignIn should toTo signIn', ()=>{

  })


})