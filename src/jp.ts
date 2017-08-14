const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;


const KEY_SPACE = 32;

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Sprite {
    pos: Point;
    srcX: number;
    srcY: number;
    width: number;
    height: number;
    alpha: number;
    visible: boolean;
    scale: number;

    constructor(x: number, y: number) {
        this.pos = new Point(x, y);
        this.srcX = 0;
        this.srcY = 0;
        this.width = 64;
        this.height = 64;
        this.alpha = 1;
        this.visible = true;
        this.scale = 1;
    }

    draw(spriteContext: HTMLCanvasElement, drawContext: CanvasRenderingContext2D) {
        if (!this.visible || this.alpha == 0) {
            return;
        }
        drawContext.globalAlpha = this.alpha;
        drawContext.drawImage(spriteContext, this.srcX, this.srcY, this.width, this.height, this.pos.x - (this.width / 2 * this.scale), this.pos.y - (this.height / 2 * this.scale), this.width * this.scale, this.height * this.scale);
    }
}

class Engine {
    spriteCanvasCtx: CanvasRenderingContext2D;
    drawCanvasCtx: CanvasRenderingContext2D;
    spriteCanvas: HTMLCanvasElement;
    drawCanvas: HTMLCanvasElement;

    sprites: Sprite[];
    game: Game;

    trackedKeys: boolean[];

    constructor(spriteCanvas: HTMLCanvasElement, drawCanvas: HTMLCanvasElement) {
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

    keyDown(e) {
        e = e || window.event;
        this.trackedKeys[e.keyCode] = true;
    }

    keyUp(e) {
        e = e || window.event;
        this.trackedKeys[e.keyCode] = false;
    }

    isKeyDown(keyCode: number) {
        return this.trackedKeys[keyCode];
    }

    frame: number = 0;

    loop() {
        this.frame++;
        this.drawCanvasCtx.globalAlpha = 1;
        this.drawCanvasCtx.fillStyle = "#000000";
        this.drawCanvasCtx.fillRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);

        this.game.update(this.frame);

        for (let sprite of this.sprites) {
            sprite.draw(this.spriteCanvas, this.drawCanvasCtx);
        }
        requestAnimationFrame(this.loop.bind(this));
    }

    getWidth(): number {
        return this.drawCanvas.width;
    }

    getHeight(): number {
        return this.drawCanvas.height;
    }

    createSprite(x: number, y: number): Sprite {
        let result = new Sprite(x, y);
        this.sprites.push(result);
        return result;
    }
}

window.onload = function () {
    let img = new Image();
    img.onload = function () {
        (<HTMLCanvasElement>document.getElementById("sprites")).getContext('2d').drawImage(img, 0, 0);
        new Engine(
            (<HTMLCanvasElement>document.getElementById("sprites")),
            (<HTMLCanvasElement>document.getElementById("draw"))
        );
    };
    img.src = "sprites.svg";
};

class Logo {
    sprite: Sprite;

    constructor(engine: Engine) {
        this.sprite = engine.createSprite(0, 0);
        this.sprite.srcX = 0;
        this.sprite.srcY = 12 * 64;
        this.sprite.width = 10 * 64;
        this.sprite.height = 4 * 64;
    }

    hide() {
        if (window.location.href.indexOf("quick") > -1) {
            this.sprite.alpha = 0;
        }

        this.sprite.scale -= 0.001;
        this.sprite.alpha -= 0.01;
        if (this.sprite.alpha < 0) {
            this.sprite.alpha = 0;
        }
        return this.sprite.alpha == 0;
    }

    show(engine: Engine) {
        this.sprite.alpha = 1;
        this.sprite.scale = 1;
        this.sprite.pos.x = engine.getWidth() / 2;
        this.sprite.pos.y = engine.getHeight() / 2;
    }
}

class GameObject {
    sprite: Sprite;
    speed: Point;
    hp: number;

