ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'game.entities.object'
)
.defines(function(){

	// The Bouncing Player Ball thing
	EntityPlayer = EntityObject.extend({
		
		worldmap_pos: {x: 0, y: 0},
		
		size: {x:16, y:16},
		checkAgainst: ig.Entity.TYPE.BOTH,
		type: ig.Entity.TYPE.A,
		
		collides: ig.Entity.COLLIDES.LITE,
		
		animSheet: new ig.AnimationSheet( 'media/player.png', 15, 19 ),
		
		velocity: 60,
		
		health: 100,
		dammage: 10,
		
		attack_cool_timer: 0,
		attack_anim_timer: 0,
		
		attacking: false,
		
		direction: null,
		inventory: [],
		
		// a listing of all buttons currently pressed
		actions: {},
		// if this is me
		me: false,
		is_host: false,
		
		syncable: {
			pos: true,
			direction: true,
		},
		
		init: function( x, y, settings ) {
			
			this.addAnim('idle', 0.1, [0] );
			this.addAnim('use', 0.1, [9]);
			
			this.addAnim('down', 0.1, [0, 1, 2]);
			this.addAnim('up', 0.1, [6, 7, 8]);
			this.addAnim('left', 0.1, [3, 4, 5]);

			this.addAnim('attack_down', 0.1, [10, 11, 12]);
			this.addAnim('attack_up', 0.1, [13, 14, 15]);
			this.addAnim('attack_left', 0.1, [16, 17, 18]);
			
			this.parent( x, y, settings );
			
		},
		
		attack: function() {
					
			if(this.attack_cool_timer == 0){
		
				this.attacking = true;
				
				// this shoould be actually be a number + this.attack_anim_timer.
				this.attack_cool_timer = 13;
				this.attack_anim_timer = 10;
				
			}
		
		},
		
		reset_actions: function(){
			this.actions = {
				up: false,
				down: false,
				left: false,
				right: false,
				attack: false,
				use: false
			}
		},
		
		update: function() {
			
			this.currentAnim = this.anims.idle;
			
			// how to solve lag
				// if (this is me){ apply vel }
				// always apply direction for animiations and attacking
				
				// user always reports input state and x,y pos
					// we may miss attacks if direction is off
						// this is if the user just turns direction and starts attacking
							// we may need to go up a level, this.attacks that, this uses that logging
				
			if(this.actions.left){
					
				this.vel.x = -this.velocity;
				
				if(this.direction == null){
					this.direction = "left";
				}
				
			}
			
			if(this.actions.right) {
				
				this.vel.x = this.velocity;
				
				if(this.direction == null){
					this.direction = "right";
				}
				
			}
			
			if(this.actions.up) {
			
				this.vel.y = -this.velocity;
				
				if(this.direction == null){
					this.direction = "up";
				}
				
			}
			
			if(this.actions.down) {
				
				this.vel.y = this.velocity;
				
				if(this.direction == null){
					this.direction = "down";
				}
				
			} 
			
			if(!this.actions.right && !this.actions.left){
				
				// always left, we flipx if needed above
				this.vel.x = 0;
				
			}
			
			if(!this.actions.up && !this.actions.down){
				
				// always left, we flipx if needed above
				this.vel.y = 0;
				
			}
			
			if(this.actions.left && !this.actions.up && !this.actions.right && !this.actions.down){
				this.direction = "left";
			}
			if(this.actions.right && !this.actions.up && !this.actions.left && !this.actions.down){
				this.direction = "right";
			}
			if(this.actions.up && !this.actions.left && !this.actions.right && !this.actions.down){
				this.direction = "up";
			}
			if(this.actions.down && !this.actions.up && !this.actions.right && !this.actions.left){
				this.direction = "down";
			}
			
			// if we have no input and are going in no direction
			if(this.vel.y == 0 && this.vel.x == 0){
				// this can be changed to a bunch of idle animations for each side
				this.direction = null;
			}
			
			// do the proper animation based on the direction we're going
			if(this.direction == "left"){
			
				this.currentAnim = this.anims.left;
				this.currentAnim.flip.x = false;
			
			} else if (this.direction == "right"){
				
				this.currentAnim = this.anims.left;
				this.currentAnim.flip.x = true;
			
			} else if (this.direction == "up"){
			
				this.currentAnim = this.anims.up;
			
			} else if (this.direction == "down"){
			
				this.currentAnim = this.anims.down;
			
			}
			
			// this lasts just one frame
			this.attacking = false;
			
			// decrease attack cooldown
			if(this.attack_cool_timer != 0){
				this.attack_cool_timer--;
			}
			
			// decrease attack animation timer
			if(this.attack_anim_timer != 0){
				this.attack_anim_timer--;
			}
			
			if(this.actions.attack){
				this.attack();
			} 
		
			// play out the whole attack, keep movement speed slowed			
			if(this.attack_anim_timer > 0){
			
				this.maxVel.x = 0;
				this.maxVel.y = 0;
				
				if(this.direction == "left"){
					
					this.currentAnim = this.anims.attack_left;
					this.currentAnim.flip.x = false;
					
				} else if(this.direction == "right"){

					this.currentAnim = this.anims.attack_left;
					this.currentAnim.flip.x = true;

				} else if(this.direction == "up"){

					this.currentAnim = this.anims.attack_up;

				} else if(this.direction == "down"){

					this.currentAnim = this.anims.attack_down;

				}
			
			} else {
			
				this.maxVel.x = this.velocity;
				this.maxVel.y = this.velocity;
				
			}
			
			this.parent();
			
		},
		
		take: function(object){
			this.inventory.push(object);
		},
		
		check: function(other){
			
			// these don't read right
			
			if(this.attacking){
				other.hit(this);
			} else if (this.actions.use){
				other.use(this);
			} else {
				other.over(this);
			}

		},
		
		over: function(){
			// console.log('player is over something');
		}	
		
	});

});