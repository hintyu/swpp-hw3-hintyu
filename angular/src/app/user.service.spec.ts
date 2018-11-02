import {TestBed, inject, async, tick, fakeAsync} from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from './user';
import { UserService } from './user.service'
import {AppModule} from './app.module';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// USING MOCK
describe('UserService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let userService: UserService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserModule,
        HttpClientModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/'},
        UserService
      ],
    });
    spyOn(console, 'error')
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

// it getServiceUserList should call getUserList
//    and initialize users with given return
  describe('Constructor', () => {

    it('constructor should initialize', fakeAsync(()=>{
      userService = TestBed.get(UserService)
      let userUrl: string = '/api/user/'

      const expectedUsers = [
        { id: 1, email: 'a', password: 'b', name: 'c', signed_in: false },
        { id: 2, email: 'd', password: 'e', name: 'f', signed_in: false },
      ] as User[];

      const req = httpTestingController.expectOne(userUrl)
      expect(req.request.method).toEqual('GET');
      req.flush(expectedUsers);
      expect(userService.userList).toBeUndefined()
      tick()
      expect(userService.userList).toEqual(expectedUsers)
    }))
  })

  // it getUserList should send GET method to httpClient
  //    and should return expected User list
  // it getUserlist should return empty array when 404
  describe('#getUserList', () => {
    let expectedUsers: User[];

    beforeEach(() => {
      userService = TestBed.get(UserService)
      expectedUsers = [
        { id: 1, email: 'a', password: 'b', name: 'c', signed_in: false },
        { id: 2, email: 'd', password: 'e', name: 'f', signed_in: false },
      ] as User[];

      httpTestingController.expectOne('/api/user/') // constructor initialization
    })

    it('should return expected users (called once)', () => {
      userService.getUserList().then(
        users => expect(users).toEqual(
          expectedUsers,'should return expected users'),
        fail
      );
      let userUrl: string = '/api/user/'
      const req = httpTestingController.expectOne(userUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(expectedUsers);
    });

    it('should be OK returning no users', () => {
      userService.getUserList().then(
        users => expect(users.length).toEqual
        (0, 'should have empty array'),
        fail
      );

      let userUrl: string = '/api/user/'
      const req = httpTestingController.expectOne(userUrl);
      req.flush([]);
    });

    it('should return empty array with 404 error', () => {
      const msg = 'Deliberate 404'
      userService.getUserList().then(users => {
        expect(users).toEqual([])
        expect(console.error).toHaveBeenCalled()
        }
      );

      let userUrl: string = '/api/user/'
      const req = httpTestingController.expectOne(userUrl);

      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    });

    it('should return expected users (called multiple times)', () => {
      userService.getUserList()
      userService.getUserList()
      userService.getUserList().then(
        users => expect(users).toEqual
        (expectedUsers, 'should return expected users'),
        fail
      );

      let userUrl: string = '/api/user/'
      const requests = httpTestingController.match(userUrl);
      expect(requests.length).toEqual(3, 'calls to getUserList()');

      requests[0].flush([]);
      requests[1].flush([{id: 1, email: 'a', password: 'b', name: 'c', signed_in: false }]);
      requests[2].flush(expectedUsers);
    });
  })

  // it getUser should send GET method to httpClient
  //    and should return expected user
  // it getUser should console.error when 404
  describe('#getUser', () => {
    const userId = 1
    const expectedUser: User = new User(userId,'a','b','c',false)
    const userUrl: string = '/api/user//' + userId

    beforeEach(() => {
      userService = TestBed.get(UserService)
      httpTestingController.expectOne('/api/user/') // to ignore constructor initialization
    })

    it('should return expected user (called once)', () => {
      userService.getUser(userId).then(
        user => expect(user).toEqual(
          expectedUser,'should return expected user'),
        fail
      );

      const req = httpTestingController.expectOne(userUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(expectedUser);
    });

    it('should resolve undefined with 404 error', () => {
      const msg = 'Deliberate 404'
      userService.getUser(userId).then(user => {
          expect(user).toBeUndefined()
          expect(console.error).toHaveBeenCalled()
        }
      );
      const req = httpTestingController.expectOne(userUrl);
      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    });
  })

  // it updateUser should send PUT request to httpClient
  describe('#updateUser', () => {
    const userId = 1
    const updatedUser: User = new User(userId,'a','b','c',false)
    const userUrl: string = '/api/user//' + userId

    beforeEach(() => {
      userService = TestBed.get(UserService)
      httpTestingController.expectOne('/api/user/') // to ignore constructor initialization
    })

    it('should send PUT request', () => {
      userService.updateUser(updatedUser).then(
        user => expect(user).toEqual(
          updatedUser,'should return updated user'),
        fail
      );

      const req = httpTestingController.expectOne(userUrl);
      expect(req.request.method).toEqual('PUT');
      req.flush(updatedUser);
    });

    it('should resolve undefined with 404 error', () => {
      const msg = 'Deliberate 404'
      userService.updateUser(updatedUser).then(user => {
          expect(user).toBeUndefined()
          expect(console.error).toHaveBeenCalled()
        }
      );
      const req = httpTestingController.expectOne(userUrl);
      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    });
  })

  /** Sync features testing **/
  describe('#syncFeatures', () => {
    let expectedUsers: User[]
    let expectedUser: User
    let req

    beforeEach(() => {
      userService = TestBed.get(UserService)
      expectedUsers = [
        { id: 1, email: 'a', password: 'b', name: 'c', signed_in: false },
        { id: 2, email: 'd', password: 'e', name: 'f', signed_in: false },
      ] as User[];
      expectedUser = new User(1,'a','b','c',false)
      req = httpTestingController.expectOne('/api/user/') // constructor initialization
      req.flush(expectedUsers)  // userList initialization
    })

    it('should initialize currentUser with dummyUser', () => {
      expect(userService.currentUser).toEqual(userService.dummyUser)
    })
    it('getServiceUserList should initialize with getUserList', fakeAsync(()=>{
      userService.getServiceUserList()
      req = httpTestingController.expectOne('/api/user/') // constructor initialization
      req.flush(expectedUsers)
      expect(req.request.method).toEqual('GET')
      tick()
      expect(userService.userList).toEqual(expectedUsers)
    }))

    it('setCurrentUser should set currentUser', () => {
      userService.setCurrentUser(expectedUser)
      expect(userService.currentUser).toEqual(expectedUser)
    })
    it('getCurrentUser should return currentUser', () => {
      expect(userService.getCurrentUser()).toEqual(userService.currentUser)
    })

    it('findAuthor should return User of given Id', ()=>{
      userService.userList = expectedUsers
      expect(userService.findAuthor(1)).toEqual(expectedUser.name)
    })
    it('findAuthor should return #NaN if there is no appropriate User', ()=>{
      userService.userList = expectedUsers
      expect(userService.findAuthor(9999)).toEqual('#NaN')
    })

    it('sighOut should change currentUser.signedin to false', fakeAsync(()=>{
      let signedInUser = new User(2,'d','e','f',true)
      let userUrl = '/api/user//' + signedInUser.id
      userService.setCurrentUser(signedInUser)

      userService.signOut()
      //updateUser called
      const req = httpTestingController.expectOne(userUrl);
      expect(req.request.method).toEqual('PUT');
      req.flush(signedInUser)
      tick()
      expect(signedInUser.signed_in).toEqual(false)
      expect(userService.currentUser).toEqual(userService.dummyUser)
    }))
  })
})



