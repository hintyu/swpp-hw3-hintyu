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
  let navigateSpy
  let activatedRoute: ActivatedRouteStub
  let expectedArticle : Article[] = [
    { id: 1, author_id: 1, title: 't1', content: 'c1' },
    { id: 2, author_id: 2, title: 't2', content: 'c2' },
  ]

  const routes: Routes = [{path: 'articles', component: ArticlesComponent}]

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub()
    userServiceSpy = jasmine.createSpyObj('UserService',
      ['getCurrentUser', 'signOut', 'findAuthor'])
    articleServiceSpy = jasmine.createSpyObj('ArticleService',
      ['getArticleList'])
    userServiceSpy.getCurrentUser.and.returnValue(
      new User(1,'e','p','n',true))
    userServiceSpy.findAuthor.and.returnValue('n')
    articleServiceSpy.getArticleList.and.returnValue(Promise.resolve(expectedArticle))

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

  it('ngOninit should force out not signed_in user', async(()=>{
    userServiceSpy.getCurrentUser.and.returnValue(
      new User(1,'e','p','n',false))
    component.ngOnInit()
    fixture.whenStable().then(()=> {
      expect(userServiceSpy.getCurrentUser).toHaveBeenCalled()
      // send un signed-in user to ../sign_in
      const routerSpy = fixture.debugElement.injector.get(Router);
      let navigateSpy = routerSpy.navigate as jasmine.Spy
      expect(navigateSpy).toHaveBeenCalled()
    })
  }))

  it('ngOninit should call getArticleList to initialize', async(()=>{
    component.ngOnInit()
    fixture.whenStable().then(()=> {
      expect(userServiceSpy.getCurrentUser).toHaveBeenCalled()
      expect(articleServiceSpy.getArticleList).toHaveBeenCalled()
      expect(component.articles).toEqual(expectedArticle)
    })
  }))

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

  it('findAuthor should call userService to find Author', ()=>{
    let authorId = 1
    let foundUserName = component.findAuthor(authorId)
    expect(userServiceSpy.findAuthor).toHaveBeenCalledWith(authorId)
    expect(foundUserName).toEqual('n')
  })

  it('createArticle should navigate to /create', ()=>{
    component.createArticle()
    const routerSpy = fixture.debugElement.injector.get(Router);
    let navigateSpy = routerSpy.navigate as jasmine.Spy
    expect(navigateSpy).toHaveBeenCalledWith(['/create'])
  })
});


