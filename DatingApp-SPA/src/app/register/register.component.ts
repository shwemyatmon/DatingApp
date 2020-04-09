import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FormatWidth } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { User } from '../_models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  user: User;
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(private authService: AuthService,
              private alertify: AlertifyService,
              private router: Router,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.bsConfig = {
      containerClass : 'theme-red'
    },
    this.createRegisterForm();
    // this.registerForm = new FormGroup({
    //   username: new FormControl('', Validators.required),
    //   password: new FormControl('', [Validators.required
    //     , Validators.minLength(4)
    //     , Validators.maxLength(8)]),
    //   confirmpassword: new FormControl('', Validators.required)
    // }, this.passwordValidator);
  }

  createRegisterForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required
        , Validators.minLength(4)
        , Validators.maxLength(8)]],
      confirmpassword: ['', Validators.required]
    }, {validator : this.passwordValidator});
  }

  passwordValidator(group: FormGroup) {
        return group.get('password').value === group.get('confirmpassword').value ? null : {mismatch: true};
  }

  register() {
       if (this.registerForm.valid) {
          this.user = Object.assign({}, this.registerForm.value);
          this.authService.register(this.user).subscribe(() => {
            this.alertify.success('Registration Successful.');
          }, error => {
            this.alertify.error(error);
          }, () => {
            this.authService.login(this.user).subscribe(() => {
              this.router.navigate(['/members/']);
            });
          });
       }


    // this.authService.register(this.model).subscribe(() => {
    //   this.alertify.success('registration successful');
    // }, error => {
    //   this.alertify.error(error);
    // });
    console.log(this.registerForm.value);
  }

  cancel() {
    this.cancelRegister.emit(false);
    this.alertify.message('cancelled');
  }

}
