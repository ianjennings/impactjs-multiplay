ig.module( 
	'game.main' 
)
.requires(

	'impact.game',
	'impact.font',
	
	'game.entities.object',
	
	'game.entities.player',
	'game.entities.coin',
	'game.entities.chest',
	'game.entities.dummy',
	'game.entities.ghost',
	'game.entities.tree',
	
	'game.levels.0x0',
	'game.levels.0x1',
	'game.levels.0x2',
	
	'game.levels.1x0',
	'game.levels.1x1',
	'game.levels.1x2'

).defines(function(){

MyGame = ig.Game.extend({
	
	// deal with faye multiplayer
	faye: {},
	
	player: null,
	settings: null,
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
	worldmap: [],
	
	num_players: 1,
	
	host: false,
	
	init: function() {
	
		// Initialize your game here; bind keys etc.
		
		// bind keys
		ig.input.bind(ig.KEY.A, 'left');
		ig.input.bind(ig.KEY.D, 'right');
		ig.input.bind(ig.KEY.W, 'up');
		ig.input.bind(ig.KEY.S, 'down');
		
		ig.input.bind(ig.KEY.SPACE, 'attack');
		ig.input.bind(ig.KEY.E, 'use');
		
		this.worldmap.push([Level0x0, Level0x1, Level0x2]);
		this.worldmap.push([Level1x0, Level1x1, Level1x2]);
		
        this.loadLevel(this.worldmap[0][0]);
		
		var ts = Math.round((new Date()).getTime() / 1000);
		
		var settings = {me: true, name: ts, health: 5, worldmap_pos: {x: 0, y:0}};
		this.player = this.spawnEntity(EntityPlayer, 100, 100, settings);
		
		// set up faye
		this.faye.client = new Faye.Client('http://ec2-50-17-122-3.compute-1.amazonaws.com:8080/faye', {
			timeout: 120
		});
		
		this.faye.subscription = this.faye.client.subscribe('/foo', function(message) {
			// send the message away
			ig.game.faye_recieve(message);
		});
		
	},
	
	// MESSAGES
	/*
	type: join, leave, actions
	data: {player_id: player_id, actions: actions}
	*/
	
	faye_recieve: function(message){
	
		console.log('Packet Recieved');
	
		if (message.type == "actions"){
			
			if(this.getEntityByName(message.data.player.name) == undefined){
		
				this.num_players++;
		
				settings = {me: false, name: message.data.player.name};
				this.spawnEntity(EntityPlayer, 100, 100, settings);
				
			}
			
			not_me = this.getEntityByName(message.data.player.name);
			
			not_me.actions = message.data.player.actions;
			// not_me.pos = message.data.player.pos;
		
		} else if (message.type == "sync"){
			
			if(!this.player.is_host){
			
				// loop through entities to sync
				// console.log('recieved');
				// console.log(message);
				
				for(i in message.data){
				
					// console.log(i);
				
					// get syncable entity
					e = this.getEntityByName(message.data[i].name);
					
					// if this entity has syncable properties
					if(e && e != undefined && e.syncable != undefined){
					
						// loop through the array of peroperties
						for(s in e.syncable){
							
							// console.log(e.syncable);
							// s is the name of the property
							
							// loop through all properties given to us
							for(u in message.data[i].to_sync){
							
								// if they have the same keys
								if(s == u){
									
									// console.log('WE SHOULD SYNC THIS');
									
									// give them the same values
									e[s] = message.data[i].to_sync[u];
									
									// console.log(property + ' == ' + message.data[i].to_sync[u]);
								}
								
							}
							
						}
					
					} else {
						console.log(' does not exist ');
					}
					// get items to sync from message
				
				}
			
			}
			
		}
		
	},
	
	update: function() {
		
		var actions = {};

		// Get direct input
		if(ig.input.state('left')){
			actions.left = true;
		}
		
		if(ig.input.state('right')) {
			actions.right = true;
		}
		
		if(ig.input.state('up')) {
			actions.up = true;
		}
		
		if(ig.input.state('down')) {
			actions.down = true;
		} 
		
		if(ig.input.state('attack')){
			actions.attack = true;
		}
		
		if(ig.input.state('use')){
			actions.use = true;
		}
		
		ig.game.faye.client.publish('/foo', {type: "actions", data: {player: {name: this.player.name, actions: actions, pos: this.player.pos}}});
		
		// Update all entities and backgroundMaps
		this.parent();
		
		// determine if I am the first player in the room
		if(Math.round((new Date()).getTime() / 1000) - this.player.name > 2 && !this.player.is_host){
			if(this.num_players > 1){
				// find out who the host is
			} else {
				this.player.is_host = true;
				console.log('I AM THE HOST');
			}
		}
		
		// console.log(this.player.pos.x + ', ' + this.player.pos.y);
		
		// Add your own, additional update code here
		if (this.player.pos.x > ig.system.width) {
		
			this.player.worldmap_pos.x++;
			this.player.pos.x = 0;
        	this.changeScene(this.player.pos.x, this.player.pos.y, this.player.worldmap_pos.x, this.player.worldmap_pos.y);
			
		} else if (this.player.pos.x < 0) {
		
			this.player.worldmap_pos.x--;
			this.player.pos.x = ig.system.width;
			
        	this.changeScene(this.player.pos.x, this.player.pos.y, this.player.worldmap_pos.x, this.player.worldmap_pos.y);
			
		} else if (this.player.pos.y > ig.system.height) {
		
			this.player.worldmap_pos.y++;
			this.player.pos.y = 0;
			
        	this.changeScene(this.player.pos.x, this.player.pos.y, this.player.worldmap_pos.x, this.player.worldmap_pos.y);
			
		} else if (this.player.pos.y < 0) {
		
			this.player.worldmap_pos.y--;
			this.player.pos.y = ig.system.height;
			
        	this.changeScene(this.player.pos.x, this.player.pos.y, this.player.worldmap_pos.x, this.player.worldmap_pos.y);
			
		} 
		
		// var foo = {"t": "wee"}; var bar = "t"; foo[bar] // jennings
		// create a blank array of entities to be synced
		var sycable_entites = [];
		var x;
			
		if(this.player.is_host){
			
			// loop through in game entities
			for(i in ig.game.entities){
			
				// set up an empty object
				x = {
					name: null,
					to_sync: {},
				};
				
				// write the name of the entity to the object
				x.name = ig.game.entities[i].name;
				
				// loop through all possible syncable properties of the object
				
				if(ig.game.entities[i].syncable != undefined){
				
					for(v in ig.game.entities[i].syncable){
						
						// if that property actually exists and is defined
						// this is causing errors
							// sending some crazy functions for some reason
						if(v != undefined && v){
						
							// create a blank object to fill with syncable items
							sync_item = {};
							
							// now set the key of this object to the same key, and the property to the same value
							x.to_sync[v] = ig.game.entities[i][v];
							
						}
							
					}
					
					sycable_entites.push(x);
				
				}
			}
		
			ig.game.faye.client.publish('/foo', {type: "sync", data: sycable_entites});
		
			// console.log('sent');
			// console.log(sycable_entites);
		
		}
		
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		this.font.draw( 'manhack v0.1', 0, 0, ig.Font.ALIGN.LEFT );
	},
	
	changeScene: function(x, y, worldmap_x, worldmap_y){
		
		var next_map = this.worldmap[worldmap_x][worldmap_y];
		
		console.log(next_map);
        this.loadLevel(next_map);
		
		// rebuild player
		var settings = {health: this.player.health, worldmap_pos: {x: worldmap_x, y: worldmap_y}};
		this.spawnPlayer(x, y, settings);
		
	},
	
	spawnPlayer: function(x, y, settings){
	
		this.player = this.spawnEntity(EntityPlayer, x, y, settings);
		
	}
	
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 30, 320, 320, 2 );

});
