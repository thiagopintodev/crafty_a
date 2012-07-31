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
			s_Player: [0,3]
		});
		Crafty.sprite(24, this.sheets.mine, {
			s_Boy: [0,0]
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
									map = {};
									map.x = 25;
									map.y = 16;
									map.tile = 16;
									map.w = map.x * map.tile;
									map.h = map.y * map.tile;

									//generate the grass along the x-axis
									for(var i = 0; i < map.x; i++) {
										//generate the grass along the y-axis
										for(var j = 0; j < map.y; j++) {
											grassType = Crafty.math.randomInt(1, 4);
											Crafty.e("2D, Canvas, grass"+grassType)
												.attr({x: i * 16, y: j * 16});

											//1/50 chance of drawing a flower and only within the bushes
											if(i > 0 && i < map.x-1 && j > 0 && j < map.y-1 && Crafty.math.randomInt(0, 50) > 48) {
												Crafty.e("2D, DOM, flower")
													.attr({x: i * 16, y: j * 16})
													//.addComponent('SpriteAnimation')
													//.animate("wind", 0, 1, 2);
													//.animate("wind", 15, -1);
											}
										}
									}

									//create the bushes along the x-axis which will form the boundaries
									for(var i = 0; i < map.x; i++) {
										Crafty.e("2D, Canvas, wall_top, solid, bush"+Crafty.math.randomInt(1,2))
											.attr({x: i * 16, y: 0, z: 2});
										Crafty.e("2D, DOM, wall_bottom, solid, bush"+Crafty.math.randomInt(1,2))
											.attr({x: i * 16, y: map.h-16, z: 2});
									}

									//create the bushes along the y-axis
									//we need to start one more and one less to not overlap the previous bushes
									for(var i = 1; i < map.y; i++) {
										Crafty.e("2D, DOM, wall_left, solid, bush"+Crafty.math.randomInt(1,2))
											.attr({x: 0, y: i * 16, z: 2});
										Crafty.e("2D, Canvas, wall_right, solid, bush"+Crafty.math.randomInt(1,2))
											.attr({x: map.w-16, y: i * 16, z: 2});
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
				player = Crafty.e("2D, Canvas")
					.attr({x: 160, y: 144, z: 1})
					.addComponent('HeroBoy')
					//.setSpeed(1);

				sign = Crafty.e("2D, Canvas, wall_top, solid, Talkable, bush"+Crafty.math.randomInt(1,2))
						.attr({x: 168, y: 200})
						.attr({msg: 'I love you'});
				sign = Crafty.e("2D, Canvas, wall_top, solid, Talkable, bush"+Crafty.math.randomInt(1,2))
						.attr({x: 200, y: 200})
						.attr({msg: 'I hate you'});
				sign = Crafty.e("2D, Canvas, wall_top, solid, Talkable, bush"+Crafty.math.randomInt(1,2))
						.attr({x: 232, y: 200})
						.attr({msg: 'who?'});
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

				msg1 = Crafty.e("2D, DOM, Text, Persist")
				  .attr({w: 400, h: 20, x: 0, y: 270})
					.text("go to a stone and press X")
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

			Crafty.c('HeroBoy', {
				init: function() {
						this.requires("_Hero, s_Boy")
								.animate("walking_down",  0, 0, 2)
								.animate("walking_up",    0, 1, 2)
								.animate("walking_left",  0, 2, 2)
								.animate("walking_right", 0, 3, 2);
				}
			});
			Crafty.c('HeroPlayer', {
				init: function() {
						this.requires("_Hero, s_Player")
								.animate("walking_down",  0, 3, 2)
								.animate("walking_up",    3, 3, 5)
								.animate("walking_left",  6, 3, 8)
								.animate("walking_right", 9, 3, 11);
				}
			});

			Crafty.c('_Hero', {
				init: function() {

						var speed  = 1;
						var keyBindings = {UP_ARROW: 270, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180};

						//setup animations
						this.requires("SpriteAnimation, Collision, Multiway, Keyboard")
						//change direction when a direction change event is received
						.multiway(speed, keyBindings)
						.bind("NewDirection",
							function (direction) {

								this.stop();
								if (direction.x < 0) {
									if (!this.isPlaying("walking_left"))
										this.animate("walking_left",  8, -1);
								}
								if (direction.x > 0) {
									if (!this.isPlaying("walking_right"))
										this.animate("walking_right", 8, -1);
								}
								if (direction.y < 0) {
									if (!this.isPlaying("walking_up"))
										this.animate("walking_up",    8, -1);
								}
								if (direction.y > 0) {
									if (!this.isPlaying("walking_down"))
										this.animate("walking_down",  8, -1);
								}
								//if(!direction.x && !direction.y) {
								//}

							}
						)
						// A rudimentary way to prevent the user from passing solid areas
						.bind('Moved', function(from) {

							if(this.hit('Talkable')){
								player.last_touched_obj = this.hit('Talkable')[0].obj;
							} else if (player.foo) {
								player.foo = false;
							} else {
								player.last_touched_obj = false;
							}

							if(this.hit('solid')){
								this.attr({x: from.x, y:from.y});
								player.foo = true;
							}
						})
						//keyboard
						.bind('KeyUp', function (e) {

							if (e.key == Crafty.keys.X && player.last_touched_obj) {
								ialert(player.last_touched_obj.msg);
							}
						})
					return this;
				}
			});

		}
	}
}
function ialert(msg) {
	msg1.text(msg);
}