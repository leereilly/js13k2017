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
    GameObject.prototype.kill = function () {
        this.sprite.visible = false;
        this.hp = 0;
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
        _this.shots = 0;
        _this.hp = 1;
        return _this;
    }
    Player.prototype.shoot = function (frame, bulletManager) {
        if (this.hp < 1) {
            return;
        }
        if (frame - this.lastShotTime > this.breakBetweenShots) {
            var speedY = 0;
            this.shots++;
            if (this.shots % 3 == 0) {
                speedY = 4;
            }
            if (this.shots % 3 == 1) {
                speedY = -4;
            }
            bulletManager.shoot(this.sprite.pos.x + 30, this.sprite.pos.y + 20, 25, speedY, 200);
            this.lastShotTime = frame;
            globalGame.playShotSound();
        }
    };
    Player.prototype.update = function (frame) {
        _super.prototype.update.call(this, frame);
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
        if (this.hp > 0) {
            this.hp -= amount;
            if (this.hp <= 0) {
                this.kill();
                globalGame.speak("hull integrity zero percent");
            }
        }
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
            this.kill();
        }
    };
    return Bullet;
}(GameObject));
var BulletManager = (function () {
    function BulletManager(game) {
        this.bullets = [];
        for (var i = 0; i < 100; i++) {
            var b = new Bullet(game.engine, 0, 0);
            this.bullets.push(b);
            b.kill();
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
                            b.kill();
                            if (Math.random() < 0.2) {
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
var Particle = (function (_super) {
    __extends(Particle, _super);
    function Particle(engine, x, y, lifetime) {
        var _this = _super.call(this, engine, x, y) || this;
        _this.sprite.srcX = 2 * 64;
        _this.sprite.srcY = 64;
        _this.sprite.width = 64;
        _this.sprite.height = 64;
        _this.reset(lifetime);
        return _this;
    }
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
            this.kill();
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
        for (var i = 0; i < 100; i++) {
            var b = new Particle(game.engine, 0, 0, 0);
            this.particles.push(b);
            b.kill();
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
    ParticleManager.prototype.spawn = function (x, y, speedX, speedY, lifetime) {
        var p = this.getFirstDead();
        if (p != null) {
            p.reset(lifetime);
            p.sprite.pos.x = x;
            p.sprite.pos.y = y;
            p.speed.x = speedX;
            p.speed.y = speedY;
            p.hp = 1;
            p.sprite.visible = true;
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
var ENEMY_TYPE_UFO = 0;
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(engine) {
        var _this = _super.call(this, engine, 0, 0) || this;
        _this.sprite.visible = false;
        _this.hp = 0;
        if (_this.type == ENEMY_TYPE_UFO) {
            _this.setFrame(0);
        }
        _this.animOffset = Math.floor(Math.random() * 100);
        return _this;
    }
    Enemy.prototype.setFrame = function (frame) {
        this.frame = frame;
        if (frame == 0) {
            this.sprite.srcX = 4 * 64;
            this.sprite.srcY = 0;
            this.sprite.width = 2 * 64;
            this.sprite.height = 64;
        }
        if (frame == 1) {
            this.sprite.srcX = 4 * 64;
            this.sprite.srcY = 64;
            this.sprite.width = 2 * 64;
            this.sprite.height = 64;
        }
    };
    Enemy.prototype.spawn = function (type, attackVector) {
        this.type = type;
        this.attackVector = attackVector;
        this.attackStep = 0;
        this.attackSubStep = 0;
        //todo typ abhängig
        this.hp = 1;
        this.attackSpeed = 0.01;
        this.setFrame(0);
        this.sprite.visible = true;
        this.sprite.pos.x = attackVector[0];
        this.sprite.pos.y = attackVector[1];
    };
    Enemy.prototype.update = function (frame) {
        this.attackSubStep += this.attackSpeed;
        if (this.attackSubStep > 1) {
            this.attackSubStep = 0;
            this.attackStep++;
        }
        if (this.attackStep * 2 + 2 >= this.attackVector.length) {
            this.kill();
        }
        //from
        var fx = this.attackVector[this.attackStep * 2];
        var fy = this.attackVector[this.attackStep * 2 + 1];
        //to
        var tx = this.attackVector[this.attackStep * 2 + 2];
        var ty = this.attackVector[this.attackStep * 2 + 3];
        this.sprite.pos.x = fx + (tx - fx) * this.attackSubStep;
        this.sprite.pos.y = fy + (ty - fy) * this.attackSubStep;
        _super.prototype.update.call(this, frame);
        if ((frame + this.animOffset) % 10 == 0) {
            this.setFrame((this.frame + 1) % 2);
        }
    };
    Enemy.prototype.takeDamage = function (amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.kill();
        }
    };
    return Enemy;
}(GameObject));
//time, type, attackvector
var ATTACK_PATTERN = [
    0, ENEMY_TYPE_UFO, 0,
    30, ENEMY_TYPE_UFO, 0,
    60, ENEMY_TYPE_UFO, 0,
    200 + 0, ENEMY_TYPE_UFO, 1,
    200 + 30, ENEMY_TYPE_UFO, 1,
    200 + 60, ENEMY_TYPE_UFO, 1,
    500 + 0, ENEMY_TYPE_UFO, 0,
    500 + 30, ENEMY_TYPE_UFO, 0,
    500 + 60, ENEMY_TYPE_UFO, 0,
];
var EnemyManager = (function () {
    function EnemyManager(engine, gameObjects) {
        this.currentAttack = 0;
        this.engine = engine;
        this.gameObjects = gameObjects;
        this.enemies = [];
        this.attackVectors = [];
        this.attackVectors.push([1920, 100, 100, 540, 1820, 500, 100, 1080], //z
        [1920, 980, 100, 540, 1820, 500, 100, 0]);
        this.reset();
    }
    EnemyManager.prototype.reset = function () {
        this.time = 0;
        for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
            var e = _a[_i];
            e.kill();
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
            if (e.hp > 0) {
                if (Game.spritesIntersect(e.sprite, player.sprite)) {
                    player.takeDamage(1);
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
        e.spawn(type, this.attackVectors[attackVectorIndex]);
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
var globalGame = null;
var Game = (function () {
    function Game(engine) {
        this.engine = engine;
        this.gameObjects = [];
        this.bulletManager = new BulletManager(this);
        this.starfield = new Starfield(this);
        this.particles = new ParticleManager(this);
        this.enemyManager = new EnemyManager(engine, this.gameObjects);
        globalGame = this;
    }
    Game.prototype.initialize = function () {
        this.logo = new Logo(this.engine);
        this.logo.show(this.engine);
        this.player = new Player(this.engine, 100, this.engine.getHeight() / 2);
        this.gameObjects.push(this.player);
        this.speak('we are lost in space');
    };
    Game.prototype.speak = function (text) {
        var msg = new SpeechSynthesisUtterance();
        msg.volume = 0.6; // 0 to 1
        msg.rate = 1.2; // 0.1 to 10
        msg.pitch = 2; //0 to 2
        msg.text = text;
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    };
    Game.prototype.update = function (frame) {
        this.starfield.update();
        this.particles.update(frame);
        if (this.player.hp > 0) {
            this.particles.spawn(this.player.sprite.pos.x - 50, this.player.sprite.pos.y, -1 - Math.random(), 0.8 - Math.random() * 1.6, 55);
        }
        if (!this.logo.hide()) {
            return;
        }
        this.enemyManager.update(this.player);
        //input
        if (this.engine.isKeyDown(KEY_DOWN)) {
            this.player.speed.y += 1;
        }
        if (this.engine.isKeyDown(KEY_UP)) {
            this.player.speed.y -= 1;
        }
        if (this.engine.isKeyDown(KEY_LEFT)) {
            this.player.speed.x -= 1;
        }
        if (this.engine.isKeyDown(KEY_RIGHT)) {
            this.player.speed.x += 1;
        }
        if (this.engine.isKeyDown(KEY_SPACE)) {
            this.player.shoot(frame, this.bulletManager);
        }
        //dampening
        this.player.speed.y *= 0.9;
        this.player.speed.x *= 0.9;
        for (var _i = 0, _a = this.gameObjects; _i < _a.length; _i++) {
            var obj = _a[_i];
            obj.update(frame);
        }
        this.bulletManager.update(frame, this.enemyManager);
    };
    Game.spritesIntersect = function (a, b) {
        return (a.pos.x + a.width - 1 >= b.pos.x && a.pos.x <= b.pos.x + b.width - 1 && a.pos.y + a.height - 1 >= b.pos.y && a.pos.y <= b.pos.y + b.height - 1);
    };
    Game.prototype.playShotSound = function () {
        this.tone("sine", 1.5);
    };
    Game.prototype.tone = function (type, x) {
        if (this.context == null) {
            this.context = new AudioContext();
        }
        var o = this.context.createOscillator();
        var g = this.context.createGain();
        o.connect(g);
        o.type = type;
        g.connect(this.context.destination);
        o.frequency.value = 240;
        o.start(0);
        g.gain.value = 0.2;
        g.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + x);
    };
    return Game;
}());
//# sourceMappingURL=jp.js.map