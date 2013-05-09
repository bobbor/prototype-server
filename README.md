prototype-server
=

a simple file-server which is well-fitted for delivering static prototypes / html-pages

Installation
-

	npm -g install prototype-server

Run
-

	prototype-server

Configuration
-

configuration takes place in the `.prototype-server.config` file in your home-directory.
But since you can't deliver files in the home-folder (or at least i do not know how -yet), you have to run the server at least once.

it starts per default on port "8080", and actually my docroot. this is actually the only thing you have to configure.

just adjust the docroot, and port and your good to go.

Hooks
-

the hooks can adjust the way the files and folders are displayed.
you can write your own, and turn certain on or off.

just play around with it, if you want to get to know the effect

As soon as I have time, I will document them.