    constructor(engine: Engine, x: number, y: number) {
        this.sprite = engine.createSprite(x, y);
        this.speed = new Point(0, 0);
    }

    update(frame: number) {
        this.sprite.pos.x += this.speed.x;
        this.sprite.pos.y += this.speed.y;
    }

    kill() {
        this.sprite.visible = false;
        this.hp = 0;
    }
}

class Player extends GameObject {

    lastShotTime: number;
    breakBetweenShots: number;
    shots: number;
    engine: Engine;

    constructor(engine: Engine, x: number, y: number) {
        super(engine, x, y);
        this.engine = engine;
        this.sprite.srcX = 0;
        this.sprite.srcY = 0;
        this.sprite.width = 2 * 64;
        this.sprite.height = 2 * 64;

        this.breakBetweenShots = 5;
        this.lastShotTime = 0;
        this.shots = 0;

        this.hp = 1;
    }

    shoot(frame: number, bulletManager: BulletManager) {
        if (this.hp < 1) {
            return;
        }
        if (frame - this.lastShotTime > this.breakBetweenShots) {
            let speedY = 0;
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
    }


    update(frame: number) {
        super.update(frame);
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

    }

    takeDamage(amount: number) {
        if (this.hp > 0) {
            this.hp -= amount;
            if (this.hp <= 0) {
                this.kill();
                globalGame.speak("hull integrity zero percent")
            }
        }
    }
}

class Bullet extends GameObject {
    lifetime: number;

    constructor(engine: Engine, x: number, y: number) {
        super(engine, x, y);
        this.sprite.srcX = 64 * 2;
        this.sprite.srcY = 0;
    }

    update(frame: number) {
        super.update(frame);
        if (this.lifetime > 0) {
            this.lifetime--;
        }
        if (this.lifetime == 0) {
            this.kill();
        }
    }
}


class BulletManager {
    bullets: Bullet[];

    constructor(game: Game) {
        this.bullets = [];

        for (let i = 0; i < 100; i++) {
            let b = new Bullet(game.engine, 0, 0);
            this.bullets.push(b);
            b.kill();
        }
    }

    getFirstDead(): Bullet {
        for (let bullet of this.bullets) {
            if (bullet.hp == 0) {
                return bullet;
            }
        }
        return null;
    }

    shoot(x: number, y: number, speedX: number, speedY: number, lifetime: number) {
        let bullet = this.getFirstDead();
        if (bullet != null) {
            bullet.lifetime = lifetime;
            bullet.sprite.pos.x = x;
            bullet.sprite.pos.y = y;
            bullet.speed.x = speedX;
            bullet.speed.y = speedY;
            bullet.hp = 1;
            bullet.sprite.visible = true;
        }
    }

    update(frame: number, enemyManager: EnemyManager) {
        for (let b of this.bullets) {
            b.update(frame);
            if (b.hp > 0) {
                for (let e of enemyManager.enemies) {
                    if (e.hp > 0) {
                        if (Game.spritesIntersect(b.sprite, e.sprite)) {
                            e.takeDamage(1);
                            b.kill();
                            if (Math.random() < 0.2) {
                                let x = Math.floor(Math.random() * 5);
                                switch(x) {
                                    case 0:
                                        globalGame.speak("nice shot")
                                        break;
                                    case 1:
                                        globalGame.speak("clean kill")
                                        break;
                                    case 2:
                                        globalGame.speak("target destroyed")
                                        break;
                                    case 3:
                                        globalGame.speak("impressive targeting")
                                        break;
                                    case 4:
                                        globalGame.speak("outstanding aim")
                                        break;
                                }

                            }
                        }
                    }
                }
            }
        }
    }
}

class Particle extends GameObject {
    lifetime: number;
    maxLifetime: number;

    constructor(engine: Engine, x: number, y: number, lifetime: number) {
        super(engine, x, y);
        this.sprite.srcX = 2 * 64;
        this.sprite.srcY = 64;
        this.sprite.width = 64;
        this.sprite.height = 64;
        this.reset(lifetime);
    }

