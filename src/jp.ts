//svg: http://www.svgminify.com/
//js: http://esprima.org/demo/minify.html
//Size zip stand 16.8. 9kb (mit minify und normal rar zip)

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const KEY_SPACE = 32;

const REPLACE_R = 153;
const REPLACE_G = 153;
const REPLACE_B = 153;


const ENEMY_TYPE_UFO = 0;
const ENEMY_TYPE_UFO_BLUE = 1;
const ENEMY_TYPE_UFO_YELLOW = 2;
const ENEMY_TYPE_UFO_ORANGE = 3;

const ENEMY_TYPE_SHOOTER = 4;
const ENEMY_TYPE_SHOOTER_BLUE = 5;

const ENEMY_TYPE_DIAMOND = 6;
const ENEMY_TYPE_DIAMOND_BLUE = 7;
const ENEMY_TYPE_DIAMOND_YELLOW = 8;

const ATTACK_VECTORS = [
    /*  0*/ [1920, 100, 100, 580, 1820, 580, 100, 1080], //z
    /*  1*/ [1920, 980, 100, 500, 1820, 500, 100, 0], //inverted z
    /*  2*/ [1920, 100, 0, 100], //straight top
    /*  3*/ [1920, 500, 0, 500], //straight center
    /*  4*/ [1920, 950, 0, 950], //straight bottom
    /*  5*/ [1920, 100, 1800, 100, 1800, 950, 1800, 100, 0, 100], //slow shooter from top
    /*  6*/ [1920, 950, 1600, 950, 1600, 100, 1600, 950, 0, 950], //slow shooter from bottom
    /*  7*/ [1920, 100, 1300, 950, 1000, 100, 800, 950, 400, 100, 0, 950], //bounce from top
    /*  8*/ [1920, 950, 1400, 100, 1100, 950, 900, 100, 500, 950, 0, 100], //bounce from bottom
    /*  9*/ [1920, 100, 1000, 950, 0, 100], //pyramid from top
    /* 10*/ [1920, 950, 1000, 100, 0, 950], //pyramid from bottom

    /* 11*/ [0, 100, 1920, 100], //straight top reverse
    /* 12*/ [0, 500, 1920, 500], //straight center reverse
    /* 13*/ [0, 950, 1920, 950], //straight bottom reverse
];


const SQUADS = [
    /*  0*/[ 20, ENEMY_TYPE_UFO, 2, ENEMY_TYPE_UFO, 2, ENEMY_TYPE_UFO_BLUE, 2], //3 ufo top
    /*  1*/[ 20, ENEMY_TYPE_UFO, 3, ENEMY_TYPE_UFO, 3, ENEMY_TYPE_UFO_BLUE, 3], //3 ufo center
    /*  2*/[ 20, ENEMY_TYPE_UFO, 4, ENEMY_TYPE_UFO, 4, ENEMY_TYPE_UFO_BLUE, 4], //3 ufo bottom
    /*  3*/[ 0,  ENEMY_TYPE_UFO, 2, ENEMY_TYPE_UFO, 3, ENEMY_TYPE_UFO_BLUE, 4], //3 ufo top to bottom (goodie bottom)
    /*  4*/[ 0,  ENEMY_TYPE_UFO_BLUE, 2, ENEMY_TYPE_UFO, 3, ENEMY_TYPE_UFO, 4], //3 ufo top to bottom (goodie top)
    /*  5*/[ 0,  ENEMY_TYPE_UFO, 2, ENEMY_TYPE_UFO_BLUE, 3, ENEMY_TYPE_UFO, 4], //3 ufo top to bottom (goodie middle)
    /*  6*/[ 30, ENEMY_TYPE_UFO, 1, ENEMY_TYPE_UFO, 1,ENEMY_TYPE_UFO_BLUE, 1], // 3 ufo z
    /*  7*/[ 30, ENEMY_TYPE_UFO, 0, ENEMY_TYPE_UFO, 0,ENEMY_TYPE_UFO_BLUE, 0], // 3 ufo z reverse

    /*  8*/[ 0, ENEMY_TYPE_SHOOTER, 5, ENEMY_TYPE_SHOOTER, 6], // 2 shooter top & bottom
];

