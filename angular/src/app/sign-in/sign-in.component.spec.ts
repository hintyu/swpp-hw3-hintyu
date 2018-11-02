import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SignInComponent } from './sign-in.component';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { SignInService } from '../sign-in.service';
import { User } from '../user';
import { AppRoutingModule } from '../app-routing.module';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let userServiceSpy
  let signInServiceSpy
  let routerSpy
  let user1 = new User(1, 'e', 'p', 'n', false)
  let user2 = new User(1, 'e', 'p', 'n', true)

    beforeEach(async(() => {
      const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      userServiceSpy = jasmine.createSpyObj('UserService',
                                            ['getCurrentUser', 'signOut'])
      signInServiceSpy = jasmine.createSpyObj('SignInService',['signIn'])
      userServiceSpy.getCurrentUser.and.returnValue(user1)
      signInServiceSpy.signIn.and.returnValue(false)

      TestBed.configureTestingModule({
        declarations: [ SignInComponent ],
        providers: [
          AppRoutingModule,
          { provide: Router, useValue: routerSpy },
          { provide: UserService, useValue: userServiceSpy },
          { provide: SignInService, useValue: signInServiceSpy }
        ]
      })
      spyOn(window, "alert")
    }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it ngOninit call userService's two methods
  it('ngOninit should call userService methods', async(() => {
    // signed out initially
    component.ngOnInit()
    fixture.whenStable().then(()=>{
      expect(userServiceSpy.getCurrentUser).toHaveBeenCalled()
    })

    // signed in already
    userServiceSpy.getCurrentUser.and.returnValue(user2)
    component.ngOnInit()
    fixture.detectChanges()
    fixture.whenStable().then(()=>{
      console.log(userServiceSpy.getCurrentUser())
      expect(userServiceSpy.getCurrentUser).toHaveBeenCalled()
      expect(userServiceSpy.signOut).toHaveBeenCalled()
    })

  }))

  it('signIn should try signIn with form input', async(()=>{
    component.ngOnInit()
    fixture.detectChanges()
    // fail
    component.signIn()
    fixture.detectChanges()
    expect(signInServiceSpy.signIn).toHaveBeenCalledWith('','')
    expect(window.alert).toHaveBeenCalled()
    // success
    signInServiceSpy.signIn.and.returnValue(true)
    component.signIn()
    fixture.detectChanges()
    expect(signInServiceSpy.signIn).toHaveBeenCalledWith('','')

    const routerSpy = fixture.debugElement.injector.get(Router);
    let navigateSpy = routerSpy.navigate as jasmine.Spy
    expect(navigateSpy).toHaveBeenCalledWith(['/articles'])
  }))
});
