import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Photo } from 'src/app/_models/photo';
import { FileUploader } from 'ng2-file-upload';
import { environment } from '../../../environments/environment';
import { CoreEnvironment } from '@angular/compiler/src/compiler_facade_interface';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';


@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  @Output() getMemberPhotoChange = new EventEmitter<string>();

  uploader: FileUploader;
  hasBaseDropZoneOver: false;
  baseUrl = environment.apiUrl;
  currentMain: Photo;



  constructor(private authService: AuthService
    ,         private userService: UserService
    ,         private alertify: AlertifyService) {

  }

  ngOnInit() {
    console.log('reach here');
    this.initialUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initialUploader() {
    console.log(this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos');
    // this.uploader = new FileUploader({
    //   url : this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos',
    //   authToken: 'Bearer ' + localStorage.getItem('token'),
    //   disableMultipart: true, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
    //   formatDataFunctionIsAsync: true,
    //   formatDataFunction: async (item) => {
    //     return new Promise( (resolve, reject) => {
    //       resolve({
    //         name: item._file.name,
    //         length: item._file.size,
    //         contentType: item._file.type,
    //         date: new Date()
    //       });
    //     });
    //   }
    // });
    // this.hasBaseDropZoneOver = false;
    // this.response = '';
    // this.uploader.onAfterAddingFile = (file) => {file.withCredentials = false; };

    // this.uploader.response.subscribe( res => this.response = res );




    console.log(this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos');
    this.uploader = new FileUploader ({
      url: this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });
    this.uploader.onAfterAddingFile = (file) => {file.withCredentials = false; };

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
      const res: Photo = JSON.parse(response);
      const photo = {
        id: res.id,
        url: res.url,
        dateAdded: res.dateAdded,
        description: res.description,
        isMain: res.isMain
      };
      this.photos.push(photo);
      console.log(photo);
      if (photo.isMain) {
        this.authService.changeMemberPhoto(photo.url);
        this.authService.currentUser.photoUrl = photo.url;
        localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
      }
      }
    };

  }

  setMainPhoto(photo: Photo) {
this.userService.setMainPhoto(this.authService.decodedToken.nameid, photo.id).subscribe(() => {
  this.currentMain = this.photos.filter(p => p.isMain === true)[0];
  this.currentMain.isMain = false;
  photo.isMain = true;
  this.authService.changeMemberPhoto(photo.url);
  this.authService.currentUser.photoUrl = photo.url;
  localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
  console.log('Successfully set to Main');
}, error => {
  this.alertify.error(error);
});
  }

  deletePhoto(id: number) {
    this.alertify.confirm('Are you sure you want delete the photo?', () => {
    this.userService.deletePhoto(this.authService.decodedToken.nameid, id).subscribe(() => {
    this.photos.splice(this.photos.findIndex(p => p.id === id), 1);
    this.alertify.success('This photo has been deleted.');
  }, error => {
  this.alertify.error('Failed to delete this photo!');
    });
   });
  }
}
