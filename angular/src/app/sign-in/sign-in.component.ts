import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { UserService } from "../user.service";
import { SignInService } from "../sign-in.service";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  constructor(
    private userService: UserService,
    private signInService: SignInService,
    private router: Router
  ) {}

  ngOnInit() {
    if(this.userService.getCurrentUser().signed_in){
      this.userService.signOut()
    }
  }

  signIn() {
    let email: string = document.forms["form"]["email"].value
    let password: string = document.forms["form"]["password"].value

    // userService's signIn method tries to sign-in with given email, password.
    // if it fails, it returns false. otherwise, it UPDATES user status inside the userService & http
    if (this.signInService.signIn(email, password)){
      this.router.navigate(['/articles'])

    } else alert('Email or password is wrong')

    return
  }
}

