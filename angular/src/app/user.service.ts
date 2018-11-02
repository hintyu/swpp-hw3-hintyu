import { Injectable } from '@angular/core';

import { User } from './user';
import { HttpClient, HttpHeaders } from '@angular/common/http';


const httpOptions = {
  headers: new HttpHeaders( { 'Content-Type': 'application/json'} )
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // currentUser will be used to check authentications, sign-in status.
  currentUser: User
  userList: User[]
  readonly  dummyUser: User = new User(-1, '', '', '', false )

  constructor(
    private http: HttpClient
  ) {
    this.currentUser = this.dummyUser
    this.getServiceUserList() // initialize user list when service create
  }

  private userUrl = '/api/user/'

  /** To update & maintain userList inside this service **/
  getServiceUserList(): void {
    this.getUserList()
      .then(userList => this.userList = userList)
  }

  /** Current User settings **/
  setCurrentUser(user: User): void {
    this.currentUser = user
  }

  getCurrentUser(): User {
    return this.currentUser
  }

  /** helping other components **/
  findAuthor(user_id: number): string {
    for(let num in this.userList) {
      if(this.userList[num].id === user_id) {
        return this.userList[num].name
      }
    }
    // if failed to find appropriate user of the id:
    return '#NaN'  //throw new NoUserFoundException(user_id);
  }

  signOut(): void {
    if(this.currentUser) {
      this.currentUser.signed_in = false;
      this.updateUser(this.currentUser)
        .then(() => this.currentUser = this.dummyUser)
    }
  }

  /** HTTP FUNCTIONS **/
  /** GET functions **/
  getUserList(): Promise<User[]> {
    return this.http.get<User[]>(this.userUrl)
      .toPromise()
      .catch(this.handleError('getUserList', []))
  }

  getUser(id: number): Promise<User> {
    const url = `${this.userUrl}/${id}`;
    return this.http.get<User>(url)
      .toPromise()
      .catch(this.handleError('getUser id=${id}'))
  }

  /** PUT functions **/

  updateUser(user: User): Promise<User> {
    const url = `${this.userUrl}/${user.id}`;
    return this.http.put(url, user, httpOptions)
      .toPromise()
      .then(() => user)
      .catch(this.handleError('updateUser=${id}'))
  }

  /** Handle Http operation that failed **/
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Promise<T> => {
      console.error(error);
      return Promise.resolve(result as T);
    };
  }
}
