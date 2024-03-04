class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static new(obj) {
        return new Vec2(obj.x, obj.y);
    }
}
class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static new(obj) {
        return new Vec3(obj.x, obj.y, obj.z);
    }
}
export { Vec2, Vec3 };