    reset(lifetime: number) {
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.hp = 1;
        this.sprite.visible = true;
        this.sprite.alpha = 1;
    }

    update(frame: number) {
        super.update(frame);
        this.lifetime--;
        if (this.lifetime < 0) {
            this.kill();
        } else {
            this.sprite.alpha = this.lifetime / this.maxLifetime;
        }
    }
}

class ParticleManager {
    particles: Particle[];

    constructor(game: Game) {
        this.particles = [];

        for (let i = 0; i < 100; i++) {
            let b = new Particle(game.engine, 0, 0, 0);
            this.particles.push(b);
            b.kill();
        }
    }

    getFirstDead(): Particle {
        for (let p of this.particles) {
            if (p.hp == 0) {
                return p;
            }
        }
        return null;
    }

    spawn(x: number, y: number, speedX: number, speedY: number, lifetime: number) {
        let p = this.getFirstDead();
        if (p != null) {
            p.reset(lifetime);
            p.sprite.pos.x = x;
            p.sprite.pos.y = y;
            p.speed.x = speedX;
            p.speed.y = speedY;
            p.hp = 1;
            p.sprite.visible = true;
        }
    }

    update(frame: number) {
        for (let p of this.particles) {
            if (p.hp > 0) {
                p.update(frame);
            }
        }
    }
}

const ENEMY_TYPE_UFO = 0;

class Enemy extends GameObject {
    type: number;
    frame: number;
    animOffset: number;
    attackVector: number[];

    attackStep: number;
    attackSubStep: number;
    attackSpeed: number;

    setFrame(frame: number) {
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
    }

    constructor(engine: Engine) {
        super(engine, 0, 0);
        this.sprite.visible = false;
        this.hp = 0;
        if (this.type == ENEMY_TYPE_UFO) {
            this.setFrame(0);
        }
        this.animOffset = Math.floor(Math.random() * 100);
    }

    spawn(type: number, attackVector: number[]) {
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

    }

    update(frame: number) {
        this.attackSubStep += this.attackSpeed;
        if (this.attackSubStep > 1) {
            this.attackSubStep = 0;
            this.attackStep++;
        }

        if (this.attackStep * 2 + 2 >= this.attackVector.length) {
            this.kill();
        }

        //from
        let fx = this.attackVector[this.attackStep * 2];
        let fy = this.attackVector[this.attackStep * 2 + 1];

        //to
        let tx = this.attackVector[this.attackStep * 2 + 2];
        let ty = this.attackVector[this.attackStep * 2 + 3];

        this.sprite.pos.x = fx + (tx - fx) * this.attackSubStep;
        this.sprite.pos.y = fy + (ty - fy) * this.attackSubStep;


        super.update(frame);
        if ((frame + this.animOffset) % 10 == 0) {
            this.setFrame((this.frame + 1) % 2);
        }
    }

    takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.kill();
        }
    }
}

