import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { UserManagementService } from 'src/app/service/user-management.service';
import { User } from '../domain/class';
import { DeleteUserComponent } from './delete-user/delete-user.component';
import { ModalFormUserComponent } from './modal-form-user/modal-form-user.component';
import { MatSort, Sort} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator!: MatPaginator ;
  @ViewChild(MatSort) sort!: MatSort;
  public displayedColumns: string[] = ['userId', 'firstName', 'lastName', 'email', 'profile', 'action'];
  public dataSource = new MatTableDataSource<User>();
  public search!: FormGroup;
  private subscription: Subscription[] = [];

  constructor(
    private userManagementService: UserManagementService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer) {
  }

  ngOnInit(): void {
    this.search = this.formBuilder.group({
      ctrlSearch: [''],
      ctrlActive: [true]
    });
    this.callGetAPI();
    this.getPermissionAPI();
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  public addUser(): void {
    const dialogRef = this.dialog.open(ModalFormUserComponent, { width: '40%', height: '50%' });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) { this.callGetAPI(); };
      }
    );
  }

  public onEdit(element: Element): void {
    const dialogRef = this.dialog.open(ModalFormUserComponent, { width: '40%', height: '50%', data: element });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) { this.callGetAPI(); };
      }
    );
  }

  public onDelete(userId: number): void {
    const dialogRef = this.dialog.open(DeleteUserComponent, { width: '40%', height: '50%' });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          this.subscription.push(this.userManagementService.deleteUser(userId).subscribe(
            () => this.callGetAPI()
          ));
        }
      });
  }

  public callGetAPI(): void {
    const keyword = this.search.get('ctrlSearch')?.value;
    const isActive = this.search.get('ctrlActive')?.value;
    this.subscription.push(this.userManagementService.getUserList(keyword, isActive).subscribe(
      users => {this.dataSource.data = users;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;}
    ));
  }

  public announceSortChange(sortState: Sort): void {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  private getPermissionAPI(): void {
    const currentUrl = (window.location.pathname).replace('/', '');
    this.subscription.push(this.authService.getPermissionPage(currentUrl).subscribe(
      resp => console.log(resp)
    ));
  }

}


