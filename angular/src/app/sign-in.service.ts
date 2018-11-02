import { Injectable } from '@angular/core';

import { User } from "./user";
import { UserService } from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class SignInService {

  userList: User[] = []

  constructor(
    private userService: UserService
  ) {
    this.getUserList()
  }

  getUserList(): void {
    this.userService.getUserList()
      .then(userList => this.userList = userList)
  }

  /** User authentication methods **/
  signIn(email: string, password: string): boolean {
    // Search the user of input email
    for(let user of this.userList){
      if(user.email === email) {
        if(user.password === password) {
          // Found the valid user
          user.signed_in = true
          this.userService.updateUser(user)
          this.userService.setCurrentUser(user)

          return true // End the sign-in session.
        }
        break
      }
    }
    return false  // failed to sign-in
  }
}
