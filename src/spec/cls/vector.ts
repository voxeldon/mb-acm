class Vec2 {
    constructor(public x: number, public y: number) {}

    static new(obj: { x: number; y: number }): Vec2 {
        return new Vec2(obj.x, obj.y);
    }

}

class Vec3 {
    constructor(public x: number, public y: number, public z: number) {}

    static new(obj: { x: number; y: number; z: number }): Vec3 {
        return new Vec3(obj.x, obj.y, obj.z);
    }

}

export { Vec2, Vec3 };
