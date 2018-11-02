import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SignInService } from './sign-in.service';
import { UserService } from './user.service';
import { User} from './user';

describe('SignInService', () => {
  let signInService: SignInService
  let userServiceSpy
  let userList: User[]

  beforeEach(() => {
    userServiceSpy = jasmine.createSpyObj('UserService',
        ['getUserList', 'updateUser', 'setCurrentUser'])
    userServiceSpy.getUserList.and.returnValue(Promise.resolve(userList))

    TestBed.configureTestingModule({
      providers: [
        SignInService,
        {provide: UserService, useValue: userServiceSpy}
        ],
      imports: [
        HttpClientTestingModule,
      ]
    });

    userList = [
      { id: 1, email: 'a', password: 'b', name: 'c', signed_in: false },
      { id: 2, email: 'd', password: 'e', name: 'f', signed_in: false },
    ] as User[];
  });

  it('should be created', inject([SignInService], (service: SignInService) => {
    expect(service).toBeTruthy();
  }));

  it('constructor should initilaize userList', fakeAsync(()=> {
    signInService = TestBed.get(SignInService)
    signInService.getUserList()
    tick()
    expect(userServiceSpy.getUserList).toHaveBeenCalled()
    expect(signInService.userList).toEqual(userList)
  }))

 it('signIn should search and signIn', fakeAsync(()=>{
   signInService = TestBed.get(SignInService)
   signInService.getUserList()
   tick()
   let result: boolean
   let signInUser = signInService.userList[0]
   // fail case 1 : email same, password wrong
   result = signInService.signIn(signInUser.email, 'invalid')
   expect(result).toEqual(false)
   // fail case 2 : not found email
   result = signInService.signIn('notFound', 'invalid')
   expect(result).toEqual(false)
   // success case
   result = signInService.signIn(signInUser.email,signInUser.password)
   tick()
   expect(result).toEqual(true)
   expect(signInService.userList[0].signed_in).toEqual(true)
   expect(userServiceSpy.updateUser).toHaveBeenCalledWith(signInService.userList[0])
   expect(userServiceSpy.setCurrentUser).toHaveBeenCalledWith(signInService.userList[0])
   }))
});

/** Async features testing **/
// it constructor should call getUserList method
// it getUserList should initialize userList with given promise from userService

/** Sync features testing **/
// it signIn should find given user from userList
//    and should change its signed_in to true
//    and should call updateUser method of userService
//    and should call setCurrentuser method of userService