class AttackPatternBuilder {
    addSquads() {
 
        //ufo beginning
        this.addSquad(0, 0);
        this.addSquad(200, 2);
        this.addSquad(200, 1);

        this.addSquad(200, 3);
        this.addSquad(200, 5);
        this.addSquad(200, 4);

        this.addSquad(200, 6);
        this.addSquad(200, 7);

        this.addSquad(200, 6);
        this.addSquad(0, 7);
        //ufo beginning end

        this.addSquad(0, 8);
    }

    pattern;
    curTime: number;

    constructor() {
        this.pattern = [];
        this.curTime = 0;
        this.addSquads();
        this.pattern.sort(this.compare)
    }

    addSquad(timeOffset: number, squad: number) {
        this.curTime += timeOffset;
        let count = (SQUADS[squad].length - 1)/2;
        let timeBetween = SQUADS[squad][0];
        for (let i = 0; i < count; i++) {
            let type = SQUADS[squad][1 + i * 2];
            let vector = SQUADS[squad][1 + i * 2 + 1];
            this.pattern.push([this.curTime + timeBetween * i, type, vector]);
        }
    }

    compare(a, b): number {
        return a[0] - b[0];
    }
}


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

        //recolor copy sprites on the sprite sheet
        //blue ufo, yellow ufo, orange ufo
        this.recolorCopy(this.spriteCanvasCtx, 4 * 64, 0, 64 * 2, 64 * 2, [{r: 85, g: 153, b: 255}, {r: 255, g: 204, b: 0}, {r: 255, g: 100, b: 55} ]);

        //shooter blue
        this.recolorCopy(this.spriteCanvasCtx, 8 * 64, 0, 64, 64 * 4, [{r: 85, g: 153, b: 255}]);

        //diamonds blue, yellow
        this.recolorCopy(this.spriteCanvasCtx, 9 * 64, 0, 2 * 64, 64 * 4, [{r: 85, g: 153, b: 255}, {r: 255, g: 204, b: 0}]);

        //goodies
        //yellow, blue, green, white
        this.recolorCopy(this.spriteCanvasCtx, 7 * 64, 0, 64, 64, [{r: 255, g: 204, b: 0}, {r: 42, g: 170, b: 255}, {r: 0, g: 190, b: 0}, {r: 255, g: 255, b: 255}]);


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

    bringSpriteToFront(sprite: Sprite) {
        this.sprites.splice(this.sprites.indexOf(sprite), 1);
        this.sprites.push(sprite);
    }

    bringSpriteToBack(sprite: Sprite) {
        this.sprites.splice(this.sprites.indexOf(sprite), 1);
        this.sprites.unshift(sprite);
    }

    private recolorCopy(canvas: CanvasRenderingContext2D, x, y, w, h, colors) {
        for (let j = 0; j < colors.length; j++) {
            let data = canvas.getImageData(x, y, w, h);
            for (let i = 0; i < data.data.length; i += 4) {
                if (data.data[i] === REPLACE_R && data.data[i + 1] === REPLACE_G && data.data[i + 2] === REPLACE_B) {
                    data.data[i] = colors[j].r;
                    data.data[i + 1] = colors[j].g;
                    data.data[i + 2] = colors[j].b;
                }
            }
            canvas.putImageData(data, x, y + h * (j + 1));
        }
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

    setToRestart() {
        this.sprite.srcY = 8 * 64;
        this.sprite.width = 8 * 64 + 40;
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
        engine.bringSpriteToFront(this.sprite);
    }

    blendIn() {
        this.sprite.alpha += 0.01;
        if (this.sprite.alpha > 1) {
            this.sprite.alpha = 1;
        }
        return this.sprite.alpha == 1;
    }
}

class GameObject {
    sprite: Sprite;
    speed: Point;
    hp: number;
    hideAfter: number;

    constructor(engine: Engine, x: number, y: number) {
        this.sprite = engine.createSprite(x, y);
        this.speed = new Point(0, 0);
    }

    update(frame: number) {
        this.sprite.pos.x += this.speed.x;
        this.sprite.pos.y += this.speed.y;
    }

    updateHideAfter() {
        if (this.hideAfter > 0) {
            this.hideAfter--;
            if (this.hideAfter == 0) {
                this.sprite.visible = false;
            }
        }
    }

    kill(hideAfter: number) {
        this.hideAfter = hideAfter;
        this.hp = 0;
        if (hideAfter == 0) {
            this.sprite.visible = false;
        }
    }
}

class Player extends GameObject {

