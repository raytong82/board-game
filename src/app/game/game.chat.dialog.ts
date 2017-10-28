import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'game.chat.dialog',
  templateUrl: 'game.chat.dialog.html',
})
export class GameChatDialog {

  constructor(
    public dialogRef: MatDialogRef<GameChatDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  closeChatDialog(): void {
    this.dialogRef.close();
  }

}
