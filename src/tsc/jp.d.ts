declare const KEY_LEFT = 37;
declare const KEY_UP = 38;
declare const KEY_RIGHT = 39;
declare const KEY_DOWN = 40;
declare const KEY_SPACE = 32;
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
}
declare class Logo {
    sprite: Sprite;
    constructor(engine: Engine);
    hide(): boolean;
    show(engine: Engine): void;
}
declare class GameObject {
    sprite: Sprite;
    speed: Point;
    hp: number;
    constructor(engine: Engine, x: number, y: number);
    update(): void;
    kill(): void;
}
declare class Player extends GameObject {
    lastShotTime: number;
    breakBetweenShots: number;
    shots: number;
    engine: Engine;
    constructor(engine: Engine, x: number, y: number);
    shoot(frame: number, bulletManager: BulletManager): void;
    update(): void;
}
declare class Bullet extends GameObject {
    lifetime: number;
    constructor(engine: Engine, x: number, y: number);
    update(): void;
}
declare class BulletManager {
    bullets: Bullet[];
    constructor(game: Game);
    getFirstDead(): Bullet;
    shoot(x: number, y: number, speedX: number, speedY: number, lifetime: number): void;
}
declare class Particle extends GameObject {
    lifetime: number;
    maxLifetime: number;
    constructor(engine: Engine, x: number, y: number, lifetime: number);
    reset(lifetime: number): void;
    update(): void;
}
declare class ParticleManager {
    particles: Particle[];
    constructor(game: Game);
    getFirstDead(): Particle;
    spawn(x: number, y: number, speedX: number, speedY: number, lifetime: number): void;
    update(): void;
}
declare class Starfield {
    stars: Sprite[];
    game: Game;
    constructor(game: Game);
    update(): void;
}
declare class Game {
    engine: Engine;
    logo: Logo;
    gameObjects: GameObject[];
    player: Player;
    bulletManager: BulletManager;
    starfield: Starfield;
    particles: ParticleManager;
    constructor(engine: Engine);
    initialize(): void;
    update(frame: number): void;
}
