import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'game.confirm.dialog',
  templateUrl: 'game.confirm.dialog.html',
})
export class GameConfirmDialog {

  constructor(
    public dialogRef: MatDialogRef<GameConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  confirmDialog(): void {
    this.dialogRef.close();
  }

  declineDialog(): void {
    this.dialogRef.close();
  }

}
