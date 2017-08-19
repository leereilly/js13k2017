declare const KEY_LEFT = 37;
declare const KEY_UP = 38;
declare const KEY_RIGHT = 39;
declare const KEY_DOWN = 40;
declare const KEY_SPACE = 32;
declare const REPLACE_R = 153;
declare const REPLACE_G = 153;
declare const REPLACE_B = 153;
declare const ENEMY_TYPE_UFO = 0;
declare const ENEMY_TYPE_UFO_BLUE = 1;
declare const ENEMY_TYPE_UFO_YELLOW = 2;
declare const ENEMY_TYPE_UFO_ORANGE = 3;
declare const ENEMY_TYPE_SHOOTER = 4;
declare const ENEMY_TYPE_SHOOTER_BLUE = 5;
declare const ENEMY_TYPE_DIAMOND = 6;
declare const ENEMY_TYPE_DIAMOND_BLUE = 7;
declare const ENEMY_TYPE_DIAMOND_YELLOW = 8;
declare const ATTACK_VECTORS: number[][];
declare const SQUADS: number[][];
declare class AttackPatternBuilder {
    addSquads(): void;
    pattern: any;
    curTime: number;
    constructor();
    addSquad(timeOffset: number, squad: number): void;
    compare(a: any, b: any): number;
}
declare class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
declare class Sprite {
    pos: Point;
    srcX: number;
    srcY: number;
    width: number;
    height: number;
    alpha: number;
    visible: boolean;
    scale: number;
    constructor(x: number, y: number);
    draw(spriteContext: HTMLCanvasElement, drawContext: CanvasRenderingContext2D): void;
}
declare class Engine {
    spriteCanvasCtx: CanvasRenderingContext2D;
    drawCanvasCtx: CanvasRenderingContext2D;
    spriteCanvas: HTMLCanvasElement;
    drawCanvas: HTMLCanvasElement;
    sprites: Sprite[];
    game: Game;
    trackedKeys: boolean[];
    constructor(spriteCanvas: HTMLCanvasElement, drawCanvas: HTMLCanvasElement);
    keyDown(e: any): void;
    keyUp(e: any): void;
    isKeyDown(keyCode: number): boolean;
    frame: number;
    loop(): void;
    getWidth(): number;
    getHeight(): number;
    createSprite(x: number, y: number): Sprite;
    bringSpriteToFront(sprite: Sprite): void;
    bringSpriteToBack(sprite: Sprite): void;
    private recolorCopy(canvas, x, y, w, h, colors);
}
declare class Logo {
    sprite: Sprite;
    constructor(engine: Engine);
    setToRestart(): void;
    hide(): boolean;
    show(engine: Engine): void;
    blendIn(): boolean;
}
declare class GameObject {
    sprite: Sprite;
    speed: Point;
    hp: number;
    hideAfter: number;
    constructor(engine: Engine, x: number, y: number);
    update(frame: number): void;
    updateHideAfter(): void;
    kill(hideAfter: number): void;
}
declare class Player extends GameObject {
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
    constructor(engine: Engine, x: number, y: number);
    shoot(frame: number, bulletManager: BulletManager): void;
    update(frame: number): void;
    takeDamage(amount: number): boolean;
    reset(): void;
    upgradeWeapon(): void;
    upgradeShield(): void;
    upgradeSpeed(): void;
    givePoints(amount: number): void;
}
declare class Bullet extends GameObject {
    lifetime: number;
    constructor(engine: Engine, x: number, y: number);
    update(frame: number): void;
}
declare class BulletManager {
    bullets: Bullet[];
    constructor(game: Game);
    getFirstDead(): Bullet;
    shoot(x: number, y: number, speedX: number, speedY: number, lifetime: number): void;
    update(frame: number, enemyManager: EnemyManager): void;
}
declare const PARTICLE_BLUE = 0;
declare const PARTICLE_EXPLO = 1;
declare class Particle extends GameObject {
    lifetime: number;
    maxLifetime: number;
    constructor(engine: Engine, x: number, y: number, lifetime: number);
    setType(type: number): void;
    reset(lifetime: number): void;
    update(frame: number): void;
}
declare class ParticleManager {
    particles: Particle[];
    constructor(game: Game);
    getFirstDead(): Particle;
    spawn(x: number, y: number, speedX: number, speedY: number, lifetime: number, type: number): void;
    update(frame: number): void;
}
declare class Enemy extends GameObject {
    type: number;
    stop: boolean;
    frame: number;
    animOffset: number;
    attackVector: number[];
    attackStep: number;
    attackSubStep: number;
    attackSpeed: number;
    setFrame(frame: number): void;
    constructor(engine: Engine);
    spawn(type: number, attackVector: number[]): void;
    calcAttackSpeed(x1: any, y1: any, x2: any, y2: any): number;
    getSpeed(): number;
    update(frame: number): void;
    takeDamage(amount: number): void;
}
declare class EnemyManager {
    engine: Engine;
    gameObjects: GameObject[];
    enemies: Enemy[];
    time: number;
    currentAttack: number;
    attackPattern: any;
    constructor(engine: Engine, gameObjects: GameObject[]);
    reset(): void;
    update(player: Player): void;
    getDeadEnemy(): Enemy;
    spawn(type: number, attackVectorIndex: number): void;
}
declare class Starfield {
    stars: Sprite[];
    game: Game;
    constructor(game: Game);
    update(): void;
}
declare class Explosion {
    lifetime: number;
    x: number;
    y: number;
    width: number;
    height: number;
    intensity: number;
    setData(lifetime: number, x: number, y: number, width: number, height: number, intensity: number): void;
    update(particles: ParticleManager): void;
}
declare class ExplosionManager {
    explosions: Explosion[];
    explode(lifetime: number, x: number, y: number, width: number, height: number, intensity: number): void;
    getFirstDead(): Explosion;
    update(particles: ParticleManager): void;
}
declare let globalGame: Game;
declare const GOODIE_WEAPON = 0;
declare const GOODIE_SPEED = 1;
declare const GOODIE_SHIELD = 2;
declare const GOODIE_POINTS = 3;
declare class Goodie extends Sprite {
    type: number;
}
declare class GoodieManager {
    goodies: Goodie[];
    goodieCount: number;
    constructor();
    reset(): void;
    update(frame: number, player: Player): void;
    getFirstDead(): Goodie;
    setFrame(g: Sprite, frame: number): void;
    spawn(x: any, y: any, type: any): void;
    dropGoodie(enemyType: number, x: number, y: number): void;
}
declare class Game {
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
    constructor(engine: Engine);
    initialize(): void;
    speak(text: string): void;
    update(frame: number): void;
    static spritesIntersect(a: Sprite, b: Sprite): boolean;
    playShotSound(): void;
    playExplosionSound(): void;
}