//time, type, attackvector
const ATTACK_PATTERN = [
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

class EnemyManager {
    engine: Engine;
    gameObjects: GameObject[];
    enemies: Enemy[];
    attackVectors: number[][];

    time: number;
    currentAttack: number = 0;

    constructor(engine: Engine, gameObjects: GameObject[]) {
        this.engine = engine;
        this.gameObjects = gameObjects;
        this.enemies = [];
        this.attackVectors = [];
        this.attackVectors.push(
            [1920, 100, 100, 540, 1820, 500, 100, 1080], //z
            [1920, 980, 100, 540, 1820, 500, 100, 0], //inverted z
        );
        this.reset();
    }

    reset() {
        this.time = 0;
        for (let e of this.enemies) {
            e.kill();
        }
    }

    update(player: Player) {
        this.time++;

        if (this.currentAttack * 3 < ATTACK_PATTERN.length) {
            let nextAttackTime = ATTACK_PATTERN[this.currentAttack * 3];
            if (this.time >= nextAttackTime) {
                this.spawn(ATTACK_PATTERN[this.currentAttack * 3 + 1], ATTACK_PATTERN[this.currentAttack * 3 + 2]);
                this.currentAttack++;
            }
        } else {
            this.currentAttack = 0;
            this.time = -500;
        }

        for (let e of this.enemies) {
            e.update(this.time);
            if (e.hp > 0) {
                if (Game.spritesIntersect(e.sprite, player.sprite)) {
                    player.takeDamage(1);
                }
            }
        }
    }

    getDeadEnemy(): Enemy {
        for (let e of this.enemies) {
            if (e.sprite.visible == false) {
                return e;
            }
        }
        let e = new Enemy(this.engine);
        this.enemies.push(e);
        return e;
    }

    spawn(type: number, attackVectorIndex: number) {
        let e = this.getDeadEnemy();
        e.spawn(type, this.attackVectors[attackVectorIndex]);
    }
}

class Starfield {
    stars: Sprite[];
    game: Game;

    constructor(game: Game) {
        this.stars = [];
        this.game = game;

        for (let i = 0; i < 100; i++) {
            let s = game.engine.createSprite(Math.random() * game.engine.getWidth(), Math.random() * game.engine.getHeight());
            this.stars.push(s);
            s.srcX = 3 * 64;
            s.srcY = 0;
            s.width = 64;
            s.height = 64;
            s.alpha = 0.2 + Math.random() * 0.8;
            s.scale = s.alpha;
        }
    }

    update() {
        for (let s of this.stars) {
            s.pos.x -= s.alpha * 2;
            if (s.pos.x < 0) {
                s.pos.x = this.game.engine.getWidth() + s.width;
                s.pos.y = Math.random() * this.game.engine.getHeight();
            }
        }
    }
}

let globalGame = null;

class Game {
    engine: Engine;
    logo: Logo;
    gameObjects: GameObject[];
    player: Player;
    bulletManager: BulletManager;
    starfield: Starfield;
    particles: ParticleManager;
    enemyManager: EnemyManager;

    constructor(engine: Engine) {
        this.engine = engine;
        this.gameObjects = [];
        this.bulletManager = new BulletManager(this);
        this.starfield = new Starfield(this);
        this.particles = new ParticleManager(this);
        this.enemyManager = new EnemyManager(engine, this.gameObjects);
        globalGame = this;
    }

    initialize() {
        this.logo = new Logo(this.engine);
        this.logo.show(this.engine);
        this.player = new Player(this.engine, 100, this.engine.getHeight() / 2);
        this.gameObjects.push(this.player);
        this.speak('we are lost in space');
    }

    speak(text: string) {
        let msg = new SpeechSynthesisUtterance();
        msg.volume = 0.6; // 0 to 1
        msg.rate = 1.2; // 0.1 to 10
        msg.pitch = 2; //0 to 2
        msg.text = text;
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    }

    update(frame: number) {
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

        for (let obj of this.gameObjects) {
            obj.update(frame);
        }

        this.bulletManager.update(frame, this.enemyManager);
    }

    static spritesIntersect(a: Sprite, b: Sprite) {
        return (a.pos.x + a.width - 1 >= b.pos.x && a.pos.x <= b.pos.x + b.width - 1 && a.pos.y + a.height - 1 >= b.pos.y && a.pos.y <= b.pos.y + b.height - 1);
    }

    playShotSound() {
        this.tone("sine", 1.5);
    }

    context: AudioContext;

    tone(type, x) {
        if (this.context == null) {
            this.context = new AudioContext()
        }
        let o = this.context.createOscillator();
        let g = this.context.createGain();
        o.connect(g);
        o.type = type;
        g.connect(this.context.destination);
        o.frequency.value = 240;
        o.start(0);
        g.gain.value = 0.2;
        g.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + x);
    }
}

