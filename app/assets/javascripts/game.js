window.onload = function() {
	//start crafty
	Crafty.init(400, 320);
	Crafty.canvas.init();
	//scenes: preloader and main
	scenes.main.create_and_preload();
};

sprites = {
	sheets: {
		main: "/assets/sprite.png",
		mine: "/assets/mine1.png"
	},
	create: function() {
		//turn the sprite map into usable components
		Crafty.sprite(16, this.sheets.main, {
			grass1: [0,0],
			grass2: [1,0],
			grass3: [2,0],
			grass4: [3,0],
			flower: [0,1],
			bush1: [0,2],
			bush2: [1,2],
			player: [0,3]
		});
		Crafty.sprite(24, this.sheets.mine, {
			boy: [0,0]
		});
		//
	},
	load_callback: function(fn_callback) {
		this.create();
		var sheets_to_load = [this.sheets.main, this.sheets.mine];
		Crafty.load(sheets_to_load, fn_callback);
	}
}

maps = {
	main: {
		//method to randomy generate the map
		renderMap:  function() {
									//generate the grass along the x-axis
									for(var i = 0; i < 25; i++) {
										//generate the grass along the y-axis
										for(var j = 0; j < 20; j++) {
											grassType = Crafty.math.randomInt(1, 4);
											Crafty.e("2D, Canvas, grass"+grassType)
												.attr({x: i * 16, y: j * 16});

											//1/50 chance of drawing a flower and only within the bushes
											if(i > 0 && i < 24 && j > 0 && j < 19 && Crafty.math.randomInt(0, 50) > 49) {
												Crafty.e("2D, DOM, flower")
													.attr({x: i * 16, y: j * 16});
													//.addComponent('SpriteAnimation')
													//.animate("wind", 0, 1, 2);
													//.animate("wind", 15, -1);
											}
											//1/50 chance of drawing a bush and only within the bushes
											if(i > 0 && i < 24 && j > 0 && j < 19 && Crafty.math.randomInt(0, 50) > 45) {
												Crafty.e("2D, Canvas, wall_top, solid, bush"+Crafty.math.randomInt(1,2))
													.attr({x: i * 16, y: j * 16});
											}
										}
									}

									//create the bushes along the x-axis which will form the boundaries
									for(var i = 0; i < 25; i++) {
										Crafty.e("2D, Canvas, wall_top, solid, bush"+Crafty.math.randomInt(1,2))
											.attr({x: i * 16, y: 0, z: 2});
										Crafty.e("2D, DOM, wall_bottom, solid, bush"+Crafty.math.randomInt(1,2))
											.attr({x: i * 16, y: 304, z: 2});
									}

									//create the bushes along the y-axis
									//we need to start one more and one less to not overlap the previous bushes
									for(var i = 1; i < 19; i++) {
										Crafty.e("2D, DOM, wall_left, solid, bush"+Crafty.math.randomInt(1,2))
											.attr({x: 0, y: i * 16, z: 2});
										Crafty.e("2D, Canvas, wall_right, solid, bush"+Crafty.math.randomInt(1,2))
											.attr({x: 384, y: i * 16, z: 2});
									}

								}
	}
}

scenes = {
	main: {
		_create: function() {

			Crafty.scene("main", function() {
				maps.main.renderMap();
				controls.hero.create();

				//create our player entity with some premade components
				player = Crafty.e("2D, Canvas, boy, Hero, Animate, Collision")
					.attr({x: 160, y: 144, z: 1})
					.setSpeed(2);
			});
			
		},
		_load: function() {
			Crafty.scene("main"); //when everything is loaded, run the main scene
		},
		create_and_preload: function() {

			this._create();
			scenes.loading.create_load_callback( this._load );

		}
	},
	loading: {
		create_load_callback: function(fn_callback) {
			
			//the loading screen that will display while our assets load
			Crafty.scene("loading", function() {
				//load takes an array of assets and a callback when complete

				sprites.load_callback(fn_callback);
				//black background with some loading text
				Crafty.background("#000");
				Crafty.e("2D, DOM, Text")
				  .attr({w: 100, h: 20, x: 150, y: 120})
					.text("Loading...")
					.css({"text-align": "center"});

				Crafty.e("2D, DOM, Text, Persist")
				  .attr({w: 200, h: 20, x: 16, y: 16})
					.text("MY GAME NAME")
					.css({"text-align": "center"});
					//.addComponent('Persist')
			});
			//automatically play the loading scene
			Crafty.scene("loading");
		}
	}
}

controls = {
	hero: {
		create: function() {

			Crafty.c("MyMoveControls", {

				init: function() {
					this.requires('Multiway');
				},
				setSpeed: function(speed) {
					this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
					return this;
				}

			});

			Crafty.c('Hero', {
				init: function() {
						//setup animations
						this.requires("SpriteAnimation, Collision, MyMoveControls")
						/*
						.animate("walk_down",  0, 3, 2)
						.animate("walk_up",    3, 3, 5)
						.animate("walk_left",  6, 3, 8)
						.animate("walk_right", 9, 3, 11)
						*/
						.animate("walk_down",  0, 0, 2)
						.animate("walk_up",    0, 1, 2)
						.animate("walk_left",  0, 2, 2)
						.animate("walk_right", 0, 3, 2)
						//change direction when a direction change event is received
						.bind("NewDirection",
							function (direction) {
								if (direction.x < 0) {
									if (!this.isPlaying("walk_left"))
										this.stop().animate("walk_left",  8, -1);
								}
								if (direction.x > 0) {
									if (!this.isPlaying("walk_right"))
										this.stop().animate("walk_right", 8, -1);
								}
								if (direction.y < 0) {
									if (!this.isPlaying("walk_up"))
										this.stop().animate("walk_up",    8, -1);
								}
								if (direction.y > 0) {
									if (!this.isPlaying("walk_down"))
										this.stop().animate("walk_down",  8, -1);
								}
								if(!direction.x && !direction.y) {
									this.stop();
								}
						})
						// A rudimentary way to prevent the user from passing solid areas
						.bind('Moved', function(from) {
							if(this.hit('solid')){
								this.attr({x: from.x, y:from.y});
							}
						});
					return this;
				}
			});

		}
	}
}