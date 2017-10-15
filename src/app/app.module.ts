import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';
import { GameService } from './game.service';
import { GameComponent } from './game/game.component';

import { Num2ArrayPipe, HasNonZeroPropertyPipe, SumOfPropertyPipe } from './game/game.pipe';

const ROUTES = [
  { path: '', redirectTo: 'games', pathMatch: 'full' },
  { path: 'games', component: GameComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    Num2ArrayPipe,
    HasNonZeroPropertyPipe,
    SumOfPropertyPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [
    GameService,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
