Multiplayer Plugin for ImpactJS
====================

What is impactjs-multiplay?
---------------------

impactjs-multiplay is going to be a multiplayer framework for the impactjs javascript game engine (http://impactjs.com/).


How does it work?
---------------------

My current implementation uses faye (https://github.com/jcoglan/faye) to distribute entity properties from player to player. Normally game logic would be done on the server, but impactjs has trouble running without a window object under nodejs. Instead, a host player acts as a listen server, and broadcasts entity properties through faye. Still with me?