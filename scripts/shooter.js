
function GamePlay() {
	
	var WIDTH  = 800;
	var HEIGHT = 600;
    var LOG = true;
	var canvas, context;
	var gameScore = 0.00;
	var gameMinSpeed = 1;
    var gameMaxSpeed = 3;
    
	var gameMusic = new Audio();
	gameMusic.src = "sounds/gameMusic.mp3";
	gameMusic.loop = true;
	
	var shootAudio = new Audio();
	shootAudio.src = "sounds/laserBlaster.mp3";
	
	var explosionAudio = new Audio();
	explosionAudio.src = "sounds/explosion.wav";
	
	var mainBackground = new Image();
	mainBackground.src ="images/mainbackground.png";

	var bgLayer1 = new Image();
	bgLayer1.src = "images/bgLayer1.png";
	
	var bgLayer2 = new Image();
	bgLayer2.src = "images/bgLayer2.png";
	
	var playerImg = new Image();
	playerImg.src = "images/player.png";
	
	var enemyImg = new Image();
	enemyImg.src ="images/mine.png";
	
	var shootImg = new Image();
	shootImg.src = "images/laser.png";
	
	var map = {
		backgrounds:[
			{
				x:0,
				y:0,
				img:mainBackground
			},{
				x:0,
				y:0,
				img:bgLayer1,
				animate:function() {
					this.x -= 1;

					if(this.x <= -WIDTH){
						this.x = WIDTH;
					}
				}
			}, {
				x:WIDTH,
				y:0,
				img:bgLayer1,
				animate:function() {
					this.x -= 1;

					if(this.x <= -WIDTH){
						this.x = WIDTH;
					}
				}
			},{
				x:0,
				y:0,
				img:bgLayer2,
				animate:function() {
					this.x -= 4;

					if(this.x <= -WIDTH){
						this.x = WIDTH;
					}
				}
			},{
				x:WIDTH,
				y:0,
				img:bgLayer2,
				animate:function() {
					this.x -= 4;

					if(this.x <= -WIDTH){
						this.x = WIDTH;
					}
				}
			}

		],
		draw: function() {
			var current_bg;
			for(var index in this.backgrounds) {
				current_bg = this.backgrounds[index];
				context.drawImage(
					current_bg.img, 
					current_bg.x, 
					current_bg.y, WIDTH, HEIGHT);
                
			}
		},
		animate:function() {

			for(var i = 1; i < this.backgrounds.length; i++) {
				this.backgrounds[i].animate();
			}
		}
	};
	
	function Shoot(x, y) {
		this.x = x;
		this.y = y;
		this.width = 46;
		this.height = 16;
        this.speed = 8;
		this.active = true;
		this.img = shootImg;
		
		this.animate = function() {
			this.x += this.speed;
		};
        
        this.draw = function() {
            if(this.active) {
                context.drawImage(this.img, this.x, this.y, this.width, this.height);
            }
        };
        
		this.isActive = function() {
			return this.active && (this.x < WIDTH);
		};
	}
	
	function Enemy(x, y, speed) {
		this.x = x;
		this.y = y;
        this.speed = speed;
		this.width = 45/2;
		this.height = 58/2;
		this.live = true;
		this.img = enemyImg;
        this.draw = function() {
            if(this.live) {
                context.fillStyle="#DD3500";
                context.lineWidth=2;
                context.strokeRect(this.x, this.y-20, 40, 7);
                context.fillRect(this.x, this.y-20, 40, 7);

                context.drawImage(this.img, this.x,this.y, this.width, this.height);
            }
        };
        
		this.animate = function() {
			this.x -= this.speed;
		};
        
		this.isActive = function() {
			return this.live &&  (this.x+this.width >= 0);		
		};
	}

	var player = {
		x:0,
		y:(HEIGHT/2),
		width:116/2,
		height:69/2,
		health:60,
		img:playerImg,
		shootIntervalId:null,
		shoots : [],
		draw:function(){
			context.drawImage(this.img, this.x, this.y, this.width, this.height);
			
			color = "#00DD35";

			if(this.health < 20)
				color = "#FF3500";
            
			context.fillStyle=color;
			context.lineWidth=2;
			context.strokeRect(this.x+35, this.y-20, 60, 7);
			context.fillRect(this.x+35, this.y-20, this.health, 7);
			
            for(var index in this.shoots) {
				this.shoots[index].draw();
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
			shootAudio.currentTime = 0;		
			shootAudio.play();
			this.shoots.push(
				new Shoot( 
					( player.x + player.width ),  //X Position
					(player.y + ( player.height/2 )) //Y Position
				));
		}
	};
	
	var enemies = [];
	var key = [];
	this.init = function() {
		
		canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
        
		setInterval(function() {
            
			animate();
			render();
			controller();
			
		},1000/60);
		
        setInterval(function(){ gameMaxSpeed++;gameMinSpeed++; }, 30000);
        
		setInterval(collisionHandler, 10);
		
		setInterval(generateEnemies, 1000);

		gameMusic.play();
	};
	
	function collisionHandler() {
		
		var each_enemy;
		
		for(var index in enemies) {
			
			each_enemy = enemies[index];
			
			if(each_enemy.live) {
			
				if(collides(player, each_enemy)) {
					each_enemy.live = false;
                    explosionAudio.currentTime = 0;
					explosionAudio.play();
					player.onCollision();
				}
				
				var each_shoot;
			
				for(var index in player.shoots) {
				
					each_shoot = player.shoots[index];
					
					if(collides(each_shoot, each_enemy)) {
						each_shoot.active = false;
						each_enemy.live = false;
						
						context.fillText("+50", each_enemy.x, each_enemy.y);
						
						gameScore+=50;

						explosionAudio.play();
					}
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
						
			if(keydown.w && player.y>=32) {
				player.y -= 4;
			}

			if(keydown.s && player.y<=(HEIGHT-player.height)) {
				player.y += 4;
			}

			if(keydown.d && player.x<=(WIDTH-player.width)) {
				player.x += 4;
			}

			if(keydown.a && player.x>=0) {
				player.x -= 4;
			}

			if(keydown.k && !player.shootIntervalId) {
				player.shoot();
				player.shootIntervalId = self.setInterval(function(){ player.shoot();},300);
			}else if(!keydown.k && player.shootIntervalId){				
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
		
		var randY = (Math.round((Math.random()*(HEIGHT-61))));
		var speed = (Math.round((Math.random()+gameMinSpeed)*(gameMaxSpeed)));
		enemies.push(
				new Enemy(WIDTH, randY, speed)
			);
	}

	function render() {
		map.draw();
		player.draw();
		
        if(LOG) {
            log.draw();
        }
        
		for(var index in enemies) {
			enemies[index].draw();
		}
		
		context.fillStyle = "#FFF";
		context.font="bold 16px Arial";
		context.fillText("score: "+gameScore, 20, 30);
	}

    var log = {
        x:20,
        y:20,
        info:{
            enemies:enemies.length,
            shoots: player.shoots.length,
        },
        draw:function(){
            
            context.globalAlpha = 0.3;
            context.fillStyle = "#FFF";
            context.fillStyle = "#000";
            
            context.fillRect(this.x,this.y, 100, (30*this.info.length));
            
            context.font="12px Arial";
		    context.fillText("enemies: "+this.info.enemies, this.x, this.y+(10*1));
            context.fillText("shoots: "+this.info.enemies, this.x, this.y+(10*2));
            context.globalAlpha = 1.0;
        }
        
    };
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

