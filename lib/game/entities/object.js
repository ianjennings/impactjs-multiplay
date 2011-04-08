ig.module(
	'game.entities.object'
)
.requires(
	'impact.entity'
)
.defines(function(){

	// this is a default entity object

	EntityObject = ig.Entity.extend({
	
		// list of syncable items
		
		syncable: {
			pos: true
		},
		
		init: function( x, y, settings ) {		
			this.parent( x, y, settings );
		},
		
		update: function() {
			this.parent();
			// sync items into array
			// every tick, get a world snapshot by looping through entities
		},
		
		hit: function() {
			return false;
		},
		
		use: function(){
			return false;
		},
		
		over: function() {
			return false;
			// trigger some GUI element that says USE!
			// or just light me up blue
		}
		
	});
	
});