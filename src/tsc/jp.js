//svg: http://www.svgminify.com/
//js: http://esprima.org/demo/minify.html
//Size zip stand 16.8. 9kb (mit minify und normal rar zip)
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_SPACE = 32;
var REPLACE_R = 153;
var REPLACE_G = 153;
var REPLACE_B = 153;
var ENEMY_TYPE_UFO = 0;
var ENEMY_TYPE_UFO_BLUE = 1;
var ENEMY_TYPE_UFO_YELLOW = 2;
var ENEMY_TYPE_UFO_ORANGE = 3;
var ENEMY_TYPE_SHOOTER = 4;
var ENEMY_TYPE_SHOOTER_BLUE = 5;
var ENEMY_TYPE_DIAMOND = 6;
var ENEMY_TYPE_DIAMOND_BLUE = 7;
var ENEMY_TYPE_DIAMOND_YELLOW = 8;
//time, type, attackvector
var ATTACK_PATTERN = [
    0, ENEMY_TYPE_UFO_ORANGE, 11,
    50, ENEMY_TYPE_UFO_YELLOW, 10,
    20, ENEMY_TYPE_UFO_BLUE, 13,
    30, ENEMY_TYPE_UFO_BLUE, 10,
    40, ENEMY_TYPE_UFO_BLUE, 9,
    50, ENEMY_TYPE_UFO_BLUE, 10,
    10, ENEMY_TYPE_DIAMOND_YELLOW, 1,
    10, ENEMY_TYPE_DIAMOND_BLUE, 2,
    10, ENEMY_TYPE_SHOOTER_BLUE, 3,
    30 + 0, ENEMY_TYPE_DIAMOND, 4,
    30 + 20, ENEMY_TYPE_SHOOTER, 5,
    100, ENEMY_TYPE_UFO, 2,
    120, ENEMY_TYPE_UFO, 2,
    140, ENEMY_TYPE_UFO_BLUE, 2,
    300 + 0, ENEMY_TYPE_UFO, 4,
    300 + 20, ENEMY_TYPE_UFO, 4,
    300 + 40, ENEMY_TYPE_UFO_BLUE, 4,
    500 + 0, ENEMY_TYPE_UFO, 3,
    500 + 20, ENEMY_TYPE_UFO, 3,
    500 + 40, ENEMY_TYPE_UFO_BLUE, 3,
    700, ENEMY_TYPE_UFO, 2,
    700, ENEMY_TYPE_UFO, 3,
    700, ENEMY_TYPE_UFO_BLUE, 4,
    900, ENEMY_TYPE_UFO, 2,
    900, ENEMY_TYPE_UFO_BLUE, 3,
    900, ENEMY_TYPE_UFO, 4,
    1100, ENEMY_TYPE_UFO_BLUE, 2,
    1100, ENEMY_TYPE_UFO, 3,
    1100, ENEMY_TYPE_UFO, 4,
    1300, ENEMY_TYPE_UFO, 0,
    1330, ENEMY_TYPE_UFO, 0,
    1360, ENEMY_TYPE_UFO_BLUE, 0,
    1500 + 0, ENEMY_TYPE_UFO, 1,
    1500 + 30, ENEMY_TYPE_UFO, 1,
    1500 + 60, ENEMY_TYPE_UFO_BLUE, 1,
    1700 + 0, ENEMY_TYPE_UFO, 0,
    1700 + 30, ENEMY_TYPE_UFO, 0,
    1700 + 60, ENEMY_TYPE_UFO_BLUE, 0,
];
var ATTACK_VECTORS = [
    /*  0*/ [1920, 100, 100, 540, 1820, 500, 100, 1080],
    /*  1*/ [1920, 980, 100, 540, 1820, 500, 100, 0],
    /*  2*/ [1920, 100, 0, 100],
    /*  3*/ [1920, 500, 0, 500],
    /*  4*/ [1920, 950, 0, 950],
    /*  5*/ [1920, 100, 1800, 100, 1800, 950, 1800, 100, 0, 100],
    /*  6*/ [1920, 950, 1600, 950, 1600, 100, 1600, 950, 0, 950],
    /*  7*/ [1920, 100, 1300, 950, 1000, 100, 800, 950, 400, 100, 0, 950],
    /*  8*/ [1920, 950, 1400, 100, 1100, 950, 900, 100, 500, 950, 0, 100],
    /*  9*/ [1920, 100, 1000, 950, 0, 100],
    /* 10*/ [1920, 950, 1000, 100, 0, 950],
    /* 11*/ [0, 100, 1920, 100],
    /* 12*/ [0, 500, 1920, 500],
    /* 13*/ [0, 950, 1920, 950],
];
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Sprite = (function () {
    function Sprite(x, y) {
        this.pos = new Point(x, y);
        this.srcX = 0;
        this.srcY = 0;
        this.width = 64;
        this.height = 64;
        this.alpha = 1;
        this.visible = true;
        this.scale = 1;
    }
    Sprite.prototype.draw = function (spriteContext, drawContext) {
        if (!this.visible || this.alpha == 0) {
            return;
        }
        drawContext.globalAlpha = this.alpha;
        drawContext.drawImage(spriteContext, this.srcX, this.srcY, this.width, this.height, this.pos.x - (this.width / 2 * this.scale), this.pos.y - (this.height / 2 * this.scale), this.width * this.scale, this.height * this.scale);
    };
    return Sprite;
}());
var Engine = (function () {
    function Engine(spriteCanvas, drawCanvas) {
        this.frame = 0;
        this.spriteCanvas = spriteCanvas;
        this.drawCanvas = drawCanvas;
        this.spriteCanvasCtx = spriteCanvas.getContext("2d");
        this.drawCanvasCtx = drawCanvas.getContext("2d");
        this.sprites = [];
        this.trackedKeys = [];
        //recolor copy sprites on the sprite sheet
        //blue ufo, yellow ufo, orange ufo
        this.recolorCopy(this.spriteCanvasCtx, 4 * 64, 0, 64 * 2, 64 * 2, [{ r: 85, g: 153, b: 255 }, { r: 255, g: 204, b: 0 }, { r: 255, g: 100, b: 55 }]);
        //shooter blue
        this.recolorCopy(this.spriteCanvasCtx, 8 * 64, 0, 64, 64 * 4, [{ r: 85, g: 153, b: 255 }]);
        //diamonds blue, yellow
        this.recolorCopy(this.spriteCanvasCtx, 9 * 64, 0, 2 * 64, 64 * 4, [{ r: 85, g: 153, b: 255 }, { r: 255, g: 204, b: 0 }]);
        //goodies
        //yellow, blue, green, white
        this.recolorCopy(this.spriteCanvasCtx, 7 * 64, 0, 64, 64, [{ r: 255, g: 204, b: 0 }, { r: 42, g: 170, b: 255 }, { r: 0, g: 190, b: 0 }, { r: 255, g: 255, b: 255 }]);
        document.onkeydown = this.keyDown.bind(this);
        document.onkeyup = this.keyUp.bind(this);
        this.game = new Game(this);
        this.game.initialize();
        requestAnimationFrame(this.loop.bind(this));
    }
    Engine.prototype.keyDown = function (e) {
        e = e || window.event;
        this.trackedKeys[e.keyCode] = true;
    };
    Engine.prototype.keyUp = function (e) {
        e = e || window.event;
        this.trackedKeys[e.keyCode] = false;
    };
    Engine.prototype.isKeyDown = function (keyCode) {
        return this.trackedKeys[keyCode];
    };
    Engine.prototype.loop = function () {
        this.frame++;
        this.drawCanvasCtx.globalAlpha = 1;
        this.drawCanvasCtx.fillStyle = "#000000";
        this.drawCanvasCtx.fillRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        this.game.update(this.frame);
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.draw(this.spriteCanvas, this.drawCanvasCtx);
        }
        requestAnimationFrame(this.loop.bind(this));
    };
    Engine.prototype.getWidth = function () {
        return this.drawCanvas.width;
    };
    Engine.prototype.getHeight = function () {
        return this.drawCanvas.height;
    };
    Engine.prototype.createSprite = function (x, y) {
        var result = new Sprite(x, y);
        this.sprites.push(result);
        return result;
    };
    Engine.prototype.bringSpriteToFront = function (sprite) {
        this.sprites.splice(this.sprites.indexOf(sprite), 1);
        this.sprites.push(sprite);
    };
    Engine.prototype.bringSpriteToBack = function (sprite) {
        this.sprites.splice(this.sprites.indexOf(sprite), 1);
        this.sprites.unshift(sprite);
    };
    Engine.prototype.recolorCopy = function (canvas, x, y, w, h, colors) {
        for (var j = 0; j < colors.length; j++) {
            var data = canvas.getImageData(x, y, w, h);
            for (var i = 0; i < data.data.length; i += 4) {
                if (data.data[i] === REPLACE_R && data.data[i + 1] === REPLACE_G && data.data[i + 2] === REPLACE_B) {
                    data.data[i] = colors[j].r;
                    data.data[i + 1] = colors[j].g;
                    data.data[i + 2] = colors[j].b;
                }
            }
            canvas.putImageData(data, x, y + h * (j + 1));
        }
    };
    return Engine;
}());
window.onload = function () {
    var img = new Image();
    img.onload = function () {
        document.getElementById("sprites").getContext('2d').drawImage(img, 0, 0);
        new Engine(document.getElementById("sprites"), document.getElementById("draw"));
    };
    img.src = "sprites.svg";
};
var Logo = (function () {
    function Logo(engine) {
        this.sprite = engine.createSprite(0, 0);
        this.sprite.srcX = 0;
        this.sprite.srcY = 12 * 64;
        this.sprite.width = 10 * 64;
        this.sprite.height = 4 * 64;
    }
    Logo.prototype.setToRestart = function () {
        this.sprite.srcY = 8 * 64;
        this.sprite.width = 8 * 64 + 40;
    };
    Logo.prototype.hide = function () {
        if (window.location.href.indexOf("quick") > -1) {
            this.sprite.alpha = 0;
        }
        this.sprite.scale -= 0.001;
        this.sprite.alpha -= 0.01;
        if (this.sprite.alpha < 0) {
            this.sprite.alpha = 0;
        }
        return this.sprite.alpha == 0;
    };
    Logo.prototype.show = function (engine) {
        this.sprite.alpha = 1;
        this.sprite.scale = 1;
        this.sprite.pos.x = engine.getWidth() / 2;
        this.sprite.pos.y = engine.getHeight() / 2;
        engine.bringSpriteToFront(this.sprite);
    };
    Logo.prototype.blendIn = function () {
        this.sprite.alpha += 0.01;
        if (this.sprite.alpha > 1) {
            this.sprite.alpha = 1;
        }
        return this.sprite.alpha == 1;
    };
    return Logo;
}());
var GameObject = (function () {
    function GameObject(engine, x, y) {
        this.sprite = engine.createSprite(x, y);
        this.speed = new Point(0, 0);
    }
    GameObject.prototype.update = function (frame) {
        this.sprite.pos.x += this.speed.x;
        this.sprite.pos.y += this.speed.y;
    };
    GameObject.prototype.updateHideAfter = function () {
        if (this.hideAfter > 0) {
            this.hideAfter--;
            if (this.hideAfter == 0) {
                this.sprite.visible = false;
            }
        }
    };
    GameObject.prototype.kill = function (hideAfter) {
        this.hideAfter = hideAfter;
        this.hp = 0;
        if (hideAfter == 0) {
            this.sprite.visible = false;
        }
    };
    return GameObject;
}());
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(engine, x, y) {
        var _this = _super.call(this, engine, x, y) || this;
        _this.engine = engine;
        _this.sprite.srcX = 0;
        _this.sprite.srcY = 0;
        _this.sprite.width = 2 * 64;
        _this.sprite.height = 2 * 64;
        _this.breakBetweenShots = 5;
        _this.lastShotTime = 0;
        _this.bestPoints = 0;
        _this.hp = 1;
        _this.reset();
        _this.shieldSprite = new Sprite(0, 0);
        _this.shieldSprite.visible = false;
        _this.engine.sprites.push(_this.shieldSprite);
        _this.shieldSprite.srcX = 0;
        _this.shieldSprite.srcY = 2 * 64;
        _this.shieldSprite.width = 3 * 64;
        _this.shieldSprite.height = 3 * 64;
        return _this;
    }
    Player.prototype.shoot = function (frame, bulletManager) {
        if (this.hp < 1) {
            return;
        }
        if (frame - this.lastShotTime > this.breakBetweenShots) {
            for (var i = 0; i < this.shotsPerShot; i++) {
                var speedY = 0;
                this.shots++;
                if (this.spreadShots) {
                    if (this.shots % 3 == 0) {
                        speedY = 4;
                    }
                    if (this.shots % 3 == 1) {
                        speedY = -4;
                    }
                }
                bulletManager.shoot(this.sprite.pos.x + 30, this.sprite.pos.y + 20, 25, speedY, 200);
            }
            for (var i = 0; i < this.backShotsPerShot; i++) {
                var speedY = 0;
                this.bshots++;
                if (this.spreadShots) {
                    if (this.bshots % 3 == 0) {
                        speedY = 4;
                    }
                    if (this.bshots % 3 == 1) {
                        speedY = -4;
                    }
                }
                bulletManager.shoot(this.sprite.pos.x + 30, this.sprite.pos.y + 20, -25, speedY, 200);
            }
            this.lastShotTime = frame;
            globalGame.playShotSound();
        }
    };
    Player.prototype.update = function (frame) {
        _super.prototype.update.call(this, frame);
        this.shieldSprite.pos.x = this.sprite.pos.x;
        this.shieldSprite.pos.y = this.sprite.pos.y;
        this.shieldSprite.visible = this.shield;
        this.shieldSprite.alpha = 0.75 + Math.sin(frame / 10.0) * 0.25;
        if (this.sprite.pos.x > this.engine.getWidth() - this.sprite.width / 2) {
            this.sprite.pos.x = this.engine.getWidth() - this.sprite.width / 2;
        }
        if (this.sprite.pos.x < this.sprite.width / 2) {
            this.sprite.pos.x = this.sprite.width / 2;
        }
        if (this.sprite.pos.y > this.engine.getHeight() - this.sprite.height / 2) {
            this.sprite.pos.y = this.engine.getHeight() - this.sprite.height / 2;
        }
        if (this.sprite.pos.y < this.sprite.height / 2) {
            this.sprite.pos.y = this.sprite.height / 2;
        }
    };
    Player.prototype.takeDamage = function (amount) {
        if (this.shield) {
            this.shield = false;
            globalGame.speak("shield lost");
            return true;
        }
        if (this.hp > 0) {
            this.hp -= amount;
            if (this.hp <= 0) {
                this.kill(70);
                this.sprite.visible = true; //do not hide dead player
                this.engine.bringSpriteToBack(this.sprite);
                globalGame.explosionManager.explode(70, this.sprite.pos.x, this.sprite.pos.y, 64 * 2, 64 * 2, 3);
                globalGame.speak("hull integrity zero percent");
            }
        }
        return false;
    };
    Player.prototype.reset = function () {
        this.hp = 1;
        this.sprite.visible = true;
        this.sprite.pos.x = 100;
        this.sprite.pos.y = this.engine.getHeight() / 2;
        this.spreadShots = false;
        this.breakBetweenShots = 20;
        this.shield = false;
        this.weaponUpgrade = 0;
        this.speedUpgrade = 0;
        this.shotsPerShot = 1;
        this.backShotsPerShot = 0;
        if (this.points > this.bestPoints) {
            this.bestPoints = this.points;
            globalGame.speak("the new top score is " + this.bestPoints + " points");
        }
        this.points = 0;
        this.shots = 0;
        this.bshots = 0;
    };
    Player.prototype.upgradeWeapon = function () {
        this.weaponUpgrade += 1;
        this.points += 50;
        if (this.weaponUpgrade <= 10) {
            globalGame.speak("weapon systems improved!");
        }
        if (this.weaponUpgrade == 1) {
            this.breakBetweenShots = 16;
        }
        if (this.weaponUpgrade == 2) {
            this.breakBetweenShots = 13;
        }
        if (this.weaponUpgrade == 3) {
            this.spreadShots = true;
        }
        if (this.weaponUpgrade == 3) {
            this.breakBetweenShots = 10;
        }
        if (this.weaponUpgrade == 4) {
            this.backShotsPerShot = 1;
        }
        if (this.weaponUpgrade == 5) {
            this.shotsPerShot = 2;
        }
        if (this.weaponUpgrade == 6) {
            this.backShotsPerShot = 2;
        }
        if (this.weaponUpgrade == 7) {
            this.shotsPerShot = 3;
        }
        if (this.weaponUpgrade == 8) {
            this.backShotsPerShot = 3;
        }
        if (this.weaponUpgrade == 9) {
            this.breakBetweenShots = 8;
        }
        if (this.weaponUpgrade == 10) {
            this.breakBetweenShots = 9;
        }
    };
    Player.prototype.upgradeShield = function () {
        this.points += 50;
        if (!this.shield) {
            globalGame.speak("shield activated!");
        }
        this.shield = true;
    };
    Player.prototype.upgradeSpeed = function () {
        this.points += 50;
        globalGame.speak("speed increased!");
        this.speedUpgrade += 0.1;
    };
    Player.prototype.givePoints = function (amount) {
        this.points += amount;
        globalGame.speak("bonus points!");
    };
    return Player;
}(GameObject));
var Bullet = (function (_super) {
    __extends(Bullet, _super);
    function Bullet(engine, x, y) {
        var _this = _super.call(this, engine, x, y) || this;
        _this.sprite.srcX = 64 * 2;
        _this.sprite.srcY = 0;
        return _this;
    }
    Bullet.prototype.update = function (frame) {
        _super.prototype.update.call(this, frame);
        if (this.lifetime > 0) {
            this.lifetime--;
        }
        if (this.lifetime == 0) {
            this.kill(0);
        }
    };
    return Bullet;
}(GameObject));
var BulletManager = (function () {
    function BulletManager(game) {
        this.bullets = [];
        for (var i = 0; i < 200; i++) {
            var b = new Bullet(game.engine, 0, 0);
            this.bullets.push(b);
            b.kill(0);
        }
    }
    BulletManager.prototype.getFirstDead = function () {
        for (var _i = 0, _a = this.bullets; _i < _a.length; _i++) {
            var bullet = _a[_i];
            if (bullet.hp == 0) {
                return bullet;
            }
        }
        return null;
    };
    BulletManager.prototype.shoot = function (x, y, speedX, speedY, lifetime) {
        var bullet = this.getFirstDead();
        if (bullet != null) {
            bullet.lifetime = lifetime;
            bullet.sprite.pos.x = x;
            bullet.sprite.pos.y = y;
            bullet.speed.x = speedX;
            bullet.speed.y = speedY;
            bullet.hp = 1;
            bullet.sprite.visible = true;
        }
    };
    BulletManager.prototype.update = function (frame, enemyManager) {
        for (var _i = 0, _a = this.bullets; _i < _a.length; _i++) {
            var b = _a[_i];
            b.update(frame);
            if (b.hp > 0) {
                for (var _b = 0, _c = enemyManager.enemies; _b < _c.length; _b++) {
                    var e = _c[_b];
                    if (e.hp > 0) {
                        if (Game.spritesIntersect(b.sprite, e.sprite)) {
                            e.takeDamage(1);
                            if (e.hp <= 0) {
                                globalGame.goodieManager.dropGoodie(e.type, e.sprite.pos.x, e.sprite.pos.y);
                            }
                            b.kill(0);
                            globalGame.player.points += 10;
                            if (Math.random() < 0.025) {
                                var x = Math.floor(Math.random() * 5);
                                switch (x) {
                                    case 0:
                                        globalGame.speak("nice shot");
                                        break;
                                    case 1:
                                        globalGame.speak("clean kill");
                                        break;
                                    case 2:
                                        globalGame.speak("target destroyed");
                                        break;
                                    case 3:
                                        globalGame.speak("impressive targeting");
                                        break;
                                    case 4:
                                        globalGame.speak("outstanding aim");
                                        break;
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    return BulletManager;
}());
var PARTICLE_BLUE = 0;
var PARTICLE_EXPLO = 1;
var Particle = (function (_super) {
    __extends(Particle, _super);
    function Particle(engine, x, y, lifetime) {
        var _this = _super.call(this, engine, x, y) || this;
        _this.sprite.width = 64;
        _this.sprite.height = 64;
        _this.reset(lifetime);
        return _this;
    }
    Particle.prototype.setType = function (type) {
        if (type == PARTICLE_BLUE) {
            this.sprite.srcX = 2 * 64;
            this.sprite.srcY = 64;
        }
        if (type == PARTICLE_EXPLO) {
            this.sprite.srcX = 6 * 64;
            this.sprite.srcY = 64;
        }
    };
    Particle.prototype.reset = function (lifetime) {
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.hp = 1;
        this.sprite.visible = true;
        this.sprite.alpha = 1;
    };
    Particle.prototype.update = function (frame) {
        _super.prototype.update.call(this, frame);
        this.lifetime--;
        if (this.lifetime < 0) {
            this.kill(0);
        }
        else {
            this.sprite.alpha = this.lifetime / this.maxLifetime;
        }
    };
    return Particle;
}(GameObject));
var ParticleManager = (function () {
    function ParticleManager(game) {
        this.particles = [];
        for (var i = 0; i < 200; i++) {
            var b = new Particle(game.engine, 0, 0, 0);
            this.particles.push(b);
            b.kill(0);
        }
    }
    ParticleManager.prototype.getFirstDead = function () {
        for (var _i = 0, _a = this.particles; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p.hp == 0) {
                return p;
            }
        }
        return null;
    };
    ParticleManager.prototype.spawn = function (x, y, speedX, speedY, lifetime, type) {
        var p = this.getFirstDead();
        if (p != null) {
            p.reset(lifetime);
            p.sprite.pos.x = x;
            p.sprite.pos.y = y;
            p.speed.x = speedX;
            p.speed.y = speedY;
            p.hp = 1;
            p.sprite.visible = true;
            p.setType(type);
        }
    };
    ParticleManager.prototype.update = function (frame) {
        for (var _i = 0, _a = this.particles; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p.hp > 0) {
                p.update(frame);
            }
        }
    };
    return ParticleManager;
}());
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(engine) {
        var _this = _super.call(this, engine, 0, 0) || this;
        _this.sprite.visible = false;
        _this.hp = 0;
        _this.animOffset = Math.floor(Math.random() * 100);
        return _this;
    }
    Enemy.prototype.setFrame = function (frame) {
        this.frame = frame;
        if (this.type <= ENEMY_TYPE_UFO_ORANGE) {
            var offset = 0;
            if (this.type == ENEMY_TYPE_UFO_BLUE) {
                offset = 2 * 64;
            }
            if (this.type == ENEMY_TYPE_UFO_YELLOW) {
                offset = 4 * 64;
            }
            if (this.type == ENEMY_TYPE_UFO_ORANGE) {
                offset = 6 * 64;
            }
            this.sprite.srcX = 4 * 64;
            this.sprite.srcY = offset;
            this.sprite.width = 2 * 64;
            this.sprite.height = 64;
            if (frame == 1) {
                this.sprite.srcY = offset + 64;
            }
        }
        else if (this.type <= ENEMY_TYPE_SHOOTER_BLUE) {
            var offset = 0;
            if (this.type == ENEMY_TYPE_SHOOTER_BLUE) {
                offset = 4 * 64;
            }
            this.sprite.srcX = 8 * 64;
            this.sprite.srcY = offset;
            this.sprite.width = 64;
            this.sprite.height = 2 * 64;
            if (frame == 1) {
                this.sprite.srcY = offset + 2 * 64;
            }
        }
        else {
            var offset = 0;
            if (this.type == ENEMY_TYPE_DIAMOND_BLUE) {
                offset = 4 * 64;
            }
            if (this.type == ENEMY_TYPE_DIAMOND_YELLOW) {
                offset = 8 * 64;
            }
            this.sprite.srcX = 9 * 64;
            this.sprite.srcY = offset;
            this.sprite.width = 2 * 64;
            this.sprite.height = 2 * 64;
            if (frame == 1) {
                this.sprite.srcY = offset + 2 * 64;
            }
        }
    };
    Enemy.prototype.spawn = function (type, attackVector) {
        this.type = type;
        this.attackVector = attackVector;
        this.attackStep = 0;
        this.attackSubStep = 0;
        this.hp = 1;
        if (this.type == ENEMY_TYPE_UFO_YELLOW || this.type == ENEMY_TYPE_DIAMOND || this.type == ENEMY_TYPE_DIAMOND_BLUE) {
            this.hp = 2;
        }
        if (this.type == ENEMY_TYPE_UFO_ORANGE || this.type == ENEMY_TYPE_DIAMOND_YELLOW) {
            this.hp = 4;
        }
        this.attackSpeed = this.calcAttackSpeed(attackVector[0], attackVector[1], attackVector[2], attackVector[3]);
        this.setFrame(0);
        this.sprite.visible = true;
        this.sprite.pos.x = attackVector[0];
        this.sprite.pos.y = attackVector[1];
        this.stop = false;
    };
    Enemy.prototype.calcAttackSpeed = function (x1, y1, x2, y2) {
        return this.getSpeed() / (Math.abs(x1 - x2) + Math.abs(y1 - y2));
    };
    Enemy.prototype.getSpeed = function () {
        if (this.type == ENEMY_TYPE_SHOOTER) {
            return 8;
        }
        if (this.type == ENEMY_TYPE_UFO_YELLOW) {
            return 14;
        }
        if (this.type == ENEMY_TYPE_UFO_ORANGE || this.type == ENEMY_TYPE_DIAMOND_YELLOW) {
            return 18;
        }
        return 12;
    };
    Enemy.prototype.update = function (frame) {
        _super.prototype.update.call(this, frame);
        if (this.stop) {
            return;
        }
        var calcSpeed = false;
        this.attackSubStep += this.attackSpeed;
        if (this.attackSubStep > 1) {
            this.attackSubStep = 0;
            this.attackStep++;
            calcSpeed = true;
        }
        if (this.attackStep * 2 + 2 >= this.attackVector.length) {
            this.kill(0);
            return;
        }
        //from
        var fx = this.attackVector[this.attackStep * 2];
        var fy = this.attackVector[this.attackStep * 2 + 1];
        //to
        var tx = this.attackVector[this.attackStep * 2 + 2];
        var ty = this.attackVector[this.attackStep * 2 + 3];
        if (calcSpeed) {
            this.attackSpeed = this.calcAttackSpeed(fx, fy, tx, ty);
        }
        this.sprite.pos.x = fx + (tx - fx) * this.attackSubStep;
        this.sprite.pos.y = fy + (ty - fy) * this.attackSubStep;
        if ((frame + this.animOffset) % 10 == 0) {
            this.setFrame((this.frame + 1) % 2);
        }
    };
    Enemy.prototype.takeDamage = function (amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.kill(10);
            globalGame.engine.bringSpriteToBack(this.sprite);
            this.stop = true;
            globalGame.explosionManager.explode(10, this.sprite.pos.x, this.sprite.pos.y, this.sprite.width, this.sprite.height, 2);
        }
    };
    return Enemy;
}(GameObject));
var EnemyManager = (function () {
    function EnemyManager(engine, gameObjects) {
        this.engine = engine;
        this.gameObjects = gameObjects;
        this.enemies = [];
        this.reset();
    }
    EnemyManager.prototype.reset = function () {
        this.time = 0;
        this.currentAttack = 0;
        for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
            var e = _a[_i];
            e.kill(0);
        }
    };
    EnemyManager.prototype.update = function (player) {
        this.time++;
        if (this.currentAttack * 3 < ATTACK_PATTERN.length) {
            var nextAttackTime = ATTACK_PATTERN[this.currentAttack * 3];
            if (this.time >= nextAttackTime) {
                this.spawn(ATTACK_PATTERN[this.currentAttack * 3 + 1], ATTACK_PATTERN[this.currentAttack * 3 + 2]);
                this.currentAttack++;
            }
        }
        else {
            this.currentAttack = 0;
            this.time = -500;
        }
        for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
            var e = _a[_i];
            e.update(this.time);
            e.updateHideAfter();
            if (e.hp > 0) {
                if (Game.spritesIntersect(e.sprite, player.sprite)) {
                    if (player.takeDamage(1)) {
                        e.takeDamage(1);
                    }
                }
            }
        }
    };
    EnemyManager.prototype.getDeadEnemy = function () {
        for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
            var e_1 = _a[_i];
            if (e_1.sprite.visible == false) {
                return e_1;
            }
        }
        var e = new Enemy(this.engine);
        this.enemies.push(e);
        return e;
    };
    EnemyManager.prototype.spawn = function (type, attackVectorIndex) {
        var e = this.getDeadEnemy();
        e.spawn(type, ATTACK_VECTORS[attackVectorIndex]);
    };
    return EnemyManager;
}());
var Starfield = (function () {
    function Starfield(game) {
        this.stars = [];
        this.game = game;
        for (var i = 0; i < 100; i++) {
            var s = game.engine.createSprite(Math.random() * game.engine.getWidth(), Math.random() * game.engine.getHeight());
            this.stars.push(s);
            s.srcX = 3 * 64;
            s.srcY = 0;
            s.width = 64;
            s.height = 64;
            s.alpha = 0.2 + Math.random() * 0.8;
            s.scale = s.alpha;
        }
    }
    Starfield.prototype.update = function () {
        for (var _i = 0, _a = this.stars; _i < _a.length; _i++) {
            var s = _a[_i];
            s.pos.x -= s.alpha * 2;
            if (s.pos.x < 0) {
                s.pos.x = this.game.engine.getWidth() + s.width;
                s.pos.y = Math.random() * this.game.engine.getHeight();
            }
        }
    };
    return Starfield;
}());
var Explosion = (function () {
    function Explosion() {
    }
    Explosion.prototype.setData = function (lifetime, x, y, width, height, intensity) {
        this.lifetime = lifetime;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.intensity = intensity;
    };
    Explosion.prototype.update = function (particles) {
        if (this.lifetime < 0) {
            return;
        }
        this.lifetime--;
        for (var i = 0; i < this.intensity; i++) {
            particles.spawn(this.x - this.width / 2 + Math.random() * this.width, this.y - this.height / 2 + Math.random() * this.height, 0, 0.1, 20, PARTICLE_EXPLO);
        }
    };
    return Explosion;
}());
var ExplosionManager = (function () {
    function ExplosionManager() {
        this.explosions = [];
    }
    ExplosionManager.prototype.explode = function (lifetime, x, y, width, height, intensity) {
        globalGame.playExplosionSound();
        var e = this.getFirstDead();
        if (e == null) {
            e = new Explosion();
            this.explosions.push(e);
        }
        e.setData(lifetime, x, y, width, height, intensity);
    };
    ExplosionManager.prototype.getFirstDead = function () {
        for (var _i = 0, _a = this.explosions; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.lifetime <= 0) {
                return e;
            }
        }
        return null;
    };
    ExplosionManager.prototype.update = function (particles) {
        for (var _i = 0, _a = this.explosions; _i < _a.length; _i++) {
            var e = _a[_i];
            e.update(particles);
        }
    };
    return ExplosionManager;
}());
var globalGame = null;
var GOODIE_WEAPON = 0;
var GOODIE_SPEED = 1;
var GOODIE_SHIELD = 2;
var GOODIE_POINTS = 3;
var Goodie = (function (_super) {
    __extends(Goodie, _super);
    function Goodie() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Goodie;
}(Sprite));
var GoodieManager = (function () {
    function GoodieManager() {
        this.goodies = [];
        this.reset();
    }
    GoodieManager.prototype.reset = function () {
        this.goodieCount = 0;
        for (var _i = 0, _a = this.goodies; _i < _a.length; _i++) {
            var g = _a[_i];
            g.visible = false;
        }
    };
    GoodieManager.prototype.update = function (frame, player) {
        for (var _i = 0, _a = this.goodies; _i < _a.length; _i++) {
            var g = _a[_i];
            if (g.visible) {
                g.pos.x -= 3;
                if (frame % 15 == 0) {
                    if (frame % 30 == 0) {
                        this.setFrame(g, g.type + 1);
                    }
                    else {
                        this.setFrame(g, 0);
                    }
                }
                if (Game.spritesIntersect(player.sprite, g)) {
                    g.visible = false;
                    if (g.type == GOODIE_WEAPON) {
                        player.upgradeWeapon();
                    }
                    if (g.type == GOODIE_SHIELD) {
                        player.upgradeShield();
                    }
                    if (g.type == GOODIE_SPEED) {
                        player.upgradeSpeed();
                    }
                    if (g.type == GOODIE_POINTS) {
                        player.givePoints(100);
                    }
                }
            }
        }
    };
    GoodieManager.prototype.getFirstDead = function () {
        for (var _i = 0, _a = this.goodies; _i < _a.length; _i++) {
            var g = _a[_i];
            if (!g.visible) {
                return g;
            }
        }
        return null;
    };
    GoodieManager.prototype.setFrame = function (g, frame) {
        g.srcX = 7 * 64;
        g.srcY = frame * 64;
    };
    GoodieManager.prototype.spawn = function (x, y, type) {
        if (globalGame.player.shield) {
            if (type == GOODIE_SHIELD) {
                type = GOODIE_POINTS;
            }
        }
        if (globalGame.player.weaponUpgrade > 9) {
            if (type == GOODIE_WEAPON) {
                type = GOODIE_POINTS;
            }
        }
        if (globalGame.player.speedUpgrade > 2) {
            if (type == GOODIE_SPEED) {
                type = GOODIE_POINTS;
            }
        }
        var g = this.getFirstDead();
        if (g == null) {
            g = new Goodie(x, y);
            this.goodies.push(g);
            globalGame.engine.sprites.push(g);
            g.width = 64;
            g.height = 64;
        }
        g.visible = true;
        g.pos.x = x;
        g.pos.y = y;
        g.type = type;
        this.setFrame(g, 0);
    };
    GoodieManager.prototype.dropGoodie = function (enemyType, x, y) {
        if (enemyType == ENEMY_TYPE_UFO_BLUE || enemyType == ENEMY_TYPE_SHOOTER_BLUE || enemyType == ENEMY_TYPE_DIAMOND_BLUE) {
            this.goodieCount++;
            this.spawn(x, y, this.goodieCount % 3);
        }
    };
    return GoodieManager;
}());
var Game = (function () {
    function Game(engine) {
        this.engine = engine;
        this.gameObjects = [];
        this.bulletManager = new BulletManager(this);
        this.starfield = new Starfield(this);
        this.particles = new ParticleManager(this);
        this.enemyManager = new EnemyManager(engine, this.gameObjects);
        this.explosionManager = new ExplosionManager();
        this.goodieManager = new GoodieManager();
        globalGame = this;
        this.waitForSpaceKey = false;
        this.showLogo = false;
    }
    Game.prototype.initialize = function () {
        this.logo = new Logo(this.engine);
        this.logo.show(this.engine);
        this.player = new Player(this.engine, 0, 0);
        this.gameObjects.push(this.player);
        this.speak('lost in space - by j. p. preesents for j. s. 13 k. games');
    };
    Game.prototype.speak = function (text) {
        if (window.location.href.indexOf("silent") > -1) {
            return;
        }
        var msg = new SpeechSynthesisUtterance();
        msg.volume = 0.6; // 0 to 1
        msg.rate = 1.2; // 0.1 to 10
        msg.pitch = 2; //0 to 2
        msg.text = text;
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    };
    Game.prototype.update = function (frame) {
        //render points
        this.engine.drawCanvasCtx.font = "48px arial";
        this.engine.drawCanvasCtx.fillStyle = "white";
        this.engine.drawCanvasCtx.textAlign = "right";
        this.engine.drawCanvasCtx.fillText("" + this.player.points, 1920 - 50, 50, 300);
        if (this.player.bestPoints > 0) {
            this.engine.drawCanvasCtx.font = "24px arial";
            this.engine.drawCanvasCtx.fillText("top score: " + this.player.bestPoints, 1920 - 50, 100, 300);
        }
        this.starfield.update();
        this.explosionManager.update(this.particles);
        this.particles.update(frame);
        this.goodieManager.update(frame, this.player);
        for (var _i = 0, _a = this.gameObjects; _i < _a.length; _i++) {
            var obj = _a[_i];
            obj.updateHideAfter();
        }
        if (this.player.hp > 0) {
            this.particles.spawn(this.player.sprite.pos.x - 50, this.player.sprite.pos.y, -1 - Math.random(), 0.8 - Math.random() * 1.6, 55, PARTICLE_BLUE);
        }
        if (this.showLogo) {
            if (!this.logo.blendIn()) {
                return;
            }
            this.showLogo = false;
            this.waitForSpaceKey = true;
        }
        if (this.waitForSpaceKey) {
            if (this.engine.isKeyDown(KEY_SPACE)) {
                this.waitForSpaceKey = false;
                this.player.reset();
                this.enemyManager.reset();
                this.goodieManager.reset();
            }
            return;
        }
        if (!this.logo.hide()) {
            return;
        }
        if (this.player.hp <= 0) {
            this.logo.show(this.engine);
            this.logo.sprite.alpha = 0;
            this.logo.setToRestart();
            this.showLogo = true;
        }
        this.enemyManager.update(this.player);
        //input
        if (this.engine.isKeyDown(KEY_DOWN)) {
            this.player.speed.y += 1 + this.player.speedUpgrade;
        }
        if (this.engine.isKeyDown(KEY_UP)) {
            this.player.speed.y -= 1 + this.player.speedUpgrade;
        }
        if (this.engine.isKeyDown(KEY_LEFT)) {
            this.player.speed.x -= 1 + this.player.speedUpgrade;
        }
        if (this.engine.isKeyDown(KEY_RIGHT)) {
            this.player.speed.x += 1 + this.player.speedUpgrade;
        }
        if (this.engine.isKeyDown(KEY_SPACE)) {
            this.player.shoot(frame, this.bulletManager);
        }
        //dampening
        this.player.speed.y *= 0.9;
        this.player.speed.x *= 0.9;
        for (var _b = 0, _c = this.gameObjects; _b < _c.length; _b++) {
            var obj = _c[_b];
            obj.update(frame);
        }
        this.bulletManager.update(frame, this.enemyManager);
    };
    Game.spritesIntersect = function (a, b) {
        return (a.pos.x + a.width - 1 >= b.pos.x && a.pos.x <= b.pos.x + b.width - 1 && a.pos.y + a.height - 1 >= b.pos.y && a.pos.y <= b.pos.y + b.height - 1);
    };
    Game.prototype.playShotSound = function () {
        if (navigator.userAgent.indexOf("Firefox") != -1) {
            return;
        }
        if (this.context == null) {
            this.context = new AudioContext();
        }
        var o = this.context.createOscillator();
        var g = this.context.createGain();
        o.connect(g);
        o.type = "sine";
        g.connect(this.context.destination);
        o.frequency.value = 1040;
        o.frequency.linearRampToValueAtTime(240, this.context.currentTime + 0.2);
        o.start(0);
        g.gain.value = 0.1;
        g.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.4);
        o.stop(this.context.currentTime + 0.5);
    };
    Game.prototype.playExplosionSound = function () {
        if (navigator.userAgent.indexOf("Firefox") != -1) {
            return;
        }
        if (this.context == null) {
            this.context = new AudioContext();
        }
        var o = this.context.createOscillator();
        var g = this.context.createGain();
        o.connect(g);
        o.type = "sawtooth";
        g.connect(this.context.destination);
        o.frequency.value = 340;
        o.frequency.linearRampToValueAtTime(10, this.context.currentTime + 0.2);
        o.start(0);
        g.gain.value = 0.2;
        g.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.4);
        o.stop(this.context.currentTime + 0.5);
    };
    return Game;
}());
//# sourceMappingURL=jp.js.map