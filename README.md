Multiplayer Plugin for ImpactJS
====================

What is impactjs-multiplay?
---------------------

impactjs-multiplay is going to be a multiplayer framework for the impactjs javascript game engine (http://impactjs.com/) using faye (https://github.com/jcoglan/faye).

Who should use this repo?
---------------------

Anybody with a strong understanding of both impactjs and multilayer networking. I recommended taking a look at the impactjs docs, and this article on multilayer networking by Valve (http://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking).

A note about the current state of impactjs-multiplay
---------------------

This is a very early version of what I hope to build into a plugin. A full package will be available in the future, but for now this repo is for learning purposes only. If you study the code you should be able to figure out whats actually going one, and begin from there.

Alright, I'm ready
---------------------

My current implementation uses faye (https://github.com/jcoglan/faye) to distribute entity properties from player to player. Normally game logic would be done on the server, but impactjs has trouble running without a window object under nodejs. Instead, a host player acts as a listen server, and broadcasts entity properties through faye. Still with me?

Say that again?
---------------------

So heres a little rundown of how most multiplayer games work.

1. Player inputs controls
2. Controls are sent to server
3. Server does calculations including collision, outcome
4. Server sends entity updates back to player
5. Player renders the outcome of the sent controls

Now, since impactjs can not run with nodejs, we lose all the great benefits of the framework if we were to program the game logic server side. So instead, we actually assign a host to handle game logic. You would call that player a host.

So instead, it looks something like this.

1. Determine which player is host
2. Player inputs controls
3. Controls are sent to server
4. Server sends controls to host
5. Host calculates outcome with impactjs
6. Host sends entity updates back to server
7. Server sends updates back to players

Contact
---------------------

If you'd like to chat you can react me at ian [at] meetjennings.com on google talk or email.