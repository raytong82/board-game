import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';
import { GameService } from './game.service';

import { GameComponent } from './game/game.component';
import { GameActionDialog } from './game/game.action.dialog';
import { GameChatDialog } from './game/game.chat.dialog';
import { GameConfirmDialog } from './game/game.confirm.dialog';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CdkTableModule} from '@angular/cdk/table';

import { StatComponent } from './stat/stat.component';

import { Num2ArrayPipe, HasNonZeroPropertyPipe, SumOfPropertyPipe } from './game/game.pipe';

const ROUTES = [
  { path: '', redirectTo: 'games', pathMatch: 'full' },
  { path: 'games', component: GameComponent },
  { path: 'stat', component: StatComponent }
];

@NgModule({
  exports: [
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ]
})
export class MaterialModule {}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    RouterModule.forRoot(ROUTES)
  ],
  declarations: [
    AppComponent,
    GameComponent,
    GameActionDialog,
    GameChatDialog,
    GameConfirmDialog,
    StatComponent,
    Num2ArrayPipe,
    HasNonZeroPropertyPipe,
    SumOfPropertyPipe
  ],
  providers: [
    GameService,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  entryComponents: [
    GameActionDialog,
    GameChatDialog,
    GameConfirmDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
