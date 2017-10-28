import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'game.action.dialog',
  templateUrl: 'game.action.dialog.html',
})
export class GameActionDialog {

  constructor(
    public dialogRef: MatDialogRef<GameActionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  closeActionDialog(): void {
    this.dialogRef.close();
  }

}