    lastShotTime: number;
    breakBetweenShots: number;
    shots: number;
    bshots: number;
    engine: Engine;
    spreadShots: boolean;
    shieldSprite: Sprite;

    shield: boolean;
    weaponUpgrade: number;
    speedUpgrade: number;
    shotsPerShot: number;
    backShotsPerShot: number;
    points: number;
    bestPoints: number;

    constructor(engine: Engine, x: number, y: number) {
        super(engine, x, y);
        this.engine = engine;
        this.sprite.srcX = 0;
        this.sprite.srcY = 0;
        this.sprite.width = 2 * 64;
        this.sprite.height = 2 * 64;

        this.breakBetweenShots = 5;
        this.lastShotTime = 0;
        this.bestPoints = 0;

        this.hp = 1;
        this.reset();
        this.shieldSprite = new Sprite(0, 0);
        this.shieldSprite.visible = false;
        this.engine.sprites.push(this.shieldSprite);
        this.shieldSprite.srcX = 0;
        this.shieldSprite.srcY = 2 * 64;
        this.shieldSprite.width = 3 * 64;
        this.shieldSprite.height = 3 * 64;
    }

    shoot(frame: number, bulletManager: BulletManager) {
        if (this.hp < 1) {
            return;
        }
        if (frame - this.lastShotTime > this.breakBetweenShots) {
            for (let i = 0; i < this.shotsPerShot; i++) {
                let speedY = 0;
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
            for (let i =0 ; i < this.backShotsPerShot; i++) {
                let speedY = 0;
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
    }


    update(frame: number) {
        super.update(frame);
        this.shieldSprite.pos.x = this.sprite.pos.x;
        this.shieldSprite.pos.y = this.sprite.pos.y;
        this.shieldSprite.visible = this.shield;
        this.shieldSprite.alpha = 0.75 + Math.sin(frame/10.0) * 0.25;
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
    }

    reset() {
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
    }

    upgradeWeapon() {
        this.weaponUpgrade += 1;
        this.points += 50;

        if (this.weaponUpgrade <= 10 ) {
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

    }

    upgradeShield() {
        this.points += 50;
        if (!this.shield) {
            globalGame.speak("shield activated!");
        }
        this.shield = true;
    }

    upgradeSpeed() {
        this.points += 50;
        globalGame.speak("speed increased!");
        this.speedUpgrade += 0.1;
    }

    givePoints(amount: number) {
        this.points += amount;
        globalGame.speak("bonus points!");
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
            this.kill(0);
        }
    }
}


class BulletManager {
    bullets: Bullet[];

    constructor(game: Game) {
        this.bullets = [];
        for (let i = 0; i < 200; i++) {
            let b = new Bullet(game.engine, 0, 0);
            this.bullets.push(b);
            b.kill(0);
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
                            if (e.hp <= 0) {
                                globalGame.goodieManager.dropGoodie(e.type, e.sprite.pos.x, e.sprite.pos.y);
                            }
                            b.kill(0);
                            globalGame.player.points += 10;
                            if (Math.random() < 0.025) {
                                let x = Math.floor(Math.random() * 5);
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
    }
}

const PARTICLE_BLUE = 0;
const PARTICLE_EXPLO = 1;


class Particle extends GameObject {
    lifetime: number;
    maxLifetime: number;

    constructor(engine: Engine, x: number, y: number, lifetime: number) {
        super(engine, x, y);
        this.sprite.width = 64;
        this.sprite.height = 64;
        this.reset(lifetime);
    }

    setType(type: number) {
        if (type == PARTICLE_BLUE) {
            this.sprite.srcX = 2 * 64;
            this.sprite.srcY = 64;
        }
        if (type == PARTICLE_EXPLO) {
            this.sprite.srcX = 6 * 64;
            this.sprite.srcY = 64;
        }

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
            this.kill(0);
        } else {
            this.sprite.alpha = this.lifetime / this.maxLifetime;
        }
    }
}


class ParticleManager {
    particles: Particle[];

    constructor(game: Game) {
        this.particles = [];

        for (let i = 0; i < 200; i++) {
            let b = new Particle(game.engine, 0, 0, 0);
            this.particles.push(b);
            b.kill(0);
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

    spawn(x: number, y: number, speedX: number, speedY: number, lifetime: number, type: number) {
        let p = this.getFirstDead();
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
    }

    update(frame: number) {
        for (let p of this.particles) {
            if (p.hp > 0) {
                p.update(frame);
            }
        }
    }
}

class Enemy extends GameObject {
    type: number;
    stop: boolean;
    frame: number;
    animOffset: number;
    attackVector: number[];

    attackStep: number;
    attackSubStep: number;
    attackSpeed: number;

    setFrame(frame: number) {
        this.frame = frame;
        if (this.type <= ENEMY_TYPE_UFO_ORANGE) {
            let offset = 0;
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
        } else if (this.type <= ENEMY_TYPE_SHOOTER_BLUE) {
            let offset = 0;
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
        } else {
            let offset = 0;
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

    }

    constructor(engine: Engine) {
        super(engine, 0, 0);
        this.sprite.visible = false;
        this.hp = 0;
        this.animOffset = Math.floor(Math.random() * 100);
    }

    spawn(type: number, attackVector: number[]) {
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
    }

    calcAttackSpeed(x1, y1, x2, y2): number {
        return this.getSpeed()/(Math.abs(x1 - x2) + Math.abs(y1 - y2));
    }

    getSpeed(): number {
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
    }

    update(frame: number) {
        super.update(frame);
        if (this.stop) {
            return;
        }

        let calcSpeed = false;
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
        let fx = this.attackVector[this.attackStep * 2];
        let fy = this.attackVector[this.attackStep * 2 + 1];

        //to
        let tx = this.attackVector[this.attackStep * 2 + 2];
        let ty = this.attackVector[this.attackStep * 2 + 3];

        if (calcSpeed) {
            this.attackSpeed = this.calcAttackSpeed(fx, fy, tx, ty);
        }

        this.sprite.pos.x = fx + (tx - fx) * this.attackSubStep;
        this.sprite.pos.y = fy + (ty - fy) * this.attackSubStep;

        if ((frame + this.animOffset) % 10 == 0) {
            this.setFrame((this.frame + 1) % 2);
        }
    }

    takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.kill(10);
            globalGame.engine.bringSpriteToBack(this.sprite);
            this.stop = true;
            globalGame.explosionManager.explode(10, this.sprite.pos.x, this.sprite.pos.y, this.sprite.width, this.sprite.height, 2);
        }
    }
}



class EnemyManager {
    engine: Engine;
    gameObjects: GameObject[];
    enemies: Enemy[];

    time: number;
    currentAttack: number;

    attackPattern;

    constructor(engine: Engine, gameObjects: GameObject[]) {
        this.engine = engine;
        this.gameObjects = gameObjects;
        this.enemies = [];
        this.reset();
        let builder = new AttackPatternBuilder();
        this.attackPattern = builder.pattern;
    }

    reset() {
        this.time = 0;
        this.currentAttack = 0;
        for (let e of this.enemies) {
            e.kill(0);
        }
    }

    update(player: Player) {
        this.time++;

        if (this.currentAttack < this.attackPattern.length) {
            let nextAttackTime = this.attackPattern[this.currentAttack][0];
            if (this.time >= nextAttackTime) {
                this.spawn(this.attackPattern[this.currentAttack][1], this.attackPattern[this.currentAttack][2]);
                this.currentAttack++;
            }
        } else {
            this.currentAttack = 0;
            this.time = -500;
        }

        for (let e of this.enemies) {
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
        e.spawn(type, ATTACK_VECTORS[attackVectorIndex]);
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

class Explosion {
    lifetime: number;
    x: number;
    y: number;
    width: number;
    height: number;
    intensity: number;

    setData(lifetime: number, x: number, y: number, width: number, height: number, intensity: number) {
        this.lifetime = lifetime;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.intensity = intensity;
    }

    update(particles: ParticleManager) {
        if (this.lifetime < 0) {
            return;
        }
        this.lifetime--;
        for (let i = 0; i < this.intensity; i++) {
            particles.spawn(this.x - this.width / 2 + Math.random() * this.width, this.y - this.height / 2 + Math.random() * this.height, 0, 0.1, 20, PARTICLE_EXPLO);
        }
    }
}

class ExplosionManager {
    explosions: Explosion[] = [];

    explode(lifetime: number, x: number, y: number, width: number, height: number, intensity: number) {
        globalGame.playExplosionSound();
        let e = this.getFirstDead();
        if (e == null) {
            e = new Explosion();
            this.explosions.push(e);
        }
        e.setData(lifetime, x, y, width, height, intensity);
    }

    getFirstDead(): Explosion {
        for (let e of this.explosions) {
            if (e.lifetime <= 0) {
                return e;
            }
        }
        return null;
    }

    update(particles: ParticleManager) {
        for (let e of this.explosions) {
            e.update(particles);
        }
    }
}

let globalGame: Game = null;


const GOODIE_WEAPON = 0;
const GOODIE_SPEED = 1;
const GOODIE_SHIELD = 2;
const GOODIE_POINTS = 3;

class Goodie extends Sprite {
    type: number;
}

class GoodieManager {
    goodies: Goodie[];
    goodieCount: number;


    constructor() {
        this.goodies = [];
        this.reset();
    }

    reset() {
        this.goodieCount = 0;
        for (let g of this.goodies) {
            g.visible = false;
        }
    }

    update(frame: number, player: Player) {
        for (let g of this.goodies) {
            if (g.visible) {
                g.pos.x -= 3;
                if (frame % 15 == 0) {
                    if (frame % 30 == 0) {
                        this.setFrame(g, g.type + 1);
                    } else {
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
    }

    getFirstDead(): Goodie {
        for (let g of this.goodies) {
            if (!g.visible) {
                return g;
            }
        }
        return null;
    }

    setFrame(g: Sprite, frame: number) {
        g.srcX = 7 * 64;
        g.srcY = frame * 64;
    }

    spawn(x, y, type) {
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

        let g = this.getFirstDead();
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
    }


    dropGoodie(enemyType: number, x: number, y: number) {
        if (enemyType == ENEMY_TYPE_UFO_BLUE || enemyType == ENEMY_TYPE_SHOOTER_BLUE || enemyType == ENEMY_TYPE_DIAMOND_BLUE) {
            this.goodieCount++;
            this.spawn(x, y, this.goodieCount % 3);
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
    particles: ParticleManager;
    enemyManager: EnemyManager;
    explosionManager: ExplosionManager;
    context: AudioContext;
    goodieManager: GoodieManager;

    waitForSpaceKey: boolean;
    showLogo: boolean;

    constructor(engine: Engine) {
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

    initialize() {
        this.logo = new Logo(this.engine);
        this.logo.show(this.engine);
        this.player = new Player(this.engine, 0, 0);
        this.gameObjects.push(this.player);
        this.speak('lost in space - by j. p. preesents for j. s. 13 k. games');
    }

    speak(text: string) {
        if (window.location.href.indexOf("silent") > -1) {
            return;
        }
        let msg = new SpeechSynthesisUtterance();
        msg.volume = 0.6; // 0 to 1
        msg.rate = 1.2; // 0.1 to 10
        msg.pitch = 2; //0 to 2
        msg.text = text;
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    }

    update(frame: number) {

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

        for (let obj of this.gameObjects) {
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

        for (let obj of this.gameObjects) {
            obj.update(frame);
        }
        this.bulletManager.update(frame, this.enemyManager);
    }

    static spritesIntersect(a: Sprite, b: Sprite) {
        return (a.pos.x + a.width - 1 >= b.pos.x && a.pos.x <= b.pos.x + b.width - 1 && a.pos.y + a.height - 1 >= b.pos.y && a.pos.y <= b.pos.y + b.height - 1);
    }

    playShotSound() {
        if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Edge") != -1) {
            return;
        }
        if (this.context == null) {
            this.context = new AudioContext()
        }
        let o = this.context.createOscillator();
        let g = this.context.createGain();
        o.connect(g);
        o.type = "sine";
        g.connect(this.context.destination);
        o.frequency.value = 1040;
        o.frequency.linearRampToValueAtTime(
            240,
            this.context.currentTime + 0.2
        );
        o.start(0);
        g.gain.value = 0.1;
        g.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.4);

        o.stop(this.context.currentTime + 0.5);
    }

    playExplosionSound() {
        if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Edge") != -1) {
            return;
        }

        if (this.context == null) {
            this.context = new AudioContext()
        }
        let o = this.context.createOscillator();
        let g = this.context.createGain();
        o.connect(g);
        o.type = "sawtooth";
        g.connect(this.context.destination);
        o.frequency.value = 340;
        o.frequency.linearRampToValueAtTime(
            10,
            this.context.currentTime + 0.2
        );
        o.start(0);
        g.gain.value = 0.2;
        g.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.4);

        o.stop(this.context.currentTime + 0.5);
    }
}

