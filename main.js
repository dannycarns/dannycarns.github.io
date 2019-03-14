var AM = new AssetManager();

var exploded = false;
var door = false;

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.x = 0;
    this.y = 0;
    this.width = 1200;
    this.height = 800;
    this.yCheck = 4;
    this.xCheck = 4;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                        this.x, this.y);
    this.game.ctx.font = "12pt Impact";
    this.game.ctx.fillStyle = "White";
    this.game.ctx.textAlign = "center";
    this.game.ctx.fillText("Press WASD to move, space to blow up, movement continues after explosion",
                            300, 20);

};

Background.prototype.update = function () {
    console.log(`(${this.xCheck}, ${this.yCheck}) (${this.x}, ${this.y})`);
    if (this.game.down && this.yCheck <= 3100) {
        this.y -= 4;
        this.yCheck += 4;
    } else if (this.game.up  && this.yCheck >= 4) {
        this.y += 4;
        this.yCheck -= 4;
    }

    if (this.game.left  && this.xCheck >= 4) {
        this.x += 4;
        this.xCheck -= 4;
    } else if (this.game.right  && this.xCheck <= 2700) {
        this.x -= 4;
        this.xCheck += 4;
    }

};

function Base(game) {

    this.x = 350;
    this.y = 75;
    this.game = game;
    this.ctx = game.ctx;
    this.blowup = false;
    this.door = true;
    this.count = 0;
    this.yCheck = 75;
    this.xCheck = 350;
    this.myAnimation = new Animation(AM.getAsset("./img/base.png"), 128, 128, 1024, 0.03, 8, true, 4);
    this.blowupAnimation = new Animation(AM.getAsset("./img/Explosion1.png"), 32, 32, 160, 0.04, 5, false, 20);
    this.doorAnimation = new Animation(AM.getAsset("./img/SpawnerDoor.png"), 32, 32, 160, 0.01, 5, false, 6);
}

Base.prototype.draw = function () {
    console.log(`(${this.xCheck}, ${this.yCheck}) (${this.x}, ${this.y})`);
    if (exploded) {
        this.blowupAnimation.drawFrame(this.game.clockTick, this.ctx, 290, -20);
    } else if (door) {
        this.myAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        this.doorAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y+100);
    } else {
        this.myAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }

}

Base.prototype.update = function () {
    if (exploded && (this.game.bomb.x - this.x < 200
                            && this.game.bomb.y - this.y < 200)) {
        this.blowup = true;
    }
    if (this.game.down && this.yCheck >= 4) {
        this.y += 4;
        this.yCheck -= 4;
    } else if (this.game.up  && this.yCheck <= 3400) {
        this.y -= 4;
        this.yCheck += 4;
    }

    if (this.game.left  && this.xCheck <= 3500) {
        this.x -= 4;
        this.xCheck += 4;
    } else if (this.game.right  && this.xCheck >= 4) {
        this.x += 4;
        this.xCheck -= 4;
    }
    if (door === false && this.game.right) {
        door = true;
    }
}


function Bomb(game) {

    this.x = 550;
    this.y = 300;
    this.game = game;
    this.ctx = game.ctx;
    this.myAnimation = new Animation(AM.getAsset("./img/Smart Bomb.png"), 32, 32, 288, 0.03, 9, true, 3);
    this.explodeAnimation = new Animation(AM.getAsset("./img/explode.png"), 170, 170, 8330, 0.05, 49, false, 3);
}

Bomb.prototype.draw = function () {
    if (exploded) {
        this.explodeAnimation.drawFrame(this.game.clockTick, this.ctx, this.x-200, this.y-200);
    } else {
        this.myAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
}

Bomb.prototype.update = function () {
    if (this.game.space) {
        exploded = true;
    }

    if (this.game.down && this.yCheck <= 3400) {
        this.y -= 4;
        this.yCheck += 4;
    } else if (this.game.up  && this.yCheck >= 4) {
        this.y += 4;
        this.yCheck -= 4;
    }

    if (this.game.left  && this.xCheck >= 4) {
        this.x += 4;
        this.xCheck -= 4;
    } else if (this.game.right  && this.xCheck <= 3500) {
        this.x -= 4;
        this.xCheck += 4;
    }


}

function Guardian(game, x, y) {

    this.x = x;
    this.y = y;
    this.game = game;
    this.ctx = game.ctx;
    this.blowup = true;
    this.timer = 300;
    this.myAnimation = new Animation(AM.getAsset("./img/guardian.png"), 128, 128, 896, 0.04, 7, true, 1);
    this.explodeAnimation = new Animation(AM.getAsset("./img/guardian death.png"), 128, 128, 1152, 0.04, 9, false, 2);
}

Guardian.prototype.draw = function () {
    if(this.timer <= 0 || exploded) {
        this.explodeAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    } else {
        this.myAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
}

Guardian.prototype.update = function () {
    this.timer--;
    if (exploded && (this.game.bomb.x - this.x < 200
                            && this.game.bomb.y - this.y < 200)) {
        this.blowup = true;
    }

    if (this.game.down && this.yCheck <= 3400) {
        this.y -= 4;
        this.yCheck += 4;
    } else if (this.game.up  && this.yCheck >= 4) {
        this.y += 4;
        this.yCheck -= 4;
    }

    if (this.game.left  && this.xCheck >= 4) {
        this.x += 4;
        this.xCheck -= 4;
    } else if (this.game.right  && this.xCheck <= 3500) {
        this.x -= 4;
        this.xCheck += 4;
    }


}



AM.queueDownload("./img/RobotUnicorn.png");
AM.queueDownload("./img/explode.png");
AM.queueDownload("./img/Explosion1.png");
AM.queueDownload("./img/Smart Bomb.png");
AM.queueDownload("./img/alien base2.png");
AM.queueDownload("./img/base.png");
AM.queueDownload("./img/gasGiantsNebulaLayer.png");
AM.queueDownload("./img/guardian death.png");
AM.queueDownload("./img/guardian.png");
AM.queueDownload("./img/SpawnerDoor.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/gasGiantsNebulaLayer.png")));
    var bomb = new Bomb(gameEngine);
    gameEngine.bomb = bomb;
    gameEngine.addEntity(new Bomb(gameEngine));
    gameEngine.addEntity(new Base(gameEngine));
    gameEngine.addEntity(new Guardian(gameEngine, 100, 100));
    gameEngine.addEntity(new Guardian(gameEngine, 849, 310));
    gameEngine.addEntity(new Guardian(gameEngine, 322, 532));

    console.log("All Done!");
});
