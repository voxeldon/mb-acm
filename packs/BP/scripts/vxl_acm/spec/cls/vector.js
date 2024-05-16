class Vector {
    static add(VectorA, VectorB) {
        if (VectorA instanceof Vector3 && VectorB instanceof Vector3) {
            return new Vector3(VectorA.x + VectorB.x, VectorA.y + VectorB.y, VectorA.z + VectorB.z);
        }
        else if (VectorA instanceof Vector2 && VectorB instanceof Vector2) {
            return new Vector2(VectorA.x + VectorB.x, VectorA.y + VectorB.y);
        }
        else {
            throw new Error("Mismatched Vector types");
        }
    }
}
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static new(obj) {
        return new Vector2(obj.x, obj.y);
    }
}
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static new(obj) {
        return new Vector3(obj.x, obj.y, obj.z);
    }
    static floor(obj) {
        return new Vector3(Math.floor(obj.x), Math.floor(obj.y), Math.floor(obj.z));
    }
}
export { Vector, Vector2, Vector3 };
