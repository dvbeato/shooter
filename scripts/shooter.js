
function GamePlay() {
	
	var WIDTH = 800;
	var HEIGHT = 480;

	var canvas, context;
	var gameScore = 0.00;
	var gameMusic = new Audio();

	gameMusic.src = "sounds/gameMusic.mp3";
	gameMusic.loop = true;

	var map = {
		backgrounds:[
			{
				src:"images/mainbackground.png", 
				x:0,
				y:0,
				img:null
			},{
				src:"images/bgLayer1.png",
				x:0,
				y:0,
				img:null,
				animate:function() {
					this.x -= 1;

					if(this.x <= -WIDTH){
						this.x = WIDTH;
					}
				}
			}, {
				src:"images/bgLayer1.png",
				x:WIDTH,
				y:0,
				img:null,
				animate:function() {
					this.x -= 1;

					if(this.x <= -WIDTH){
						this.x = WIDTH;
					}
				}
			},{
				src:"images/bgLayer2.png",
				x:0,
				y:0,
				img:null,
				animate:function() {
					this.x -= 4;

					if(this.x <= -WIDTH){
						this.x = WIDTH;
					}
				}
			},{
				src:"images/bgLayer2.png",
				x:WIDTH,
				y:0,
				img:null,
				animate:function() {
					this.x -= 4;

					if(this.x <= -WIDTH){
						this.x = WIDTH;
					}
				}
			}

		],
		init: function() {
			for (var index in this.backgrounds) {
				var img = new Image();
				img.src = this.backgrounds[index].src;
				this.backgrounds[index].img = img;
			}		
		},
		draw: function() {
			var current_bg;
			for(var index in this.backgrounds) {
				current_bg = this.backgrounds[index];
				context.drawImage(
					current_bg.img, 
					current_bg.x, 
					current_bg.y)
			}
		},
		animate:function() {

			for(var i = 1; i < this.backgrounds.length; i++) {
				this.backgrounds[i].animate();
			}
		}
	}
	
	function Shoot(x, y) {
		this.x = x;
		this.y = y;
		this.width = 46;
		this.height = 16;
		this.active = true;
		this.img = new Image();
		this.img.src = "images/laser.png";
		this.animate = function() {
			this.x += 8;
		}
		this.isActive = function() {
			return this.active && (this.x < WIDTH);
		}
	}
	
	function Enemy(x, y) {
		this.x = x;
		this.y = y;
		this.width = 45;
		this.height = 58;
		this.live = true;
		this.img = new Image();
		this.img.src = "images/mine.png";
		this.animate = function() {
			this.x -= 4;
		}
		this.isActive = function() {
			return this.live &&  (this.x+this.width >= 0);		}
	}

	var player = {
		x:0,
		y:(HEIGHT/2),
		width:116,
		height:69,
		health:60,
		src:"images/player.png",
		img:null,
		shootIntervalId:null,
		shoots : [],
		init:function(){
			this.img = new Image();
			this.img.src = this.src;
		},
		draw:function(){
			context.drawImage(this.img, this.x, this.y);
			
			color = "#00DD35";

			if(this.health < 20)
				color = "#FF3500";
			context.fillStyle=color;
			context.lineWidth=2;
			context.strokeRect(this.x+35, this.y-20, 60, 7);
			context.fillRect(this.x+35, this.y-20, this.health, 7);
			var current_shoot;
			for(var index in this.shoots) {
				current_shoot = this.shoots[index];
				if(current_shoot.active)
					context.drawImage(
						current_shoot.img, 
						current_shoot.x, 
						current_shoot.y);
			}
		},
		onCollision:function(){
			this.health-=10;
			if(this.health <= 0) {
				animate();
				render();
				alert("Your Score: "+gameScore);
				document.location.reload();
			}
		},
		shoot:function() {

			var audio = new Audio();
			audio.src = "sounds/laserFire.wav";
			audio.play();
			
			this.shoots.push(
				new Shoot( 
					( player.x+player.width ),  //X Position
					(player.y + ( player.height/2 )) //Y Position
				));
		}
	}	
	
	var enemies = [];
	var key = [];
	this.init = function() {
		
		canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
	
		map.init();
		player.init();

		setInterval(function() {
			animate();
			render();
			controller();
			collisionHandler();
		},1000/60);

		setInterval(generateEnemies, 1000);

		gameMusic.play();
	}
	
	function collisionHandler() {
		
		var each_shoot;
		for(var index in player.shoots) {
			
			each_shoot = player.shoots[index];
			
			if(each_shoot.active){	
			
				var each_enemy;
				for(var index in enemies) {
						
					each_enemy = enemies[index];
					if(each_enemy.live) {
						if(collides(each_shoot, each_enemy)) {
							each_shoot.active = false;
							each_enemy.live = false;
							gameScore+=50;

							var sound = new Audio();
							sound.src = "sounds/explosion.wav"
							sound.play();
						}

					}
				}
			}
		}
		

		var each_enemy;
		for(var index in enemies) {
			each_enemy = enemies[index];
			if(each_enemy.live) {
				if(collides(player, each_enemy)) {
										
					each_enemy.live = false;
						var sound = new Audio();
							sound.src = "sounds/explosion.wav"
							sound.play();
					player.onCollision();
				}
			}
		}

	}
	
	function collides(a, b) {
		return a.x < b.x + b.width &&
			   a.x + a.width > b.x &&
			   a.y < b.y + b.height &&
			   a.y + a.height > b.y;
	}

	function controller() {
						
			if(keydown.w) {
				player.y -= 4;
			}

			if(keydown.s) {
				player.y += 4;
			}

			if(keydown.d) {
				player.x += 4;
			}

			if(keydown.a) {
				player.x -= 4;
			}

			if(keydown.k && !player.shootIntervalId) {
				console.log("if",keydown.k,player.shootIntervalId);
				player.shoot();
				player.shootIntervalId = self.setInterval(function(){ player.shoot();},300);
			}else if(!keydown.k && player.shootIntervalId){
				console.log("else",keydown.k,player.shootIntervalId);
				window.clearInterval(player.shootIntervalId);
				player.shootIntervalId = null;
			}
	}

	function animate() {
		map.animate();
			
		for(var index in player.shoots) {
			player.shoots[index].animate();
		}
		
		player.shoots = player.shoots.filter(function(shoot){
			return shoot.isActive();
		});

		for(var index in enemies) {
			enemies[index].animate();
		}

		enemies = enemies.filter(function(enemy){
			return enemy.isActive();		
		});
	}
	
	function generateEnemies() {
		
		var randY = (Math.floor((Math.random()*(HEIGHT-61))+1)  )
		
		enemies.push(
				new Enemy(WIDTH, randY )
			);
	}

	function render() {
		map.draw();
		player.draw();
		
		for(var index in enemies) {
			
			if(enemies[index].live) {

				context.fillStyle="#DD3500";
				context.lineWidth=2;
				context.strokeRect(enemies[index].x, enemies[index].y-20, 40, 7);
				context.fillRect(enemies[index].x, enemies[index].y-20, 40, 7);

				context.drawImage(
					enemies[index].img, 
					enemies[index].x,
					enemies[index].y);
			}
		}
		
		context.fillStyle = "#FFF";
		context.font="bold 16px Arial";
		context.fillText("score: "+gameScore, 20, 30);
	}
}
//bind keys
$(function() {
  window.keydown = {};
  
  function keyName(event) {
    return jQuery.hotkeys.specialKeys[event.which] ||
      String.fromCharCode(event.which).toLowerCase();
  }
  
  $(document).bind("keydown", function(event) {
    keydown[keyName(event)] = true;
  });
  
  $(document).bind("keyup", function(event) {
    keydown[keyName(event)] = false;
  });
});

