# BoardGame

Heroku does not support specify port, so client and server need to deploy to different instance

## Port

~~port 3000 for angularJS~~
~~port 4000 for socket io~~
port 3000 for both angularJS and socket io

## Environment Variable

Be aware not to include trailing space at the end of value

`HEROKU_APP_START=./bin/www`
> app to run; client would be ./bin/www; server would be ./routes/server.js

`SERVER=true`
> ~~override the port to 4000 instead of process.env.PORT~~

 
## Environment

environment=local
> serverUrl would be localhost

## Heroku Client App for Angular

```NPM_CONFIG_LOGLEVEL: verbose
NPM_CONFIG_PRODUCTION: false
HEROKU_APP_START: ./bin/www
```

## Heroku Server App for Socket IO

```NPM_CONFIG_LOGLEVEL: verbose
NPM_CONFIG_PRODUCTION: false
HEROKU_APP_START: ./routes/server.js
SERVER: false
```

## How to build

`npm install --save express body-parser morgan body-parser serve-favicon mongoose socketio socket.io-client @angular/material @angular/cdk`

## How to run

`set HEROKU_APP_START=./bin/www&& set SERVER=true&& ng build --environment=local && npm start`

## To-do Items

- [x] hide score, score cards, trade cards (except last used) by player
- [x] display game action history
- [x] determine end game and freeze actions and display winner
- [x] fix use trade card became pick trade card
- [x] fix waiting cannot reset
- [x] web and server use the same port
- [x] fix display winner, optimize ui reduce space, display only last 20 actions
- [x] support chat room with emoji
- [x] check on intermediate action and clear data after action completed
- [x] store data in mlab for game history
- [x] show modal dialog on chat / user action
- [x] support config to show chat / user action as setting and persist to local
- [x] support config to confirm / decline current action as setting and persist to local
- [ ] data analytics on stored data
- [ ] support inline emoji
