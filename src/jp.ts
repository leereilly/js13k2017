const KEY_UP = 38;
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

    update() {
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

    constructor(engine: Engine, x: number, y: number) {
        super(engine, x, y);
        this.sprite.srcX = 0;
        this.sprite.srcY = 0;
        this.sprite.width = 2 * 64;
        this.sprite.height = 2 * 64;

        this.breakBetweenShots = 5;
        this.lastShotTime = 0;
        this.shots = 0;
    }

    shoot(frame: number, bulletManager: BulletManager) {
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

    update() {
        if (this.lifetime > 0) {
            this.lifetime--;
        }
        if (this.lifetime == 0) {
            this.kill();
        }
        super.update();
    }
}


class BulletManager {
    bullets: Bullet[];

    constructor(game: Game) {
        this.bullets = [];

        for (let i = 0; i < 100; i++) {
            let b = new Bullet(game.engine, 0, 0);
            this.bullets.push(b);
            game.gameObjects.push(b);
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

class Game {
    engine: Engine;
    logo: Logo;
    gameObjects: GameObject[];
    player: Player;
    bulletManager: BulletManager;
    starfield: Starfield;


    constructor(engine: Engine) {
        this.engine = engine;
        this.gameObjects = [];
        this.bulletManager = new BulletManager(this);
        this.starfield = new Starfield(this);
    }

    initialize() {
        this.logo = new Logo(this.engine);
        this.logo.show(this.engine);
        this.player = new Player(this.engine, 100, this.engine.getHeight() / 2);
        this.gameObjects.push(this.player);
    }

    update(frame: number) {
        this.starfield.update();

        if (!this.logo.hide()) {
            return;
        }

        if (this.engine.isKeyDown(KEY_DOWN)) {
            this.player.speed.y += 1;
        }

        if (this.engine.isKeyDown(KEY_UP)) {
            this.player.speed.y -= 1;
        }

        if (this.engine.isKeyDown(KEY_SPACE)) {
            this.player.shoot(frame, this.bulletManager);
        }

        this.player.speed.y *= 0.9;


        for (let obj of this.gameObjects) {
            obj.update();
        }
    }
}

