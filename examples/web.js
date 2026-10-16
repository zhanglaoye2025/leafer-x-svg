var LeaferUI = function(exports) {
    "use strict";
    exports.PathNodeHandleType = void 0;
    (function(PathNodeHandleType) {
        PathNodeHandleType[PathNodeHandleType["none"] = 1] = "none";
        PathNodeHandleType[PathNodeHandleType["free"] = 2] = "free";
        PathNodeHandleType[PathNodeHandleType["mirrorAngle"] = 3] = "mirrorAngle";
        PathNodeHandleType[PathNodeHandleType["mirror"] = 4] = "mirror";
    })(exports.PathNodeHandleType || (exports.PathNodeHandleType = {}));
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P ? value : new P(function(resolve) {
                resolve(value);
            });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    exports.Answer = void 0;
    (function(Answer) {
        Answer[Answer["No"] = 0] = "No";
        Answer[Answer["Yes"] = 1] = "Yes";
        Answer[Answer["NoAndSkip"] = 2] = "NoAndSkip";
        Answer[Answer["YesAndSkip"] = 3] = "YesAndSkip";
    })(exports.Answer || (exports.Answer = {}));
    const emptyData = {};
    function isUndefined(value) {
        return value === undefined;
    }
    function isNull(value) {
        return value == null;
    }
    function isString(value) {
        return typeof value === "string";
    }
    const {isFinite: isFinite} = Number;
    function isNumber(value) {
        return typeof value === "number";
    }
    const numberReg = /^-?\d+(?:\.\d+)?$/;
    function tryToNumber(value) {
        return typeof value === "string" && numberReg.test(value) ? +value : value;
    }
    const {isArray: isArray} = Array;
    function isObject(value) {
        return value && typeof value === "object";
    }
    function isData(value) {
        return isObject(value) && !isArray(value);
    }
    function isEmptyData(value) {
        return JSON.stringify(value) === "{}";
    }
    const DataHelper = {
        default(t, defaultData) {
            assign(defaultData, t);
            assign(t, defaultData);
            return t;
        },
        assign(t, merge, exclude) {
            let value;
            Object.keys(merge).forEach(key => {
                var _a, _b;
                value = merge[key];
                if ((value === null || value === void 0 ? void 0 : value.constructor) === Object && ((_a = t[key]) === null || _a === void 0 ? void 0 : _a.constructor) === Object) return assign(t[key], merge[key], exclude && exclude[key]);
                if (exclude && key in exclude) {
                    if (((_b = exclude[key]) === null || _b === void 0 ? void 0 : _b.constructor) === Object) assign(t[key] = {}, merge[key], exclude[key]);
                    return;
                }
                t[key] = merge[key];
            });
        },
        copyAttrs(t, from, include) {
            include.forEach(key => {
                if (!isUndefined(from[key])) t[key] = from[key];
            });
            return t;
        },
        clone(data) {
            return JSON.parse(JSON.stringify(data));
        },
        toMap(list) {
            const map = {};
            for (let i = 0, len = list.length; i < len; i++) map[list[i]] = true;
            return map;
        },
        stintSet(data, attrName, value) {
            value || (value = undefined);
            data[attrName] !== value && (data[attrName] = value);
        }
    };
    const {assign: assign} = DataHelper;
    class LeafData {
        get __useNaturalRatio() {
            return true;
        }
        get __isLinePath() {
            const {path: path} = this;
            return path && path.length === 6 && path[0] === 1;
        }
        get __usePathBox() {
            return this.__pathInputed;
        }
        get __blendMode() {
            if (this.eraser && this.eraser !== "path") return "destination-out";
            const {blendMode: blendMode} = this;
            return blendMode === "pass-through" ? null : blendMode;
        }
        constructor(leaf) {
            this.__leaf = leaf;
        }
        __get(name) {
            if (this.__input) {
                const value = this.__input[name];
                if (!isUndefined(value)) return value;
            }
            return this[name];
        }
        __getData() {
            const data = {
                tag: this.__leaf.tag
            }, {__input: __input} = this;
            let inputValue;
            for (let key in this) {
                if (key[0] !== "_") {
                    inputValue = __input ? __input[key] : undefined;
                    data[key] = isUndefined(inputValue) ? this[key] : inputValue;
                }
            }
            return data;
        }
        __setInput(name, value) {
            this.__input || (this.__input = {});
            this.__input[name] = value;
        }
        __getInput(name) {
            if (this.__input) {
                const value = this.__input[name];
                if (!isUndefined(value)) return value;
            }
            if (name === "path" && !this.__pathInputed) return;
            return this["_" + name];
        }
        __removeInput(name) {
            if (this.__input && !isUndefined(this.__input[name])) this.__input[name] = undefined;
        }
        __getInputData(names, options) {
            const data = {};
            if (names) {
                if (isArray(names)) {
                    for (let name of names) data[name] = this.__getInput(name);
                } else {
                    for (let name in names) data[name] = this.__getInput(name);
                }
            } else {
                let value, inputValue, {__input: __input} = this;
                data.tag = this.__leaf.tag;
                for (let key in this) {
                    if (key[0] !== "_") {
                        value = this["_" + key];
                        if (!isUndefined(value)) {
                            if (key === "path" && !this.__pathInputed) continue;
                            inputValue = __input ? __input[key] : undefined;
                            data[key] = isUndefined(inputValue) ? value : inputValue;
                        }
                    }
                }
            }
            if (options) {
                if (options.matrix) {
                    const {a: a, b: b, c: c, d: d, e: e, f: f} = this.__leaf.__localMatrix;
                    data.matrix = {
                        a: a,
                        b: b,
                        c: c,
                        d: d,
                        e: e,
                        f: f
                    };
                }
            }
            return data;
        }
        __setMiddle(name, value) {
            this.__middle || (this.__middle = {});
            this.__middle[name] = value;
        }
        __getMiddle(name) {
            return this.__middle && this.__middle[name];
        }
        __checkSingle() {
            const t = this;
            if (t.blendMode === "pass-through") {
                const leaf = this.__leaf;
                if (t.opacity < 1 && (leaf.isBranch || t.__hasMultiPaint) || leaf.__hasEraser || t.eraser || t.filter) {
                    t.__single = true;
                } else if (t.__single) {
                    t.__single = false;
                }
            } else {
                t.__single = true;
            }
        }
        __removeNaturalSize() {
            this.__naturalWidth = this.__naturalHeight = undefined;
        }
        destroy() {
            this.__input = this.__middle = null;
            if (this.__complexData) this.__complexData.destroy();
        }
    }
    const IncrementId = {
        RUNTIME: "runtime",
        LEAF: "leaf",
        TASK: "task",
        CANVAS: "canvas",
        IMAGE: "image",
        types: {},
        create(typeName) {
            const {types: types} = I$2;
            if (types[typeName]) {
                return types[typeName]++;
            } else {
                types[typeName] = 1;
                return 0;
            }
        }
    };
    const I$2 = IncrementId;
    let tempA, tempB, tempTo;
    const {max: max$5} = Math, tempFour = [ 0, 0, 0, 0 ];
    const FourNumberHelper = {
        zero: [ ...tempFour ],
        tempFour: tempFour,
        set(to, top, right, bottom, left) {
            if (right === undefined) right = bottom = left = top;
            to[0] = top;
            to[1] = right;
            to[2] = bottom;
            to[3] = left;
            return to;
        },
        setTemp(top, right, bottom, left) {
            return set$3(tempFour, top, right, bottom, left);
        },
        toTempAB(a, b, change) {
            tempTo = change ? isNumber(a) ? b : a : [];
            if (isNumber(a)) tempA = setTemp(a), tempB = b; else if (isNumber(b)) tempA = a, 
            tempB = setTemp(b); else tempA = a, tempB = b;
            if (tempA.length !== 4) tempA = get$5(tempA);
            if (tempB.length !== 4) tempB = get$5(tempB);
        },
        get(num, maxValue) {
            let data;
            if (!isNumber(num)) {
                switch (num.length) {
                  case 4:
                    data = isUndefined(maxValue) ? num : [ ...num ];
                    break;

                  case 2:
                    data = [ num[0], num[1], num[0], num[1] ];
                    break;

                  case 3:
                    data = [ num[0], num[1], num[2], num[1] ];
                    break;

                  case 1:
                    num = num[0];
                    break;

                  default:
                    num = 0;
                }
            }
            if (!data) data = [ num, num, num, num ];
            if (!isUndefined(maxValue)) for (let i = 0; i < 4; i++) if (data[i] > maxValue) data[i] = maxValue;
            return data;
        },
        max(t, other, change) {
            if (isNumber(t) && isNumber(other)) return max$5(t, other);
            toTempAB(t, other, change);
            return set$3(tempTo, max$5(tempA[0], tempB[0]), max$5(tempA[1], tempB[1]), max$5(tempA[2], tempB[2]), max$5(tempA[3], tempB[3]));
        },
        add(t, other, change) {
            if (isNumber(t) && isNumber(other)) return t + other;
            toTempAB(t, other, change);
            return set$3(tempTo, tempA[0] + tempB[0], tempA[1] + tempB[1], tempA[2] + tempB[2], tempA[3] + tempB[3]);
        },
        swapAndScale(t, scaleX, scaleY, change) {
            if (isNumber(t)) return scaleX === scaleY ? t * scaleX : [ t * scaleY, t * scaleX ];
            const to = change ? t : [];
            const [top, right, bottom, left] = t.length === 4 ? t : get$5(t);
            return set$3(to, bottom * scaleY, left * scaleX, top * scaleY, right * scaleX);
        }
    };
    const {set: set$3, get: get$5, setTemp: setTemp, toTempAB: toTempAB} = FourNumberHelper;
    const {round: round$3, pow: pow$1, max: max$4, floor: floor$2, PI: PI$3} = Math;
    const tempScaleData$1 = {};
    const MathHelper = {
        within(value, min, max) {
            if (isObject(min)) max = min.max, min = min.min;
            if (!isUndefined(min) && value < min) value = min;
            if (!isUndefined(max) && value > max) value = max;
            return value;
        },
        fourNumber: FourNumberHelper.get,
        formatRotation(rotation, unsign) {
            rotation %= 360;
            if (unsign) {
                if (rotation < 0) rotation += 360;
            } else {
                if (rotation > 180) rotation -= 360;
                if (rotation < -180) rotation += 360;
            }
            return MathHelper.float(rotation);
        },
        getGapRotation(addRotation, gap, oldRotation = 0) {
            let rotation = addRotation + oldRotation;
            if (gap > 1) {
                const r = Math.abs(rotation % gap);
                if (r < 1 || r > gap - 1) rotation = Math.round(rotation / gap) * gap;
            }
            return rotation - oldRotation;
        },
        float(num, maxLength) {
            const a = !isUndefined(maxLength) ? pow$1(10, maxLength) : 1e12;
            num = round$3(num * a) / a;
            return num === -0 ? 0 : num;
        },
        sign(num) {
            return num < 0 ? -1 : 1;
        },
        getScaleData(scale, size, originSize, scaleData) {
            if (!scaleData) scaleData = {};
            if (size) {
                const scaleX = (isNumber(size) ? size : size.width || 0) / originSize.width, scaleY = (isNumber(size) ? size : size.height || 0) / originSize.height;
                scaleData.scaleX = scaleX || scaleY || 1;
                scaleData.scaleY = scaleY || scaleX || 1;
            } else if (scale) MathHelper.assignScale(scaleData, scale);
            return scaleData;
        },
        getScaleFixedData(worldScaleData, scaleFixed, unscale, abs, _localScaleData) {
            let {scaleX: scaleX, scaleY: scaleY} = worldScaleData;
            if (abs || scaleFixed) scaleX < 0 && (scaleX = -scaleX), scaleY < 0 && (scaleY = -scaleY);
            if (scaleFixed) {
                if (scaleFixed === true) {
                    scaleX = scaleY = unscale ? 1 : 1 / scaleX;
                } else {
                    let minScale;
                    if (isNumber(scaleFixed)) minScale = scaleFixed; else if (scaleFixed === "zoom-in") minScale = 1;
                    if (minScale) {
                        if (scaleX > minScale || scaleY > minScale) scaleX = scaleY = unscale ? 1 : 1 / scaleX; else scaleX = scaleY = unscale ? 1 : 1 / minScale;
                    }
                }
            }
            tempScaleData$1.scaleX = scaleX;
            tempScaleData$1.scaleY = scaleY;
            return tempScaleData$1;
        },
        assignScale(scaleData, scale) {
            if (isNumber(scale)) {
                scaleData.scaleX = scaleData.scaleY = scale;
            } else {
                scaleData.scaleX = scale.x;
                scaleData.scaleY = scale.y;
            }
        },
        getFloorScale(num, min = 1) {
            return max$4(floor$2(num), min) / num;
        },
        randInt: randInt,
        randColor(opacity) {
            return `rgba(${randInt(255)},${randInt(255)},${randInt(255)},${opacity || 1})`;
        }
    };
    function randInt(num) {
        return Math.round(Math.random() * num);
    }
    const OneRadian = PI$3 / 180;
    const PI2 = PI$3 * 2;
    const PI_2 = PI$3 / 2;
    function getPointData() {
        return {
            x: 0,
            y: 0
        };
    }
    function getBoundsData() {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    }
    function getMatrixData() {
        return {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: 0,
            f: 0
        };
    }
    const {sin: sin$5, cos: cos$5, acos: acos, sqrt: sqrt$3} = Math;
    const {float: float$4} = MathHelper;
    const tempPoint$5 = {};
    function getWorld() {
        return Object.assign(Object.assign(Object.assign({}, getMatrixData()), getBoundsData()), {
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            skewX: 0,
            skewY: 0
        });
    }
    const MatrixHelper = {
        defaultMatrix: getMatrixData(),
        defaultWorld: getWorld(),
        tempMatrix: {},
        set(t, a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
            t.a = a;
            t.b = b;
            t.c = c;
            t.d = d;
            t.e = e;
            t.f = f;
        },
        get: getMatrixData,
        getWorld: getWorld,
        copy(t, matrix) {
            t.a = matrix.a;
            t.b = matrix.b;
            t.c = matrix.c;
            t.d = matrix.d;
            t.e = matrix.e;
            t.f = matrix.f;
        },
        translate(t, x, y) {
            t.e += x;
            t.f += y;
        },
        translateInner(t, x, y, hasOrigin) {
            t.e += t.a * x + t.c * y;
            t.f += t.b * x + t.d * y;
            if (hasOrigin) t.e -= x, t.f -= y;
        },
        scale(t, scaleX, scaleY = scaleX) {
            t.a *= scaleX;
            t.b *= scaleX;
            t.c *= scaleY;
            t.d *= scaleY;
        },
        pixelScale(t, pixelRatio, to) {
            to || (to = t);
            to.a = t.a * pixelRatio;
            to.b = t.b * pixelRatio;
            to.c = t.c * pixelRatio;
            to.d = t.d * pixelRatio;
            to.e = t.e * pixelRatio;
            to.f = t.f * pixelRatio;
        },
        scaleOfOuter(t, origin, scaleX, scaleY) {
            M$6.toInnerPoint(t, origin, tempPoint$5);
            M$6.scaleOfInner(t, tempPoint$5, scaleX, scaleY);
        },
        scaleOfInner(t, origin, scaleX, scaleY = scaleX) {
            M$6.translateInner(t, origin.x, origin.y);
            M$6.scale(t, scaleX, scaleY);
            M$6.translateInner(t, -origin.x, -origin.y);
        },
        rotate(t, rotation) {
            const {a: a, b: b, c: c, d: d} = t;
            rotation *= OneRadian;
            const cosR = cos$5(rotation);
            const sinR = sin$5(rotation);
            t.a = a * cosR - b * sinR;
            t.b = a * sinR + b * cosR;
            t.c = c * cosR - d * sinR;
            t.d = c * sinR + d * cosR;
        },
        rotateOfOuter(t, origin, rotation) {
            M$6.toInnerPoint(t, origin, tempPoint$5);
            M$6.rotateOfInner(t, tempPoint$5, rotation);
        },
        rotateOfInner(t, origin, rotation) {
            M$6.translateInner(t, origin.x, origin.y);
            M$6.rotate(t, rotation);
            M$6.translateInner(t, -origin.x, -origin.y);
        },
        skew(t, skewX, skewY) {
            const {a: a, b: b, c: c, d: d} = t;
            if (skewY) {
                skewY *= OneRadian;
                t.a = a + c * skewY;
                t.b = b + d * skewY;
            }
            if (skewX) {
                skewX *= OneRadian;
                t.c = c + a * skewX;
                t.d = d + b * skewX;
            }
        },
        skewOfOuter(t, origin, skewX, skewY) {
            M$6.toInnerPoint(t, origin, tempPoint$5);
            M$6.skewOfInner(t, tempPoint$5, skewX, skewY);
        },
        skewOfInner(t, origin, skewX, skewY = 0) {
            M$6.translateInner(t, origin.x, origin.y);
            M$6.skew(t, skewX, skewY);
            M$6.translateInner(t, -origin.x, -origin.y);
        },
        multiply(t, child) {
            const {a: a, b: b, c: c, d: d, e: e, f: f} = t;
            t.a = child.a * a + child.b * c;
            t.b = child.a * b + child.b * d;
            t.c = child.c * a + child.d * c;
            t.d = child.c * b + child.d * d;
            t.e = child.e * a + child.f * c + e;
            t.f = child.e * b + child.f * d + f;
        },
        multiplyParent(t, parent, to, abcdChanged, childScaleData) {
            const {e: e, f: f} = t;
            to || (to = t);
            if (isUndefined(abcdChanged)) abcdChanged = t.a !== 1 || t.b || t.c || t.d !== 1;
            if (abcdChanged) {
                const {a: a, b: b, c: c, d: d} = t;
                to.a = a * parent.a + b * parent.c;
                to.b = a * parent.b + b * parent.d;
                to.c = c * parent.a + d * parent.c;
                to.d = c * parent.b + d * parent.d;
                if (childScaleData) {
                    to.scaleX = parent.scaleX * childScaleData.scaleX;
                    to.scaleY = parent.scaleY * childScaleData.scaleY;
                }
            } else {
                to.a = parent.a;
                to.b = parent.b;
                to.c = parent.c;
                to.d = parent.d;
                if (childScaleData) {
                    to.scaleX = parent.scaleX;
                    to.scaleY = parent.scaleY;
                }
            }
            to.e = e * parent.a + f * parent.c + parent.e;
            to.f = e * parent.b + f * parent.d + parent.f;
        },
        divide(t, child) {
            M$6.multiply(t, M$6.tempInvert(child));
        },
        divideParent(t, parent) {
            M$6.multiplyParent(t, M$6.tempInvert(parent));
        },
        tempInvert(t) {
            const {tempMatrix: tempMatrix} = M$6;
            M$6.copy(tempMatrix, t);
            M$6.invert(tempMatrix);
            return tempMatrix;
        },
        invert(t) {
            const {a: a, b: b, c: c, d: d, e: e, f: f} = t;
            if (!b && !c) {
                if (a === 1 && d === 1) {
                    t.e = -e;
                    t.f = -f;
                } else {
                    const s = 1 / (a * d);
                    t.a = d * s;
                    t.d = a * s;
                    t.e = -e * d * s;
                    t.f = -f * a * s;
                }
            } else {
                const s = 1 / (a * d - b * c);
                t.a = d * s;
                t.b = -b * s;
                t.c = -c * s;
                t.d = a * s;
                t.e = -(e * d - f * c) * s;
                t.f = -(f * a - e * b) * s;
            }
        },
        toOuterPoint(t, inner, to, distance) {
            const {x: x, y: y} = inner;
            to || (to = inner);
            to.x = x * t.a + y * t.c;
            to.y = x * t.b + y * t.d;
            if (!distance) {
                to.x += t.e;
                to.y += t.f;
            }
        },
        toInnerPoint(t, outer, to, distance) {
            const {a: a, b: b, c: c, d: d} = t;
            const s = 1 / (a * d - b * c);
            const {x: x, y: y} = outer;
            to || (to = outer);
            to.x = (x * d - y * c) * s;
            to.y = (y * a - x * b) * s;
            if (!distance) {
                const {e: e, f: f} = t;
                to.x -= (e * d - f * c) * s;
                to.y -= (f * a - e * b) * s;
            }
        },
        setLayout(t, layout, origin, around, bcChanged) {
            const {x: x, y: y, scaleX: scaleX, scaleY: scaleY} = layout;
            if (isUndefined(bcChanged)) bcChanged = layout.rotation || layout.skewX || layout.skewY;
            if (bcChanged) {
                const {rotation: rotation, skewX: skewX, skewY: skewY} = layout;
                const r = rotation * OneRadian;
                const cosR = cos$5(r);
                const sinR = sin$5(r);
                if (skewX || skewY) {
                    const sx = skewX * OneRadian;
                    const sy = skewY * OneRadian;
                    t.a = (cosR + sy * -sinR) * scaleX;
                    t.b = (sinR + sy * cosR) * scaleX;
                    t.c = (-sinR + sx * cosR) * scaleY;
                    t.d = (cosR + sx * sinR) * scaleY;
                } else {
                    t.a = cosR * scaleX;
                    t.b = sinR * scaleX;
                    t.c = -sinR * scaleY;
                    t.d = cosR * scaleY;
                }
            } else {
                t.a = scaleX;
                t.b = 0;
                t.c = 0;
                t.d = scaleY;
            }
            t.e = x;
            t.f = y;
            if (origin = origin || around) M$6.translateInner(t, -origin.x, -origin.y, !around);
        },
        getLayout(t, origin, around, firstSkewY) {
            const {a: a, b: b, c: c, d: d, e: e, f: f} = t;
            let x = e, y = f, scaleX, scaleY, rotation, skewX, skewY;
            if (b || c) {
                const s = a * d - b * c;
                if (c && !firstSkewY) {
                    scaleX = sqrt$3(a * a + b * b);
                    scaleY = s / scaleX;
                    const cosR = a / scaleX;
                    rotation = b > 0 ? acos(cosR) : -acos(cosR);
                } else {
                    scaleY = sqrt$3(c * c + d * d);
                    scaleX = s / scaleY;
                    const cosR = c / scaleY;
                    rotation = PI_2 - (d > 0 ? acos(-cosR) : -acos(cosR));
                }
                const cosR = float$4(cos$5(rotation));
                const sinR = sin$5(rotation);
                scaleX = float$4(scaleX), scaleY = float$4(scaleY);
                skewX = cosR ? float$4((c / scaleY + sinR) / cosR / OneRadian, 9) : 0;
                skewY = cosR ? float$4((b / scaleX - sinR) / cosR / OneRadian, 9) : 0;
                rotation = float$4(rotation / OneRadian);
            } else {
                scaleX = a;
                scaleY = d;
                rotation = skewX = skewY = 0;
            }
            if (origin = around || origin) {
                x += origin.x * a + origin.y * c;
                y += origin.x * b + origin.y * d;
                if (!around) x -= origin.x, y -= origin.y;
            }
            return {
                x: x,
                y: y,
                scaleX: scaleX,
                scaleY: scaleY,
                rotation: rotation,
                skewX: skewX,
                skewY: skewY
            };
        },
        withScale(t, scaleX, scaleY = scaleX) {
            const world = t;
            if (!scaleX || !scaleY) {
                const {a: a, b: b, c: c, d: d} = t;
                if (b || c) {
                    scaleX = sqrt$3(a * a + b * b);
                    scaleY = (a * d - b * c) / scaleX;
                } else {
                    scaleX = a;
                    scaleY = d;
                }
            }
            world.scaleX = scaleX;
            world.scaleY = scaleY;
            return world;
        },
        reset(t) {
            M$6.set(t);
        }
    };
    const M$6 = MatrixHelper;
    const {float: float$3} = MathHelper;
    const {toInnerPoint: toInnerPoint$2, toOuterPoint: toOuterPoint$3} = MatrixHelper;
    const {sin: sin$4, cos: cos$4, abs: abs$6, sqrt: sqrt$2, atan2: atan2$2, min: min$2, round: round$2} = Math;
    const PointHelper = {
        defaultPoint: getPointData(),
        tempPoint: {},
        tempRadiusPoint: {},
        set(t, x = 0, y = 0) {
            t.x = x;
            t.y = y;
        },
        setRadius(t, x, y) {
            t.radiusX = x;
            t.radiusY = isUndefined(y) ? x : y;
        },
        copy(t, point) {
            t.x = point.x;
            t.y = point.y;
        },
        copyFrom(t, x, y) {
            t.x = x;
            t.y = y;
        },
        round(t, halfPixel) {
            t.x = halfPixel ? round$2(t.x - .5) + .5 : round$2(t.x);
            t.y = halfPixel ? round$2(t.y - .5) + .5 : round$2(t.y);
        },
        move(t, x, y) {
            if (isObject(x)) t.x += x.x, t.y += x.y; else t.x += x, t.y += y;
        },
        scale(t, scaleX, scaleY = scaleX) {
            if (t.x) t.x *= scaleX;
            if (t.y) t.y *= scaleY;
        },
        scaleOf(t, origin, scaleX, scaleY = scaleX) {
            t.x += (t.x - origin.x) * (scaleX - 1);
            t.y += (t.y - origin.y) * (scaleY - 1);
        },
        rotate(t, rotation, origin, radiusX = 1, radiusY = 1) {
            if (!origin) origin = P$5.defaultPoint;
            rotation *= OneRadian;
            const cosR = cos$4(rotation);
            const sinR = sin$4(rotation);
            const rx = (t.x - origin.x) / radiusX;
            const ry = (t.y - origin.y) / radiusY;
            t.x = origin.x + (rx * cosR - ry * sinR) * radiusX;
            t.y = origin.y + (rx * sinR + ry * cosR) * radiusY;
        },
        tempToInnerOf(t, matrix) {
            const {tempPoint: temp} = P$5;
            copy$9(temp, t);
            toInnerPoint$2(matrix, temp, temp);
            return temp;
        },
        tempToOuterOf(t, matrix) {
            const {tempPoint: temp} = P$5;
            copy$9(temp, t);
            toOuterPoint$3(matrix, temp, temp);
            return temp;
        },
        tempToInnerRadiusPointOf(t, matrix) {
            const {tempRadiusPoint: temp} = P$5;
            copy$9(temp, t);
            P$5.toInnerRadiusPointOf(t, matrix, temp);
            return temp;
        },
        copyRadiusPoint(t, point, x, y) {
            copy$9(t, point);
            setRadius(t, x, y);
            return t;
        },
        toInnerRadiusPointOf(t, matrix, to) {
            to || (to = t);
            toInnerPoint$2(matrix, t, to);
            to.radiusX = Math.abs(t.radiusX / matrix.scaleX);
            to.radiusY = Math.abs(t.radiusY / matrix.scaleY);
        },
        toInnerOf(t, matrix, to) {
            toInnerPoint$2(matrix, t, to);
        },
        toOuterOf(t, matrix, to) {
            toOuterPoint$3(matrix, t, to);
        },
        toVertical(t, rotation, verticalDistance, to) {
            const r = rotation * OneRadian;
            t.x += -Math.sin(r) * verticalDistance;
            t.y += Math.cos(r) * verticalDistance;
        },
        getCenter(t, to) {
            return {
                x: t.x + (to.x - t.x) / 2,
                y: t.y + (to.y - t.y) / 2
            };
        },
        getCenterX(x1, x2) {
            return x1 + (x2 - x1) / 2;
        },
        getCenterY(y1, y2) {
            return y1 + (y2 - y1) / 2;
        },
        getDistance(t, point) {
            return getDistanceFrom(t.x, t.y, point.x, point.y);
        },
        getDistanceFrom(x1, y1, x2, y2) {
            const x = abs$6(x2 - x1);
            const y = abs$6(y2 - y1);
            return sqrt$2(x * x + y * y);
        },
        getMinDistanceFrom(x1, y1, x2, y2, x3, y3) {
            return min$2(getDistanceFrom(x1, y1, x2, y2), getDistanceFrom(x2, y2, x3, y3));
        },
        getAngle(t, to, radiusX, radiusY) {
            return getAtan2(t, to, radiusX, radiusY) / OneRadian;
        },
        getRotation(t, origin, to, toOrigin) {
            if (!toOrigin) toOrigin = origin;
            return P$5.getRadianFrom(t.x, t.y, origin.x, origin.y, to.x, to.y, toOrigin.x, toOrigin.y) / OneRadian;
        },
        getRadianFrom(fromX, fromY, originX, originY, toX, toY, toOriginX, toOriginY) {
            if (isUndefined(toOriginX)) toOriginX = originX, toOriginY = originY;
            const a = fromX - originX;
            const b = fromY - originY;
            const c = toX - toOriginX;
            const d = toY - toOriginY;
            return Math.atan2(a * d - b * c, a * c + b * d);
        },
        getAtan2(t, to, radiusX = 1, radiusY = 1) {
            return atan2$2((to.y - t.y) / radiusY, (to.x - t.x) / radiusX);
        },
        getDistancePoint(t, to, distance, changeTo, fromTo) {
            const r = getAtan2(t, to);
            fromTo && (t = to);
            changeTo || (to = {});
            to.x = t.x + cos$4(r) * distance;
            to.y = t.y + sin$4(r) * distance;
            return to;
        },
        toNumberPoints(originPoints) {
            let points = originPoints;
            if (isObject(originPoints[0])) points = [], originPoints.forEach(p => points.push(p.x, p.y));
            return points;
        },
        isSame(t, point, quick) {
            return quick ? t.x === point.x && t.y === point.y : float$3(t.x) === float$3(point.x) && float$3(t.y) === float$3(point.y);
        },
        reset(t) {
            t.x = t.y = 0;
        }
    };
    const P$5 = PointHelper;
    const {getDistanceFrom: getDistanceFrom, copy: copy$9, setRadius: setRadius, getAtan2: getAtan2} = P$5;
    class Point {
        constructor(x, y) {
            this.set(x, y);
        }
        set(x, y) {
            isObject(x) ? PointHelper.copy(this, x) : PointHelper.set(this, x, y);
            return this;
        }
        get() {
            const {x: x, y: y} = this;
            return {
                x: x,
                y: y
            };
        }
        clone() {
            return new Point(this);
        }
        move(x, y) {
            PointHelper.move(this, x, y);
            return this;
        }
        scale(scaleX, scaleY) {
            PointHelper.scale(this, scaleX, scaleY);
            return this;
        }
        scaleOf(origin, scaleX, scaleY) {
            PointHelper.scaleOf(this, origin, scaleX, scaleY);
            return this;
        }
        rotate(rotation, origin, radiusX, radiusY) {
            PointHelper.rotate(this, rotation, origin, radiusX, radiusY);
            return this;
        }
        rotateOf(origin, rotation, radiusX, radiusY) {
            PointHelper.rotate(this, rotation, origin, radiusX, radiusY);
            return this;
        }
        getRotation(origin, to, toOrigin) {
            return PointHelper.getRotation(this, origin, to, toOrigin);
        }
        toInnerOf(matrix, to) {
            PointHelper.toInnerOf(this, matrix, to);
            return this;
        }
        toOuterOf(matrix, to) {
            PointHelper.toOuterOf(this, matrix, to);
            return this;
        }
        getCenter(to) {
            return new Point(PointHelper.getCenter(this, to));
        }
        getDistance(to) {
            return PointHelper.getDistance(this, to);
        }
        getDistancePoint(to, distance, changeTo, fromTo) {
            return new Point(PointHelper.getDistancePoint(this, to, distance, changeTo, fromTo));
        }
        getAngle(to, radiusX, radiusY) {
            return PointHelper.getAngle(this, to, radiusX, radiusY);
        }
        getAtan2(to, radiusX, radiusY) {
            return PointHelper.getAtan2(this, to, radiusX, radiusY);
        }
        isSame(point, quick) {
            return PointHelper.isSame(this, point, quick);
        }
        reset() {
            PointHelper.reset(this);
            return this;
        }
    }
    const tempPoint$4 = new Point;
    class Matrix {
        constructor(a, b, c, d, e, f) {
            this.set(a, b, c, d, e, f);
        }
        set(a, b, c, d, e, f) {
            isObject(a) ? MatrixHelper.copy(this, a) : MatrixHelper.set(this, a, b, c, d, e, f);
            return this;
        }
        setWith(dataWithScale) {
            MatrixHelper.copy(this, dataWithScale);
            this.scaleX = dataWithScale.scaleX;
            this.scaleY = dataWithScale.scaleY;
            return this;
        }
        get() {
            const {a: a, b: b, c: c, d: d, e: e, f: f} = this;
            return {
                a: a,
                b: b,
                c: c,
                d: d,
                e: e,
                f: f
            };
        }
        clone() {
            return new Matrix(this);
        }
        translate(x, y) {
            MatrixHelper.translate(this, x, y);
            return this;
        }
        translateInner(x, y) {
            MatrixHelper.translateInner(this, x, y);
            return this;
        }
        scale(x, y) {
            MatrixHelper.scale(this, x, y);
            return this;
        }
        scaleWith(x, y) {
            MatrixHelper.scale(this, x, y);
            this.scaleX *= x;
            this.scaleY *= y || x;
            return this;
        }
        pixelScale(pixelRatio) {
            MatrixHelper.pixelScale(this, pixelRatio);
            return this;
        }
        scaleOfOuter(origin, x, y) {
            MatrixHelper.scaleOfOuter(this, origin, x, y);
            return this;
        }
        scaleOfInner(origin, x, y) {
            MatrixHelper.scaleOfInner(this, origin, x, y);
            return this;
        }
        rotate(angle) {
            MatrixHelper.rotate(this, angle);
            return this;
        }
        rotateOfOuter(origin, angle) {
            MatrixHelper.rotateOfOuter(this, origin, angle);
            return this;
        }
        rotateOfInner(origin, angle) {
            MatrixHelper.rotateOfInner(this, origin, angle);
            return this;
        }
        skew(x, y) {
            MatrixHelper.skew(this, x, y);
            return this;
        }
        skewOfOuter(origin, x, y) {
            MatrixHelper.skewOfOuter(this, origin, x, y);
            return this;
        }
        skewOfInner(origin, x, y) {
            MatrixHelper.skewOfInner(this, origin, x, y);
            return this;
        }
        multiply(child) {
            MatrixHelper.multiply(this, child);
            return this;
        }
        multiplyParent(parent) {
            MatrixHelper.multiplyParent(this, parent);
            return this;
        }
        divide(child) {
            MatrixHelper.divide(this, child);
            return this;
        }
        divideParent(parent) {
            MatrixHelper.divideParent(this, parent);
            return this;
        }
        invert() {
            MatrixHelper.invert(this);
            return this;
        }
        invertWith() {
            MatrixHelper.invert(this);
            this.scaleX = 1 / this.scaleX;
            this.scaleY = 1 / this.scaleY;
            return this;
        }
        toOuterPoint(inner, to, distance) {
            MatrixHelper.toOuterPoint(this, inner, to, distance);
        }
        toInnerPoint(outer, to, distance) {
            MatrixHelper.toInnerPoint(this, outer, to, distance);
        }
        setLayout(data, origin, around) {
            MatrixHelper.setLayout(this, data, origin, around);
            return this;
        }
        getLayout(origin, around, firstSkewY) {
            return MatrixHelper.getLayout(this, origin, around, firstSkewY);
        }
        withScale(scaleX, scaleY) {
            return MatrixHelper.withScale(this, scaleX, scaleY);
        }
        reset() {
            MatrixHelper.reset(this);
            return this;
        }
    }
    const tempMatrix$2 = new Matrix;
    const TwoPointBoundsHelper = {
        tempPointBounds: {},
        setPoint(t, minX, minY) {
            t.minX = t.maxX = minX;
            t.minY = t.maxY = minY;
        },
        addPoint(t, x, y) {
            t.minX = x < t.minX ? x : t.minX;
            t.minY = y < t.minY ? y : t.minY;
            t.maxX = x > t.maxX ? x : t.maxX;
            t.maxY = y > t.maxY ? y : t.maxY;
        },
        addBounds(t, x, y, width, height) {
            addPoint$3(t, x, y);
            addPoint$3(t, x + width, y + height);
        },
        copy(t, pb) {
            t.minX = pb.minX;
            t.minY = pb.minY;
            t.maxX = pb.maxX;
            t.maxY = pb.maxY;
        },
        addPointBounds(t, pb) {
            t.minX = pb.minX < t.minX ? pb.minX : t.minX;
            t.minY = pb.minY < t.minY ? pb.minY : t.minY;
            t.maxX = pb.maxX > t.maxX ? pb.maxX : t.maxX;
            t.maxY = pb.maxY > t.maxY ? pb.maxY : t.maxY;
        },
        toBounds(t, setBounds) {
            setBounds.x = t.minX;
            setBounds.y = t.minY;
            setBounds.width = t.maxX - t.minX;
            setBounds.height = t.maxY - t.minY;
        }
    };
    const {addPoint: addPoint$3} = TwoPointBoundsHelper;
    exports.Direction4 = void 0;
    (function(Direction4) {
        Direction4[Direction4["top"] = 0] = "top";
        Direction4[Direction4["right"] = 1] = "right";
        Direction4[Direction4["bottom"] = 2] = "bottom";
        Direction4[Direction4["left"] = 3] = "left";
    })(exports.Direction4 || (exports.Direction4 = {}));
    exports.Direction9 = void 0;
    (function(Direction9) {
        Direction9[Direction9["topLeft"] = 0] = "topLeft";
        Direction9[Direction9["top"] = 1] = "top";
        Direction9[Direction9["topRight"] = 2] = "topRight";
        Direction9[Direction9["right"] = 3] = "right";
        Direction9[Direction9["bottomRight"] = 4] = "bottomRight";
        Direction9[Direction9["bottom"] = 5] = "bottom";
        Direction9[Direction9["bottomLeft"] = 6] = "bottomLeft";
        Direction9[Direction9["left"] = 7] = "left";
        Direction9[Direction9["center"] = 8] = "center";
        Direction9[Direction9["top-left"] = 0] = "top-left";
        Direction9[Direction9["top-right"] = 2] = "top-right";
        Direction9[Direction9["bottom-right"] = 4] = "bottom-right";
        Direction9[Direction9["bottom-left"] = 6] = "bottom-left";
    })(exports.Direction9 || (exports.Direction9 = {}));
    const directionData = [ {
        x: 0,
        y: 0
    }, {
        x: .5,
        y: 0
    }, {
        x: 1,
        y: 0
    }, {
        x: 1,
        y: .5
    }, {
        x: 1,
        y: 1
    }, {
        x: .5,
        y: 1
    }, {
        x: 0,
        y: 1
    }, {
        x: 0,
        y: .5
    }, {
        x: .5,
        y: .5
    } ];
    directionData.forEach(item => item.type = "percent");
    const AroundHelper = {
        directionData: directionData,
        tempPoint: {},
        get: get$4,
        toPoint(around, box, to, onlyBoxSize, content, onlyContentSize) {
            const point = get$4(around);
            to.x = point.x;
            to.y = point.y;
            if (point.type === "percent") {
                to.x *= box.width;
                to.y *= box.height;
                if (content) {
                    if (!onlyContentSize) to.x -= content.x, to.y -= content.y;
                    if (point.x) to.x -= point.x === 1 ? content.width : point.x === .5 ? point.x * content.width : 0;
                    if (point.y) to.y -= point.y === 1 ? content.height : point.y === .5 ? point.y * content.height : 0;
                }
            }
            if (!onlyBoxSize) to.x += box.x, to.y += box.y;
        },
        getPoint(around, box, to, onlyBoxSize = true) {
            if (!to) to = {};
            AroundHelper.toPoint(around, box, to, onlyBoxSize);
            return to;
        }
    };
    function get$4(around) {
        return isString(around) ? directionData[exports.Direction9[around]] : around;
    }
    const {toPoint: toPoint$5} = AroundHelper;
    const AlignHelper = {
        toPoint(align, content, box, to, onlyBoxSize, onlyContentSize) {
            toPoint$5(align, box, to, onlyBoxSize, content, onlyContentSize);
        }
    };
    const {tempPointBounds: tempPointBounds$1, setPoint: setPoint$2, addPoint: addPoint$2, toBounds: toBounds$2} = TwoPointBoundsHelper;
    const {toOuterPoint: toOuterPoint$2} = MatrixHelper;
    const {float: float$2, fourNumber: fourNumber} = MathHelper;
    const {floor: floor$1, ceil: ceil$1} = Math;
    let right$1, bottom$1, boundsRight, boundsBottom;
    const point = {};
    const toPoint$4 = {};
    const tempBounds$3 = {};
    const BoundsHelper = {
        tempBounds: tempBounds$3,
        set(t, x = 0, y = 0, width = 0, height = 0) {
            t.x = x;
            t.y = y;
            t.width = width;
            t.height = height;
        },
        copy(t, bounds) {
            t.x = bounds.x;
            t.y = bounds.y;
            t.width = bounds.width;
            t.height = bounds.height;
        },
        copyAndSpread(t, bounds, spread, isShrink, side) {
            const {x: x, y: y, width: width, height: height} = bounds;
            if (isArray(spread)) {
                const four = fourNumber(spread);
                isShrink ? B.set(t, x + four[3], y + four[0], width - four[1] - four[3], height - four[2] - four[0]) : B.set(t, x - four[3], y - four[0], width + four[1] + four[3], height + four[2] + four[0]);
            } else {
                if (isShrink) spread = -spread;
                B.set(t, x - spread, y - spread, width + spread * 2, height + spread * 2);
            }
            if (side) {
                if (side === "width") t.y = y, t.height = height; else t.x = x, t.width = width;
            }
        },
        minX(t) {
            return t.width > 0 ? t.x : t.x + t.width;
        },
        minY(t) {
            return t.height > 0 ? t.y : t.y + t.height;
        },
        maxX(t) {
            return t.width > 0 ? t.x + t.width : t.x;
        },
        maxY(t) {
            return t.height > 0 ? t.y + t.height : t.y;
        },
        move(t, x, y) {
            t.x += x;
            t.y += y;
        },
        scroll(t, data) {
            t.x += data.scrollX;
            t.y += data.scrollY;
        },
        getByMove(t, x, y) {
            t = Object.assign({}, t);
            B.move(t, x, y);
            return t;
        },
        toOffsetOutBounds(t, to, offsetBounds) {
            if (!to) to = t; else copy$8(to, t);
            if (!offsetBounds) offsetBounds = t;
            to.offsetX = B.maxX(offsetBounds);
            to.offsetY = B.maxY(offsetBounds);
            B.move(to, -to.offsetX, -to.offsetY);
        },
        scale(t, scaleX, scaleY = scaleX, onlySize) {
            onlySize || PointHelper.scale(t, scaleX, scaleY);
            t.width *= scaleX;
            t.height *= scaleY;
        },
        scaleOf(t, origin, scaleX, scaleY = scaleX) {
            PointHelper.scaleOf(t, origin, scaleX, scaleY);
            t.width *= scaleX;
            t.height *= scaleY;
        },
        tempToOuterOf(t, matrix) {
            B.copy(tempBounds$3, t);
            B.toOuterOf(tempBounds$3, matrix);
            return tempBounds$3;
        },
        getOuterOf(t, matrix) {
            t = Object.assign({}, t);
            B.toOuterOf(t, matrix);
            return t;
        },
        toOuterOf(t, matrix, to) {
            to || (to = t);
            if (matrix.b === 0 && matrix.c === 0) {
                const {a: a, d: d, e: e, f: f} = matrix;
                if (a > 0) {
                    to.width = t.width * a;
                    to.x = e + t.x * a;
                } else {
                    to.width = t.width * -a;
                    to.x = e + t.x * a - to.width;
                }
                if (d > 0) {
                    to.height = t.height * d;
                    to.y = f + t.y * d;
                } else {
                    to.height = t.height * -d;
                    to.y = f + t.y * d - to.height;
                }
            } else {
                point.x = t.x;
                point.y = t.y;
                toOuterPoint$2(matrix, point, toPoint$4);
                setPoint$2(tempPointBounds$1, toPoint$4.x, toPoint$4.y);
                point.x = t.x + t.width;
                toOuterPoint$2(matrix, point, toPoint$4);
                addPoint$2(tempPointBounds$1, toPoint$4.x, toPoint$4.y);
                point.y = t.y + t.height;
                toOuterPoint$2(matrix, point, toPoint$4);
                addPoint$2(tempPointBounds$1, toPoint$4.x, toPoint$4.y);
                point.x = t.x;
                toOuterPoint$2(matrix, point, toPoint$4);
                addPoint$2(tempPointBounds$1, toPoint$4.x, toPoint$4.y);
                toBounds$2(tempPointBounds$1, to);
            }
        },
        toInnerOf(t, matrix, to) {
            to || (to = t);
            B.move(to, -matrix.e, -matrix.f);
            B.scale(to, 1 / matrix.a, 1 / matrix.d);
        },
        getFitMatrix(t, put, baseScale = 1) {
            const scale = Math.min(baseScale, B.getFitScale(t, put));
            return new Matrix(scale, 0, 0, scale, -put.x * scale, -put.y * scale);
        },
        getFitScale(t, put, isCoverMode) {
            const sw = t.width / put.width, sh = t.height / put.height;
            return isCoverMode ? Math.max(sw, sh) : Math.min(sw, sh);
        },
        put(t, put, align = "center", putScale = 1, changeSize = true, to) {
            to || (to = put);
            if (isString(putScale)) putScale = B.getFitScale(t, put, putScale === "cover");
            tempBounds$3.width = changeSize ? put.width *= putScale : put.width * putScale;
            tempBounds$3.height = changeSize ? put.height *= putScale : put.height * putScale;
            AlignHelper.toPoint(align, tempBounds$3, t, to, true, true);
        },
        getSpread(t, spread, side) {
            const n = {};
            B.copyAndSpread(n, t, spread, false, side);
            return n;
        },
        spread(t, spread, side) {
            B.copyAndSpread(t, t, spread, false, side);
        },
        shrink(t, shrink, side) {
            B.copyAndSpread(t, t, shrink, true, side);
        },
        ceil(t) {
            const {x: x, y: y} = t;
            t.x = floor$1(t.x);
            t.y = floor$1(t.y);
            t.width = x > t.x ? ceil$1(t.width + x - t.x) : ceil$1(t.width);
            t.height = y > t.y ? ceil$1(t.height + y - t.y) : ceil$1(t.height);
        },
        unsign(t) {
            if (t.width < 0) {
                t.x += t.width;
                t.width = -t.width;
            }
            if (t.height < 0) {
                t.y += t.height;
                t.height = -t.height;
            }
        },
        float(t, maxLength) {
            t.x = float$2(t.x, maxLength);
            t.y = float$2(t.y, maxLength);
            t.width = float$2(t.width, maxLength);
            t.height = float$2(t.height, maxLength);
        },
        add(t, bounds, isPoint) {
            right$1 = t.x + t.width;
            bottom$1 = t.y + t.height;
            boundsRight = bounds.x;
            boundsBottom = bounds.y;
            if (!isPoint) {
                boundsRight += bounds.width;
                boundsBottom += bounds.height;
            }
            right$1 = right$1 > boundsRight ? right$1 : boundsRight;
            bottom$1 = bottom$1 > boundsBottom ? bottom$1 : boundsBottom;
            t.x = t.x < bounds.x ? t.x : bounds.x;
            t.y = t.y < bounds.y ? t.y : bounds.y;
            t.width = right$1 - t.x;
            t.height = bottom$1 - t.y;
        },
        addList(t, list) {
            B.setListWithFn(t, list, undefined, true);
        },
        setList(t, list, addMode = false) {
            B.setListWithFn(t, list, undefined, addMode);
        },
        addListWithFn(t, list, boundsDataFn) {
            B.setListWithFn(t, list, boundsDataFn, true);
        },
        setListWithFn(t, list, boundsDataFn, addMode = false) {
            let bounds, first = true;
            for (let i = 0, len = list.length; i < len; i++) {
                bounds = boundsDataFn ? boundsDataFn(list[i], i) : list[i];
                if (bounds && (bounds.width || bounds.height)) {
                    if (first) {
                        first = false;
                        if (!addMode) copy$8(t, bounds);
                    } else {
                        add$2(t, bounds);
                    }
                }
            }
            if (first) B.reset(t);
        },
        setPoints(t, points) {
            points.forEach((point, index) => index === 0 ? setPoint$2(tempPointBounds$1, point.x, point.y) : addPoint$2(tempPointBounds$1, point.x, point.y));
            toBounds$2(tempPointBounds$1, t);
        },
        setPoint(t, point) {
            B.set(t, point.x, point.y);
        },
        addPoint(t, point) {
            add$2(t, point, true);
        },
        getPoints(t) {
            const {x: x, y: y, width: width, height: height} = t;
            return [ {
                x: x,
                y: y
            }, {
                x: x + width,
                y: y
            }, {
                x: x + width,
                y: y + height
            }, {
                x: x,
                y: y + height
            } ];
        },
        getPoint(t, around, onlyBoxSize = false, to) {
            return AroundHelper.getPoint(around, t, to, onlyBoxSize);
        },
        hitRadiusPoint(t, point, pointMatrix) {
            if (pointMatrix) point = PointHelper.tempToInnerRadiusPointOf(point, pointMatrix);
            return point.x >= t.x - point.radiusX && point.x <= t.x + t.width + point.radiusX && (point.y >= t.y - point.radiusY && point.y <= t.y + t.height + point.radiusY);
        },
        hitPoint(t, point, pointMatrix) {
            if (pointMatrix) point = PointHelper.tempToInnerOf(point, pointMatrix);
            return point.x >= t.x && point.x <= t.x + t.width && (point.y >= t.y && point.y <= t.y + t.height);
        },
        hit(t, other, otherMatrix) {
            if (otherMatrix) other = B.tempToOuterOf(other, otherMatrix);
            return !(t.y + t.height < other.y || other.y + other.height < t.y || t.x + t.width < other.x || other.x + other.width < t.x);
        },
        includes(t, other, otherMatrix) {
            if (otherMatrix) other = B.tempToOuterOf(other, otherMatrix);
            return t.x <= other.x && t.y <= other.y && t.x + t.width >= other.x + other.width && t.y + t.height >= other.y + other.height;
        },
        getIntersectData(t, other, otherMatrix) {
            if (otherMatrix) other = B.tempToOuterOf(other, otherMatrix);
            if (!B.hit(t, other)) return getBoundsData();
            let {x: x, y: y, width: width, height: height} = other;
            right$1 = x + width;
            bottom$1 = y + height;
            boundsRight = t.x + t.width;
            boundsBottom = t.y + t.height;
            x = x > t.x ? x : t.x;
            y = y > t.y ? y : t.y;
            right$1 = right$1 < boundsRight ? right$1 : boundsRight;
            bottom$1 = bottom$1 < boundsBottom ? bottom$1 : boundsBottom;
            width = right$1 - x;
            height = bottom$1 - y;
            return {
                x: x,
                y: y,
                width: width,
                height: height
            };
        },
        intersect(t, other, otherMatrix) {
            B.copy(t, B.getIntersectData(t, other, otherMatrix));
        },
        isSame(t, bounds) {
            return t.x === bounds.x && t.y === bounds.y && t.width === bounds.width && t.height === bounds.height;
        },
        isEmpty(t) {
            return t.x === 0 && t.y === 0 && t.width === 0 && t.height === 0;
        },
        hasSize(t) {
            return t.width && t.height;
        },
        reset(t) {
            B.set(t);
        }
    };
    const B = BoundsHelper;
    const {add: add$2, copy: copy$8} = B;
    class Bounds {
        get minX() {
            return BoundsHelper.minX(this);
        }
        get minY() {
            return BoundsHelper.minY(this);
        }
        get maxX() {
            return BoundsHelper.maxX(this);
        }
        get maxY() {
            return BoundsHelper.maxY(this);
        }
        constructor(x, y, width, height) {
            this.set(x, y, width, height);
        }
        set(x, y, width, height) {
            isObject(x) ? BoundsHelper.copy(this, x) : BoundsHelper.set(this, x, y, width, height);
            return this;
        }
        get() {
            const {x: x, y: y, width: width, height: height} = this;
            return {
                x: x,
                y: y,
                width: width,
                height: height
            };
        }
        clone() {
            return new Bounds(this);
        }
        move(x, y) {
            BoundsHelper.move(this, x, y);
            return this;
        }
        scale(scaleX, scaleY, onlySize) {
            BoundsHelper.scale(this, scaleX, scaleY, onlySize);
            return this;
        }
        scaleOf(origin, scaleX, scaleY) {
            BoundsHelper.scaleOf(this, origin, scaleX, scaleY);
            return this;
        }
        toOuterOf(matrix, to) {
            BoundsHelper.toOuterOf(this, matrix, to);
            return this;
        }
        toInnerOf(matrix, to) {
            BoundsHelper.toInnerOf(this, matrix, to);
            return this;
        }
        getFitMatrix(put, baseScale) {
            return BoundsHelper.getFitMatrix(this, put, baseScale);
        }
        put(put, align, putScale) {
            BoundsHelper.put(this, put, align, putScale);
        }
        spread(fourNumber, side) {
            BoundsHelper.spread(this, fourNumber, side);
            return this;
        }
        shrink(fourNumber, side) {
            BoundsHelper.shrink(this, fourNumber, side);
            return this;
        }
        ceil() {
            BoundsHelper.ceil(this);
            return this;
        }
        unsign() {
            BoundsHelper.unsign(this);
            return this;
        }
        float(maxLength) {
            BoundsHelper.float(this, maxLength);
            return this;
        }
        add(bounds) {
            BoundsHelper.add(this, bounds);
            return this;
        }
        addList(boundsList) {
            BoundsHelper.setList(this, boundsList, true);
            return this;
        }
        setList(boundsList) {
            BoundsHelper.setList(this, boundsList);
            return this;
        }
        addListWithFn(list, boundsDataFn) {
            BoundsHelper.setListWithFn(this, list, boundsDataFn, true);
            return this;
        }
        setListWithFn(list, boundsDataFn) {
            BoundsHelper.setListWithFn(this, list, boundsDataFn);
            return this;
        }
        setPoint(point) {
            BoundsHelper.setPoint(this, point);
            return this;
        }
        setPoints(points) {
            BoundsHelper.setPoints(this, points);
            return this;
        }
        addPoint(point) {
            BoundsHelper.addPoint(this, point);
            return this;
        }
        getPoints() {
            return BoundsHelper.getPoints(this);
        }
        getPoint(around, onlyBoxSize, to) {
            return BoundsHelper.getPoint(this, around, onlyBoxSize, to);
        }
        hitPoint(point, pointMatrix) {
            return BoundsHelper.hitPoint(this, point, pointMatrix);
        }
        hitRadiusPoint(point, pointMatrix) {
            return BoundsHelper.hitRadiusPoint(this, point, pointMatrix);
        }
        hit(bounds, boundsMatrix) {
            return BoundsHelper.hit(this, bounds, boundsMatrix);
        }
        includes(bounds, boundsMatrix) {
            return BoundsHelper.includes(this, bounds, boundsMatrix);
        }
        intersect(bounds, boundsMatrix) {
            BoundsHelper.intersect(this, bounds, boundsMatrix);
            return this;
        }
        getIntersect(bounds, boundsMatrix) {
            return new Bounds(BoundsHelper.getIntersectData(this, bounds, boundsMatrix));
        }
        isSame(bounds) {
            return BoundsHelper.isSame(this, bounds);
        }
        isEmpty() {
            return BoundsHelper.isEmpty(this);
        }
        reset() {
            BoundsHelper.reset(this);
        }
    }
    const tempBounds$2 = new Bounds;
    class AutoBounds {
        constructor(top, right, bottom, left, width, height) {
            isObject(top) ? this.copy(top) : this.set(top, right, bottom, left, width, height);
        }
        set(top = 0, right = 0, bottom = 0, left = 0, width = 0, height = 0) {
            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.left = left;
            this.width = width;
            this.height = height;
        }
        copy(autoSize) {
            const {top: top, right: right, bottom: bottom, left: left, width: width, height: height} = autoSize;
            this.set(top, right, bottom, left, width, height);
        }
        getBoundsFrom(parent) {
            const {top: top, right: right, bottom: bottom, left: left, width: width, height: height} = this;
            return new Bounds(left, top, width ? width : parent.width - left - right, height ? height : parent.height - top - bottom);
        }
    }
    const UnitConvertHelper = {
        number(value, percentRefer) {
            return isObject(value) ? value.type === "percent" ? value.value * percentRefer : value.value : value;
        }
    };
    const StringNumberMap = {
        0: 1,
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 1,
        ".": 1,
        e: 1,
        E: 1
    };
    const {floor: floor, max: max$3} = Math;
    const Platform = {
        toURL(text, fileType) {
            let url = encodeURIComponent(text);
            if (fileType === "text") url = "data:text/plain;charset=utf-8," + url; else if (fileType === "svg") url = "data:image/svg+xml," + url;
            return url;
        },
        image: {
            hitCanvasSize: 100,
            maxCacheSize: 2560 * 1600,
            maxPatternSize: 4096 * 2160,
            crossOrigin: "anonymous",
            isLarge(size, scaleX, scaleY, largeSize) {
                return size.width * size.height * (scaleX ? scaleX * scaleY : 1) > (largeSize || image$1.maxCacheSize);
            },
            isSuperLarge(size, scaleX, scaleY) {
                return image$1.isLarge(size, scaleX, scaleY, image$1.maxPatternSize);
            },
            getRealURL(url) {
                const {prefix: prefix, suffix: suffix} = image$1;
                if (suffix && !url.startsWith("data:") && !url.startsWith("blob:")) url += (url.includes("?") ? "&" : "?") + suffix;
                if (prefix && url[0] === "/") url = prefix + url;
                return url;
            },
            resize(view, width, height, xGap, yGap, clip, smooth, opacity, _filters, interlace) {
                const realWidth = max$3(floor(width + (xGap || 0)), 1), realHeight = max$3(floor(height + (yGap || 0)), 1);
                let interlaceX, interlaceY, interlaceOffset;
                if (interlace && (interlaceOffset = UnitConvertHelper.number(interlace.offset, interlace.type === "x" ? width : height))) interlace.type === "x" ? interlaceX = true : interlaceY = true;
                const canvas = Platform.origin.createCanvas(interlaceY ? realWidth * 2 : realWidth, interlaceX ? realHeight * 2 : realHeight);
                const ctx = canvas.getContext("2d");
                if (opacity) ctx.globalAlpha = opacity;
                ctx.imageSmoothingEnabled = smooth === false ? false : true;
                if (image$1.canUse(view)) {
                    if (clip) {
                        const scaleX = width / clip.width, scaleY = height / clip.height;
                        ctx.setTransform(scaleX, 0, 0, scaleY, -clip.x * scaleX, -clip.y * scaleY);
                        ctx.drawImage(view, 0, 0, view.width, view.height);
                    } else ctx.drawImage(view, 0, 0, width, height);
                    if (interlaceOffset) {
                        ctx.drawImage(canvas, 0, 0, realWidth, realHeight, interlaceX ? interlaceOffset - realWidth : realWidth, interlaceX ? realHeight : interlaceOffset - realHeight, realWidth, realHeight);
                        ctx.drawImage(canvas, 0, 0, realWidth, realHeight, interlaceX ? interlaceOffset : realWidth, interlaceX ? realHeight : interlaceOffset, realWidth, realHeight);
                    }
                }
                return canvas;
            },
            canUse(view) {
                return view && view.width && !view.__closed;
            },
            setPatternTransform(pattern, transform, paint) {
                try {
                    if (transform && pattern.setTransform) {
                        pattern.setTransform(transform);
                        transform = undefined;
                    }
                } catch (_a) {}
                if (paint) DataHelper.stintSet(paint, "transform", transform);
            }
        }
    };
    const {image: image$1} = Platform;
    const {randColor: randColor} = MathHelper;
    class Debug {
        constructor(name) {
            this.repeatMap = {};
            this.name = name;
        }
        static get(name) {
            return new Debug(name);
        }
        static set filter(name) {
            this.filterList = getNameList(name);
        }
        static set exclude(name) {
            this.excludeList = getNameList(name);
        }
        static drawRepaint(canvas, bounds) {
            const color = randColor();
            canvas.fillWorld(bounds, color.replace("1)", ".1)"));
            canvas.strokeWorld(bounds, color);
        }
        static drawBounds(leaf, canvas, _options) {
            const showHit = Debug.showBounds === "hit", w = leaf.__nowWorld, color = randColor();
            if (showHit) canvas.setWorld(w), leaf.__drawHitPath(canvas), canvas.fillStyle = color.replace("1)", ".2)"), 
            canvas.fill();
            canvas.resetTransform();
            canvas.setStroke(color, 2);
            showHit ? canvas.stroke() : canvas.strokeWorld(w, color);
        }
        log(...messages) {
            if (D$5.enable) {
                if (D$5.filterList.length && D$5.filterList.every(name => name !== this.name)) return;
                if (D$5.excludeList.length && D$5.excludeList.some(name => name === this.name)) return;
                console.log("%c" + this.name, "color:#21ae62", ...messages);
            }
        }
        tip(...messages) {
            if (D$5.enable) this.warn(...messages);
        }
        warn(...messages) {
            if (D$5.showWarn) console.warn(this.name, ...messages);
        }
        repeat(name, ...messages) {
            if (!this.repeatMap[name]) {
                this.warn("repeat:" + name, ...messages);
                this.repeatMap[name] = true;
            }
        }
        error(...messages) {
            try {
                throw new Error;
            } catch (e) {
                console.error(this.name, ...messages, e);
            }
        }
    }
    Debug.filterList = [];
    Debug.excludeList = [];
    Debug.showWarn = true;
    function getNameList(name) {
        if (!name) name = []; else if (isString(name)) name = [ name ];
        return name;
    }
    const D$5 = Debug;
    const debug$h = Debug.get("RunTime");
    const Run = {
        currentId: 0,
        currentName: "",
        idMap: {},
        nameMap: {},
        nameToIdMap: {},
        start(name, microsecond) {
            const id = IncrementId.create(IncrementId.RUNTIME);
            R$1.currentId = R$1.idMap[id] = microsecond ? performance.now() : Date.now();
            R$1.currentName = R$1.nameMap[id] = name;
            R$1.nameToIdMap[name] = id;
            return id;
        },
        end(id, microsecond) {
            const time = R$1.idMap[id], name = R$1.nameMap[id];
            const duration = microsecond ? (performance.now() - time) / 1e3 : Date.now() - time;
            R$1.idMap[id] = R$1.nameMap[id] = R$1.nameToIdMap[name] = undefined;
            debug$h.log(name, duration, "ms");
        },
        endOfName(name, microsecond) {
            const id = R$1.nameToIdMap[name];
            if (!isUndefined(id)) R$1.end(id, microsecond);
        }
    };
    const R$1 = Run;
    const check = [];
    const Plugin = {
        list: {},
        add(name, ...needPlugins) {
            this.list[name] = true;
            check.push(...needPlugins);
        },
        has(name, tip) {
            const rs = this.list[name];
            if (!rs && tip) this.need(name);
            return rs;
        },
        need(name) {
            console.error("please install and import plugin: " + (name.includes("-x") ? "" : "@leafer-in/") + name);
        }
    };
    setTimeout(() => check.forEach(name => Plugin.has(name, true)));
    const Creator = {
        editor(_options) {
            return Plugin.need("editor");
        }
    };
    const debug$g = Debug.get("UICreator");
    const UICreator = {
        list: {},
        register(UI) {
            const {__tag: tag} = UI.prototype;
            if (list$1[tag]) debug$g.repeat(tag);
            list$1[tag] = UI;
        },
        get(tag, data, x, y, width, height) {
            if (!list$1[tag]) {
                debug$g.warn("not register " + tag);
                return undefined;
            }
            const ui = new list$1[tag](data);
            if (!isUndefined(x)) {
                ui.x = x;
                if (y) ui.y = y;
                if (width) ui.width = width;
                if (height) ui.height = height;
            }
            return ui;
        }
    };
    const {list: list$1} = UICreator;
    const debug$f = Debug.get("EventCreator");
    const EventCreator = {
        nameList: {},
        register(Event) {
            let name;
            Object.keys(Event).forEach(key => {
                name = Event[key];
                if (isString(name)) nameList[name] && debug$f.repeat(name), nameList[name] = Event;
            });
        },
        changeName(oldName, newName) {
            const Event = nameList[oldName];
            if (Event) {
                const constName = Object.keys(Event).find(key => Event[key] === oldName);
                if (constName) {
                    Event[constName] = newName;
                    nameList[newName] = Event;
                }
            }
        },
        has(type) {
            return !!this.nameList[type];
        },
        get(type, ...params) {
            return new nameList[type](...params);
        }
    };
    const {nameList: nameList} = EventCreator;
    class CanvasManager {
        constructor() {
            this.list = [];
        }
        add(canvas) {
            canvas.manager = this;
            this.list.push(canvas);
        }
        get(size) {
            let old;
            const {list: list} = this;
            for (let i = 0, len = list.length; i < len; i++) {
                old = list[i];
                if (old.recycled && old.isSameSize(size)) {
                    old.recycled = false;
                    old.manager || (old.manager = this);
                    return old;
                }
            }
            const canvas = Creator.canvas(size);
            this.add(canvas);
            return canvas;
        }
        recycle(old) {
            old.recycled = true;
        }
        clearRecycled() {
            let canvas;
            const filter = [];
            for (let i = 0, len = this.list.length; i < len; i++) {
                canvas = this.list[i];
                canvas.recycled ? canvas.destroy() : filter.push(canvas);
            }
            this.list = filter;
        }
        clear() {
            this.list.forEach(item => {
                item.destroy();
            });
            this.list.length = 0;
        }
        destroy() {
            this.clear();
        }
    }
    function contextAttr(realName) {
        return (target, key) => {
            if (!realName) realName = key;
            const property = {
                get() {
                    return this.context[realName];
                },
                set(value) {
                    this.context[realName] = value;
                }
            };
            if (key === "strokeCap") property.set = function(value) {
                this.context[realName] = value === "none" ? "butt" : value;
            };
            Object.defineProperty(target, key, property);
        };
    }
    const contextMethodNameList = [];
    function contextMethod() {
        return (_target, key) => {
            contextMethodNameList.push(key);
        };
    }
    const emptyArray = [];
    class Canvas {
        set blendMode(value) {
            if (value === "normal") value = "source-over";
            this.context.globalCompositeOperation = value;
        }
        get blendMode() {
            return this.context.globalCompositeOperation;
        }
        set dashPattern(value) {
            this.context.setLineDash(value || emptyArray);
        }
        get dashPattern() {
            return this.context.getLineDash();
        }
        __bindContext() {
            let method;
            contextMethodNameList.forEach(name => {
                method = this.context[name];
                if (method) this[name] = method.bind(this.context);
            });
            this.textBaseline = "alphabetic";
        }
        setTransform(_a, _b, _c, _d, _e, _f) {}
        resetTransform() {}
        getTransform() {
            return void 0;
        }
        save() {}
        restore() {}
        transform(a, b, c, d, e, f) {
            if (isObject(a)) {
                this.context.transform(a.a, a.b, a.c, a.d, a.e, a.f);
            } else {
                this.context.transform(a, b, c, d, e, f);
            }
        }
        translate(_x, _y) {}
        scale(_x, _y) {}
        rotate(_angle) {}
        fill(_path2d, _rule) {}
        stroke(_path2d) {}
        clip(_path2d, _rule) {}
        fillRect(_x, _y, _width, _height) {}
        strokeRect(_x, _y, _width, _height) {}
        clearRect(_x, _y, _width, _height) {}
        drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
            switch (arguments.length) {
              case 9:
                if (sx < 0) {
                    const d = -sx / sw * dw;
                    sw += sx;
                    sx = 0;
                    dx += d;
                    dw -= d;
                }
                if (sy < 0) {
                    const d = -sy / sh * dh;
                    sh += sy;
                    sy = 0;
                    dy += d;
                    dh -= d;
                }
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
                break;

              case 5:
                this.context.drawImage(image, sx, sy, sw, sh);
                break;

              case 3:
                this.context.drawImage(image, sx, sy);
            }
        }
        beginPath() {}
        moveTo(_x, _y) {}
        lineTo(_x, _y) {}
        bezierCurveTo(_cp1x, _cp1y, _cp2x, _cp2y, _x, _y) {}
        quadraticCurveTo(_cpx, _cpy, _x, _y) {}
        closePath() {}
        arc(_x, _y, _radius, _startAngle, _endAngle, _anticlockwise) {}
        arcTo(_x1, _y1, _x2, _y2, _radius) {}
        ellipse(_x, _y, _radiusX, _radiusY, _rotation, _startAngle, _endAngle, _anticlockwise) {}
        rect(_x, _y, _width, _height) {}
        roundRect(_x, _y, _width, _height, _radius) {}
        createConicGradient(_startAngle, _x, _y) {
            return void 0;
        }
        createLinearGradient(_x0, _y0, _x1, _y1) {
            return void 0;
        }
        createPattern(_image, _repetition) {
            return void 0;
        }
        createRadialGradient(_x0, _y0, _r0, _x1, _y1, _r1) {
            return void 0;
        }
        fillText(_text, _x, _y, _maxWidth) {}
        measureText(_text) {
            return void 0;
        }
        strokeText(_text, _x, _y, _maxWidth) {}
        destroy() {
            this.context = null;
        }
    }
    __decorate([ contextAttr("imageSmoothingEnabled") ], Canvas.prototype, "smooth", void 0);
    __decorate([ contextAttr("imageSmoothingQuality") ], Canvas.prototype, "smoothLevel", void 0);
    __decorate([ contextAttr("globalAlpha") ], Canvas.prototype, "opacity", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "fillStyle", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "strokeStyle", void 0);
    __decorate([ contextAttr("lineWidth") ], Canvas.prototype, "strokeWidth", void 0);
    __decorate([ contextAttr("lineCap") ], Canvas.prototype, "strokeCap", void 0);
    __decorate([ contextAttr("lineJoin") ], Canvas.prototype, "strokeJoin", void 0);
    __decorate([ contextAttr("lineDashOffset") ], Canvas.prototype, "dashOffset", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "miterLimit", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "shadowBlur", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "shadowColor", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "shadowOffsetX", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "shadowOffsetY", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "filter", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "font", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "fontKerning", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "fontStretch", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "fontVariantCaps", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "textAlign", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "textBaseline", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "textRendering", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "wordSpacing", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "letterSpacing", void 0);
    __decorate([ contextAttr() ], Canvas.prototype, "direction", void 0);
    __decorate([ contextMethod() ], Canvas.prototype, "setTransform", null);
    __decorate([ contextMethod() ], Canvas.prototype, "resetTransform", null);
    __decorate([ contextMethod() ], Canvas.prototype, "getTransform", null);
    __decorate([ contextMethod() ], Canvas.prototype, "save", null);
    __decorate([ contextMethod() ], Canvas.prototype, "restore", null);
    __decorate([ contextMethod() ], Canvas.prototype, "translate", null);
    __decorate([ contextMethod() ], Canvas.prototype, "scale", null);
    __decorate([ contextMethod() ], Canvas.prototype, "rotate", null);
    __decorate([ contextMethod() ], Canvas.prototype, "fill", null);
    __decorate([ contextMethod() ], Canvas.prototype, "stroke", null);
    __decorate([ contextMethod() ], Canvas.prototype, "clip", null);
    __decorate([ contextMethod() ], Canvas.prototype, "fillRect", null);
    __decorate([ contextMethod() ], Canvas.prototype, "strokeRect", null);
    __decorate([ contextMethod() ], Canvas.prototype, "clearRect", null);
    __decorate([ contextMethod() ], Canvas.prototype, "beginPath", null);
    __decorate([ contextMethod() ], Canvas.prototype, "moveTo", null);
    __decorate([ contextMethod() ], Canvas.prototype, "lineTo", null);
    __decorate([ contextMethod() ], Canvas.prototype, "bezierCurveTo", null);
    __decorate([ contextMethod() ], Canvas.prototype, "quadraticCurveTo", null);
    __decorate([ contextMethod() ], Canvas.prototype, "closePath", null);
    __decorate([ contextMethod() ], Canvas.prototype, "arc", null);
    __decorate([ contextMethod() ], Canvas.prototype, "arcTo", null);
    __decorate([ contextMethod() ], Canvas.prototype, "ellipse", null);
    __decorate([ contextMethod() ], Canvas.prototype, "rect", null);
    __decorate([ contextMethod() ], Canvas.prototype, "roundRect", null);
    __decorate([ contextMethod() ], Canvas.prototype, "createConicGradient", null);
    __decorate([ contextMethod() ], Canvas.prototype, "createLinearGradient", null);
    __decorate([ contextMethod() ], Canvas.prototype, "createPattern", null);
    __decorate([ contextMethod() ], Canvas.prototype, "createRadialGradient", null);
    __decorate([ contextMethod() ], Canvas.prototype, "fillText", null);
    __decorate([ contextMethod() ], Canvas.prototype, "measureText", null);
    __decorate([ contextMethod() ], Canvas.prototype, "strokeText", null);
    const {copy: copy$7, multiplyParent: multiplyParent$4, pixelScale: pixelScale} = MatrixHelper, {round: round$1} = Math, tempPixelBounds = new Bounds, tempPixelBounds2 = new Bounds;
    const minSize = {
        width: 1,
        height: 1,
        pixelRatio: 1
    };
    const canvasSizeAttrs = [ "width", "height", "pixelRatio" ];
    class LeaferCanvasBase extends Canvas {
        get width() {
            return this.size.width;
        }
        get height() {
            return this.size.height;
        }
        get pixelRatio() {
            return this.size.pixelRatio;
        }
        get pixelWidth() {
            return this.width * this.pixelRatio || 0;
        }
        get pixelHeight() {
            return this.height * this.pixelRatio || 0;
        }
        get pixelSnap() {
            return this.config.pixelSnap;
        }
        set pixelSnap(value) {
            this.config.pixelSnap = value;
        }
        get allowBackgroundColor() {
            return this.view && this.parentView;
        }
        constructor(config, manager) {
            super();
            this.size = {};
            this.worldTransform = {};
            if (!config) config = minSize;
            this.manager = manager;
            this.innerId = IncrementId.create(IncrementId.CANVAS);
            const {width: width, height: height, pixelRatio: pixelRatio} = config;
            this.autoLayout = !width || !height;
            this.size.pixelRatio = pixelRatio || Platform.devicePixelRatio;
            this.config = config;
            this.init();
        }
        init() {}
        __createContext() {
            const {view: view} = this;
            const {contextSettings: contextSettings} = this.config;
            this.context = contextSettings ? view.getContext("2d", contextSettings) : view.getContext("2d");
            this.__bindContext();
        }
        export(_filename, _options) {
            return undefined;
        }
        toBlob(_type, _quality) {
            return undefined;
        }
        toDataURL(_type, _quality) {
            return undefined;
        }
        saveAs(_filename, _quality) {
            return undefined;
        }
        resize(size, safeResize = true) {
            if (this.isSameSize(size)) return;
            let takeCanvas;
            if (this.context && !this.unreal && safeResize && this.width) {
                takeCanvas = this.getSameCanvas();
                takeCanvas.copyWorld(this);
            }
            const s = this.size;
            DataHelper.copyAttrs(s, size, canvasSizeAttrs);
            canvasSizeAttrs.forEach(key => s[key] || (s[key] = 1));
            this.bounds = new Bounds(0, 0, this.width, this.height);
            this.updateViewSize();
            this.updateClientBounds();
            if (this.context) {
                this.smooth = this.config.smooth;
                if (!this.unreal && takeCanvas) {
                    this.clearWorld(takeCanvas.bounds);
                    this.copyWorld(takeCanvas);
                    takeCanvas.recycle();
                }
            }
        }
        updateViewSize() {}
        updateClientBounds() {}
        getClientBounds(update) {
            if (update) this.updateClientBounds();
            return this.clientBounds || this.bounds;
        }
        startAutoLayout(_autoBounds, _listener) {}
        stopAutoLayout() {}
        setCursor(_cursor) {}
        setWorld(matrix, parentMatrix) {
            const {pixelRatio: pixelRatio, pixelSnap: pixelSnap} = this, w = this.worldTransform;
            if (parentMatrix) multiplyParent$4(matrix, parentMatrix, w);
            pixelScale(matrix, pixelRatio, w);
            if (pixelSnap && !matrix.ignorePixelSnap) {
                if (matrix.half && matrix.half * pixelRatio % 2) w.e = round$1(w.e - .5) + .5, w.f = round$1(w.f - .5) + .5; else w.e = round$1(w.e), 
                w.f = round$1(w.f);
            }
            this.setTransform(w.a, w.b, w.c, w.d, w.e, w.f);
        }
        useWorldTransform(worldTransform) {
            if (worldTransform) this.worldTransform = worldTransform;
            const w = this.worldTransform;
            if (w) this.setTransform(w.a, w.b, w.c, w.d, w.e, w.f);
        }
        setStroke(color, strokeWidth, options, childOptions) {
            if (strokeWidth) this.strokeWidth = strokeWidth;
            if (color) this.strokeStyle = color;
            if (options) this.setStrokeOptions(options, childOptions);
        }
        setStrokeOptions(options, childOptions) {
            let {strokeCap: strokeCap, strokeJoin: strokeJoin, dashPattern: dashPattern, dashOffset: dashOffset, miterLimit: miterLimit} = options;
            if (childOptions) {
                if (childOptions.strokeCap) strokeCap = childOptions.strokeCap;
                if (childOptions.strokeJoin) strokeJoin = childOptions.strokeJoin;
                if (!isUndefined(childOptions.dashPattern)) dashPattern = childOptions.dashPattern;
                if (!isUndefined(childOptions.dashOffset)) dashOffset = childOptions.dashOffset;
                if (childOptions.miterLimit) miterLimit = childOptions.miterLimit;
            }
            this.strokeCap = strokeCap;
            this.strokeJoin = strokeJoin;
            this.dashPattern = dashPattern;
            this.dashOffset = dashOffset;
            this.miterLimit = miterLimit;
        }
        saveBlendMode(blendMode) {
            this.savedBlendMode = this.blendMode;
            this.blendMode = blendMode;
        }
        restoreBlendMode() {
            this.blendMode = this.savedBlendMode;
        }
        hitFill(_point, _fillRule) {
            return true;
        }
        hitStroke(_point, _strokeWidth) {
            return true;
        }
        hitPixel(_radiusPoint, _offset, _scale = 1) {
            return true;
        }
        setWorldShadow(x, y, blur, color) {
            const {pixelRatio: pixelRatio} = this;
            this.shadowOffsetX = x * pixelRatio;
            this.shadowOffsetY = y * pixelRatio;
            this.shadowBlur = blur * pixelRatio;
            this.shadowColor = color || "black";
        }
        setWorldBlur(blur) {
            const {pixelRatio: pixelRatio} = this;
            this.filter = `blur(${blur * pixelRatio}px)`;
        }
        copyWorld(canvas, from, to, blendMode, ceilPixel) {
            if (blendMode) this.blendMode = blendMode;
            if (from) {
                this.setTempPixelBounds(from, ceilPixel);
                if (!to) to = tempPixelBounds; else this.setTempPixelBounds2(to, ceilPixel), to = tempPixelBounds2;
                this.drawImage(canvas.view, tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height, to.x, to.y, to.width, to.height);
            } else {
                this.drawImage(canvas.view, 0, 0);
            }
            if (blendMode) this.blendMode = "source-over";
        }
        copyWorldToInner(canvas, fromWorld, toInnerBounds, blendMode, ceilPixel) {
            if (fromWorld.b || fromWorld.c) {
                this.save();
                this.resetTransform();
                this.copyWorld(canvas, fromWorld, BoundsHelper.tempToOuterOf(toInnerBounds, fromWorld), blendMode, ceilPixel);
                this.restore();
            } else {
                if (blendMode) this.blendMode = blendMode;
                this.setTempPixelBounds(fromWorld, ceilPixel);
                this.drawImage(canvas.view, tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height, toInnerBounds.x, toInnerBounds.y, toInnerBounds.width, toInnerBounds.height);
                if (blendMode) this.blendMode = "source-over";
            }
        }
        copyWorldByReset(canvas, from, to, blendMode, onlyResetTransform, ceilPixel) {
            this.resetTransform();
            this.copyWorld(canvas, from, to, blendMode, ceilPixel);
            if (!onlyResetTransform) this.useWorldTransform();
        }
        useGrayscaleAlpha(bounds) {
            this.setTempPixelBounds(bounds, true, true);
            if (!tempPixelBounds.width || !tempPixelBounds.height) return;
            let alpha, pixel;
            const {context: context} = this, imageData = context.getImageData(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height), {data: data} = imageData;
            for (let i = 0, len = data.length; i < len; i += 4) {
                pixel = data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114;
                if (alpha = data[i + 3]) data[i + 3] = alpha === 255 ? pixel : alpha * (pixel / 255);
            }
            context.putImageData(imageData, tempPixelBounds.x, tempPixelBounds.y);
        }
        useMask(maskCanvas, fromBounds, toBounds) {
            this.copyWorld(maskCanvas, fromBounds, toBounds, "destination-in");
        }
        useEraser(eraserCanvas, fromBounds, toBounds) {
            this.copyWorld(eraserCanvas, fromBounds, toBounds, "destination-out");
        }
        fillWorld(bounds, color, blendMode, ceilPixel) {
            if (blendMode) this.blendMode = blendMode;
            this.fillStyle = color;
            this.setTempPixelBounds(bounds, ceilPixel);
            this.fillRect(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height);
            if (blendMode) this.blendMode = "source-over";
        }
        strokeWorld(bounds, color, blendMode, ceilPixel) {
            if (blendMode) this.blendMode = blendMode;
            this.strokeStyle = color;
            this.setTempPixelBounds(bounds, ceilPixel);
            this.strokeRect(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height);
            if (blendMode) this.blendMode = "source-over";
        }
        clipWorld(bounds, ceilPixel = true) {
            this.beginPath();
            this.setTempPixelBounds(bounds, ceilPixel);
            this.rect(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height);
            this.clip();
        }
        clipUI(ruleData) {
            ruleData.windingRule ? this.clip(ruleData.windingRule) : this.clip();
        }
        clearWorld(bounds, ceilPixel = true) {
            this.setTempPixelBounds(bounds, ceilPixel);
            this.clearRect(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height);
        }
        clear() {
            const {pixelRatio: pixelRatio} = this;
            this.clearRect(0, 0, this.width * pixelRatio + 2, this.height * pixelRatio + 2);
        }
        setTempPixelBounds(bounds, ceil, intersect) {
            this.copyToPixelBounds(tempPixelBounds, bounds, ceil, intersect);
        }
        setTempPixelBounds2(bounds, ceil, intersect) {
            this.copyToPixelBounds(tempPixelBounds2, bounds, ceil, intersect);
        }
        copyToPixelBounds(pixelBounds, bounds, ceil, intersect) {
            pixelBounds.set(bounds);
            if (intersect) pixelBounds.intersect(this.bounds);
            pixelBounds.scale(this.pixelRatio);
            if (ceil) pixelBounds.ceil();
        }
        isSameSize(size) {
            return this.width === size.width && this.height === size.height && (!size.pixelRatio || this.pixelRatio === size.pixelRatio);
        }
        getSameCanvas(useSameWorldTransform, useSameSmooth) {
            const {size: size, pixelSnap: pixelSnap} = this, canvas = this.manager ? this.manager.get(size) : Creator.canvas(Object.assign({}, size));
            canvas.save();
            if (useSameWorldTransform) copy$7(canvas.worldTransform, this.worldTransform), canvas.useWorldTransform();
            if (useSameSmooth) canvas.smooth = this.smooth;
            canvas.pixelSnap !== pixelSnap && (canvas.pixelSnap = pixelSnap);
            return canvas;
        }
        recycle(clearBounds) {
            if (!this.recycled) {
                this.restore();
                clearBounds ? this.clearWorld(clearBounds) : this.clear();
                this.manager ? this.manager.recycle(this) : this.destroy();
            }
        }
        updateRender(_bounds) {}
        unrealCanvas() {}
        destroy() {
            this.manager = this.view = this.parentView = null;
        }
    }
    const PathHelper = {
        creator: {},
        parse(_pathString, _curveMode) {
            return undefined;
        },
        convertToCanvasData(_old, _curveMode) {
            return undefined;
        }
    };
    const CanvasCommandOnlyMap = {
        N: 21,
        D: 22,
        X: 23,
        G: 24,
        F: 25,
        O: 26,
        P: 27,
        U: 28
    };
    const PathCommandMap = Object.assign({
        M: 1,
        m: 10,
        L: 2,
        l: 20,
        H: 3,
        h: 30,
        V: 4,
        v: 40,
        C: 5,
        c: 50,
        S: 6,
        s: 60,
        Q: 7,
        q: 70,
        T: 8,
        t: 80,
        A: 9,
        a: 90,
        Z: 11,
        z: 11,
        R: 12
    }, CanvasCommandOnlyMap);
    const PathCommandLengthMap = {
        M: 3,
        m: 3,
        L: 3,
        l: 3,
        H: 2,
        h: 2,
        V: 2,
        v: 2,
        C: 7,
        c: 7,
        S: 5,
        s: 5,
        Q: 5,
        q: 5,
        T: 3,
        t: 3,
        A: 8,
        a: 8,
        Z: 1,
        z: 1,
        N: 5,
        D: 9,
        X: 6,
        G: 9,
        F: 5,
        O: 7,
        P: 4,
        U: 6
    };
    const NeedConvertToCanvasCommandMap = {
        m: 10,
        l: 20,
        H: 3,
        h: 30,
        V: 4,
        v: 40,
        c: 50,
        S: 6,
        s: 60,
        q: 70,
        T: 8,
        t: 80,
        A: 9,
        a: 90
    };
    const NeedConvertToCurveCommandMap = Object.assign(Object.assign({}, NeedConvertToCanvasCommandMap), CanvasCommandOnlyMap);
    const P$4 = PathCommandMap;
    const PathNumberCommandMap = {};
    for (let key in P$4) {
        PathNumberCommandMap[P$4[key]] = key;
    }
    const PathNumberCommandLengthMap = {};
    for (let key in P$4) {
        PathNumberCommandLengthMap[P$4[key]] = PathCommandLengthMap[key];
    }
    const RectHelper = {
        drawRoundRect(drawer, x, y, width, height, cornerRadius) {
            const data = MathHelper.fourNumber(cornerRadius, Math.min(width / 2, height / 2));
            const right = x + width;
            const bottom = y + height;
            data[0] ? drawer.moveTo(x + data[0], y) : drawer.moveTo(x, y);
            data[1] ? drawer.arcTo(right, y, right, bottom, data[1]) : drawer.lineTo(right, y);
            data[2] ? drawer.arcTo(right, bottom, x, bottom, data[2]) : drawer.lineTo(right, bottom);
            data[3] ? drawer.arcTo(x, bottom, x, y, data[3]) : drawer.lineTo(x, bottom);
            data[0] ? drawer.arcTo(x, y, right, y, data[0]) : drawer.lineTo(x, y);
        }
    };
    const {sin: sin$3, cos: cos$3, hypot: hypot, atan2: atan2$1, ceil: ceil, abs: abs$5, PI: PI$2, sqrt: sqrt$1, pow: pow} = Math;
    const {setPoint: setPoint$1, addPoint: addPoint$1} = TwoPointBoundsHelper;
    const {set: set$2, toNumberPoints: toNumberPoints} = PointHelper;
    const {M: M$5, L: L$6, C: C$4, Q: Q$4, Z: Z$5} = PathCommandMap;
    const tempPoint$3 = {};
    const BezierHelper = {
        points(data, originPoints, curve, close) {
            let points = toNumberPoints(originPoints);
            data.push(M$5, points[0], points[1]);
            if (curve && points.length > 5) {
                let aX, aY, bX, bY, cX, cY, c1X, c1Y, c2X, c2Y;
                let baX, baY, ba, cb, d, len = points.length;
                const t = curve === true ? .5 : curve;
                if (close) {
                    points = [ points[len - 2], points[len - 1], ...points, points[0], points[1], points[2], points[3] ];
                    len = points.length;
                }
                for (let i = 2; i < len - 2; i += 2) {
                    aX = points[i - 2];
                    aY = points[i - 1];
                    bX = points[i];
                    bY = points[i + 1];
                    cX = points[i + 2];
                    cY = points[i + 3];
                    baX = bX - aX;
                    baY = bY - aY;
                    ba = sqrt$1(pow(baX, 2) + pow(baY, 2));
                    cb = sqrt$1(pow(cX - bX, 2) + pow(cY - bY, 2));
                    if (!ba && !cb) continue;
                    d = ba + cb;
                    ba = t * ba / d;
                    cb = t * cb / d;
                    cX -= aX;
                    cY -= aY;
                    c1X = bX - ba * cX;
                    c1Y = bY - ba * cY;
                    if (i === 2) {
                        if (!close) data.push(Q$4, c1X, c1Y, bX, bY);
                    } else {
                        if (baX || baY) data.push(C$4, c2X, c2Y, c1X, c1Y, bX, bY);
                    }
                    c2X = bX + cb * cX;
                    c2Y = bY + cb * cY;
                }
                if (!close) data.push(Q$4, c2X, c2Y, points[len - 2], points[len - 1]);
            } else {
                for (let i = 2, len = points.length; i < len; i += 2) {
                    data.push(L$6, points[i], points[i + 1]);
                }
            }
            if (close) data.push(Z$5);
        },
        rect(data, x, y, width, height) {
            PathHelper.creator.path = data;
            PathHelper.creator.moveTo(x, y).lineTo(x + width, y).lineTo(x + width, y + height).lineTo(x, y + height).lineTo(x, y);
        },
        roundRect(data, x, y, width, height, radius) {
            PathHelper.creator.path = [];
            RectHelper.drawRoundRect(PathHelper.creator, x, y, width, height, radius);
            data.push(...PathHelper.convertToCanvasData(PathHelper.creator.path, true));
        },
        arcTo(data, fromX, fromY, x1, y1, toX, toY, radius, setPointBounds, setEndPoint, setStartPoint) {
            const BAx = x1 - fromX;
            const BAy = y1 - fromY;
            const CBx = toX - x1;
            const CBy = toY - y1;
            let startRadian = atan2$1(BAy, BAx);
            let endRadian = atan2$1(CBy, CBx);
            const lenBA = hypot(BAx, BAy);
            const lenCB = hypot(CBx, CBy);
            let totalRadian = endRadian - startRadian;
            if (totalRadian < 0) totalRadian += PI2;
            if (lenBA < 1e-12 || lenCB < 1e-12 || totalRadian < 1e-12 || abs$5(totalRadian - PI$2) < 1e-12) {
                if (data) data.push(L$6, x1, y1);
                if (setPointBounds) {
                    setPoint$1(setPointBounds, fromX, fromY);
                    addPoint$1(setPointBounds, x1, y1);
                }
                if (setStartPoint) set$2(setStartPoint, fromX, fromY);
                if (setEndPoint) set$2(setEndPoint, x1, y1);
                return;
            }
            const anticlockwise = BAx * CBy - CBx * BAy < 0;
            const sign = anticlockwise ? -1 : 1;
            const c = radius / cos$3(totalRadian / 2);
            const centerX = x1 + c * cos$3(startRadian + totalRadian / 2 + PI_2 * sign);
            const centerY = y1 + c * sin$3(startRadian + totalRadian / 2 + PI_2 * sign);
            startRadian -= PI_2 * sign;
            endRadian -= PI_2 * sign;
            return ellipse$6(data, centerX, centerY, radius, radius, 0, startRadian / OneRadian, endRadian / OneRadian, anticlockwise, setPointBounds, setEndPoint, setStartPoint);
        },
        arc(data, x, y, radius, startAngle, endAngle, anticlockwise, setPointBounds, setEndPoint, setStartPoint) {
            return ellipse$6(data, x, y, radius, radius, 0, startAngle, endAngle, anticlockwise, setPointBounds, setEndPoint, setStartPoint);
        },
        ellipse(data, cx, cy, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise, setPointBounds, setEndPoint, setStartPoint) {
            const rotationRadian = rotation * OneRadian;
            const rotationSin = sin$3(rotationRadian);
            const rotationCos = cos$3(rotationRadian);
            let startRadian = startAngle * OneRadian;
            let endRadian = endAngle * OneRadian;
            if (startRadian > PI$2) startRadian -= PI2;
            if (endRadian < 0) endRadian += PI2;
            let totalRadian = endRadian - startRadian;
            if (totalRadian < 0) totalRadian += PI2; else if (totalRadian > PI2) totalRadian -= PI2;
            if (anticlockwise) {
                const closedAngle = abs$5(endAngle - startAngle) === 360;
                if (closedAngle) totalRadian = -PI2; else totalRadian -= PI2;
            }
            const parts = ceil(abs$5(totalRadian / PI_2));
            const partRadian = totalRadian / parts;
            const partRadian4Sin = sin$3(partRadian / 4);
            const control = 8 / 3 * partRadian4Sin * partRadian4Sin / sin$3(partRadian / 2);
            endRadian = startRadian + partRadian;
            let startCos = cos$3(startRadian);
            let startSin = sin$3(startRadian);
            let endCos, endSin;
            let x, y, x1, y1, x2, y2;
            let startX = x = rotationCos * radiusX * startCos - rotationSin * radiusY * startSin;
            let startY = y = rotationSin * radiusX * startCos + rotationCos * radiusY * startSin;
            let fromX = cx + x, fromY = cy + y;
            if (data) data.push(data.length ? L$6 : M$5, fromX, fromY);
            if (setPointBounds) setPoint$1(setPointBounds, fromX, fromY);
            if (setStartPoint) set$2(setStartPoint, fromX, fromY);
            for (let i = 0; i < parts; i++) {
                endCos = cos$3(endRadian);
                endSin = sin$3(endRadian);
                x = rotationCos * radiusX * endCos - rotationSin * radiusY * endSin;
                y = rotationSin * radiusX * endCos + rotationCos * radiusY * endSin;
                x1 = cx + startX - control * (rotationCos * radiusX * startSin + rotationSin * radiusY * startCos);
                y1 = cy + startY - control * (rotationSin * radiusX * startSin - rotationCos * radiusY * startCos);
                x2 = cx + x + control * (rotationCos * radiusX * endSin + rotationSin * radiusY * endCos);
                y2 = cy + y + control * (rotationSin * radiusX * endSin - rotationCos * radiusY * endCos);
                if (data) data.push(C$4, x1, y1, x2, y2, cx + x, cy + y);
                if (setPointBounds) toTwoPointBounds$1(cx + startX, cy + startY, x1, y1, x2, y2, cx + x, cy + y, setPointBounds, true);
                startX = x;
                startY = y;
                startCos = endCos;
                startSin = endSin;
                startRadian = endRadian;
                endRadian += partRadian;
            }
            if (setEndPoint) set$2(setEndPoint, cx + x, cy + y);
        },
        quadraticCurveTo(data, fromX, fromY, x1, y1, toX, toY) {
            data.push(C$4, (fromX + 2 * x1) / 3, (fromY + 2 * y1) / 3, (toX + 2 * x1) / 3, (toY + 2 * y1) / 3, toX, toY);
        },
        toTwoPointBoundsByQuadraticCurve(fromX, fromY, x1, y1, toX, toY, pointBounds, addMode) {
            toTwoPointBounds$1(fromX, fromY, (fromX + 2 * x1) / 3, (fromY + 2 * y1) / 3, (toX + 2 * x1) / 3, (toY + 2 * y1) / 3, toX, toY, pointBounds, addMode);
        },
        toTwoPointBounds(fromX, fromY, x1, y1, x2, y2, toX, toY, pointBounds, addMode) {
            const tList = [];
            let a, b, c, t, t1, t2, v, sqrtV;
            let f = fromX, z1 = x1, z2 = x2, o = toX;
            for (let i = 0; i < 2; ++i) {
                if (i == 1) {
                    f = fromY, z1 = y1, z2 = y2, o = toY;
                }
                a = -3 * f + 9 * z1 - 9 * z2 + 3 * o;
                b = 6 * f - 12 * z1 + 6 * z2;
                c = 3 * z1 - 3 * f;
                if (Math.abs(a) < 1e-12) {
                    if (Math.abs(b) < 1e-12) continue;
                    t = -c / b;
                    if (0 < t && t < 1) tList.push(t);
                    continue;
                }
                v = b * b - 4 * c * a;
                sqrtV = Math.sqrt(v);
                if (v < 0) continue;
                t1 = (-b + sqrtV) / (2 * a);
                if (0 < t1 && t1 < 1) tList.push(t1);
                t2 = (-b - sqrtV) / (2 * a);
                if (0 < t2 && t2 < 1) tList.push(t2);
            }
            addMode ? addPoint$1(pointBounds, fromX, fromY) : setPoint$1(pointBounds, fromX, fromY);
            addPoint$1(pointBounds, toX, toY);
            for (let i = 0, len = tList.length; i < len; i++) {
                getPointAndSet(tList[i], fromX, fromY, x1, y1, x2, y2, toX, toY, tempPoint$3);
                addPoint$1(pointBounds, tempPoint$3.x, tempPoint$3.y);
            }
        },
        getPointAndSet(t, fromX, fromY, x1, y1, x2, y2, toX, toY, setPoint) {
            const o = 1 - t, a = o * o * o, b = 3 * o * o * t, c = 3 * o * t * t, d = t * t * t;
            setPoint.x = a * fromX + b * x1 + c * x2 + d * toX;
            setPoint.y = a * fromY + b * y1 + c * y2 + d * toY;
        },
        getPoint(t, fromX, fromY, x1, y1, x2, y2, toX, toY) {
            const point = {};
            getPointAndSet(t, fromX, fromY, x1, y1, x2, y2, toX, toY, point);
            return point;
        },
        getDerivative(t, fromV, v1, v2, toV) {
            const o = 1 - t;
            return 3 * o * o * (v1 - fromV) + 6 * o * t * (v2 - v1) + 3 * t * t * (toV - v2);
        },
        cut(t, fromX, fromY, x1, y1, x2, y2, toX, toY) {
            if (t <= 0) return {
                left: null,
                right: [ x1, y1, x2, y2, toX, toY ]
            }; else if (t >= 1) return {
                left: [ x1, y1, x2, y2, toX, toY ],
                right: null
            };
            const u = 1 - t;
            const leftX1 = fromX * u + x1 * t;
            const leftY1 = fromY * u + y1 * t;
            const P12x = x1 * u + x2 * t;
            const P12y = y1 * u + y2 * t;
            const rightX2 = x2 * u + toX * t;
            const rightY2 = y2 * u + toY * t;
            const leftX2 = leftX1 * u + P12x * t;
            const leftY2 = leftY1 * u + P12y * t;
            const rightX1 = P12x * u + rightX2 * t;
            const rightY1 = P12y * u + rightY2 * t;
            const leftX = leftX2 * u + rightX1 * t;
            const leftY = leftY2 * u + rightY1 * t;
            return {
                left: [ leftX1, leftY1, leftX2, leftY2, leftX, leftY ],
                right: [ rightX1, rightY1, rightX2, rightY2, toX, toY ]
            };
        }
    };
    const {getPointAndSet: getPointAndSet, toTwoPointBounds: toTwoPointBounds$1, ellipse: ellipse$6} = BezierHelper;
    const {sin: sin$2, cos: cos$2, sqrt: sqrt, atan2: atan2} = Math;
    const {ellipse: ellipse$5} = BezierHelper;
    const EllipseHelper = {
        ellipticalArc(data, fromX, fromY, radiusX, radiusY, rotation, largeFlag, sweepFlag, toX, toY, curveMode) {
            const halfX = (toX - fromX) / 2;
            const halfY = (toY - fromY) / 2;
            const rotationRadian = rotation * OneRadian;
            const rotationSin = sin$2(rotationRadian);
            const rotationCos = cos$2(rotationRadian);
            const px = -rotationCos * halfX - rotationSin * halfY;
            const py = -rotationCos * halfY + rotationSin * halfX;
            const rxSquare = radiusX * radiusX;
            const rySquare = radiusY * radiusY;
            const pySquare = py * py;
            const pxSquare = px * px;
            const a = rxSquare * rySquare - rxSquare * pySquare - rySquare * pxSquare;
            let s = 0;
            if (a < 0) {
                const t = sqrt(1 - a / (rxSquare * rySquare));
                radiusX *= t;
                radiusY *= t;
            } else {
                s = (largeFlag === sweepFlag ? -1 : 1) * sqrt(a / (rxSquare * pySquare + rySquare * pxSquare));
            }
            const cx = s * radiusX * py / radiusY;
            const cy = -s * radiusY * px / radiusX;
            const startRadian = atan2((py - cy) / radiusY, (px - cx) / radiusX);
            const endRadian = atan2((-py - cy) / radiusY, (-px - cx) / radiusX);
            let totalRadian = endRadian - startRadian;
            if (sweepFlag === 0 && totalRadian > 0) {
                totalRadian -= PI2;
            } else if (sweepFlag === 1 && totalRadian < 0) {
                totalRadian += PI2;
            }
            const centerX = fromX + halfX + rotationCos * cx - rotationSin * cy;
            const centerY = fromY + halfY + rotationSin * cx + rotationCos * cy;
            const anticlockwise = totalRadian < 0 ? 1 : 0;
            if (curveMode || Platform.ellipseToCurve) {
                ellipse$5(data, centerX, centerY, radiusX, radiusY, rotation, startRadian / OneRadian, endRadian / OneRadian, anticlockwise);
            } else {
                if (radiusX === radiusY && !rotation) {
                    data.push(PathCommandMap.O, centerX, centerY, radiusX, startRadian / OneRadian, endRadian / OneRadian, anticlockwise);
                } else {
                    data.push(PathCommandMap.G, centerX, centerY, radiusX, radiusY, rotation, startRadian / OneRadian, endRadian / OneRadian, anticlockwise);
                }
            }
        }
    };
    const PathCommandNodeHelper = {
        toCommand(_nodes) {
            return [];
        },
        toNode(_data, _filterSamePoint) {
            return [];
        }
    };
    const {M: M$4, m: m, L: L$5, l: l, H: H, h: h, V: V, v: v, C: C$3, c: c, S: S, s: s, Q: Q$3, q: q, T: T, t: t, A: A, a: a, Z: Z$4, z: z, N: N$3, D: D$4, X: X$3, G: G$3, F: F$4, O: O$3, P: P$3, U: U$3} = PathCommandMap;
    const {rect: rect$3, roundRect: roundRect$2, arcTo: arcTo$3, arc: arc$3, ellipse: ellipse$4, quadraticCurveTo: quadraticCurveTo$1} = BezierHelper;
    const {ellipticalArc: ellipticalArc} = EllipseHelper;
    const debug$e = Debug.get("PathConvert");
    const setEndPoint$1 = {};
    const PathConvert = {
        current: {
            dot: 0
        },
        stringify(data, floatLength) {
            let i = 0, len = data.length, count, str = "", command, lastCommand;
            while (i < len) {
                command = data[i];
                count = PathNumberCommandLengthMap[command];
                if (command === lastCommand) {
                    str += " ";
                } else {
                    str += PathNumberCommandMap[command];
                }
                for (let j = 1; j < count; j++) {
                    str += MathHelper.float(data[i + j], floatLength);
                    j === count - 1 || (str += " ");
                }
                lastCommand = command;
                i += count;
            }
            return str;
        },
        parse(pathString, curveMode) {
            let needConvert, char, lastChar, num = "";
            const data = [];
            const convertCommand = curveMode ? NeedConvertToCurveCommandMap : NeedConvertToCanvasCommandMap;
            for (let i = 0, len = pathString.length; i < len; i++) {
                char = pathString[i];
                if (StringNumberMap[char]) {
                    if (char === ".") {
                        if (current.dot) {
                            pushData(data, num);
                            num = "";
                        }
                        current.dot++;
                    }
                    if (num === "0" && char !== ".") {
                        pushData(data, num);
                        num = "";
                    }
                    num += char;
                } else if (PathCommandMap[char]) {
                    if (num) {
                        pushData(data, num);
                        num = "";
                    }
                    current.name = PathCommandMap[char];
                    current.length = PathCommandLengthMap[char];
                    current.index = 0;
                    pushData(data, current.name);
                    if (char === "m") current.name = PathCommandMap["l"]; else if (char === "M") current.name = PathCommandMap["L"];
                    if (!needConvert && convertCommand[char]) needConvert = true;
                } else {
                    if (char === "-" || char === "+") {
                        if (lastChar === "e" || lastChar === "E") {
                            num += char;
                        } else {
                            if (num) pushData(data, num);
                            num = char;
                        }
                    } else {
                        if (num) {
                            pushData(data, num);
                            num = "";
                        }
                    }
                }
                lastChar = char;
            }
            if (num) pushData(data, num);
            return needConvert ? PathConvert.toCanvasData(data, curveMode) : data;
        },
        toCanvasData(old, curveMode) {
            let x = 0, y = 0, x1 = 0, y1 = 0, startX = 0, startY = 0, i = 0, len = old.length, controlX, controlY, command, lastCommand, smooth;
            const data = [];
            while (i < len) {
                command = old[i];
                switch (command) {
                  case m:
                    old[i + 1] += x;
                    old[i + 2] += y;

                  case M$4:
                    x = startX = old[i + 1];
                    y = startY = old[i + 2];
                    data.push(M$4, x, y);
                    i += 3;
                    break;

                  case h:
                    old[i + 1] += x;

                  case H:
                    x = old[i + 1];
                    data.push(L$5, x, y);
                    i += 2;
                    break;

                  case v:
                    old[i + 1] += y;

                  case V:
                    y = old[i + 1];
                    data.push(L$5, x, y);
                    i += 2;
                    break;

                  case l:
                    old[i + 1] += x;
                    old[i + 2] += y;

                  case L$5:
                    x = old[i + 1];
                    y = old[i + 2];
                    data.push(L$5, x, y);
                    i += 3;
                    break;

                  case s:
                    old[i + 1] += x;
                    old[i + 2] += y;
                    old[i + 3] += x;
                    old[i + 4] += y;
                    command = S;

                  case S:
                    smooth = lastCommand === C$3 || lastCommand === S;
                    x1 = smooth ? x * 2 - controlX : x;
                    y1 = smooth ? y * 2 - controlY : y;
                    controlX = old[i + 1];
                    controlY = old[i + 2];
                    x = old[i + 3];
                    y = old[i + 4];
                    data.push(C$3, x1, y1, controlX, controlY, x, y);
                    i += 5;
                    break;

                  case c:
                    old[i + 1] += x;
                    old[i + 2] += y;
                    old[i + 3] += x;
                    old[i + 4] += y;
                    old[i + 5] += x;
                    old[i + 6] += y;
                    command = C$3;

                  case C$3:
                    controlX = old[i + 3];
                    controlY = old[i + 4];
                    x = old[i + 5];
                    y = old[i + 6];
                    data.push(C$3, old[i + 1], old[i + 2], controlX, controlY, x, y);
                    i += 7;
                    break;

                  case t:
                    old[i + 1] += x;
                    old[i + 2] += y;
                    command = T;

                  case T:
                    smooth = lastCommand === Q$3 || lastCommand === T;
                    controlX = smooth ? x * 2 - controlX : x;
                    controlY = smooth ? y * 2 - controlY : y;
                    curveMode ? quadraticCurveTo$1(data, x, y, controlX, controlY, old[i + 1], old[i + 2]) : data.push(Q$3, controlX, controlY, old[i + 1], old[i + 2]);
                    x = old[i + 1];
                    y = old[i + 2];
                    i += 3;
                    break;

                  case q:
                    old[i + 1] += x;
                    old[i + 2] += y;
                    old[i + 3] += x;
                    old[i + 4] += y;
                    command = Q$3;

                  case Q$3:
                    controlX = old[i + 1];
                    controlY = old[i + 2];
                    curveMode ? quadraticCurveTo$1(data, x, y, controlX, controlY, old[i + 3], old[i + 4]) : data.push(Q$3, controlX, controlY, old[i + 3], old[i + 4]);
                    x = old[i + 3];
                    y = old[i + 4];
                    i += 5;
                    break;

                  case a:
                    old[i + 6] += x;
                    old[i + 7] += y;

                  case A:
                    ellipticalArc(data, x, y, old[i + 1], old[i + 2], old[i + 3], old[i + 4], old[i + 5], old[i + 6], old[i + 7], curveMode);
                    x = old[i + 6];
                    y = old[i + 7];
                    i += 8;
                    break;

                  case z:
                  case Z$4:
                    data.push(Z$4);
                    x = startX;
                    y = startY;
                    i++;
                    break;

                  case N$3:
                    x = old[i + 1];
                    y = old[i + 2];
                    curveMode ? rect$3(data, x, y, old[i + 3], old[i + 4]) : copyData(data, old, i, 5);
                    i += 5;
                    break;

                  case D$4:
                    x = old[i + 1];
                    y = old[i + 2];
                    curveMode ? roundRect$2(data, x, y, old[i + 3], old[i + 4], [ old[i + 5], old[i + 6], old[i + 7], old[i + 8] ]) : copyData(data, old, i, 9);
                    i += 9;
                    break;

                  case X$3:
                    x = old[i + 1];
                    y = old[i + 2];
                    curveMode ? roundRect$2(data, x, y, old[i + 3], old[i + 4], old[i + 5]) : copyData(data, old, i, 6);
                    i += 6;
                    break;

                  case G$3:
                    ellipse$4(curveMode ? data : copyData(data, old, i, 9), old[i + 1], old[i + 2], old[i + 3], old[i + 4], old[i + 5], old[i + 6], old[i + 7], old[i + 8], null, setEndPoint$1);
                    x = setEndPoint$1.x;
                    y = setEndPoint$1.y;
                    i += 9;
                    break;

                  case F$4:
                    curveMode ? ellipse$4(data, old[i + 1], old[i + 2], old[i + 3], old[i + 4], 0, 0, 360, false) : copyData(data, old, i, 5);
                    x = old[i + 1] + old[i + 3];
                    y = old[i + 2];
                    i += 5;
                    break;

                  case O$3:
                    arc$3(curveMode ? data : copyData(data, old, i, 7), old[i + 1], old[i + 2], old[i + 3], old[i + 4], old[i + 5], old[i + 6], null, setEndPoint$1);
                    x = setEndPoint$1.x;
                    y = setEndPoint$1.y;
                    i += 7;
                    break;

                  case P$3:
                    curveMode ? arc$3(data, old[i + 1], old[i + 2], old[i + 3], 0, 360, false) : copyData(data, old, i, 4);
                    x = old[i + 1] + old[i + 3];
                    y = old[i + 2];
                    i += 4;
                    break;

                  case U$3:
                    arcTo$3(curveMode ? data : copyData(data, old, i, 6), x, y, old[i + 1], old[i + 2], old[i + 3], old[i + 4], old[i + 5], null, setEndPoint$1);
                    x = setEndPoint$1.x;
                    y = setEndPoint$1.y;
                    i += 6;
                    break;

                  default:
                    debug$e.error(`command: ${command} [index:${i}]`, old);
                    return data;
                }
                lastCommand = command;
            }
            return data;
        },
        objectToCanvasData(list) {
            if (list[0].name.length > 1) {
                return PathCommandNodeHelper.toCommand(list);
            } else {
                const data = [];
                list.forEach(item => {
                    switch (item.name) {
                      case "M":
                        data.push(M$4, item.x, item.y);
                        break;

                      case "L":
                        data.push(L$5, item.x, item.y);
                        break;

                      case "C":
                        data.push(C$3, item.x1, item.y1, item.x2, item.y2, item.x, item.y);
                        break;

                      case "Q":
                        data.push(Q$3, item.x1, item.y1, item.x, item.y);
                        break;

                      case "Z":
                        data.push(Z$4);
                    }
                });
                return data;
            }
        },
        copyData(data, old, index, count) {
            for (let i = index, end = index + count; i < end; i++) {
                data.push(old[i]);
            }
        },
        pushData(data, strNum) {
            if (current.index === current.length) {
                current.index = 1;
                data.push(current.name);
            }
            data.push(Number(strNum));
            current.index++;
            current.dot = 0;
        }
    };
    const {current: current, pushData: pushData, copyData: copyData} = PathConvert;
    const {M: M$3, L: L$4, C: C$2, Q: Q$2, Z: Z$3, N: N$2, D: D$3, X: X$2, G: G$2, F: F$3, O: O$2, P: P$2, U: U$2} = PathCommandMap;
    const {getMinDistanceFrom: getMinDistanceFrom, getRadianFrom: getRadianFrom} = PointHelper;
    const {tan: tan, min: min$1, abs: abs$4} = Math;
    const startPoint = {};
    const debug$d = Debug.get("PointsCurve");
    const PathCommandDataHelper = {
        pointsCurveList: {},
        beginPath(data) {
            data.length = 0;
        },
        moveTo(data, x, y) {
            data.push(M$3, x, y);
        },
        lineTo(data, x, y) {
            data.push(L$4, x, y);
        },
        bezierCurveTo(data, x1, y1, x2, y2, x, y) {
            data.push(C$2, x1, y1, x2, y2, x, y);
        },
        quadraticCurveTo(data, x1, y1, x, y) {
            data.push(Q$2, x1, y1, x, y);
        },
        closePath(data) {
            data.push(Z$3);
        },
        rect(data, x, y, width, height) {
            data.push(N$2, x, y, width, height);
        },
        roundRect(data, x, y, width, height, cornerRadius) {
            if (isNumber(cornerRadius)) {
                data.push(X$2, x, y, width, height, cornerRadius);
            } else {
                const fourCorners = MathHelper.fourNumber(cornerRadius);
                if (fourCorners) {
                    data.push(D$3, x, y, width, height, ...fourCorners);
                } else {
                    data.push(N$2, x, y, width, height);
                }
            }
        },
        ellipse(data, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
            if (radiusX === radiusY) return arc$2(data, x, y, radiusX, startAngle, endAngle, anticlockwise);
            if (isNull(rotation)) {
                data.push(F$3, x, y, radiusX, radiusY);
            } else {
                if (isNull(startAngle)) startAngle = 0;
                if (isNull(endAngle)) endAngle = 360;
                data.push(G$2, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise ? 1 : 0);
            }
        },
        arc(data, x, y, radius, startAngle, endAngle, anticlockwise) {
            if (isNull(startAngle)) {
                data.push(P$2, x, y, radius);
            } else {
                if (isNull(startAngle)) startAngle = 0;
                if (isNull(endAngle)) endAngle = 360;
                data.push(O$2, x, y, radius, startAngle, endAngle, anticlockwise ? 1 : 0);
            }
        },
        arcTo(data, x1, y1, x2, y2, radius, lastX, lastY, fullRadius) {
            if (!isUndefined(lastX)) {
                const r = getMinDistanceFrom(lastX, lastY, x1, y1, x2, y2) / (fullRadius ? 1 : 2);
                radius = min$1(radius, min$1(r, r * abs$4(tan(getRadianFrom(lastX, lastY, x1, y1, x2, y2) / 2))));
            }
            data.push(U$2, x1, y1, x2, y2, radius);
        },
        drawEllipse(data, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
            BezierHelper.ellipse(null, x, y, radiusX, radiusY, isNull(rotation) ? 0 : rotation, isNull(startAngle) ? 0 : startAngle, isNull(endAngle) ? 360 : endAngle, anticlockwise, null, null, startPoint);
            data.push(M$3, startPoint.x, startPoint.y);
            ellipse$3(data, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        },
        drawArc(data, x, y, radius, startAngle, endAngle, anticlockwise) {
            BezierHelper.arc(null, x, y, radius, isNull(startAngle) ? 0 : startAngle, isNull(endAngle) ? 360 : endAngle, anticlockwise, null, null, startPoint);
            data.push(M$3, startPoint.x, startPoint.y);
            arc$2(data, x, y, radius, startAngle, endAngle, anticlockwise);
        },
        drawPoints(data, points, curve, close, options) {
            let type = "Q";
            if (isObject(curve)) type = curve.type, curve = curve.value;
            if (!pointsCurveList[type]) debug$d.warn("not found:", type), type = "Q";
            pointsCurveList[type](data, points, curve, close, options);
        }
    };
    const {ellipse: ellipse$3, arc: arc$2, pointsCurveList: pointsCurveList} = PathCommandDataHelper;
    function registerPointsCurve(type, fn) {
        if (pointsCurveList[type]) debug$d.repeat(type);
        pointsCurveList[type] = fn;
    }
    registerPointsCurve("Q", BezierHelper.points);
    const {moveTo: moveTo$4, lineTo: lineTo$3, quadraticCurveTo: quadraticCurveTo, bezierCurveTo: bezierCurveTo, closePath: closePath$3, beginPath: beginPath, rect: rect$2, roundRect: roundRect$1, ellipse: ellipse$2, arc: arc$1, arcTo: arcTo$2, drawEllipse: drawEllipse, drawArc: drawArc, drawPoints: drawPoints$2} = PathCommandDataHelper;
    class PathCreator {
        set path(value) {
            this.__path = value;
        }
        get path() {
            return this.__path;
        }
        constructor(path) {
            this.set(path);
        }
        set(path) {
            this.__path = path ? isString(path) ? PathHelper.parse(path) : path : [];
            return this;
        }
        beginPath() {
            beginPath(this.__path);
            this.paint();
            return this;
        }
        moveTo(x, y) {
            moveTo$4(this.__path, x, y);
            this.paint();
            return this;
        }
        lineTo(x, y) {
            lineTo$3(this.__path, x, y);
            this.paint();
            return this;
        }
        bezierCurveTo(x1, y1, x2, y2, x, y) {
            bezierCurveTo(this.__path, x1, y1, x2, y2, x, y);
            this.paint();
            return this;
        }
        quadraticCurveTo(x1, y1, x, y) {
            quadraticCurveTo(this.__path, x1, y1, x, y);
            this.paint();
            return this;
        }
        closePath() {
            closePath$3(this.__path);
            this.paint();
            return this;
        }
        rect(x, y, width, height) {
            rect$2(this.__path, x, y, width, height);
            this.paint();
            return this;
        }
        roundRect(x, y, width, height, cornerRadius) {
            roundRect$1(this.__path, x, y, width, height, cornerRadius);
            this.paint();
            return this;
        }
        ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
            ellipse$2(this.__path, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
            this.paint();
            return this;
        }
        arc(x, y, radius, startAngle, endAngle, anticlockwise) {
            arc$1(this.__path, x, y, radius, startAngle, endAngle, anticlockwise);
            this.paint();
            return this;
        }
        arcTo(x1, y1, x2, y2, radius) {
            arcTo$2(this.__path, x1, y1, x2, y2, radius);
            this.paint();
            return this;
        }
        drawEllipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
            drawEllipse(this.__path, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
            this.paint();
            return this;
        }
        drawArc(x, y, radius, startAngle, endAngle, anticlockwise) {
            drawArc(this.__path, x, y, radius, startAngle, endAngle, anticlockwise);
            this.paint();
            return this;
        }
        drawPoints(points, curve, close) {
            drawPoints$2(this.__path, points, curve, close);
            this.paint();
            return this;
        }
        clearPath() {
            return this.beginPath();
        }
        paint() {}
    }
    const {M: M$2, L: L$3, C: C$1, Q: Q$1, Z: Z$2, N: N$1, D: D$2, X: X$1, G: G$1, F: F$2, O: O$1, P: P$1, U: U$1} = PathCommandMap;
    const debug$c = Debug.get("PathDrawer");
    const PathDrawer = {
        drawPathByData(drawer, data) {
            if (!data) return;
            let command;
            let i = 0, len = data.length;
            while (i < len) {
                command = data[i];
                switch (command) {
                  case M$2:
                    drawer.moveTo(data[i + 1], data[i + 2]);
                    i += 3;
                    break;

                  case L$3:
                    drawer.lineTo(data[i + 1], data[i + 2]);
                    i += 3;
                    break;

                  case C$1:
                    drawer.bezierCurveTo(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6]);
                    i += 7;
                    break;

                  case Q$1:
                    drawer.quadraticCurveTo(data[i + 1], data[i + 2], data[i + 3], data[i + 4]);
                    i += 5;
                    break;

                  case Z$2:
                    drawer.closePath();
                    i += 1;
                    break;

                  case N$1:
                    drawer.rect(data[i + 1], data[i + 2], data[i + 3], data[i + 4]);
                    i += 5;
                    break;

                  case D$2:
                    drawer.roundRect(data[i + 1], data[i + 2], data[i + 3], data[i + 4], [ data[i + 5], data[i + 6], data[i + 7], data[i + 8] ]);
                    i += 9;
                    break;

                  case X$1:
                    drawer.roundRect(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5]);
                    i += 6;
                    break;

                  case G$1:
                    drawer.ellipse(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5] * OneRadian, data[i + 6] * OneRadian, data[i + 7] * OneRadian, data[i + 8]);
                    i += 9;
                    break;

                  case F$2:
                    drawer.ellipse(data[i + 1], data[i + 2], data[i + 3], data[i + 4], 0, 0, PI2, false);
                    i += 5;
                    break;

                  case O$1:
                    drawer.arc(data[i + 1], data[i + 2], data[i + 3], data[i + 4] * OneRadian, data[i + 5] * OneRadian, data[i + 6]);
                    i += 7;
                    break;

                  case P$1:
                    drawer.arc(data[i + 1], data[i + 2], data[i + 3], 0, PI2, false);
                    i += 4;
                    break;

                  case U$1:
                    drawer.arcTo(data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5]);
                    i += 6;
                    break;

                  default:
                    debug$c.error(`command: ${command} [index:${i}]`, data);
                    return;
                }
            }
        },
        drawPathByPoints(_drawer, _points, _closed) {}
    };
    const {M: M$1, L: L$2, C: C, Q: Q, Z: Z$1, N: N, D: D$1, X: X, G: G, F: F$1, O: O, P: P, U: U} = PathCommandMap;
    const {toTwoPointBounds: toTwoPointBounds, toTwoPointBoundsByQuadraticCurve: toTwoPointBoundsByQuadraticCurve, arcTo: arcTo$1, arc: arc, ellipse: ellipse$1} = BezierHelper;
    const {addPointBounds: addPointBounds, copy: copy$6, addPoint: addPoint, setPoint: setPoint, addBounds: addBounds, toBounds: toBounds$1} = TwoPointBoundsHelper;
    const debug$b = Debug.get("PathBounds");
    let radius, radiusX, radiusY;
    const tempPointBounds = {};
    const setPointBounds = {};
    const setEndPoint = {};
    const PathBounds = {
        toBounds(data, setBounds) {
            PathBounds.toTwoPointBounds(data, setPointBounds);
            toBounds$1(setPointBounds, setBounds);
        },
        toTwoPointBounds(data, setPointBounds) {
            if (!data || !data.length) return setPoint(setPointBounds, 0, 0);
            let i = 0, x = 0, y = 0, x1, y1, toX, toY, command;
            const len = data.length;
            while (i < len) {
                command = data[i];
                if (i === 0) {
                    if (command === Z$1 || command === C || command === Q) {
                        setPoint(setPointBounds, x, y);
                    } else {
                        setPoint(setPointBounds, data[i + 1], data[i + 2]);
                    }
                }
                switch (command) {
                  case M$1:
                  case L$2:
                    x = data[i + 1];
                    y = data[i + 2];
                    addPoint(setPointBounds, x, y);
                    i += 3;
                    break;

                  case C:
                    toX = data[i + 5];
                    toY = data[i + 6];
                    toTwoPointBounds(x, y, data[i + 1], data[i + 2], data[i + 3], data[i + 4], toX, toY, tempPointBounds);
                    addPointBounds(setPointBounds, tempPointBounds);
                    x = toX;
                    y = toY;
                    i += 7;
                    break;

                  case Q:
                    x1 = data[i + 1];
                    y1 = data[i + 2];
                    toX = data[i + 3];
                    toY = data[i + 4];
                    toTwoPointBoundsByQuadraticCurve(x, y, x1, y1, toX, toY, tempPointBounds);
                    addPointBounds(setPointBounds, tempPointBounds);
                    x = toX;
                    y = toY;
                    i += 5;
                    break;

                  case Z$1:
                    i += 1;
                    break;

                  case N:
                    x = data[i + 1];
                    y = data[i + 2];
                    addBounds(setPointBounds, x, y, data[i + 3], data[i + 4]);
                    i += 5;
                    break;

                  case D$1:
                  case X:
                    x = data[i + 1];
                    y = data[i + 2];
                    addBounds(setPointBounds, x, y, data[i + 3], data[i + 4]);
                    i += command === D$1 ? 9 : 6;
                    break;

                  case G:
                    ellipse$1(null, data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6], data[i + 7], data[i + 8], tempPointBounds, setEndPoint);
                    i === 0 ? copy$6(setPointBounds, tempPointBounds) : addPointBounds(setPointBounds, tempPointBounds);
                    x = setEndPoint.x;
                    y = setEndPoint.y;
                    i += 9;
                    break;

                  case F$1:
                    x = data[i + 1];
                    y = data[i + 2];
                    radiusX = data[i + 3];
                    radiusY = data[i + 4];
                    addBounds(setPointBounds, x - radiusX, y - radiusY, radiusX * 2, radiusY * 2);
                    x += radiusX;
                    i += 5;
                    break;

                  case O:
                    arc(null, data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6], tempPointBounds, setEndPoint);
                    i === 0 ? copy$6(setPointBounds, tempPointBounds) : addPointBounds(setPointBounds, tempPointBounds);
                    x = setEndPoint.x;
                    y = setEndPoint.y;
                    i += 7;
                    break;

                  case P:
                    x = data[i + 1];
                    y = data[i + 2];
                    radius = data[i + 3];
                    addBounds(setPointBounds, x - radius, y - radius, radius * 2, radius * 2);
                    x += radius;
                    i += 4;
                    break;

                  case U:
                    arcTo$1(null, x, y, data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], tempPointBounds, setEndPoint);
                    i === 0 ? copy$6(setPointBounds, tempPointBounds) : addPointBounds(setPointBounds, tempPointBounds);
                    x = setEndPoint.x;
                    y = setEndPoint.y;
                    i += 6;
                    break;

                  default:
                    debug$b.error(`command: ${command} [index:${i}]`, data);
                    return;
                }
            }
        }
    };
    const {M: M, L: L$1, Z: Z} = PathCommandMap;
    const {getCenterX: getCenterX, getCenterY: getCenterY} = PointHelper;
    const {arcTo: arcTo} = PathCommandDataHelper;
    const {float: float$1} = MathHelper;
    const PathCorner = {
        smooth(data, cornerRadius, _cornerSmoothing) {
            let command, lastCommand, commandLen, startXIndex, startYIndex, smoothLen;
            let i = 0, x = 0, y = 0, startX = 0, startY = 0, secondX = 0, secondY = 0, lastX = 0, lastY = 0;
            if (isArray(cornerRadius)) cornerRadius = cornerRadius[0] || 0;
            const len = data.length, three = len === 9;
            const smooth = [];
            while (i < len) {
                command = data[i];
                switch (command) {
                  case M:
                    smoothLen = smooth.length;
                    if (smoothLen && lastCommand !== Z) {
                        smooth[startXIndex] = startX;
                        smooth[startYIndex] = startY;
                    }
                    startX = lastX = data[i + 1];
                    startY = lastY = data[i + 2];
                    i += 3;
                    if (data[i] === L$1) {
                        secondX = data[i + 1];
                        secondY = data[i + 2];
                        three ? smooth.push(M, startX, startY) : smooth.push(M, getCenterX(startX, secondX), getCenterY(startY, secondY));
                    } else {
                        smooth.push(M, startX, startY);
                    }
                    startXIndex = smoothLen + 1;
                    startYIndex = smoothLen + 2;
                    break;

                  case L$1:
                    x = data[i + 1];
                    y = data[i + 2];
                    i += 3;
                    switch (data[i]) {
                      case L$1:
                        arcTo(smooth, x, y, data[i + 1], data[i + 2], cornerRadius, lastX, lastY, three);
                        break;

                      case Z:
                        if (float$1(x) === float$1(startX) && float$1(y) === float$1(startY)) x = lastX, 
                        y = lastY; else arcTo(smooth, x, y, startX, startY, cornerRadius, lastX, lastY, three);
                        break;

                      default:
                        smooth.push(L$1, x, y);
                    }
                    lastX = x;
                    lastY = y;
                    break;

                  case Z:
                    if (lastCommand !== Z) {
                        arcTo(smooth, startX, startY, secondX, secondY, cornerRadius, lastX, lastY, three);
                        smooth.push(Z);
                    }
                    i += 1;
                    break;

                  default:
                    commandLen = PathNumberCommandLengthMap[command];
                    for (let j = 0; j < commandLen; j++) smooth.push(data[i + j]);
                    i += commandLen;
                }
                lastCommand = command;
            }
            if (command !== Z) {
                smooth[startXIndex] = startX;
                smooth[startYIndex] = startY;
            }
            return smooth;
        }
    };
    function path(path) {
        return new PathCreator(path);
    }
    const pen = path();
    PathHelper.creator = path();
    PathHelper.parse = PathConvert.parse;
    PathHelper.convertToCanvasData = PathConvert.toCanvasData;
    const {drawRoundRect: drawRoundRect} = RectHelper;
    function roundRect(drawer) {
        if (drawer && !drawer.roundRect) {
            drawer.roundRect = function(x, y, width, height, cornerRadius) {
                drawRoundRect(this, x, y, width, height, cornerRadius);
            };
        }
    }
    function canvasPatch(drawer) {
        roundRect(drawer);
    }
    const FileHelper = {
        alphaPixelTypes: [ "png", "webp", "svg" ],
        upperCaseTypeMap: {},
        mimeType(type, base = "image") {
            if (!type || type.startsWith(base)) return type;
            if (type === "jpg") type = "jpeg";
            return base + "/" + type;
        },
        fileType(filename) {
            const l = filename.split(".");
            return l[l.length - 1];
        },
        isOpaqueImage(filename) {
            const type = F.fileType(filename);
            return [ "jpg", "jpeg" ].some(item => item === type);
        },
        getExportOptions(options) {
            switch (typeof options) {
              case "object":
                return options;

              case "number":
                return {
                    quality: options
                };

              case "boolean":
                return {
                    blob: options
                };

              default:
                return {};
            }
        }
    };
    const F = FileHelper;
    F.mineType = F.mimeType;
    F.alphaPixelTypes.forEach(type => F.upperCaseTypeMap[type] = type.toUpperCase());
    const debug$a = Debug.get("TaskProcessor");
    class TaskItem {
        constructor(task) {
            this.parallel = true;
            this.time = 1;
            this.id = IncrementId.create(IncrementId.TASK);
            this.task = task;
        }
        run() {
            return __awaiter(this, void 0, void 0, function*() {
                try {
                    if (this.isComplete || this.runing) return;
                    this.runing = true;
                    if (this.canUse && !this.canUse()) return this.cancel();
                    if (this.task) yield this.task();
                } catch (error) {
                    debug$a.error(error);
                }
            });
        }
        complete() {
            this.isComplete = true;
            this.parent = this.task = this.canUse = null;
        }
        cancel() {
            this.isCancel = true;
            this.complete();
        }
    }
    class TaskProcessor {
        get total() {
            return this.list.length + this.delayNumber;
        }
        get finishedIndex() {
            return this.isComplete ? 0 : this.index + this.parallelSuccessNumber;
        }
        get remain() {
            return this.isComplete ? this.total : this.total - this.finishedIndex;
        }
        get percent() {
            const {total: total} = this;
            let totalTime = 0, runTime = 0;
            for (let i = 0; i < total; i++) {
                if (i <= this.finishedIndex) {
                    runTime += this.list[i].time;
                    if (i === this.finishedIndex) totalTime = runTime;
                } else {
                    totalTime += this.list[i].time;
                }
            }
            return this.isComplete ? 1 : runTime / totalTime;
        }
        constructor(config) {
            this.config = {
                parallel: 6
            };
            this.list = [];
            this.running = false;
            this.isComplete = true;
            this.index = 0;
            this.delayNumber = 0;
            if (config) DataHelper.assign(this.config, config);
            this.empty();
        }
        add(taskCallback, options, canUse) {
            let start, parallel, time, delay;
            const task = new TaskItem(taskCallback);
            task.parent = this;
            if (isNumber(options)) {
                delay = options;
            } else if (options) {
                parallel = options.parallel;
                start = options.start;
                time = options.time;
                delay = options.delay;
                if (!canUse) canUse = options.canUse;
            }
            if (time) task.time = time;
            if (parallel === false) task.parallel = false;
            if (canUse) task.canUse = canUse;
            if (isUndefined(delay)) {
                this.push(task, start);
            } else {
                this.delayNumber++;
                setTimeout(() => {
                    if (this.delayNumber) {
                        this.delayNumber--;
                        this.push(task, start);
                    }
                }, delay);
            }
            this.isComplete = false;
            return task;
        }
        push(task, start) {
            this.list.push(task);
            if (start !== false && !this.timer) {
                this.timer = setTimeout(() => this.start());
            }
        }
        empty() {
            this.index = 0;
            this.parallelSuccessNumber = 0;
            this.list = [];
            this.parallelList = [];
            this.delayNumber = 0;
        }
        start() {
            if (!this.running) {
                this.running = true;
                this.isComplete = false;
                this.run();
            }
        }
        pause() {
            clearTimeout(this.timer);
            this.timer = null;
            this.running = false;
        }
        resume() {
            this.start();
        }
        skip() {
            this.index++;
            this.resume();
        }
        stop() {
            this.isComplete = true;
            this.list.forEach(task => {
                if (!task.isComplete) task.run();
            });
            this.pause();
            this.empty();
        }
        run() {
            if (!this.running) return;
            this.setParallelList();
            if (this.parallelList.length > 1) {
                this.runParallelTasks();
            } else {
                this.remain ? this.runTask() : this.onComplete();
            }
        }
        runTask() {
            const task = this.list[this.index];
            if (!task) {
                this.timer = setTimeout(() => this.nextTask());
                return;
            }
            task.run().then(() => {
                this.onTask(task);
                this.index++;
                task.isCancel ? this.runTask() : this.nextTask();
            }).catch(error => {
                this.onError(error);
            });
        }
        runParallelTasks() {
            this.parallelList.forEach(task => this.runParallelTask(task));
        }
        runParallelTask(task) {
            task.run().then(() => {
                this.onTask(task);
                this.fillParallelTask();
            }).catch(error => {
                this.onParallelError(error);
            });
        }
        nextTask() {
            if (this.total === this.finishedIndex) {
                this.onComplete();
            } else {
                this.timer = setTimeout(() => this.run());
            }
        }
        setParallelList() {
            let task;
            const {config: config, list: list, index: index} = this;
            this.parallelList = [];
            this.parallelSuccessNumber = 0;
            let end = index + config.parallel;
            if (end > list.length) end = list.length;
            if (config.parallel > 1) {
                for (let i = index; i < end; i++) {
                    task = list[i];
                    if (task.parallel) this.parallelList.push(task); else break;
                }
            }
        }
        fillParallelTask() {
            let task;
            const parallelList = this.parallelList;
            this.parallelSuccessNumber++;
            parallelList.pop();
            const parallelWaitNumber = parallelList.length;
            const nextIndex = this.finishedIndex + parallelWaitNumber;
            if (parallelList.length) {
                if (!this.running) return;
                if (nextIndex < this.total) {
                    task = this.list[nextIndex];
                    if (task && task.parallel) {
                        parallelList.push(task);
                        this.runParallelTask(task);
                    }
                }
            } else {
                this.index += this.parallelSuccessNumber;
                this.parallelSuccessNumber = 0;
                this.nextTask();
            }
        }
        onComplete() {
            this.stop();
            if (this.config.onComplete) this.config.onComplete();
        }
        onTask(task) {
            task.complete();
            if (this.config.onTask) this.config.onTask();
        }
        onParallelError(error) {
            this.parallelList.forEach(task => {
                task.parallel = false;
            });
            this.parallelList.length = 0;
            this.parallelSuccessNumber = 0;
            this.onError(error);
        }
        onError(error) {
            this.pause();
            if (this.config.onError) this.config.onError(error);
        }
        destroy() {
            this.stop();
        }
    }
    const debug$9 = Debug.get("Resource");
    const Resource = {
        tasker: new TaskProcessor,
        queue: new TaskProcessor({
            parallel: 1
        }),
        map: {},
        get isComplete() {
            return R.tasker.isComplete;
        },
        set(key, value) {
            if (R.map[key]) debug$9.repeat(key);
            R.map[key] = value;
        },
        get(key) {
            return R.map[key];
        },
        remove(key) {
            const r = R.map[key];
            if (r) {
                if (r.destroy) r.destroy();
                delete R.map[key];
            }
        },
        loadImage(key, format) {
            return new Promise((resolve, reject) => {
                const image = this.setImage(key, key, format);
                image.load(() => resolve(image), e => reject(e));
            });
        },
        setImage(key, value, format) {
            let config;
            if (isString(value)) config = {
                url: value
            }; else if (!value.url) config = {
                url: key,
                view: value
            };
            if (config) format && (config.format = format), value = Creator.image(config);
            R.set(key, value);
            return value;
        },
        loadFilm(_key, _format) {
            return undefined;
        },
        loadVideo(_key, _format) {
            return undefined;
        },
        destroy() {
            R.map = {};
        }
    };
    const R = Resource;
    const ImageManager = {
        maxRecycled: 10,
        recycledList: [],
        patternTasker: Resource.queue,
        get(config, type) {
            let image = Resource.get(config.url);
            if (!image) Resource.set(config.url, image = Creator[type || "image"](config));
            image.use++;
            return image;
        },
        recycle(image) {
            if (image.parent) image = image.parent;
            image.use--;
            setTimeout(() => {
                if (!image.use) {
                    if (Platform.image.isLarge(image)) {
                        if (image.url) Resource.remove(image.url);
                    } else {
                        image.clearLevels();
                        I$1.recycledList.push(image);
                    }
                }
            });
        },
        recyclePaint(paint) {
            I$1.recycle(paint.image);
        },
        clearRecycled(force) {
            const list = I$1.recycledList;
            if (list.length > I$1.maxRecycled || force) {
                list.forEach(image => (!image.use || force) && image.url && Resource.remove(image.url));
                list.length = 0;
            }
        },
        clearLevels() {},
        hasAlphaPixel(config) {
            return FileHelper.alphaPixelTypes.some(item => I$1.isFormat(item, config));
        },
        isFormat(format, config) {
            if (config.format) return config.format === format;
            const {url: url} = config;
            if (url.startsWith("data:")) {
                if (url.startsWith("data:" + FileHelper.mimeType(format))) return true;
            } else {
                if (url.includes("." + format) || url.includes("." + FileHelper.upperCaseTypeMap[format])) return true; else if (format === "png" && !url.includes(".")) return true;
            }
            return false;
        },
        destroy() {
            this.clearRecycled(true);
        }
    };
    const I$1 = ImageManager;
    const {IMAGE: IMAGE, create: create$1} = IncrementId;
    class LeaferImage {
        get tag() {
            return "Image";
        }
        get url() {
            return this.config.url;
        }
        get crossOrigin() {
            const {crossOrigin: crossOrigin} = this.config;
            return isUndefined(crossOrigin) ? Platform.image.crossOrigin : crossOrigin;
        }
        get completed() {
            return this.ready || !!this.error;
        }
        constructor(config) {
            this.use = 0;
            this.waitComplete = [];
            this.innerId = create$1(IMAGE);
            this.config = config || (config = {
                url: ""
            });
            if (config.view) {
                const {view: view} = config;
                this.setView(view.config ? view.view : view);
            }
            ImageManager.isFormat("svg", config) && (this.isSVG = true);
            ImageManager.hasAlphaPixel(config) && (this.hasAlphaPixel = true);
        }
        load(onSuccess, onError, thumbSize) {
            if (!this.loading) {
                this.loading = true;
                Resource.tasker.add(() => __awaiter(this, void 0, void 0, function*() {
                    return yield Platform.origin["load" + this.tag](this.getLoadUrl(thumbSize), this.crossOrigin, this).then(img => {
                        if (thumbSize) this.setThumbView(img);
                        this.setView(img);
                    }).catch(e => {
                        this.error = e;
                        this.onComplete(false);
                    });
                }));
            }
            this.waitComplete.push(onSuccess, onError);
            return this.waitComplete.length - 2;
        }
        unload(index, stopEvent) {
            const l = this.waitComplete;
            if (stopEvent) {
                const error = l[index + 1];
                if (error) error({
                    type: "stop"
                });
            }
            l[index] = l[index + 1] = undefined;
        }
        setView(img) {
            this.ready = true;
            if (!this.width) {
                this.width = img.width;
                this.height = img.height;
                this.view = img;
            }
            this.onComplete(true);
        }
        onComplete(isSuccess) {
            let odd;
            this.waitComplete.forEach((item, index) => {
                odd = index % 2;
                if (item) {
                    if (isSuccess) {
                        if (!odd) item(this);
                    } else {
                        if (odd) item(this.error);
                    }
                }
            });
            this.waitComplete.length = 0;
            this.loading = false;
        }
        getFull(_filters) {
            return this.view;
        }
        getCanvas(width, height, opacity, filters, xGap, yGap, smooth, interlace) {
            width || (width = this.width);
            height || (height = this.height);
            if (this.cache) {
                let {params: params, data: data} = this.cache;
                for (let i in params) {
                    if (params[i] !== arguments[i]) {
                        data = null;
                        break;
                    }
                }
                if (data) return data;
            }
            const canvas = Platform.image.resize(this.view, width, height, xGap, yGap, undefined, smooth, opacity, filters, interlace);
            this.cache = this.use > 1 ? {
                data: canvas,
                params: arguments
            } : null;
            return canvas;
        }
        getPattern(canvas, repeat, transform, paint) {
            const pattern = Platform.canvas.createPattern(canvas, repeat);
            Platform.image.setPatternTransform(pattern, transform, paint);
            return pattern;
        }
        render(canvas, x, y, width, height, _leaf, _paint, _imageScaleX, _imageScaleY) {
            canvas.drawImage(this.view, x, y, width, height);
        }
        getLoadUrl(_thumbSize) {
            return this.url;
        }
        setThumbView(_view) {}
        getThumbSize(_lod) {
            return undefined;
        }
        getMinLevel() {
            return undefined;
        }
        getLevelData(_level, _width, _height) {
            return undefined;
        }
        clearLevels(_checkUse) {}
        destroyFilter() {}
        destroy() {
            this.clearLevels();
            this.destroyFilter();
            const {view: view} = this;
            if (view && view.close) view.close();
            this.config = {
                url: ""
            };
            this.cache = this.view = null;
            this.waitComplete.length = 0;
        }
    }
    class LeaferFilm extends LeaferImage {
        get tag() {
            return "Film";
        }
    }
    class LeaferVideo extends LeaferImage {
        get tag() {
            return "Video";
        }
    }
    function defineKey(target, key, descriptor, noConfigurable) {
        if (!noConfigurable) descriptor.configurable = descriptor.enumerable = true;
        Object.defineProperty(target, key, descriptor);
    }
    function getDescriptor(object, name) {
        return Object.getOwnPropertyDescriptor(object, name);
    }
    function createDescriptor(key, defaultValue) {
        const privateKey = "_" + key;
        return {
            get() {
                const v = this[privateKey];
                return v == null ? defaultValue : v;
            },
            set(value) {
                this[privateKey] = value;
            }
        };
    }
    function getNames(object) {
        return Object.getOwnPropertyNames(object);
    }
    function decorateLeafAttr(defaultValue, descriptorFn) {
        return (target, key) => defineLeafAttr(target, key, defaultValue, descriptorFn && descriptorFn(key));
    }
    function attr(partDescriptor) {
        return partDescriptor;
    }
    function defineLeafAttr(target, key, defaultValue, partDescriptor) {
        const defaultDescriptor = {
            get() {
                return this.__getAttr(key);
            },
            set(value) {
                this.__setAttr(key, value);
            }
        };
        defineKey(target, key, Object.assign(defaultDescriptor, partDescriptor || {}));
        defineDataProcessor(target, key, defaultValue);
    }
    function dataType(defaultValue) {
        return decorateLeafAttr(defaultValue);
    }
    function positionType(defaultValue, checkFiniteNumber) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value, checkFiniteNumber) && (this.__layout.matrixChanged || this.__layout.matrixChange());
            }
        }));
    }
    function scrollType(defaultValue, checkFiniteNumber) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                if (this.__setAttr(key, value, checkFiniteNumber)) {
                    this.__layout.matrixChanged || this.__layout.matrixChange();
                    this.__scrollWorld || (this.__scrollWorld = {});
                }
            }
        }));
    }
    function autoLayoutType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                if (this.__setAttr(key, value)) {
                    this.__hasAutoLayout = !!(this.origin || this.around || this.flow);
                    if (!this.__local) this.__layout.createLocal();
                    doBoundsType(this);
                }
            }
        }));
    }
    function scaleType(defaultValue, checkFiniteNumber) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value, checkFiniteNumber) && (this.__layout.scaleChanged || this.__layout.scaleChange());
            }
        }));
    }
    function rotationType(defaultValue, checkFiniteNumber) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value, checkFiniteNumber) && (this.__layout.rotationChanged || this.__layout.rotationChange());
            }
        }));
    }
    function boundsType(defaultValue, checkFiniteNumber) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value, checkFiniteNumber) && doBoundsType(this);
            }
        }));
    }
    function naturalBoundsType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value) && (doBoundsType(this), this.__.__removeNaturalSize());
            }
        }));
    }
    function doBoundsType(leaf) {
        leaf.__layout.boxChanged || leaf.__layout.boxChange();
        if (leaf.__hasAutoLayout) leaf.__layout.matrixChanged || leaf.__layout.matrixChange();
    }
    function pathInputType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                const data = this.__;
                if (data.__pathInputed !== 2) data.__pathInputed = value ? 1 : 0;
                if (!value) data.__pathForRender = undefined;
                this.__setAttr(key, value);
                doBoundsType(this);
            }
        }));
    }
    const pathType = boundsType;
    function affectStrokeBoundsType(defaultValue, useStroke) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                if (this.__setAttr(key, value)) {
                    doStrokeType(this);
                    if (useStroke) this.__.__useStroke = true;
                }
            }
        }));
    }
    function doStrokeType(leaf) {
        leaf.__layout.strokeChanged || leaf.__layout.strokeChange();
        if (leaf.__.__useArrow) doBoundsType(leaf);
    }
    const strokeType = affectStrokeBoundsType;
    function affectRenderBoundsType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value);
                this.__layout.renderChanged || this.__layout.renderChange();
            }
        }));
    }
    function surfaceType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value) && doSurfaceType(this);
            }
        }));
    }
    function doSurfaceType(leaf) {
        leaf.__layout.surfaceChanged || leaf.__layout.surfaceChange();
    }
    function dimType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                if (this.__setAttr(key, value)) {
                    const data = this.__;
                    DataHelper.stintSet(data, "__useDim", data.dim || data.bright || data.dimskip);
                }
            }
        }));
    }
    function opacityType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value) && (this.__layout.opacityChanged || this.__layout.opacityChange());
                if (this.mask) checkMask$1(this);
            }
        }));
    }
    function visibleType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                const oldValue = this.visible;
                if (oldValue === true && value === 0) {
                    if (this.animationOut) return this.__runAnimation("out", () => doVisible(this, key, value, oldValue));
                } else if (oldValue === 0 && value === true) {
                    if (this.animation) this.__runAnimation("in");
                }
                doVisible(this, key, value, oldValue);
                if (this.mask) checkMask$1(this);
            }
        }));
    }
    function checkMask$1(leaf) {
        const {parent: parent} = leaf;
        if (parent) {
            const {__hasMask: __hasMask} = parent;
            parent.__updateMask();
            if (__hasMask !== parent.__hasMask) parent.forceUpdate();
        }
    }
    function doVisible(leaf, key, value, oldValue) {
        if (leaf.__setAttr(key, value)) {
            leaf.__layout.opacityChanged || leaf.__layout.opacityChange();
            if (oldValue === 0 || value === 0) doBoundsType(leaf);
        }
    }
    function sortParentChange(parent) {
        parent.__layout.childrenSortChange();
        if (parent.__.flow) parent.__layout.boxChange();
    }
    function sortType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                if (this.__setAttr(key, value)) {
                    this.waitParentChange(sortParentChange);
                }
            }
        }));
    }
    function maskParentChange(parent) {
        parent.__updateMask();
    }
    function maskType(defaultValue, updateSelf) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                if (this.__setAttr(key, value)) {
                    this.__layout.boxChanged || this.__layout.boxChange();
                    updateSelf ? this.__updateMask() : this.waitParentChange(maskParentChange);
                }
            }
        }));
    }
    function eraserParentChange(parent) {
        parent.__updateEraser();
    }
    function eraserType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value) && this.waitParentChange(eraserParentChange);
            }
        }));
    }
    function hitType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                if (this.__setAttr(key, value)) {
                    this.__layout.hitCanvasChanged = true;
                    if (this.leafer) this.leafer.updateCursor();
                }
            }
        }));
    }
    function cursorType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value);
                if (this.leafer) this.leafer.updateCursor();
            }
        }));
    }
    function dataProcessor(processor) {
        return (target, _key) => {
            defineKey(target, "__DataProcessor", {
                get() {
                    return processor;
                }
            });
        };
    }
    function layoutProcessor(processor) {
        return (target, _key) => {
            defineKey(target, "__LayoutProcessor", {
                get() {
                    return processor;
                }
            });
        };
    }
    function getSetMethodName(key) {
        return "set" + key.charAt(0).toUpperCase() + key.slice(1);
    }
    function defineDataProcessor(target, key, defaultValue) {
        const data = target.__DataProcessor.prototype;
        const computedKey = "_" + key;
        const setMethodName = getSetMethodName(key);
        const property = createDescriptor(key, defaultValue);
        if (isUndefined(defaultValue)) {
            property.get = function() {
                return this[computedKey];
            };
        } else if (typeof defaultValue === "function") {
            property.get = function() {
                const v = this[computedKey];
                return v == null ? defaultValue(this.__leaf) : v;
            };
        } else if (isObject(defaultValue)) {
            const isEmpty = isEmptyData(defaultValue);
            property.get = function() {
                const v = this[computedKey];
                return v == null ? this[computedKey] = isEmpty ? {} : DataHelper.clone(defaultValue) : v;
            };
        }
        const isBox = target.isBranchLeaf;
        if (key === "width") {
            property.get = function() {
                const v = this[computedKey];
                if (v == null) {
                    const t = this, naturalWidth = t.__naturalWidth, leaf = t.__leaf;
                    if (!defaultValue || leaf.pathInputed) return leaf.boxBounds.width;
                    if (naturalWidth) return t._height && t.__useNaturalRatio ? t._height * naturalWidth / t.__naturalHeight : naturalWidth;
                    return isBox && leaf.children.length ? leaf.boxBounds.width : defaultValue;
                } else return v;
            };
        } else if (key === "height") {
            property.get = function() {
                const v = this[computedKey];
                if (v == null) {
                    const t = this, naturalHeight = t.__naturalHeight, leaf = t.__leaf;
                    if (!defaultValue || leaf.pathInputed) return leaf.boxBounds.height;
                    if (naturalHeight) return t._width && t.__useNaturalRatio ? t._width * naturalHeight / t.__naturalWidth : naturalHeight;
                    return isBox && leaf.children.length ? leaf.boxBounds.height : defaultValue;
                } else return v;
            };
        }
        let descriptor, find = data;
        while (!descriptor && find) {
            descriptor = getDescriptor(find, key);
            find = find.__proto__;
        }
        if (descriptor && descriptor.set) property.set = descriptor.set;
        if (data[setMethodName]) {
            property.set = data[setMethodName];
            delete data[setMethodName];
        }
        defineKey(data, key, property);
    }
    const debug$8 = new Debug("rewrite");
    const list = [];
    const excludeNames = [ "destroy", "constructor" ];
    function rewrite(method) {
        return (target, key) => {
            list.push({
                name: target.constructor.name + "." + key,
                run: () => {
                    target[key] = method;
                }
            });
        };
    }
    function rewriteAble() {
        return _target => {
            doRewrite();
        };
    }
    function doRewrite(error) {
        if (list.length) {
            list.forEach(item => {
                if (error) debug$8.error(item.name, "需在Class上装饰@rewriteAble()");
                item.run();
            });
            list.length = 0;
        }
    }
    setTimeout(() => doRewrite(true));
    function useModule(module, exclude) {
        return target => {
            const names = module.prototype ? getNames(module.prototype) : Object.keys(module);
            names.forEach(name => {
                if (!excludeNames.includes(name) && (!exclude || !exclude.includes(name))) {
                    if (module.prototype) {
                        const d = getDescriptor(module.prototype, name);
                        if (d) Object.defineProperty(target.prototype, name, d);
                    } else {
                        target.prototype[name] = module[name];
                    }
                }
            });
        };
    }
    function registerUI() {
        return target => {
            UICreator.register(target);
        };
    }
    function registerUIEvent() {
        return target => {
            EventCreator.register(target);
        };
    }
    const {copy: copy$5, toInnerPoint: toInnerPoint$1, toOuterPoint: toOuterPoint$1, scaleOfOuter: scaleOfOuter$2, rotateOfOuter: rotateOfOuter$2, skewOfOuter: skewOfOuter, multiplyParent: multiplyParent$3, divideParent: divideParent, getLayout: getLayout} = MatrixHelper;
    const matrix$1 = {}, {round: round} = Math;
    const LeafHelper = {
        updateAllMatrix(leaf, checkAutoLayout, waitAutoLayout) {
            if (checkAutoLayout && leaf.__hasAutoLayout && leaf.__layout.matrixChanged) waitAutoLayout = true;
            updateMatrix$1(leaf, checkAutoLayout, waitAutoLayout);
            if (leaf.isBranch) {
                const {children: children} = leaf;
                for (let i = 0, len = children.length; i < len; i++) {
                    updateAllMatrix$3(children[i], checkAutoLayout, waitAutoLayout);
                }
            }
        },
        updateMatrix(leaf, checkAutoLayout, waitAutoLayout) {
            const layout = leaf.__layout;
            if (checkAutoLayout) {
                if (waitAutoLayout) {
                    layout.waitAutoLayout = true;
                    if (leaf.__hasAutoLayout) layout.matrixChanged = false;
                }
            } else if (layout.waitAutoLayout) {
                layout.waitAutoLayout = false;
            }
            if (layout.matrixChanged) leaf.__updateLocalMatrix();
            if (!layout.waitAutoLayout) leaf.__updateWorldMatrix();
        },
        updateBounds(leaf, noUpdateSize) {
            const layout = leaf.__layout;
            if (layout.boundsChanged) leaf.__updateLocalBounds();
            if (noUpdateSize) layout.resized = undefined;
            if (!layout.waitAutoLayout) leaf.__updateWorldBounds();
        },
        updateAllWorldOpacity(leaf) {
            leaf.__updateWorldOpacity();
            if (leaf.isBranch) {
                const {children: children} = leaf;
                for (let i = 0, len = children.length; i < len; i++) {
                    updateAllWorldOpacity(children[i]);
                }
            }
        },
        updateChange(leaf) {
            const layout = leaf.__layout;
            if (layout.stateStyleChanged) leaf.updateState();
            if (layout.opacityChanged) updateAllWorldOpacity(leaf);
            leaf.__updateChange();
            if (layout.surfaceChanged) {
                if (leaf.__hasComplex) L.updateComplex(leaf);
                layout.surfaceChanged = false;
            }
        },
        updateAllChange(leaf) {
            updateChange(leaf);
            if (leaf.isBranch) {
                const {children: children} = leaf;
                for (let i = 0, len = children.length; i < len; i++) {
                    updateAllChange$1(children[i]);
                }
            }
        },
        worldHittable(t) {
            while (t) {
                if (!t.__.hittable) return false;
                t = t.parent;
            }
            return true;
        },
        draggable(t) {
            return (t.draggable || t.editable) && t.hitSelf && !t.locked;
        },
        copyCanvasByWorld(leaf, currentCanvas, fromCanvas, fromWorld, blendMode, onlyResetTransform) {
            if (!fromWorld) fromWorld = leaf.__nowWorld;
            if (leaf.__worldFlipped || Platform.fullImageShadow) currentCanvas.copyWorldByReset(fromCanvas, fromWorld, leaf.__nowWorld, blendMode, onlyResetTransform); else currentCanvas.copyWorldToInner(fromCanvas, fromWorld, leaf.__layout.renderBounds, blendMode);
        },
        clip(leaf, canvas, options) {
            if (leaf.__worldOpacity) {
                canvas.setWorld(leaf.__nowWorld = leaf.__getNowWorld(options));
                leaf.__drawRenderPath(canvas);
                canvas.clipUI(leaf);
            }
        },
        renderComplex(_leaf, _canvas, _options) {},
        updateComplex(_leaf) {},
        checkComplex(_leaf) {},
        moveWorld(t, x, y = 0, isInnerPoint, transition) {
            const local = isObject(x) ? Object.assign({}, x) : {
                x: x,
                y: y
            };
            isInnerPoint ? toOuterPoint$1(t.localTransform, local, local, true) : t.parent && toInnerPoint$1(t.parent.scrollWorldTransform, local, local, true);
            L.moveLocal(t, local.x, local.y, transition);
        },
        moveLocal(t, x, y = 0, transition) {
            if (isObject(x)) y = x.y, x = x.x;
            x += t.x;
            y += t.y;
            if (t.leafer && t.leafer.config.pointSnap) x = round(x), y = round(y);
            transition ? t.animate({
                x: x,
                y: y
            }, transition) : (t.x = x, t.y = y);
        },
        zoomOfWorld(t, origin, scaleX, scaleY, resize, transition, boundsType) {
            L.zoomOfLocal(t, getTempLocal(t, origin), scaleX, scaleY, resize, transition, boundsType);
        },
        zoomOfLocal(t, origin, scaleX, scaleY = scaleX, resize, transition, boundsType) {
            const o = t.__localMatrix;
            if (!isNumber(scaleY)) {
                if (scaleY) transition = scaleY;
                scaleY = scaleX;
            }
            copy$5(matrix$1, o);
            scaleOfOuter$2(matrix$1, origin, scaleX, scaleY);
            if (L.hasHighPosition(t)) {
                L.setTransform(t, matrix$1, resize, transition, boundsType);
            } else {
                const x = t.x + matrix$1.e - o.e, y = t.y + matrix$1.f - o.f;
                if (transition && !resize) t.animate({
                    x: x,
                    y: y,
                    scaleX: t.scaleX * scaleX,
                    scaleY: t.scaleY * scaleY
                }, transition); else t.x = x, t.y = y, t.scaleResize(scaleX, scaleY, resize !== true, boundsType);
            }
        },
        rotateOfWorld(t, origin, angle, transition) {
            L.rotateOfLocal(t, getTempLocal(t, origin), angle, transition);
        },
        rotateOfLocal(t, origin, angle, transition) {
            const o = t.__localMatrix;
            copy$5(matrix$1, o);
            rotateOfOuter$2(matrix$1, origin, angle);
            if (L.hasHighPosition(t)) L.setTransform(t, matrix$1, false, transition); else t.set({
                x: t.x + matrix$1.e - o.e,
                y: t.y + matrix$1.f - o.f,
                rotation: MathHelper.formatRotation(t.rotation + angle)
            }, transition);
        },
        skewOfWorld(t, origin, skewX, skewY, resize, transition) {
            L.skewOfLocal(t, getTempLocal(t, origin), skewX, skewY, resize, transition);
        },
        skewOfLocal(t, origin, skewX, skewY = 0, resize, transition) {
            copy$5(matrix$1, t.__localMatrix);
            skewOfOuter(matrix$1, origin, skewX, skewY);
            L.setTransform(t, matrix$1, resize, transition);
        },
        transformWorld(t, transform, resize, transition, boundsType) {
            copy$5(matrix$1, t.worldTransform);
            multiplyParent$3(matrix$1, transform);
            if (t.parent) divideParent(matrix$1, t.parent.scrollWorldTransform);
            L.setTransform(t, matrix$1, resize, transition, boundsType);
        },
        transform(t, transform, resize, transition, boundsType) {
            copy$5(matrix$1, t.localTransform);
            multiplyParent$3(matrix$1, transform);
            L.setTransform(t, matrix$1, resize, transition, boundsType);
        },
        setTransform(t, transform, resize, transition, boundsType) {
            const data = t.__, originPoint = data.origin && L.getInnerOrigin(t, data.origin);
            const layout = getLayout(transform, originPoint, data.around && L.getInnerOrigin(t, data.around));
            if (L.hasOffset(t)) {
                layout.x -= data.offsetX;
                layout.y -= data.offsetY;
            }
            if (resize) {
                const scaleX = layout.scaleX / t.scaleX, scaleY = layout.scaleY / t.scaleY;
                delete layout.scaleX, delete layout.scaleY;
                if (originPoint) {
                    BoundsHelper.scale(t.boxBounds, Math.abs(scaleX), Math.abs(scaleY));
                    const changedPoint = L.getInnerOrigin(t, data.origin);
                    PointHelper.move(layout, originPoint.x - changedPoint.x, originPoint.y - changedPoint.y);
                }
                t.set(layout);
                t.scaleResize(scaleX, scaleY, false, boundsType);
            } else t.set(layout, transition);
        },
        getFlipTransform(t, axis) {
            const m = getMatrixData();
            const sign = axis === "x" ? 1 : -1;
            scaleOfOuter$2(m, L.getLocalOrigin(t, "center"), -1 * sign, 1 * sign);
            return m;
        },
        getLocalOrigin(t, origin) {
            return PointHelper.tempToOuterOf(L.getInnerOrigin(t, origin), t.localTransform);
        },
        getInnerOrigin(t, origin) {
            const innerOrigin = {};
            AroundHelper.toPoint(origin, t.boxBounds, innerOrigin);
            return innerOrigin;
        },
        getRelativeWorld(t, relative, temp) {
            copy$5(matrix$1, t.worldTransform);
            divideParent(matrix$1, relative.scrollWorldTransform);
            return temp ? matrix$1 : Object.assign({}, matrix$1);
        },
        updateScaleFixedWorld(_t) {},
        updateOuterBounds(_t) {},
        cacheId(_t) {},
        drop(t, parent, index, resize) {
            t.setTransform(L.getRelativeWorld(t, parent, true), resize);
            parent.add(t, index);
        },
        hasHighPosition(t) {
            return t.origin || t.around || L.hasOffset(t);
        },
        hasOffset(t) {
            return t.offsetX || t.offsetY;
        },
        hasParent(p, parent, minLevel) {
            if (!parent) return false;
            while (p) {
                if (parent === p) return true;
                if (minLevel && p.__level === minLevel) return;
                p = p.parent;
            }
        },
        animateMove(t, move, speed = .3, onAnimate) {
            if (!move.x && !move.y) return;
            if (Math.abs(move.x) < 1 && Math.abs(move.y) < 1) {
                t.move(move);
            } else {
                const x = move.x * speed, y = move.y * speed;
                move.x -= x, move.y -= y;
                t.move(x, y);
                Platform.requestRender(() => L.animateMove(t, move, speed, onAnimate));
            }
            onAnimate && onAnimate();
        }
    };
    function isTrackChanges(leafer) {
        return leafer && leafer.config.trackChanges;
    }
    const L = LeafHelper;
    const {updateAllMatrix: updateAllMatrix$3, updateMatrix: updateMatrix$1, updateAllWorldOpacity: updateAllWorldOpacity, updateAllChange: updateAllChange$1, updateChange: updateChange} = L;
    function getTempLocal(t, worldPoint) {
        t.updateLayout();
        return t.parent ? PointHelper.tempToInnerOf(worldPoint, t.parent.scrollWorldTransform) : worldPoint;
    }
    const LeafBoundsHelper = {
        worldBounds(target) {
            return target.__world;
        },
        localBoxBounds(target) {
            return target.__.eraser || target.__.visible === 0 ? null : target.__local || target.__layout;
        },
        localStrokeBounds(target) {
            return target.__.eraser || target.__.visible === 0 ? null : target.__layout.localStrokeBounds;
        },
        localRenderBounds(target) {
            const {__: __, __layout: __layout} = target;
            return __.eraser || __.visible === 0 ? null : __layout.localOuterBounds || __layout.localRenderBounds;
        },
        maskLocalBoxBounds(target, index) {
            return checkMask(target, index) && target.__localBoxBounds;
        },
        maskLocalStrokeBounds(target, index) {
            return checkMask(target, index) && target.__layout.localStrokeBounds;
        },
        maskLocalRenderBounds(target, index) {
            const {__layout: __layout} = target;
            return checkMask(target, index) && (__layout.localOuterBounds || __layout.localRenderBounds);
        },
        excludeRenderBounds(child, options) {
            if (options.bounds && !options.bounds.hit(child.__world, options.matrix)) return true;
            if (options.hideBounds && options.hideBounds.includes(child.__world, options.matrix)) return true;
            return false;
        }
    };
    let findMask;
    function checkMask(target, index) {
        if (!index) findMask = 0;
        if (target.__.mask) findMask = 1;
        return findMask < 0 ? null : (findMask && (findMask = -1), true);
    }
    const {updateBounds: updateBounds$2} = LeafHelper;
    const BranchHelper = {
        sort(a, b) {
            return a.__.zIndex === b.__.zIndex ? a.__tempNumber - b.__tempNumber : a.__.zIndex - b.__.zIndex;
        },
        zIndex(branch, child, index) {
            const {children: children} = branch, before = children[index - 1], after = children[index];
            if (before && after) {
                if (child.zIndex < before.zIndex || child.zIndex > after.zIndex) child.zIndex = (before.zIndex + after.zIndex) / 2;
            } else if (before) {
                if (child.zIndex < before.zIndex) child.zIndex = before.zIndex + 1;
            } else if (after) {
                if (child.zIndex > after.zIndex) child.zIndex = after.zIndex - 1;
            }
        },
        pushAllChildBranch(branch, leafList) {
            branch.__tempNumber = 1;
            if (branch.__.__childBranchNumber) {
                const {children: children} = branch;
                for (let i = 0, len = children.length; i < len; i++) {
                    branch = children[i];
                    if (branch.isBranch) {
                        branch.__tempNumber = 1;
                        leafList.add(branch);
                        pushAllChildBranch$1(branch, leafList);
                    }
                }
            }
        },
        pushAllParent(leaf, leafList) {
            const {keys: keys} = leafList;
            if (keys) {
                while (leaf.parent) {
                    if (isUndefined(keys[leaf.parent.innerId])) {
                        leafList.add(leaf.parent);
                        leaf = leaf.parent;
                    } else {
                        break;
                    }
                }
            } else {
                while (leaf.parent) {
                    leafList.add(leaf.parent);
                    leaf = leaf.parent;
                }
            }
        },
        pushAllBranchStack(branch, pushList) {
            let start = pushList.length;
            const {children: children} = branch;
            for (let i = 0, len = children.length; i < len; i++) {
                if (children[i].isBranch) {
                    pushList.push(children[i]);
                }
            }
            for (let i = start, len = pushList.length; i < len; i++) {
                pushAllBranchStack(pushList[i], pushList);
            }
        },
        updateBounds(branch, exclude) {
            const branchStack = [ branch ];
            pushAllBranchStack(branch, branchStack);
            updateBoundsByBranchStack(branchStack, exclude);
        },
        updateBoundsByBranchStack(branchStack, exclude) {
            let branch, children;
            for (let i = branchStack.length - 1; i > -1; i--) {
                branch = branchStack[i];
                children = branch.children;
                for (let j = 0, len = children.length; j < len; j++) {
                    updateBounds$2(children[j]);
                }
                if (exclude && exclude === branch) continue;
                updateBounds$2(branch);
            }
        },
        move(branch, x, y) {
            let w;
            const {children: children} = branch;
            for (let i = 0, len = children.length; i < len; i++) {
                branch = children[i];
                w = branch.__world;
                w.e += x;
                w.f += y;
                w.x += x;
                w.y += y;
                if (branch.isBranch) move$3(branch, x, y);
            }
        },
        scale(branch, x, y, scaleX, scaleY, a, b) {
            let w;
            const {children: children} = branch;
            const changeScaleX = scaleX - 1;
            const changeScaleY = scaleY - 1;
            for (let i = 0, len = children.length; i < len; i++) {
                branch = children[i];
                w = branch.__world;
                w.a *= scaleX;
                w.d *= scaleY;
                if (w.b || w.c) {
                    w.b *= scaleX;
                    w.c *= scaleY;
                }
                if (w.e === w.x && w.f === w.y) {
                    w.x = w.e += (w.e - a) * changeScaleX + x;
                    w.y = w.f += (w.f - b) * changeScaleY + y;
                } else {
                    w.e += (w.e - a) * changeScaleX + x;
                    w.f += (w.f - b) * changeScaleY + y;
                    w.x += (w.x - a) * changeScaleX + x;
                    w.y += (w.y - b) * changeScaleY + y;
                }
                w.width *= scaleX;
                w.height *= scaleY;
                w.scaleX *= scaleX;
                w.scaleY *= scaleY;
                if (branch.isBranch) scale$1(branch, x, y, scaleX, scaleY, a, b);
            }
        }
    };
    const {pushAllChildBranch: pushAllChildBranch$1, pushAllBranchStack: pushAllBranchStack, updateBoundsByBranchStack: updateBoundsByBranchStack, move: move$3, scale: scale$1} = BranchHelper;
    const WaitHelper = {
        run(wait) {
            if (wait && wait.length) {
                const len = wait.length;
                for (let i = 0; i < len; i++) {
                    wait[i]();
                }
                wait.length === len ? wait.length = 0 : wait.splice(0, len);
            }
        }
    };
    const {getRelativeWorld: getRelativeWorld$1, updateBounds: updateBounds$1} = LeafHelper;
    const {toOuterOf: toOuterOf$3, getPoints: getPoints, copy: copy$4} = BoundsHelper;
    const localContent = "_localContentBounds";
    const worldContent = "_worldContentBounds", worldBox = "_worldBoxBounds", worldStroke = "_worldStrokeBounds";
    class LeafLayout {
        get contentBounds() {
            return this._contentBounds || this.boxBounds;
        }
        set contentBounds(bounds) {
            this._contentBounds = bounds;
        }
        get strokeBounds() {
            return this._strokeBounds || this.boxBounds;
        }
        get renderBounds() {
            return this._renderBounds || this.boxBounds;
        }
        set renderBounds(bounds) {
            this._renderBounds = bounds;
        }
        get localContentBounds() {
            toOuterOf$3(this.contentBounds, this.leaf.__localMatrix, this[localContent] || (this[localContent] = {}));
            return this[localContent];
        }
        get localStrokeBounds() {
            return this._localStrokeBounds || this;
        }
        get localRenderBounds() {
            return this._localRenderBounds || this;
        }
        get worldContentBounds() {
            toOuterOf$3(this.contentBounds, this.leaf.__world, this[worldContent] || (this[worldContent] = {}));
            return this[worldContent];
        }
        get worldBoxBounds() {
            toOuterOf$3(this.boxBounds, this.leaf.__world, this[worldBox] || (this[worldBox] = {}));
            return this[worldBox];
        }
        get worldStrokeBounds() {
            toOuterOf$3(this.strokeBounds, this.leaf.__world, this[worldStroke] || (this[worldStroke] = {}));
            return this[worldStroke];
        }
        get a() {
            return 1;
        }
        get b() {
            return 0;
        }
        get c() {
            return 0;
        }
        get d() {
            return 1;
        }
        get e() {
            return this.leaf.__.x;
        }
        get f() {
            return this.leaf.__.y;
        }
        get x() {
            return this.e + this.boxBounds.x;
        }
        get y() {
            return this.f + this.boxBounds.y;
        }
        get width() {
            return this.boxBounds.width;
        }
        get height() {
            return this.boxBounds.height;
        }
        constructor(leaf) {
            this.leaf = leaf;
            if (this.leaf.__local) this._localRenderBounds = this._localStrokeBounds = this.leaf.__local;
            if (leaf.__world) {
                this.boxBounds = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                };
                this.boxChange();
                this.matrixChange();
            }
        }
        createLocal() {
            const local = this.leaf.__local = {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                e: 0,
                f: 0,
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            if (!this._localStrokeBounds) this._localStrokeBounds = local;
            if (!this._localRenderBounds) this._localRenderBounds = local;
        }
        update() {
            const {leaf: leaf} = this, {leafer: leafer} = leaf;
            if (leaf.isApp) return updateBounds$1(leaf);
            if (leafer) {
                if (leafer.ready) leafer.watcher.changed && leafer.layouter.layout(); else leafer.start();
            } else {
                let root = leaf;
                while (root.parent && !root.parent.leafer) {
                    root = root.parent;
                }
                const r = root;
                if (r.__fullLayouting) return;
                r.__fullLayouting = true;
                Platform.layout(r);
                delete r.__fullLayouting;
            }
        }
        getTransform(relative = "world") {
            this.update();
            const {leaf: leaf} = this;
            switch (relative) {
              case "world":
                return leaf.__world;

              case "local":
                return leaf.__localMatrix;

              case "inner":
                return MatrixHelper.defaultMatrix;

              case "page":
                relative = leaf.zoomLayer;

              default:
                return getRelativeWorld$1(leaf, relative);
            }
        }
        getBounds(type, relative = "world") {
            this.update();
            switch (relative) {
              case "world":
                return this.getWorldBounds(type);

              case "local":
                return this.getLocalBounds(type);

              case "inner":
                return this.getInnerBounds(type);

              case "page":
                relative = this.leaf.zoomLayer;

              default:
                return new Bounds(this.getInnerBounds(type)).toOuterOf(this.getTransform(relative));
            }
        }
        getInnerBounds(type = "box") {
            switch (type) {
              case "render":
                return this.renderBounds;

              case "content":
                if (this.contentBounds) return this.contentBounds;

              case "box":
                return this.boxBounds;

              case "stroke":
                return this.strokeBounds;
            }
        }
        getLocalBounds(type = "box") {
            switch (type) {
              case "render":
                return this.localRenderBounds;

              case "stroke":
                return this.localStrokeBounds;

              case "content":
                if (this.contentBounds) return this.localContentBounds;

              case "box":
                return this.leaf.__localBoxBounds;
            }
        }
        getWorldBounds(type = "box") {
            switch (type) {
              case "render":
                return this.leaf.__world;

              case "stroke":
                return this.worldStrokeBounds;

              case "content":
                if (this.contentBounds) return this.worldContentBounds;

              case "box":
                return this.worldBoxBounds;
            }
        }
        getLayoutBounds(type, relative = "world", unscale) {
            const {leaf: leaf} = this;
            let point, matrix, layoutBounds, bounds = this.getInnerBounds(type);
            switch (relative) {
              case "world":
                point = leaf.getWorldPoint(bounds);
                matrix = leaf.__world;
                break;

              case "local":
                const {scaleX: scaleX, scaleY: scaleY, rotation: rotation, skewX: skewX, skewY: skewY} = leaf.__;
                layoutBounds = {
                    scaleX: scaleX,
                    scaleY: scaleY,
                    rotation: rotation,
                    skewX: skewX,
                    skewY: skewY
                };
                point = leaf.getLocalPointByInner(bounds);
                break;

              case "inner":
                point = bounds;
                matrix = MatrixHelper.defaultMatrix;
                break;

              case "page":
                relative = leaf.zoomLayer;

              default:
                point = leaf.getWorldPoint(bounds, relative);
                matrix = getRelativeWorld$1(leaf, relative, true);
            }
            if (!layoutBounds) layoutBounds = MatrixHelper.getLayout(matrix);
            copy$4(layoutBounds, bounds);
            PointHelper.copy(layoutBounds, point);
            if (unscale) {
                const {scaleX: scaleX, scaleY: scaleY} = layoutBounds;
                const uScaleX = Math.abs(scaleX);
                const uScaleY = Math.abs(scaleY);
                if (uScaleX !== 1 || uScaleY !== 1) {
                    layoutBounds.scaleX /= uScaleX;
                    layoutBounds.scaleY /= uScaleY;
                    layoutBounds.width *= uScaleX;
                    layoutBounds.height *= uScaleY;
                }
            }
            return layoutBounds;
        }
        getLayoutPoints(type, relative = "world") {
            const {leaf: leaf} = this;
            const points = getPoints(this.getInnerBounds(type));
            let relativeLeaf;
            switch (relative) {
              case "world":
                relativeLeaf = null;
                break;

              case "local":
                relativeLeaf = leaf.parent;
                break;

              case "inner":
                break;

              case "page":
                relative = leaf.zoomLayer;

              default:
                relativeLeaf = relative;
            }
            if (!isUndefined(relativeLeaf)) points.forEach(point => leaf.innerToWorld(point, null, false, relativeLeaf));
            return points;
        }
        shrinkContent() {
            const {x: x, y: y, width: width, height: height} = this.boxBounds;
            this._contentBounds = {
                x: x,
                y: y,
                width: width,
                height: height
            };
        }
        spreadStroke() {
            const {x: x, y: y, width: width, height: height} = this.strokeBounds;
            this._strokeBounds = {
                x: x,
                y: y,
                width: width,
                height: height
            };
            this._localStrokeBounds = {
                x: x,
                y: y,
                width: width,
                height: height
            };
            if (!this.renderSpread) this.spreadRenderCancel();
        }
        spreadRender() {
            const {x: x, y: y, width: width, height: height} = this.renderBounds;
            this._renderBounds = {
                x: x,
                y: y,
                width: width,
                height: height
            };
            this._localRenderBounds = {
                x: x,
                y: y,
                width: width,
                height: height
            };
        }
        shrinkContentCancel() {
            this._contentBounds = undefined;
        }
        spreadStrokeCancel() {
            const same = this.renderBounds === this.strokeBounds;
            this._strokeBounds = this.boxBounds;
            this._localStrokeBounds = this.leaf.__localBoxBounds;
            if (same) this.spreadRenderCancel();
        }
        spreadRenderCancel() {
            this._renderBounds = this._strokeBounds;
            this._localRenderBounds = this._localStrokeBounds;
        }
        boxChange() {
            this.boxChanged = true;
            this.localBoxChanged ? this.boundsChanged || (this.boundsChanged = true) : this.localBoxChange();
            this.hitCanvasChanged = true;
        }
        localBoxChange() {
            this.localBoxChanged = true;
            this.boundsChanged = true;
        }
        strokeChange() {
            this.strokeChanged = true;
            this.strokeSpread || (this.strokeSpread = 1);
            this.boundsChanged = true;
            this.hitCanvasChanged = true;
        }
        renderChange() {
            this.renderChanged = true;
            this.renderSpread || (this.renderSpread = 1);
            this.boundsChanged = true;
            this.hitCanvasChanged = true;
        }
        scaleChange() {
            this.scaleChanged = true;
            this._scaleOrRotationChange();
        }
        rotationChange() {
            this.rotationChanged = true;
            this.affectRotation = true;
            this._scaleOrRotationChange();
        }
        _scaleOrRotationChange() {
            this.affectScaleOrRotation = true;
            this.matrixChange();
            if (!this.leaf.__local) this.createLocal();
        }
        matrixChange() {
            this.matrixChanged = true;
            this.localBoxChanged ? this.boundsChanged || (this.boundsChanged = true) : this.localBoxChange();
        }
        surfaceChange() {
            this.surfaceChanged = true;
        }
        opacityChange() {
            this.opacityChanged = true;
        }
        childrenSortChange() {
            if (!this.childrenSortChanged) {
                this.childrenSortChanged = this.affectChildrenSort = true;
                this.leaf.forceUpdate("surface");
            }
        }
        destroy() {}
    }
    class Event {
        constructor(type, target) {
            this.bubbles = false;
            this.type = type;
            if (target) this.target = target;
        }
        stopDefault() {
            this.isStopDefault = true;
            if (this.origin) Platform.event.stopDefault(this.origin);
        }
        stopNow() {
            this.isStopNow = true;
            this.isStop = true;
            if (this.origin) Platform.event.stopNow(this.origin);
        }
        stop() {
            this.isStop = true;
            if (this.origin) Platform.event.stop(this.origin);
        }
    }
    class ChildEvent extends Event {
        constructor(type, child, parent) {
            super(type, child);
            this.parent = parent;
            this.child = child;
        }
    }
    ChildEvent.ADD = "child.add";
    ChildEvent.REMOVE = "child.remove";
    ChildEvent.CREATED = "created";
    ChildEvent.MOUNTED = "mounted";
    ChildEvent.UNMOUNTED = "unmounted";
    ChildEvent.DESTROY = "destroy";
    const SCROLL = "property.scroll";
    class PropertyEvent extends Event {
        constructor(type, target, attrName, oldValue, newValue) {
            super(type, target);
            this.attrName = attrName;
            this.oldValue = oldValue;
            this.newValue = newValue;
        }
    }
    PropertyEvent.CHANGE = "property.change";
    PropertyEvent.LEAFER_CHANGE = "property.leafer_change";
    PropertyEvent.SCROLL = SCROLL;
    const extraPropertyEventMap = {
        scrollX: SCROLL,
        scrollY: SCROLL
    };
    class ImageEvent extends Event {
        constructor(type, data) {
            super(type);
            Object.assign(this, data);
        }
    }
    ImageEvent.LOAD = "image.load";
    ImageEvent.LOADED = "image.loaded";
    ImageEvent.ERROR = "image.error";
    class BoundsEvent extends Event {
        static checkHas(leaf, type, mode) {
            if (mode === "on") {
                type === WORLD ? leaf.__hasWorldEvent = true : leaf.__hasLocalEvent = true;
            } else {
                leaf.__hasLocalEvent = leaf.hasEvent(RESIZE) || leaf.hasEvent(INNER) || leaf.hasEvent(LOCAL);
                leaf.__hasWorldEvent = leaf.hasEvent(WORLD);
            }
        }
        static emitLocal(leaf) {
            if (leaf.leaferIsReady) {
                const {resized: resized} = leaf.__layout;
                if (resized !== "local") {
                    leaf.emit(RESIZE, leaf);
                    if (resized === "inner") leaf.emit(INNER, leaf);
                }
                leaf.emit(LOCAL, leaf);
            }
        }
        static emitWorld(leaf) {
            if (leaf.leaferIsReady) leaf.emit(WORLD, leaf);
        }
    }
    BoundsEvent.RESIZE = "bounds.resize";
    BoundsEvent.INNER = "bounds.inner";
    BoundsEvent.LOCAL = "bounds.local";
    BoundsEvent.WORLD = "bounds.world";
    const {RESIZE: RESIZE, INNER: INNER, LOCAL: LOCAL, WORLD: WORLD} = BoundsEvent;
    const boundsEventMap = {};
    [ RESIZE, INNER, LOCAL, WORLD ].forEach(key => boundsEventMap[key] = 1);
    class ResizeEvent extends Event {
        get bigger() {
            if (!this.old) return true;
            const {width: width, height: height} = this.old;
            return this.width >= width && this.height >= height;
        }
        get smaller() {
            return !this.bigger;
        }
        get samePixelRatio() {
            if (!this.old) return true;
            return this.pixelRatio === this.old.pixelRatio;
        }
        constructor(size, oldSize) {
            if (isObject(size)) {
                super(ResizeEvent.RESIZE);
                Object.assign(this, size);
            } else {
                super(size);
            }
            this.old = oldSize;
        }
        static isResizing(leaf) {
            return this.resizingKeys && !isUndefined(this.resizingKeys[leaf.innerId]);
        }
    }
    ResizeEvent.RESIZE = "resize";
    class WatchEvent extends Event {
        constructor(type, data) {
            super(type);
            this.data = data;
        }
    }
    WatchEvent.REQUEST = "watch.request";
    WatchEvent.DATA = "watch.data";
    class LayoutEvent extends Event {
        constructor(type, data, times) {
            super(type);
            if (data) {
                this.data = data;
                this.times = times;
            }
        }
    }
    LayoutEvent.REQUEST = "layout.request";
    LayoutEvent.START = "layout.start";
    LayoutEvent.BEFORE = "layout.before";
    LayoutEvent.LAYOUT = "layout";
    LayoutEvent.AFTER = "layout.after";
    LayoutEvent.AGAIN = "layout.again";
    LayoutEvent.END = "layout.end";
    class RenderEvent extends Event {
        constructor(type, times, bounds, options) {
            super(type);
            if (times) this.times = times;
            if (bounds) {
                this.renderBounds = bounds;
                this.renderOptions = options;
            }
        }
    }
    RenderEvent.REQUEST = "render.request";
    RenderEvent.CHILD_START = "render.child_start";
    RenderEvent.CHILD_END = "render.child_end";
    RenderEvent.START = "render.start";
    RenderEvent.BEFORE = "render.before";
    RenderEvent.RENDER = "render";
    RenderEvent.AFTER = "render.after";
    RenderEvent.AGAIN = "render.again";
    RenderEvent.END = "render.end";
    RenderEvent.NEXT = "render.next";
    class LeaferEvent extends Event {}
    LeaferEvent.START = "leafer.start";
    LeaferEvent.BEFORE_READY = "leafer.before_ready";
    LeaferEvent.READY = "leafer.ready";
    LeaferEvent.AFTER_READY = "leafer.after_ready";
    LeaferEvent.VIEW_READY = "leafer.view_ready";
    LeaferEvent.VIEW_COMPLETED = "leafer.view_completed";
    LeaferEvent.STOP = "leafer.stop";
    LeaferEvent.RESTART = "leafer.restart";
    LeaferEvent.END = "leafer.end";
    LeaferEvent.UPDATE_MODE = "leafer.update_mode";
    LeaferEvent.TRANSFORM = "leafer.transform";
    LeaferEvent.MOVE = "leafer.move";
    LeaferEvent.SCALE = "leafer.scale";
    LeaferEvent.ROTATE = "leafer.rotate";
    LeaferEvent.SKEW = "leafer.skew";
    const {MOVE: MOVE, SCALE: SCALE, ROTATE: ROTATE, SKEW: SKEW} = LeaferEvent;
    const leaferTransformAttrMap = {
        x: MOVE,
        y: MOVE,
        scaleX: SCALE,
        scaleY: SCALE,
        rotation: ROTATE,
        skewX: SKEW,
        skewY: SKEW
    };
    const empty = {};
    class Eventer {
        set event(map) {
            this.on(map);
        }
        on(type, listener, options) {
            if (!listener) {
                let event;
                if (isArray(type)) type.forEach(item => this.on(item[0], item[1], item[2])); else for (let key in type) isArray(event = type[key]) ? this.on(key, event[0], event[1]) : this.on(key, event);
                return;
            }
            let capture, once;
            if (options) {
                if (options === "once") {
                    once = true;
                } else if (typeof options === "boolean") {
                    capture = options;
                } else {
                    capture = options.capture;
                    once = options.once;
                }
            }
            let events;
            const map = __getListenerMap(this, capture, true);
            const typeList = isString(type) ? type.split(" ") : type;
            const item = once ? {
                listener: listener,
                once: once
            } : {
                listener: listener
            };
            typeList.forEach(type => {
                if (type) {
                    events = map[type];
                    if (events) {
                        if (events.findIndex(item => item.listener === listener) === -1) events.push(item);
                    } else {
                        map[type] = [ item ];
                    }
                    if (boundsEventMap[type]) BoundsEvent.checkHas(this, type, "on");
                }
            });
        }
        off(type, listener, options) {
            if (type) {
                const typeList = isString(type) ? type.split(" ") : type;
                if (listener) {
                    let capture;
                    if (options) capture = typeof options === "boolean" ? options : options === "once" ? false : options.capture;
                    let events, index;
                    const map = __getListenerMap(this, capture);
                    typeList.forEach(type => {
                        if (type) {
                            events = map[type];
                            if (events) {
                                index = events.findIndex(item => item.listener === listener);
                                if (index > -1) events.splice(index, 1);
                                if (!events.length) delete map[type];
                                if (boundsEventMap[type]) BoundsEvent.checkHas(this, type, "off");
                            }
                        }
                    });
                } else {
                    const {__bubbleMap: b, __captureMap: c} = this;
                    typeList.forEach(type => {
                        if (b) delete b[type];
                        if (c) delete c[type];
                    });
                }
            } else {
                this.__bubbleMap = this.__captureMap = undefined;
            }
        }
        on_(type, listener, bind, options) {
            if (!listener) isArray(type) && type.forEach(item => this.on(item[0], item[2] ? item[1] = item[1].bind(item[2]) : item[1], item[3])); else this.on(type, bind ? listener = listener.bind(bind) : listener, options);
            return {
                type: type,
                current: this,
                listener: listener,
                options: options
            };
        }
        off_(id) {
            if (!id) return;
            const list = isArray(id) ? id : [ id ];
            list.forEach(item => {
                if (item) {
                    if (!item.listener) isArray(item.type) && item.type.forEach(v => item.current.off(v[0], v[1], v[3])); else item.current.off(item.type, item.listener, item.options);
                }
            });
            list.length = 0;
        }
        once(type, listener, captureOrBind, capture) {
            if (!listener) return isArray(type) && type.forEach(item => this.once(item[0], item[1], item[2], item[3]));
            if (isObject(captureOrBind)) listener = listener.bind(captureOrBind); else capture = captureOrBind;
            this.on(type, listener, {
                once: true,
                capture: capture
            });
        }
        emit(type, event, capture) {
            if (!event && EventCreator.has(type)) event = EventCreator.get(type, {
                type: type,
                target: this,
                current: this
            });
            const map = __getListenerMap(this, capture);
            const list = map[type];
            if (list) {
                let item;
                for (let i = 0, len = list.length; i < len; i++) {
                    if (item = list[i]) {
                        item.listener(event);
                        if (item.once) {
                            this.off(type, item.listener, capture);
                            i--, len--;
                        }
                        if (event && event.isStopNow) break;
                    }
                }
            }
            this.syncEventer && this.syncEventer.emitEvent(event, capture);
        }
        emitEvent(event, capture) {
            event.current = this;
            this.emit(event.type, event, capture);
        }
        hasEvent(type, capture) {
            if (this.syncEventer && this.syncEventer.hasEvent(type, capture)) return true;
            const {__bubbleMap: b, __captureMap: c} = this;
            const hasB = b && b[type], hasC = c && c[type];
            return !!(isUndefined(capture) ? hasB || hasC : capture ? hasC : hasB);
        }
        destroy() {
            this.__captureMap = this.__bubbleMap = this.syncEventer = null;
        }
    }
    function __getListenerMap(eventer, capture, create) {
        if (capture) {
            const {__captureMap: c} = eventer;
            if (c) {
                return c;
            } else {
                return create ? eventer.__captureMap = {} : empty;
            }
        } else {
            const {__bubbleMap: b} = eventer;
            if (b) {
                return b;
            } else {
                return create ? eventer.__bubbleMap = {} : empty;
            }
        }
    }
    const {on: on, on_: on_, off: off, off_: off_, once: once, emit: emit$2, emitEvent: emitEvent$1, hasEvent: hasEvent, destroy: destroy} = Eventer.prototype;
    const LeafEventer = {
        on: on,
        on_: on_,
        off: off,
        off_: off_,
        once: once,
        emit: emit$2,
        emitEvent: emitEvent$1,
        hasEvent: hasEvent,
        destroyEventer: destroy
    };
    const debug$7 = Debug.get("setAttr");
    const LeafDataProxy = {
        __setAttr(name, newValue, checkFiniteNumber) {
            if (this.leaferIsCreated) {
                const oldValue = this.__.__getInput(name);
                if (checkFiniteNumber && !isFinite(newValue) && !isUndefined(newValue)) {
                    debug$7.warn(this.innerName, name, newValue);
                    newValue = undefined;
                }
                if (isObject(newValue) || oldValue !== newValue) {
                    this.__realSetAttr(name, newValue);
                    if (this.isLeafer) {
                        this.emitEvent(new PropertyEvent(PropertyEvent.LEAFER_CHANGE, this, name, oldValue, newValue));
                        const transformEventName = leaferTransformAttrMap[name];
                        if (transformEventName) {
                            this.emitEvent(new LeaferEvent(transformEventName, this));
                            this.emitEvent(new LeaferEvent(LeaferEvent.TRANSFORM, this));
                        }
                    }
                    this.emitPropertyEvent(PropertyEvent.CHANGE, name, oldValue, newValue);
                    const extraPropertyEvent = extraPropertyEventMap[name];
                    if (extraPropertyEvent) this.emitPropertyEvent(extraPropertyEvent, name, oldValue, newValue);
                    return true;
                } else {
                    return false;
                }
            } else {
                this.__realSetAttr(name, newValue);
                return true;
            }
        },
        emitPropertyEvent(type, name, oldValue, newValue) {
            const {leafer: leafer} = this;
            if (isTrackChanges(leafer) || leafer.zoomLayer === this) {
                const event = new PropertyEvent(type, this, name, oldValue, newValue);
                this.isLeafer || this.hasEvent(type) && this.emitEvent(event);
                leafer.emitEvent(event);
            } else leafer.watcher.add(this);
        },
        __realSetAttr(name, newValue) {
            const data = this.__;
            data[name] = newValue;
            if (this.__proxyData) this.setProxyAttr(name, newValue);
            if (data.normalStyle) this.lockNormalStyle || isUndefined(data.normalStyle[name]) || (data.normalStyle[name] = newValue);
        },
        __getAttr(name) {
            if (this.__proxyData) return this.getProxyAttr(name);
            return this.__.__get(name);
        }
    };
    const {setLayout: setLayout, multiplyParent: multiplyParent$2, translateInner: translateInner, defaultWorld: defaultWorld} = MatrixHelper;
    const {toPoint: toPoint$3, tempPoint: tempPoint$2} = AroundHelper;
    const LeafMatrix = {
        __updateWorldMatrix() {
            const {parent: parent, __layout: __layout, __world: __world, __scrollWorld: __scrollWorld, __: __} = this;
            multiplyParent$2(this.__local || __layout, parent ? parent.__scrollWorld || parent.__world : defaultWorld, __world, !!__layout.affectScaleOrRotation, __);
            if (__scrollWorld) translateInner(Object.assign(__scrollWorld, __world), __.scrollX, __.scrollY);
            if (__layout.scaleFixed) LeafHelper.updateScaleFixedWorld(this);
        },
        __updateLocalMatrix() {
            if (this.__local) {
                const layout = this.__layout, local = this.__local, data = this.__;
                if (layout.affectScaleOrRotation) {
                    if (layout.scaleChanged && (layout.resized || (layout.resized = "scale")) || layout.rotationChanged) {
                        setLayout(local, data, null, null, layout.affectRotation);
                        layout.scaleChanged = layout.rotationChanged = undefined;
                    }
                }
                local.e = data.x + data.offsetX;
                local.f = data.y + data.offsetY;
                if (data.around || data.origin) {
                    toPoint$3(data.around || data.origin, layout.boxBounds, tempPoint$2);
                    translateInner(local, -tempPoint$2.x, -tempPoint$2.y, !data.around);
                }
            }
            this.__layout.matrixChanged = undefined;
        }
    };
    const {updateMatrix: updateMatrix, updateAllMatrix: updateAllMatrix$2} = LeafHelper;
    const {updateBounds: updateBounds} = BranchHelper;
    const {toOuterOf: toOuterOf$2, copyAndSpread: copyAndSpread$2, copy: copy$3} = BoundsHelper;
    const {toBounds: toBounds} = PathBounds;
    const LeafBounds = {
        __updateWorldBounds() {
            const {__layout: __layout, __world: __world} = this;
            toOuterOf$2(__layout.renderBounds, __world, __world);
            if (this.__hasComplex) LeafHelper.checkComplex(this);
            if (__layout.resized) {
                if (__layout.resized === "inner") this.__onUpdateSize();
                if (this.__hasLocalEvent) BoundsEvent.emitLocal(this);
                __layout.resized = undefined;
            }
            if (this.__hasWorldEvent) BoundsEvent.emitWorld(this);
        },
        __updateLocalBounds() {
            const layout = this.__layout, data = this.__;
            if (layout.boxChanged) {
                if (!data.__pathInputed) this.__updatePath();
                this.__updateRenderPath();
                this.__updateBoxBounds();
                layout.resized = "inner";
            }
            if (layout.localBoxChanged) {
                if (this.__local) this.__updateLocalBoxBounds();
                layout.localBoxChanged = undefined;
                if (layout.strokeSpread && !layout.strokeChanged) layout.strokeChanged = layout.boxChanged ? true : 2;
                if (layout.renderSpread && !layout.renderChanged) layout.renderChanged = layout.boxChanged ? true : 2;
                if (this.parent) this.parent.__layout.boxChange();
            }
            layout.boxChanged = undefined;
            if (layout.strokeChanged) {
                if (layout.strokeChanged === 2) {
                    this.__updateLocalStrokeBounds();
                } else {
                    layout.strokeSpread = this.__updateStrokeSpread();
                    if (layout.strokeSpread) {
                        if (layout.strokeBounds === layout.boxBounds) layout.spreadStroke();
                        this.__updateStrokeBounds();
                        this.__updateLocalStrokeBounds();
                    } else {
                        layout.spreadStrokeCancel();
                    }
                    layout.resized = "inner";
                    if (layout.renderSpread || layout.strokeSpread !== layout.strokeBoxSpread) layout.renderChanged = true;
                }
                layout.strokeChanged = undefined;
                if (this.parent) this.parent.__layout.strokeChange();
            }
            if (layout.renderChanged) {
                if (layout.renderChanged === 2) {
                    this.__updateLocalRenderBounds();
                } else {
                    layout.renderSpread = this.__updateRenderSpread();
                    if (layout.renderSpread) {
                        if (layout.renderBounds === layout.boxBounds || layout.renderBounds === layout.strokeBounds) layout.spreadRender();
                        this.__updateRenderBounds();
                        this.__updateLocalRenderBounds();
                    } else {
                        layout.spreadRenderCancel();
                    }
                }
                layout.renderChanged = undefined;
                if (this.parent) this.parent.__layout.renderChange();
            }
            if (layout.outerScale) LeafHelper.updateOuterBounds(this);
            layout.resized || (layout.resized = "local");
            layout.boundsChanged = undefined;
        },
        __updateLocalBoxBounds() {
            if (this.__hasMotionPath) this.__updateMotionPath();
            if (this.__hasAutoLayout) this.__updateAutoLayout();
            toOuterOf$2(this.__layout.boxBounds, this.__local, this.__local);
        },
        __updateLocalStrokeBounds() {
            toOuterOf$2(this.__layout.strokeBounds, this.__localMatrix, this.__layout.localStrokeBounds);
        },
        __updateLocalRenderBounds() {
            toOuterOf$2(this.__layout.renderBounds, this.__localMatrix, this.__layout.localRenderBounds);
        },
        __updateBoxBounds(_secondLayout, _bounds) {
            const b = this.__layout.boxBounds;
            const data = this.__;
            if (data.__usePathBox) {
                toBounds(data.path, b);
            } else {
                b.x = 0;
                b.y = 0;
                b.width = data.width;
                b.height = data.height;
            }
        },
        __updateAutoLayout() {
            this.__layout.matrixChanged = true;
            if (this.isBranch) {
                this.__extraUpdate();
                if (this.__.flow) {
                    if (this.__layout.childrenSortChanged) this.__updateSortChildren();
                    if (this.__layout.boxChanged) this.__updateFlowLayout();
                    updateAllMatrix$2(this);
                    updateBounds(this, this);
                    if (this.__.__autoSide) this.__updateBoxBounds(true);
                } else {
                    updateAllMatrix$2(this);
                    updateBounds(this, this);
                }
            } else {
                updateMatrix(this);
            }
        },
        __updateNaturalSize() {
            const {__: data, __layout: layout} = this;
            data.__naturalWidth = layout.boxBounds.width;
            data.__naturalHeight = layout.boxBounds.height;
        },
        __updateStrokeBounds(_bounds) {
            const layout = this.__layout;
            copyAndSpread$2(layout.strokeBounds, layout.boxBounds, layout.strokeBoxSpread);
        },
        __updateRenderBounds(_bounds) {
            const layout = this.__layout, {renderSpread: renderSpread} = layout;
            isNumber(renderSpread) && renderSpread <= 0 ? copy$3(layout.renderBounds, layout.strokeBounds) : copyAndSpread$2(layout.renderBounds, layout.boxBounds, renderSpread);
        }
    };
    const LeafRender = {
        __render(canvas, options) {
            if (options.shape) return this.__renderShape(canvas, options);
            if (options.cellList && !options.cellList.has(this)) return;
            if (this.__worldOpacity) {
                const data = this.__;
                if (data.bright && !options.topRendering) return options.topList.add(this);
                canvas.setWorld(this.__nowWorld = this.__getNowWorld(options));
                canvas.opacity = options.ignoreOpacity ? 1 : options.dimOpacity && !data.dimskip ? data.opacity * options.dimOpacity : data.opacity;
                if (this.__.__single) {
                    if (data.eraser === "path") return this.__renderEraser(canvas, options);
                    const tempCanvas = canvas.getSameCanvas(true, true);
                    this.__draw(tempCanvas, options, canvas);
                    LeafHelper.copyCanvasByWorld(this, canvas, tempCanvas, this.__nowWorld, data.__blendMode, true);
                    tempCanvas.recycle(this.__nowWorld);
                } else {
                    this.__draw(canvas, options);
                }
                if (Debug.showBounds) Debug.drawBounds(this, canvas, options);
            }
        },
        __renderShape(canvas, options) {
            if (this.__worldOpacity) {
                canvas.setWorld(this.__nowWorld = this.__getNowWorld(options));
                this.__drawShape(canvas, options);
            }
        },
        __clip(canvas, options) {
            LeafHelper.clip(this, canvas, options);
        },
        __updateWorldOpacity() {
            this.__worldOpacity = this.__.visible ? this.parent ? this.parent.__worldOpacity * this.__.opacity : this.__.opacity : 0;
            if (this.__layout.opacityChanged) this.__layout.opacityChanged = false;
        }
    };
    const {excludeRenderBounds: excludeRenderBounds$1} = LeafBoundsHelper, {hasSize: hasSize} = BoundsHelper;
    const BranchRender = {
        __updateChange() {
            if (this.__layout.childrenSortChanged) this.__updateSortChildren();
            this.__.__checkSingle();
        },
        __render(canvas, options) {
            const nowWorld = this.__nowWorld = this.__getNowWorld(options);
            if (this.__worldOpacity && hasSize(nowWorld)) {
                const data = this.__;
                if (data.__useDim) {
                    if (data.bright && !options.topRendering) return options.topList.add(this);
                    if (data.dim) options.dimOpacity = data.dim === true ? .2 : data.dim; else if (data.dimskip) options.dimOpacity && (options.dimOpacity = 0);
                }
                if (data.__single && !this.isBranchLeaf) {
                    if (data.eraser === "path") return this.__renderEraser(canvas, options);
                    const tempCanvas = canvas.getSameCanvas(false, true);
                    this.__renderBranch(tempCanvas, options);
                    canvas.opacity = options.ignoreOpacity ? 1 : options.dimOpacity ? data.opacity * options.dimOpacity : data.opacity;
                    canvas.copyWorldByReset(tempCanvas, nowWorld, nowWorld, data.__blendMode, true);
                    tempCanvas.recycle(nowWorld);
                } else {
                    this.__renderBranch(canvas, options);
                }
            }
        },
        __renderBranch(canvas, options) {
            if (this.__hasMask) {
                this.__renderMask(canvas, options);
            } else {
                let child;
                const {children: children} = this;
                for (let i = 0, len = children.length; i < len; i++) {
                    child = children[i];
                    excludeRenderBounds$1(child, options) || (child.__hasComplex ? LeafHelper.renderComplex(child, canvas, options) : child.__render(canvas, options));
                }
                if (this.__hasMask === 0) this.__rerenderMask(canvas, options);
            }
        },
        __clip(canvas, options) {
            if (this.__worldOpacity) {
                const {children: children} = this;
                for (let i = 0, len = children.length; i < len; i++) {
                    excludeRenderBounds$1(children[i], options) || children[i].__clip(canvas, options);
                }
            }
        }
    };
    const {LEAF: LEAF, create: create} = IncrementId;
    const {stintSet: stintSet$4} = DataHelper;
    const {toInnerPoint: toInnerPoint, toOuterPoint: toOuterPoint, multiplyParent: multiplyParent$1} = MatrixHelper;
    const {toOuterOf: toOuterOf$1} = BoundsHelper;
    const {copy: copy$2, move: move$2} = PointHelper;
    const {getScaleFixedData: getScaleFixedData} = MathHelper;
    const {moveLocal: moveLocal, zoomOfLocal: zoomOfLocal, rotateOfLocal: rotateOfLocal, skewOfLocal: skewOfLocal, moveWorld: moveWorld, zoomOfWorld: zoomOfWorld, rotateOfWorld: rotateOfWorld, skewOfWorld: skewOfWorld, transform: transform, transformWorld: transformWorld, setTransform: setTransform, getFlipTransform: getFlipTransform, getLocalOrigin: getLocalOrigin, getRelativeWorld: getRelativeWorld, drop: drop} = LeafHelper;
    exports.Leaf = class Leaf {
        get tag() {
            return this.__tag;
        }
        set tag(_value) {}
        get __tag() {
            return "Leaf";
        }
        get innerName() {
            return this.__.name || this.tag + this.innerId;
        }
        get __DataProcessor() {
            return LeafData;
        }
        get __LayoutProcessor() {
            return LeafLayout;
        }
        get leaferIsCreated() {
            return this.leafer && this.leafer.created;
        }
        get leaferIsReady() {
            return this.leafer && this.leafer.ready;
        }
        get isLeafer() {
            return false;
        }
        get isFrame() {
            return false;
        }
        get isBranch() {
            return false;
        }
        get isBranchLeaf() {
            return false;
        }
        get __localMatrix() {
            return this.__local || this.__layout;
        }
        get __localBoxBounds() {
            return this.__local || this.__layout;
        }
        get worldTransform() {
            return this.__layout.getTransform("world");
        }
        get localTransform() {
            return this.__layout.getTransform("local");
        }
        get scrollWorldTransform() {
            this.updateLayout();
            return this.__scrollWorld || this.__world;
        }
        get boxBounds() {
            return this.getBounds("box", "inner");
        }
        get renderBounds() {
            return this.getBounds("render", "inner");
        }
        get worldBoxBounds() {
            return this.getBounds("box");
        }
        get worldStrokeBounds() {
            return this.getBounds("stroke");
        }
        get worldRenderBounds() {
            return this.getBounds("render");
        }
        get worldOpacity() {
            this.updateLayout();
            return this.__worldOpacity;
        }
        get __worldFlipped() {
            return this.__world.scaleX < 0 || this.__world.scaleY < 0;
        }
        get __onlyHitMask() {
            return this.__hasMask && !this.__.hitChildren;
        }
        get __ignoreHitWorld() {
            return (this.__hasMask || this.__hasEraser) && this.__.hitChildren;
        }
        get __inLazyBounds() {
            return this.leaferIsCreated && this.leafer.lazyBounds.hit(this.__world);
        }
        get pathInputed() {
            return this.__.__pathInputed;
        }
        set event(map) {
            this.on(map);
        }
        constructor(data) {
            this.innerId = create(LEAF);
            this.reset(data);
            if (this.__bubbleMap) this.__emitLifeEvent(ChildEvent.CREATED);
        }
        reset(data) {
            if (this.leafer) this.leafer.forceRender(this.__world);
            if (data !== 0) {
                this.__world = {
                    a: 1,
                    b: 0,
                    c: 0,
                    d: 1,
                    e: 0,
                    f: 0,
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    scaleX: 1,
                    scaleY: 1
                };
                if (data !== null) this.__local = {
                    a: 1,
                    b: 0,
                    c: 0,
                    d: 1,
                    e: 0,
                    f: 0,
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                };
            }
            this.__worldOpacity = 1;
            this.__ = new this.__DataProcessor(this);
            this.__layout = new this.__LayoutProcessor(this);
            if (this.__level) this.resetCustom();
            if (data) {
                if (data.__) data = data.toJSON();
                data.children ? this.set(data) : Object.assign(this, data);
            }
        }
        resetCustom() {
            this.__hasMask = this.__hasEraser = null;
            this.forceUpdate();
        }
        waitParentChange(item) {
            this.__parentChange || (this.__parentChange = []);
            if (!this.__parentChange.includes(item)) this.__parentChange.push(item);
            if (this.parent) item(this.parent, this);
        }
        waitParent(item, bind) {
            if (bind) item = item.bind(bind);
            this.parent ? item() : this.on(ChildEvent.ADD, item, "once");
        }
        waitLeafer(item, bind) {
            if (bind) item = item.bind(bind);
            this.leafer ? item() : this.on(ChildEvent.MOUNTED, item, "once");
        }
        nextRender(item, bind, off) {
            this.leafer ? this.leafer.nextRender(item, bind, off) : this.waitLeafer(() => this.leafer.nextRender(item, bind, off));
        }
        removeNextRender(item) {
            this.nextRender(item, null, "off");
        }
        __bindLeafer(leafer) {
            if (this.isLeafer && leafer !== null) leafer = this;
            if (this.leafer && !leafer) this.leafer.leafs--;
            this.leafer = leafer;
            if (leafer) {
                leafer.leafs++;
                this.__level = this.parent ? this.parent.__level + 1 : 1;
                if (this.animation) this.__runAnimation("in");
                if (this.__bubbleMap) this.__emitLifeEvent(ChildEvent.MOUNTED);
                if (leafer.cacheId) LeafHelper.cacheId(this);
            } else {
                this.__emitLifeEvent(ChildEvent.UNMOUNTED);
            }
            if (this.isBranch) {
                const {children: children} = this;
                for (let i = 0, len = children.length; i < len; i++) {
                    children[i].__bindLeafer(leafer);
                }
            }
        }
        __bindFrame(frame) {
            this.frame = frame;
            if (this.isBranch) {
                const {children: children} = this;
                for (let i = 0, len = children.length; i < len; i++) {
                    children[i].__bindFrame(frame);
                }
            }
        }
        setAttr(name, value) {
            this[name] = value;
        }
        getAttr(name) {
            return this[name];
        }
        getComputedAttr(name) {
            return this.__[name];
        }
        toJSON(options) {
            if (options) this.__layout.update();
            return this.__.__getInputData(null, options);
        }
        toString(options) {
            return JSON.stringify(this.toJSON(options));
        }
        scaleResize(scaleX, scaleY = scaleX, _noResize, _boundsType) {
            this.scaleX *= scaleX;
            this.scaleY *= scaleY;
        }
        updateLayout() {
            this.__layout.update();
        }
        forceUpdate(typeOrAttrName) {
            if (this.__hasComplex) LeafHelper.updateComplex(this);
            let quick;
            if (!typeOrAttrName || typeOrAttrName === "bounds") doBoundsType(this), quick = true; else if (typeOrAttrName === "surface") doSurfaceType(this), 
            quick = true; else if (typeOrAttrName === "stroke") doStrokeType(this), quick = true;
            if (quick) {
                const {leafer: leafer} = this;
                return leafer && leafer.watcher && leafer.watcher.__onAttrChange({
                    target: this
                });
            }
            const value = this.__.__getInput(typeOrAttrName);
            this.__[typeOrAttrName] = isUndefined(value) ? null : undefined;
            this[typeOrAttrName] = value;
        }
        forceRender(_bounds, _sync) {
            this.forceUpdate("surface");
        }
        __extraUpdate() {
            if (this.leaferIsReady) this.leafer.layouter.addExtra(this);
        }
        __updateEraser() {
            this.__hasEraser = this.children.some(item => item.__.eraser);
        }
        __renderEraser(canvas, options) {
            canvas.save();
            this.__clip(canvas, options);
            const {renderBounds: r} = this.__layout;
            canvas.clearRect(r.x, r.y, r.width, r.height);
            canvas.restore();
        }
        __updateMask() {
            const hasMask = this.children.some(item => item.__.mask && item.__.visible && item.__.opacity);
            this.__hasMask = this.__.maskskip ? hasMask && 0 : hasMask;
        }
        __getNowWorld(options) {
            if (options.matrix) {
                if (!this.__cameraWorld) this.__cameraWorld = {};
                const cameraWorld = this.__cameraWorld, world = this.__world;
                multiplyParent$1(world, options.matrix, cameraWorld, undefined, world);
                toOuterOf$1(this.__layout.renderBounds, cameraWorld, cameraWorld);
                stintSet$4(cameraWorld, "half", world.half);
                stintSet$4(cameraWorld, "ignorePixelSnap", world.ignorePixelSnap);
                return cameraWorld;
            } else {
                return this.__world;
            }
        }
        getClampRenderScale() {
            let {scaleX: scaleX} = this.__nowWorld || this.__world;
            if (scaleX < 0) scaleX = -scaleX;
            return scaleX > 1 ? scaleX : 1;
        }
        getRenderScaleData(abs, scaleFixed, unscale = true) {
            return getScaleFixedData(ImageManager.patternLocked ? this.__world : this.__nowWorld || this.__world, scaleFixed, unscale, abs);
        }
        getTransform(relative) {
            return this.__layout.getTransform(relative || "local");
        }
        getBounds(type, relative) {
            return this.__layout.getBounds(type, relative);
        }
        getLayoutBounds(type, relative, unscale) {
            return this.__layout.getLayoutBounds(type, relative, unscale);
        }
        getLayoutPoints(type, relative) {
            return this.__layout.getLayoutPoints(type, relative);
        }
        getWorldBounds(inner, relative, change) {
            const matrix = relative ? getRelativeWorld(this, relative) : this.worldTransform;
            const to = change ? inner : {};
            toOuterOf$1(inner, matrix, to);
            return to;
        }
        worldToLocal(world, to, distance, relative) {
            if (this.parent) {
                this.parent.worldToInner(world, to, distance, relative);
            } else {
                if (to) copy$2(to, world);
            }
        }
        localToWorld(local, to, distance, relative) {
            if (this.parent) {
                this.parent.innerToWorld(local, to, distance, relative);
            } else {
                if (to) copy$2(to, local);
            }
        }
        worldToInner(world, to, distance, relative) {
            if (relative) {
                relative.innerToWorld(world, to, distance);
                world = to ? to : world;
            }
            toInnerPoint(this.worldTransform, world, to, distance);
        }
        innerToWorld(inner, to, distance, relative) {
            toOuterPoint(this.worldTransform, inner, to, distance);
            if (relative) relative.worldToInner(to ? to : inner, null, distance);
        }
        getBoxPoint(world, relative, distance, change) {
            const inner = this.getInnerPoint(world, relative, distance, change);
            if (distance) return inner;
            return this.getBoxPointByInner(inner, null, null, true);
        }
        getBoxPointByInner(inner, _relative, _distance, change) {
            const point = change ? inner : Object.assign({}, inner), {x: x, y: y} = this.boxBounds;
            move$2(point, -x, -y);
            return point;
        }
        getInnerPoint(world, relative, distance, change) {
            const point = change ? world : {};
            this.worldToInner(world, point, distance, relative);
            return point;
        }
        getInnerPointByBox(box, _relative, _distance, change) {
            const point = change ? box : Object.assign({}, box), {x: x, y: y} = this.boxBounds;
            move$2(point, x, y);
            return point;
        }
        getInnerPointByLocal(local, _relative, distance, change) {
            return this.getInnerPoint(local, this.parent, distance, change);
        }
        getLocalPoint(world, relative, distance, change) {
            const point = change ? world : {};
            this.worldToLocal(world, point, distance, relative);
            return point;
        }
        getLocalPointByInner(inner, _relative, distance, change) {
            return this.getWorldPoint(inner, this.parent, distance, change);
        }
        getPagePoint(world, relative, distance, change) {
            const layer = this.leafer ? this.leafer.zoomLayer : this;
            return layer.getInnerPoint(world, relative, distance, change);
        }
        getWorldPoint(inner, relative, distance, change) {
            const point = change ? inner : {};
            this.innerToWorld(inner, point, distance, relative);
            return point;
        }
        getWorldPointByBox(box, relative, distance, change) {
            return this.getWorldPoint(this.getInnerPointByBox(box, null, null, change), relative, distance, true);
        }
        getWorldPointByLocal(local, relative, distance, change) {
            const point = change ? local : {};
            this.localToWorld(local, point, distance, relative);
            return point;
        }
        getWorldPointByPage(page, relative, distance, change) {
            const layer = this.leafer ? this.leafer.zoomLayer : this;
            return layer.getWorldPoint(page, relative, distance, change);
        }
        setTransform(matrix, resize, transition, boundsType) {
            setTransform(this, matrix, resize, transition, boundsType);
        }
        transform(matrix, resize, transition, boundsType) {
            transform(this, matrix, resize, transition, boundsType);
        }
        move(x, y, transition) {
            moveLocal(this, x, y, transition);
        }
        moveInner(x, y, transition) {
            moveWorld(this, x, y, true, transition);
        }
        scaleOf(origin, scaleX, scaleY, resize, transition, boundsType) {
            zoomOfLocal(this, getLocalOrigin(this, origin), scaleX, scaleY, resize, transition, boundsType);
        }
        rotateOf(origin, rotation, transition) {
            rotateOfLocal(this, getLocalOrigin(this, origin), rotation, transition);
        }
        skewOf(origin, skewX, skewY, resize, transition) {
            skewOfLocal(this, getLocalOrigin(this, origin), skewX, skewY, resize, transition);
        }
        transformWorld(worldTransform, resize, transition, boundsType) {
            transformWorld(this, worldTransform, resize, transition, boundsType);
        }
        moveWorld(x, y, transition) {
            moveWorld(this, x, y, false, transition);
        }
        scaleOfWorld(worldOrigin, scaleX, scaleY, resize, transition, boundsType) {
            zoomOfWorld(this, worldOrigin, scaleX, scaleY, resize, transition, boundsType);
        }
        rotateOfWorld(worldOrigin, rotation) {
            rotateOfWorld(this, worldOrigin, rotation);
        }
        skewOfWorld(worldOrigin, skewX, skewY, resize, transition) {
            skewOfWorld(this, worldOrigin, skewX, skewY, resize, transition);
        }
        flip(axis, transition) {
            transform(this, getFlipTransform(this, axis), false, transition);
        }
        remove(_child, destroy) {
            if (this.parent) this.parent.remove(this, destroy);
        }
        dropTo(parent, index, resize) {
            drop(this, parent, index, resize);
        }
        static changeAttr(attrName, defaultValue, fn) {
            fn ? this.addAttr(attrName, defaultValue, fn) : defineDataProcessor(this.prototype, attrName, defaultValue);
        }
        static addAttr(attrName, defaultValue, fn, helpValue) {
            if (!fn) fn = boundsType;
            fn(defaultValue, helpValue)(this.prototype, attrName);
        }
        __emitLifeEvent(type) {
            if (this.hasEvent(type)) this.emitEvent(new ChildEvent(type, this, this.parent));
        }
        destroy() {
            if (!this.destroyed) {
                if (this.parent) this.remove();
                if (this.children) this.clear();
                this.__emitLifeEvent(ChildEvent.DESTROY);
                this.__.destroy();
                this.__layout.destroy();
                this.destroyEventer();
                this.destroyed = true;
            }
        }
    };
    exports.Leaf = __decorate([ useModule(LeafDataProxy), useModule(LeafMatrix), useModule(LeafBounds), useModule(LeafEventer), useModule(LeafRender) ], exports.Leaf);
    const {setListWithFn: setListWithFn} = BoundsHelper;
    const {sort: sort} = BranchHelper;
    const {localBoxBounds: localBoxBounds, localStrokeBounds: localStrokeBounds, localRenderBounds: localRenderBounds, maskLocalBoxBounds: maskLocalBoxBounds, maskLocalStrokeBounds: maskLocalStrokeBounds, maskLocalRenderBounds: maskLocalRenderBounds} = LeafBoundsHelper;
    const debug$6 = new Debug("Branch");
    exports.Branch = class Branch extends exports.Leaf {
        __updateStrokeSpread() {
            const {children: children} = this;
            for (let i = 0, len = children.length; i < len; i++) {
                if (children[i].__layout.strokeSpread) return 1;
            }
            return 0;
        }
        __updateRenderSpread() {
            let layout;
            const {children: children} = this;
            for (let i = 0, len = children.length; i < len; i++) {
                layout = children[i].__layout;
                if (layout.renderSpread || layout.localOuterBounds) return 1;
            }
            return 0;
        }
        __updateBoxBounds(_secondLayout, bounds) {
            setListWithFn(bounds || this.__layout.boxBounds, this.children, this.__hasMask ? maskLocalBoxBounds : localBoxBounds);
        }
        __updateStrokeBounds(bounds) {
            setListWithFn(bounds || this.__layout.strokeBounds, this.children, this.__hasMask ? maskLocalStrokeBounds : localStrokeBounds);
        }
        __updateRenderBounds(bounds) {
            setListWithFn(bounds || this.__layout.renderBounds, this.children, this.__hasMask ? maskLocalRenderBounds : localRenderBounds);
        }
        __updateSortChildren() {
            let affectSort;
            const {children: children} = this;
            if (children.length > 1) {
                for (let i = 0, len = children.length; i < len; i++) {
                    children[i].__tempNumber = i;
                    if (children[i].__.zIndex) affectSort = true;
                }
                children.sort(sort);
                this.__layout.affectChildrenSort = affectSort;
            }
            this.__layout.childrenSortChanged = false;
        }
        add(child, index) {
            if (child === this || child.destroyed) return debug$6.warn("add self or destroyed");
            const noIndex = isUndefined(index);
            if (!child.__) {
                if (isArray(child)) return child.forEach(item => {
                    this.add(item, index);
                    noIndex || index++;
                }); else child = UICreator.get(child.tag, child);
                if (!child) return;
            }
            if (child.parent) child.parent.remove(child);
            child.parent = this;
            if (noIndex) this.children.push(child); else {
                BranchHelper.zIndex(this, child, index);
                this.children.splice(index, 0, child);
            }
            if (child.isBranch) this.__.__childBranchNumber = (this.__.__childBranchNumber || 0) + 1;
            const childLayout = child.__layout;
            childLayout.boxChanged || childLayout.boxChange();
            childLayout.matrixChanged || childLayout.matrixChange();
            if (child.__parentChange) child.__parentChange.forEach(item => item(this, child));
            if (child.__bubbleMap) child.__emitLifeEvent(ChildEvent.ADD);
            if (this.frame) child.__bindFrame(this.frame);
            if (this.leafer) {
                child.__bindLeafer(this.leafer);
                if (this.leafer.created) this.__emitChildEvent(ChildEvent.ADD, child);
            }
            this.__layout.affectChildrenSort && this.__layout.childrenSortChange();
        }
        addMany(...children) {
            this.add(children);
        }
        remove(child, destroy) {
            if (child) {
                if (child.__) {
                    if (child.animationOut) child.__runAnimation("out", () => this.__remove(child, destroy)); else this.__remove(child, destroy);
                } else this.find(child).forEach(item => this.remove(item, destroy));
            } else if (isUndefined(child)) {
                super.remove(null, destroy);
            }
        }
        removeAll(destroy) {
            const {children: children} = this;
            if (children.length) {
                this.children = [];
                this.__preRemove();
                this.__.__childBranchNumber = 0;
                children.forEach(child => {
                    this.__realRemoveChild(child);
                    if (destroy) child.destroy();
                });
            }
        }
        clear() {
            this.removeAll(true);
        }
        __remove(child, destroy) {
            const index = this.children.indexOf(child);
            if (index > -1) {
                this.children.splice(index, 1);
                if (child.isBranch) this.__.__childBranchNumber = (this.__.__childBranchNumber || 1) - 1;
                this.__preRemove();
                this.__realRemoveChild(child);
                if (destroy) child.destroy();
            }
        }
        __preRemove() {
            if (this.__hasMask) this.__updateMask();
            if (this.__hasEraser) this.__updateEraser();
            this.__layout.boxChange();
            this.__layout.affectChildrenSort && this.__layout.childrenSortChange();
        }
        __realRemoveChild(child) {
            child.__emitLifeEvent(ChildEvent.REMOVE);
            child.parent = null;
            if (this.leafer) {
                child.__bindLeafer(null);
                if (this.leafer.created) {
                    this.__emitChildEvent(ChildEvent.REMOVE, child);
                    if (this.leafer.hitCanvasManager) this.leafer.hitCanvasManager.clear();
                }
            }
            if (child.frame && !child.isFrame) child.__bindFrame(null);
        }
        __emitChildEvent(type, child) {
            const {leafer: leafer} = this;
            if (isTrackChanges(leafer) || leafer.zoomLayer === this) {
                const event = new ChildEvent(type, child, this);
                if (this.hasEvent(type) && !this.isLeafer) this.emitEvent(event);
                leafer.emitEvent(event);
            } else leafer.watcher.addChild(child, this, type);
        }
    };
    exports.Branch = __decorate([ useModule(BranchRender) ], exports.Branch);
    class LeafList {
        get length() {
            return this.list.length;
        }
        constructor(item) {
            this.reset();
            if (item) isArray(item) ? this.addList(item) : this.add(item);
        }
        has(leaf) {
            return leaf && !isUndefined(this.keys[leaf.innerId]);
        }
        indexAt(index) {
            return this.list[index];
        }
        indexOf(leaf) {
            const index = this.keys[leaf.innerId];
            return isUndefined(index) ? -1 : index;
        }
        add(leaf) {
            const {list: list, keys: keys} = this;
            if (isUndefined(keys[leaf.innerId])) {
                list.push(leaf);
                keys[leaf.innerId] = list.length - 1;
            }
        }
        addAt(leaf, index = 0) {
            const {keys: keys} = this;
            if (isUndefined(keys[leaf.innerId])) {
                const {list: list} = this;
                for (let i = index, len = list.length; i < len; i++) keys[list[i].innerId]++;
                if (index === 0) {
                    list.unshift(leaf);
                } else {
                    if (index > list.length) index = list.length;
                    list.splice(index, 0, leaf);
                }
                keys[leaf.innerId] = index;
            }
        }
        addList(list) {
            for (let i = 0; i < list.length; i++) this.add(list[i]);
        }
        remove(leaf) {
            const {list: list} = this;
            let findIndex;
            for (let i = 0, len = list.length; i < len; i++) {
                if (!isUndefined(findIndex)) {
                    this.keys[list[i].innerId] = i - 1;
                } else if (list[i].innerId === leaf.innerId) {
                    findIndex = i;
                    delete this.keys[leaf.innerId];
                }
            }
            if (!isUndefined(findIndex)) list.splice(findIndex, 1);
        }
        sort(reverse) {
            const {list: list} = this;
            if (reverse) {
                list.sort((a, b) => b.__level - a.__level);
            } else {
                list.sort((a, b) => a.__level - b.__level);
            }
        }
        forEach(itemCallback) {
            this.list.forEach(itemCallback);
        }
        clone() {
            const list = new LeafList;
            list.list = [ ...this.list ];
            list.keys = Object.assign({}, this.keys);
            return list;
        }
        update() {
            this.keys = {};
            const {list: list, keys: keys} = this;
            for (let i = 0, len = list.length; i < len; i++) keys[list[i].innerId] = i;
        }
        reset() {
            this.list = [];
            this.keys = {};
        }
        destroy() {
            this.reset();
        }
    }
    class LeafLevelList {
        get length() {
            return this._length;
        }
        constructor(item) {
            this._length = 0;
            this.reset();
            if (item) isArray(item) ? this.addList(item) : this.add(item);
        }
        has(leaf) {
            return !isUndefined(this.keys[leaf.innerId]);
        }
        without(leaf) {
            return isUndefined(this.keys[leaf.innerId]);
        }
        sort(reverse) {
            const {levels: levels} = this;
            if (reverse) {
                levels.sort((a, b) => b - a);
            } else {
                levels.sort((a, b) => a - b);
            }
        }
        addList(list) {
            list.forEach(leaf => {
                this.add(leaf);
            });
        }
        add(leaf) {
            const {keys: keys, levelMap: levelMap} = this;
            if (!keys[leaf.innerId]) {
                keys[leaf.innerId] = 1;
                if (!levelMap[leaf.__level]) {
                    levelMap[leaf.__level] = [ leaf ];
                    this.levels.push(leaf.__level);
                } else {
                    levelMap[leaf.__level].push(leaf);
                }
                this._length++;
            }
        }
        forEach(itemCallback) {
            let list;
            this.levels.forEach(level => {
                list = this.levelMap[level];
                for (let i = 0, len = list.length; i < len; i++) {
                    itemCallback(list[i]);
                }
            });
        }
        reset() {
            this.levelMap = {};
            this.keys = {};
            this.levels = [];
            this._length = 0;
        }
        destroy() {
            this.levelMap = null;
        }
    }
    const version = "2.3.1";
    if (typeof globalThis !== "undefined") {
        const globalLeafer = globalThis.Leafer || (globalThis.Leafer = {});
        globalLeafer.version = version;
        globalLeafer.Plugin = Plugin;
    }
    const debug$5 = Debug.get("LeaferCanvas");
    class LeaferCanvas extends LeaferCanvasBase {
        set zIndex(zIndex) {
            const {style: style} = this.view;
            style.zIndex = zIndex;
            this.setAbsolute(this.view);
        }
        set childIndex(index) {
            const {view: view, parentView: parentView} = this;
            if (view && parentView) {
                const beforeNode = parentView.children[index];
                if (beforeNode) {
                    this.setAbsolute(beforeNode);
                    parentView.insertBefore(view, beforeNode);
                } else {
                    parentView.appendChild(beforeNode);
                }
            }
        }
        init() {
            const {config: config} = this;
            const view = config.view || config.canvas;
            view ? this.__createViewFrom(view) : this.__createView();
            const {style: style} = this.view;
            style.display || (style.display = "block");
            this.parentView = this.view.parentElement;
            if (this.parentView) {
                const pStyle = this.parentView.style;
                pStyle.webkitUserSelect = pStyle.userSelect = "none";
                this.view.classList.add("leafer-canvas-view");
            }
            if (Platform.syncDomFont && !this.parentView) {
                style.display = "none";
                if (document.body) document.body.appendChild(this.view);
            }
            this.__createContext();
            if (!this.autoLayout) this.resize(config);
        }
        set backgroundColor(color) {
            this.view.style.backgroundColor = color;
        }
        get backgroundColor() {
            return this.view.style.backgroundColor;
        }
        set hittable(hittable) {
            this.view.style.pointerEvents = hittable ? "auto" : "none";
        }
        get hittable() {
            return this.view.style.pointerEvents !== "none";
        }
        __createView() {
            this.view = document.createElement("canvas");
        }
        __createViewFrom(inputView) {
            let find = isString(inputView) ? document.getElementById(inputView) : inputView;
            if (find) {
                if (find instanceof HTMLCanvasElement) {
                    this.view = find;
                } else {
                    let parent = find;
                    if (find === window || find === document) {
                        const div = document.createElement("div");
                        const {style: style} = div;
                        style.position = "absolute";
                        style.top = style.bottom = style.left = style.right = "0px";
                        document.body.appendChild(div);
                        parent = div;
                    }
                    this.__createView();
                    const view = this.view;
                    if (parent.hasChildNodes()) {
                        this.setAbsolute(view);
                        parent.style.position || (parent.style.position = "relative");
                    }
                    parent.appendChild(view);
                }
            } else {
                debug$5.error(`no id: ${inputView}`);
                this.__createView();
            }
        }
        setAbsolute(view) {
            const {style: style} = view;
            style.position = "absolute";
            style.top = style.left = "0px";
        }
        updateViewSize() {
            const {width: width, height: height, pixelRatio: pixelRatio} = this;
            const {style: style} = this.view;
            style.width = width + "px";
            style.height = height + "px";
            if (!this.unreal) {
                this.view.width = Math.ceil(width * pixelRatio);
                this.view.height = Math.ceil(height * pixelRatio);
            }
        }
        updateClientBounds() {
            if (this.view.parentElement) this.clientBounds = this.view.getBoundingClientRect();
        }
        startAutoLayout(autoBounds, listener) {
            this.resizeListener = listener;
            if (autoBounds) {
                this.autoBounds = autoBounds;
                if (this.resizeObserver) return;
                try {
                    this.resizeObserver = new ResizeObserver(entries => {
                        this.updateClientBounds();
                        for (const entry of entries) this.checkAutoBounds(entry.contentRect);
                    });
                    const parent = this.parentView;
                    if (parent) {
                        this.resizeObserver.observe(parent);
                        this.checkAutoBounds(parent.getBoundingClientRect());
                    } else {
                        this.checkAutoBounds(this.view);
                        debug$5.warn("no parent");
                    }
                } catch (_a) {
                    this.imitateResizeObserver();
                }
                this.stopListenPixelRatio();
            } else {
                this.listenPixelRatio();
                if (this.unreal) this.updateViewSize();
            }
        }
        imitateResizeObserver() {
            if (this.autoLayout) {
                if (this.parentView) this.checkAutoBounds(this.parentView.getBoundingClientRect());
                Platform.requestRender(this.imitateResizeObserver.bind(this));
            }
        }
        listenPixelRatio() {
            if (!this.windowListener) window.addEventListener("resize", this.windowListener = () => {
                const pixelRatio = Platform.devicePixelRatio;
                if (!this.config.pixelRatio && this.pixelRatio !== pixelRatio) {
                    const {width: width, height: height} = this;
                    this.emitResize({
                        width: width,
                        height: height,
                        pixelRatio: pixelRatio
                    });
                }
            });
        }
        stopListenPixelRatio() {
            if (this.windowListener) {
                window.removeEventListener("resize", this.windowListener);
                this.windowListener = null;
            }
        }
        checkAutoBounds(parentSize) {
            const view = this.view;
            const {x: x, y: y, width: width, height: height} = this.autoBounds.getBoundsFrom(parentSize);
            const size = {
                width: width,
                height: height,
                pixelRatio: this.config.pixelRatio ? this.pixelRatio : Platform.devicePixelRatio
            };
            if (!this.isSameSize(size)) {
                const {style: style} = view;
                style.marginLeft = x + "px";
                style.marginTop = y + "px";
                this.emitResize(size);
            }
        }
        stopAutoLayout() {
            this.autoLayout = false;
            if (this.resizeObserver) this.resizeObserver.disconnect();
            this.resizeListener = this.resizeObserver = null;
        }
        emitResize(size) {
            const oldSize = {};
            DataHelper.copyAttrs(oldSize, this, canvasSizeAttrs);
            this.resize(size);
            if (this.resizeListener && !isUndefined(this.width)) this.resizeListener(new ResizeEvent(size, oldSize));
        }
        unrealCanvas() {
            if (!this.unreal && this.parentView) {
                let view = this.view;
                if (view) view.remove();
                view = this.view = document.createElement("div");
                this.parentView.appendChild(this.view);
                view.classList.add("leafer-app-view");
                this.unreal = true;
            }
        }
        destroy() {
            const {view: view} = this;
            if (view) {
                this.stopAutoLayout();
                this.stopListenPixelRatio();
                if (view.parentElement) view.remove();
                super.destroy();
            }
        }
    }
    canvasPatch(CanvasRenderingContext2D.prototype);
    canvasPatch(Path2D.prototype);
    Object.assign(Creator, {
        canvas: (options, manager) => new LeaferCanvas(options, manager),
        image: options => new LeaferImage(options)
    });
    function useCanvas(_canvasType, _power) {
        Platform.origin = {
            createCanvas(width, height) {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                return canvas;
            },
            canvasToDataURL: (canvas, type, quality) => {
                const imageType = FileHelper.mimeType(type), url = canvas.toDataURL(imageType, quality);
                return imageType === "image/bmp" ? url.replace("image/png;", "image/bmp;") : url;
            },
            canvasToBolb: (canvas, type, quality) => new Promise(resolve => canvas.toBlob(resolve, FileHelper.mimeType(type), quality)),
            canvasSaveAs: (canvas, filename, quality) => {
                const url = canvas.toDataURL(FileHelper.mimeType(FileHelper.fileType(filename)), quality);
                return Platform.origin.download(url, filename);
            },
            download(url, filename) {
                return __awaiter(this, void 0, void 0, function*() {
                    let el = document.createElement("a");
                    el.href = url;
                    el.download = filename;
                    document.body.appendChild(el);
                    el.click();
                    document.body.removeChild(el);
                });
            },
            loadImage(src, crossOrigin, _leaferImage) {
                return new Promise((resolve, reject) => {
                    const img = new Platform.origin.Image;
                    if (crossOrigin) {
                        img.setAttribute("crossOrigin", crossOrigin);
                        img.crossOrigin = crossOrigin;
                    }
                    img.onload = () => {
                        resolve(img);
                    };
                    img.onerror = e => {
                        reject(e);
                    };
                    img.src = Platform.image.getRealURL(src);
                });
            },
            loadContent(url_1) {
                return __awaiter(this, arguments, void 0, function*(url, responseType = "text") {
                    const response = yield fetch(url);
                    if (!response.ok) throw new Error(`${response.status}`);
                    return yield response[responseType]();
                });
            },
            Image: Image,
            PointerEvent: PointerEvent,
            DragEvent: DragEvent
        };
        Platform.event = {
            stopDefault(origin) {
                origin.preventDefault();
            },
            stopNow(origin) {
                origin.stopImmediatePropagation();
            },
            stop(origin) {
                origin.stopPropagation();
            }
        };
        Platform.canvas = Creator.canvas();
        Platform.conicGradientSupport = !!Platform.canvas.context.createConicGradient;
    }
    Platform.name = "web";
    Platform.isMobile = "ontouchstart" in window;
    Platform.requestRender = function(render) {
        window.requestAnimationFrame(render);
    };
    defineKey(Platform, "devicePixelRatio", {
        get() {
            return devicePixelRatio;
        }
    });
    const {userAgent: userAgent} = navigator;
    if (userAgent.indexOf("Firefox") > -1) {
        Platform.intWheelDeltaY = true;
        Platform.syncDomFont = true;
    } else if (/iPhone|iPad|iPod/.test(navigator.userAgent) || /Macintosh/.test(navigator.userAgent) && /Version\/[\d.]+.*Safari/.test(navigator.userAgent)) {
        Platform.fullImageShadow = true;
    }
    if (userAgent.indexOf("Windows") > -1) {
        Platform.os = "Windows";
        Platform.intWheelDeltaY = true;
    } else if (userAgent.indexOf("Mac") > -1) {
        Platform.os = "Mac";
    } else if (userAgent.indexOf("Linux") > -1) {
        Platform.os = "Linux";
    }
    class Watcher {
        get childrenChanged() {
            return this.hasAdd || this.hasRemove || this.hasVisible;
        }
        get updatedList() {
            if (this.hasRemove && this.config.usePartLayout) {
                const updatedList = new LeafList;
                this.__updatedList.list.forEach(item => {
                    if (item.leafer) updatedList.add(item);
                });
                return updatedList;
            } else {
                return this.__updatedList;
            }
        }
        constructor(target, userConfig) {
            this.totalTimes = 0;
            this.changed = 0;
            this.config = {};
            this.__updatedList = new LeafList;
            this.target = target;
            if (userConfig) this.config = DataHelper.default(userConfig, this.config);
            this.__listenEvents();
        }
        start() {
            if (this.disabled) return;
            this.running = true;
        }
        stop() {
            this.running = false;
        }
        disable() {
            this.stop();
            this.__removeListenEvents();
            this.disabled = true;
        }
        update() {
            if (this.changed < 100) {
                this.changed++;
                if (this.running) this.target.emit(RenderEvent.REQUEST);
            }
        }
        __onAttrChange(event) {
            this.add(event.target);
        }
        add(leaf) {
            if (this.config.usePartLayout) this.__updatedList.add(leaf);
            this.update();
        }
        addChild(child, parent, eventType) {
            if (this.config.usePartLayout) {
                if (eventType === ChildEvent.ADD) {
                    this.hasAdd = true;
                    this.__pushChild(child);
                } else {
                    this.hasRemove = true;
                    this.__updatedList.add(parent);
                }
            }
            this.update();
        }
        __onChildEvent(event) {
            this.addChild(event.child, event.parent, event.type);
        }
        __pushChild(child) {
            this.__updatedList.add(child);
            if (child.isBranch) this.__loopChildren(child);
        }
        __loopChildren(parent) {
            const {children: children} = parent;
            for (let i = 0, len = children.length; i < len; i++) this.__pushChild(children[i]);
        }
        __onRquestData() {
            this.target.emitEvent(new WatchEvent(WatchEvent.DATA, {
                updatedList: this.updatedList
            }));
            this.__updatedList = new LeafList;
            this.totalTimes++;
            this.hasVisible = this.hasRemove = this.hasAdd = false;
            this.changed = 0;
        }
        __listenEvents() {
            this.__eventIds = [ this.target.on_([ [ PropertyEvent.CHANGE, this.__onAttrChange, this ], [ [ ChildEvent.ADD, ChildEvent.REMOVE ], this.__onChildEvent, this ], [ WatchEvent.REQUEST, this.__onRquestData, this ] ]) ];
        }
        __removeListenEvents() {
            this.target.off_(this.__eventIds);
        }
        destroy() {
            if (this.target) {
                this.stop();
                this.__removeListenEvents();
                this.target = this.__updatedList = null;
            }
        }
    }
    const {updateAllMatrix: updateAllMatrix$1, updateBounds: updateOneBounds, updateChange: updateOneChange} = LeafHelper;
    const {pushAllChildBranch: pushAllChildBranch, pushAllParent: pushAllParent} = BranchHelper;
    const LayouterHelper = {
        updateMatrix(updateList, levelList) {
            let index = 0, leaf, layout;
            const {list: list} = updateList;
            while (index < list.length) {
                leaf = list[index];
                layout = leaf.__layout;
                if (levelList.without(leaf) && !layout.proxyZoom) {
                    if (layout.matrixChanged) {
                        updateAllMatrix$1(leaf, true);
                        if (leaf.isBranch) pushAllChildBranch(leaf, levelList);
                        push(leaf, levelList);
                    } else if (layout.boundsChanged) {
                        if (leaf.isBranch) leaf.__tempNumber = 0;
                        push(leaf, levelList);
                    }
                }
                index++;
            }
        },
        updateBounds(boundsList) {
            let index = 0, level, list, branch, children;
            const {levels: levels, levelMap: levelMap} = boundsList;
            boundsList.sort(true);
            while (index < levels.length) {
                level = levels[index];
                list = levelMap[level];
                for (let i = 0, len = list.length; i < len; i++) {
                    branch = list[i];
                    if (branch.isBranch && branch.__tempNumber) {
                        children = branch.children;
                        for (let j = 0, jLen = children.length; j < jLen; j++) {
                            if (!children[j].isBranch) {
                                updateOneBounds(children[j]);
                            }
                        }
                    }
                    updateOneBounds(branch);
                }
                index++;
            }
        },
        updateChange(updateList) {
            updateList.list.forEach(updateOneChange);
        },
        push: push
    };
    function push(leaf, levelList) {
        levelList.add(leaf);
        pushAllParent(leaf, levelList);
    }
    const {worldBounds: worldBounds} = LeafBoundsHelper;
    class LayoutBlockData {
        constructor(list) {
            this.updatedBounds = new Bounds;
            this.beforeBounds = new Bounds;
            this.afterBounds = new Bounds;
            if (isArray(list)) list = new LeafList(list);
            this.updatedList = list;
        }
        setBefore() {
            this.beforeBounds.setListWithFn(this.updatedList.list, worldBounds);
        }
        setAfter() {
            this.afterBounds.setListWithFn(this.updatedList.list, worldBounds);
            this.updatedBounds.setList([ this.beforeBounds, this.afterBounds ]);
        }
        merge(data) {
            this.updatedList.addList(data.updatedList.list);
            this.beforeBounds.add(data.beforeBounds);
            this.afterBounds.add(data.afterBounds);
            this.updatedBounds.add(data.updatedBounds);
        }
        destroy() {
            this.updatedList = null;
        }
    }
    const {updateAllMatrix: updateAllMatrix, updateAllChange: updateAllChange} = LeafHelper;
    const debug$4 = Debug.get("Layouter");
    class Layouter {
        constructor(target, userConfig) {
            this.totalTimes = 0;
            this.config = {
                usePartLayout: true
            };
            this.__levelList = new LeafLevelList;
            this.target = target;
            if (userConfig) this.config = DataHelper.default(userConfig, this.config);
            this.__listenEvents();
        }
        start() {
            if (this.disabled) return;
            this.running = true;
        }
        stop() {
            this.running = false;
        }
        disable() {
            this.stop();
            this.__removeListenEvents();
            this.disabled = true;
        }
        layout() {
            if (this.layouting || !this.running) return;
            const {target: target} = this;
            this.times = 0;
            try {
                target.emit(LayoutEvent.START);
                this.layoutOnce();
                target.emitEvent(new LayoutEvent(LayoutEvent.END, this.layoutedBlocks, this.times));
            } catch (e) {
                debug$4.error(e);
            }
            this.layoutedBlocks = null;
        }
        layoutAgain() {
            if (this.layouting) {
                this.waitAgain = true;
            } else {
                this.layoutOnce();
            }
        }
        layoutOnce() {
            if (this.layouting) return debug$4.warn("layouting");
            if (this.times > 3) return debug$4.warn("layout max times");
            this.times++;
            this.totalTimes++;
            this.layouting = true;
            this.target.emit(WatchEvent.REQUEST);
            if (this.totalTimes > 1 && this.config.usePartLayout) {
                this.partLayout();
            } else {
                this.fullLayout();
            }
            this.layouting = false;
            if (this.waitAgain) {
                this.waitAgain = false;
                this.layoutOnce();
            }
        }
        partLayout() {
            var _a;
            if (!((_a = this.__updatedList) === null || _a === void 0 ? void 0 : _a.length)) return;
            const t = Run.start("PartLayout");
            const {target: target, __updatedList: updateList} = this;
            const {BEFORE: BEFORE, LAYOUT: LAYOUT, AFTER: AFTER} = LayoutEvent;
            const blocks = this.getBlocks(updateList);
            blocks.forEach(item => item.setBefore());
            target.emitEvent(new LayoutEvent(BEFORE, blocks, this.times));
            this.extraBlock = null;
            updateList.sort();
            LayouterHelper.updateMatrix(updateList, this.__levelList);
            LayouterHelper.updateBounds(this.__levelList);
            LayouterHelper.updateChange(updateList);
            if (this.extraBlock) blocks.push(this.extraBlock);
            blocks.forEach(item => item.setAfter());
            target.emitEvent(new LayoutEvent(LAYOUT, blocks, this.times));
            target.emitEvent(new LayoutEvent(AFTER, blocks, this.times));
            this.addBlocks(blocks);
            this.__levelList.reset();
            this.__updatedList = null;
            Run.end(t);
        }
        fullLayout() {
            const t = Run.start("FullLayout");
            const {target: target} = this;
            const {BEFORE: BEFORE, LAYOUT: LAYOUT, AFTER: AFTER} = LayoutEvent;
            const blocks = this.getBlocks(new LeafList(target));
            target.emitEvent(new LayoutEvent(BEFORE, blocks, this.times));
            Layouter.fullLayout(target);
            blocks.forEach(item => {
                item.setAfter();
            });
            target.emitEvent(new LayoutEvent(LAYOUT, blocks, this.times));
            target.emitEvent(new LayoutEvent(AFTER, blocks, this.times));
            this.addBlocks(blocks);
            Run.end(t);
        }
        static fullLayout(target) {
            updateAllMatrix(target, true);
            if (target.isBranch) BranchHelper.updateBounds(target); else LeafHelper.updateBounds(target);
            updateAllChange(target);
        }
        addExtra(leaf, updateBounds) {
            if (!this.__updatedList.has(leaf)) {
                const {updatedList: updatedList, beforeBounds: beforeBounds} = this.extraBlock || (this.extraBlock = new LayoutBlockData([]));
                updatedList.length ? beforeBounds.add(leaf.__world) : beforeBounds.set(leaf.__world);
                updatedList.add(leaf);
                if (updateBounds) {
                    const list = this.__levelList;
                    LayouterHelper.push(leaf, list);
                    list.sort(true);
                }
            }
        }
        createBlock(data) {
            return new LayoutBlockData(data);
        }
        getBlocks(list) {
            return [ this.createBlock(list) ];
        }
        addBlocks(current) {
            this.layoutedBlocks ? this.layoutedBlocks.push(...current) : this.layoutedBlocks = current;
        }
        __onReceiveWatchData(event) {
            this.__updatedList = event.data.updatedList;
        }
        __listenEvents() {
            this.__eventIds = [ this.target.on_([ [ LayoutEvent.REQUEST, this.layout, this ], [ LayoutEvent.AGAIN, this.layoutAgain, this ], [ WatchEvent.DATA, this.__onReceiveWatchData, this ] ]) ];
        }
        __removeListenEvents() {
            this.target.off_(this.__eventIds);
        }
        destroy() {
            if (this.target) {
                this.stop();
                this.__removeListenEvents();
                this.target = this.config = null;
            }
        }
    }
    const debug$3 = Debug.get("Renderer");
    class Renderer {
        get needFill() {
            return !!(!this.canvas.allowBackgroundColor && this.config.fill);
        }
        constructor(target, canvas, userConfig) {
            this.FPS = 60;
            this.totalTimes = 0;
            this.times = 0;
            this.config = {
                usePartRender: true,
                ceilPartPixel: true,
                maxFPS: 120
            };
            this.frames = [];
            this.target = target;
            this.canvas = canvas;
            if (userConfig) this.config = DataHelper.default(userConfig, this.config);
            this.__listenEvents();
        }
        start() {
            this.running = true;
            this.update(false);
        }
        stop() {
            this.running = false;
        }
        update(change = true) {
            if (!this.changed) this.changed = change;
            if (!this.requestTime) this.__requestRender();
        }
        requestLayout() {
            this.target.emit(LayoutEvent.REQUEST);
        }
        checkRender() {
            if (this.running) {
                const {target: target} = this;
                if (target.isApp) {
                    target.emit(RenderEvent.CHILD_START, target);
                    target.children.forEach(leafer => {
                        leafer.renderer.FPS = this.FPS;
                        leafer.renderer.checkRender();
                    });
                    target.emit(RenderEvent.CHILD_END, target);
                }
                if (this.changed && this.canvas.view) this.render();
                this.target.emit(RenderEvent.NEXT);
            }
        }
        render(callback) {
            if (!(this.running && this.canvas.view)) return this.update();
            const {target: target} = this;
            this.times = 0;
            this.totalBounds = new Bounds;
            debug$3.log(target.innerName, "---\x3e");
            try {
                this.emitRender(RenderEvent.START);
                this.renderOnce(callback);
                this.emitRender(RenderEvent.END, this.totalBounds);
                ImageManager.clearRecycled();
            } catch (e) {
                this.rendering = false;
                debug$3.error(e);
            }
            debug$3.log("-------------|");
        }
        renderAgain() {
            if (this.rendering) {
                this.waitAgain = true;
            } else {
                this.renderOnce();
            }
        }
        renderOnce(callback) {
            if (this.rendering) return debug$3.warn("rendering");
            if (this.times > 3) return debug$3.warn("render max times");
            this.times++;
            this.totalTimes++;
            this.rendering = true;
            this.changed = false;
            this.renderBounds = new Bounds;
            this.renderOptions = {};
            if (callback) {
                this.emitRender(RenderEvent.BEFORE);
                callback();
            } else {
                this.requestLayout();
                if (this.ignore) {
                    this.ignore = this.rendering = false;
                    return;
                }
                this.emitRender(RenderEvent.BEFORE);
                if (this.config.usePartRender && this.totalTimes > 1) {
                    this.partRender();
                } else {
                    this.fullRender();
                }
            }
            this.emitRender(RenderEvent.RENDER, this.renderBounds, this.renderOptions);
            this.emitRender(RenderEvent.AFTER, this.renderBounds, this.renderOptions);
            this.updateBlocks = null;
            this.rendering = false;
            if (this.waitAgain) {
                this.waitAgain = false;
                this.renderOnce();
            }
        }
        partRender() {
            const {canvas: canvas, updateBlocks: list} = this;
            if (!list) return;
            this.mergeBlocks();
            list.forEach(block => {
                if (canvas.bounds.hit(block) && !block.isEmpty()) this.clipRender(block);
            });
        }
        clipRender(block) {
            const t = Run.start("PartRender");
            const {canvas: canvas} = this, bounds = block.getIntersect(canvas.bounds), realBounds = new Bounds(bounds);
            canvas.save();
            bounds.spread(Renderer.clipSpread).ceil();
            const {ceilPartPixel: ceilPartPixel} = this.config;
            canvas.clipWorld(bounds, ceilPartPixel);
            canvas.clearWorld(bounds, ceilPartPixel);
            this.__render(bounds, realBounds);
            canvas.restore();
            Run.end(t);
        }
        fullRender() {
            const t = Run.start("FullRender");
            const {canvas: canvas} = this;
            canvas.save();
            canvas.clear();
            this.__render(canvas.bounds);
            canvas.restore();
            Run.end(t);
        }
        __render(bounds, realBounds) {
            const {canvas: canvas, target: target} = this, includes = bounds.includes(target.__world), options = includes ? {
                includes: includes
            } : {
                bounds: bounds,
                includes: includes
            };
            if (this.needFill) canvas.fillWorld(bounds, this.config.fill);
            if (Debug.showRepaint) Debug.drawRepaint(canvas, bounds);
            if (this.config.useCellRender) options.cellList = this.getCellList();
            Platform.render(target, canvas, options);
            this.renderBounds = realBounds = realBounds || bounds;
            this.renderOptions = options;
            this.totalBounds.isEmpty() ? this.totalBounds = realBounds : this.totalBounds.add(realBounds);
            canvas.updateRender(realBounds);
        }
        getCellList() {
            return undefined;
        }
        addBlock(block, _leafList) {
            if (!this.updateBlocks) this.updateBlocks = [];
            this.updateBlocks.push(block);
        }
        mergeBlocks() {
            const {updateBlocks: list} = this;
            if (list) {
                const bounds = new Bounds;
                bounds.setList(list);
                list.length = 0;
                list.push(bounds);
            }
        }
        __requestRender() {
            const target = this.target;
            if (this.requestTime || !target) return;
            if (target.parentApp) return target.parentApp.requestRender(false);
            this.requestTime = this.frameTime || Date.now();
            const render = () => {
                const nowFPS = 1e3 / ((this.frameTime = Date.now()) - this.requestTime);
                const {maxFPS: maxFPS} = this.config;
                if (maxFPS && nowFPS > maxFPS) return Platform.requestRender(render);
                const {frames: frames} = this;
                if (frames.length > 30) frames.shift();
                frames.push(nowFPS);
                this.FPS = Math.round(frames.reduce((a, b) => a + b, 0) / frames.length);
                this.requestTime = 0;
                this.checkRender();
            };
            Platform.requestRender(render);
        }
        __onResize(e) {
            if (this.canvas.unreal) return;
            if (e.bigger || !e.samePixelRatio) {
                const {width: width, height: height} = e.old;
                const bounds = new Bounds(0, 0, width, height);
                if (!bounds.includes(this.target.__world) || this.needFill || !e.samePixelRatio) {
                    this.addBlock(this.canvas.bounds);
                    this.target.forceUpdate("surface");
                    return;
                }
            }
            this.addBlock(new Bounds(0, 0, 1, 1));
            this.update();
        }
        __onLayoutEnd(event) {
            if (event.data) event.data.map(item => {
                let empty;
                const {updatedList: updatedList} = item;
                if (updatedList) updatedList.list.some(leaf => {
                    empty = !leaf.__world.width || !leaf.__world.height;
                    if (empty) {
                        if (!leaf.isLeafer) debug$3.tip(leaf.innerName, ": empty");
                        empty = !leaf.isBranch || leaf.isBranchLeaf;
                    }
                    return empty;
                });
                this.addBlock(empty ? this.canvas.bounds : item.updatedBounds, updatedList);
            });
        }
        emitRender(type, bounds, options) {
            this.target.emitEvent(new RenderEvent(type, this.times, bounds, options));
        }
        __listenEvents() {
            this.__eventIds = [ this.target.on_([ [ RenderEvent.REQUEST, this.update, this ], [ LayoutEvent.END, this.__onLayoutEnd, this ], [ RenderEvent.AGAIN, this.renderAgain, this ], [ ResizeEvent.RESIZE, this.__onResize, this ] ]) ];
        }
        __removeListenEvents() {
            this.target.off_(this.__eventIds);
        }
        destroy() {
            if (this.target) {
                this.stop();
                this.__removeListenEvents();
                this.config = {};
                this.target = this.canvas = null;
            }
        }
    }
    Renderer.clipSpread = 10;
    const tempPoint$1 = {};
    const {copyRadiusPoint: copyRadiusPoint$1} = PointHelper;
    const {hitRadiusPoint: hitRadiusPoint$1} = BoundsHelper;
    class Picker {
        constructor(target, selector) {
            this.target = target;
            this.selector = selector;
        }
        getByPoint(hitPoint, hitRadius, options) {
            if (!hitRadius) hitRadius = 0;
            if (!options) options = {};
            const through = options.through || false;
            const ignoreHittable = options.ignoreHittable || false;
            const target = options.target || this.target;
            this.exclude = options.exclude || null;
            this.point = {
                x: hitPoint.x,
                y: hitPoint.y,
                radiusX: hitRadius,
                radiusY: hitRadius
            };
            this.findList = new LeafList(options.findList);
            if (!options.findList) this.hitBranch(target.isBranchLeaf ? {
                children: [ target ]
            } : target);
            const {list: list} = this.findList;
            const leaf = this.getBestMatchLeaf(list, options.bottomList, ignoreHittable, !!options.findList);
            const path = ignoreHittable ? this.getPath(leaf) : this.getHitablePath(leaf);
            this.clear();
            return through ? {
                path: path,
                target: leaf,
                throughPath: list.length ? this.getThroughPath(list) : path
            } : {
                path: path,
                target: leaf
            };
        }
        hitPoint(hitPoint, hitRadius, options) {
            return !!this.getByPoint(hitPoint, hitRadius, options).target;
        }
        getBestMatchLeaf(list, bottomList, ignoreHittable, allowNull) {
            const findList = this.findList = new LeafList;
            if (list.length) {
                let find;
                const {x: x, y: y} = this.point;
                const point = {
                    x: x,
                    y: y,
                    radiusX: 0,
                    radiusY: 0
                };
                for (let i = 0, len = list.length; i < len; i++) {
                    find = list[i];
                    if (ignoreHittable || LeafHelper.worldHittable(find)) {
                        this.hitChild(find, find.hitThrough ? this.point : point, find.mask && find.parent && find.parent.__onlyHitMask);
                        if (findList.length) {
                            if (find.isBranchLeaf && list.some(item => item !== find && LeafHelper.hasParent(item, find))) {
                                findList.reset();
                                break;
                            }
                            return findList.list[0];
                        }
                    }
                }
            }
            if (bottomList) {
                for (let i = 0, len = bottomList.length; i < len; i++) {
                    this.hitChild(bottomList[i].target, this.point, undefined, bottomList[i].proxy);
                    if (findList.length) return findList.list[0];
                }
            }
            if (allowNull) return null;
            return ignoreHittable ? list[0] : list.find(item => LeafHelper.worldHittable(item));
        }
        getPath(leaf) {
            const path = new LeafList, syncList = [], {target: target} = this;
            while (leaf) {
                if (leaf.syncEventer) syncList.push(leaf.syncEventer);
                path.add(leaf);
                leaf = leaf.parent;
                if (leaf === target) break;
            }
            if (syncList.length) {
                syncList.forEach(item => {
                    while (item) {
                        if (item.__.hittable) path.add(item);
                        item = item.parent;
                        if (item === target) break;
                    }
                });
            }
            if (target) path.add(target);
            return path;
        }
        getHitablePath(leaf) {
            const path = this.getPath(leaf && leaf.hittable ? leaf : null);
            let item, hittablePath = new LeafList;
            for (let i = path.list.length - 1; i > -1; i--) {
                item = path.list[i];
                if (!item.__.hittable) break;
                hittablePath.addAt(item, 0);
                if (!item.__.hitChildren || item.isLeafer && item.mode === "draw") break;
            }
            return hittablePath;
        }
        getThroughPath(list) {
            const throughPath = new LeafList;
            const pathList = [];
            for (let i = list.length - 1; i > -1; i--) {
                pathList.push(this.getPath(list[i]));
            }
            let path, nextPath, leaf;
            for (let i = 0, len = pathList.length; i < len; i++) {
                path = pathList[i], nextPath = pathList[i + 1];
                for (let j = 0, jLen = path.length; j < jLen; j++) {
                    leaf = path.list[j];
                    if (nextPath && nextPath.has(leaf)) break;
                    throughPath.add(leaf);
                }
            }
            return throughPath;
        }
        hitBranch(branch) {
            this.eachFind(branch.children, branch.__onlyHitMask);
        }
        eachFind(children, onlyHitMask) {
            let child, hit, data;
            const {point: point} = this, len = children.length;
            for (let i = len - 1; i > -1; i--) {
                child = children[i], data = child.__;
                if (!data.visible || onlyHitMask && !data.mask) continue;
                hit = hitRadiusPoint$1(child.__world, data.hitRadius ? copyRadiusPoint$1(tempPoint$1, point, data.hitRadius) : point);
                if (child.isBranch) {
                    if (hit || child.__ignoreHitWorld) {
                        if (child.isBranchLeaf && data.__clipAfterFill && !child.__hitWorld(point, true)) continue;
                        if (child.topChildren) this.eachFind(child.topChildren, false);
                        this.eachFind(child.children, child.__onlyHitMask);
                        if (child.isBranchLeaf) this.hitChild(child, point, onlyHitMask);
                    }
                } else {
                    if (hit) this.hitChild(child, point, onlyHitMask);
                }
            }
        }
        hitChild(child, point, onlyHitMask, proxy) {
            if (this.exclude && this.exclude.has(child)) return;
            if (child.__hitWorld(point, onlyHitMask && child.mask === "path" ? true : undefined)) {
                const {parent: parent, mask: mask} = child;
                if (parent && parent.__hasMask && mask && !(mask === "clipping" || mask === "clipping-path")) {
                    if (!parent.children.some(item => !item.mask && this.isHitLeaf(item, point))) return;
                }
                const leaf = proxy || child, {hitThrough: hitThrough} = child, {findList: findList} = this;
                if (hitThrough) {
                    const index = findList.list.findIndex(item => hitThrough === "parent" ? LeafHelper.hasParent(item.parent, child.parent) : item[hitThrough] === child[hitThrough]);
                    if (index > 0) return findList.addAt(leaf, index);
                }
                findList.add(leaf);
            }
        }
        isHitLeaf(leaf, point) {
            if (leaf.isBranch) {
                const {findList: findList} = this, old = findList.length;
                this.eachFind([ leaf ], false);
                const count = findList.length - old;
                for (let i = 0; i < count; i++) findList.remove(findList.indexAt(findList.length - 1));
                return !!count;
            } else return leaf.__hitWorld(point);
        }
        clear() {
            this.point = null;
            this.findList = null;
            this.exclude = null;
        }
        destroy() {
            this.clear();
        }
    }
    class Selector {
        constructor(target, userConfig) {
            this.config = {};
            if (userConfig) this.config = DataHelper.default(userConfig, this.config);
            this.picker = new Picker(this.target = target, this);
            this.finder = Creator.finder && Creator.finder(target, this.config);
        }
        getByPoint(hitPoint, hitRadius, options) {
            const {target: target, picker: picker} = this;
            if (Platform.backgrounder) target && target.updateLayout();
            return picker.getByPoint(hitPoint, hitRadius, options);
        }
        hitPoint(hitPoint, hitRadius, options) {
            return this.picker.hitPoint(hitPoint, hitRadius, options);
        }
        getBy(condition, branch, one, options) {
            return this.finder ? this.finder.getBy(condition, branch, one, options) : Plugin.need("find");
        }
        destroy() {
            this.picker.destroy();
            if (this.finder) this.finder.destroy();
        }
    }
    Object.assign(Creator, {
        watcher: (target, options) => new Watcher(target, options),
        layouter: (target, options) => new Layouter(target, options),
        renderer: (target, canvas, options) => new Renderer(target, canvas, options),
        selector: (target, options) => new Selector(target, options)
    });
    Platform.layout = Layouter.fullLayout;
    Platform.render = function(target, canvas, options) {
        const topOptions = Object.assign(Object.assign({}, options), {
            topRendering: true
        });
        options.topList = new LeafList;
        target.__render(canvas, options);
        if (options.topList.length) options.topList.forEach(item => {
            const {parent: parent} = item;
            if (parent && parent.isBranchLeaf && parent.overflow !== "show") {
                canvas.save();
                LeafHelper.clip(parent, canvas, topOptions);
                item.__render(canvas, topOptions);
                canvas.restore();
            } else {
                item.__render(canvas, topOptions);
            }
        });
    };
    function effectType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value);
                if (value) this.__.__useEffect = true;
                const layout = this.__layout;
                layout.renderChanged || layout.renderChange();
                layout.surfaceChange();
            }
        }));
    }
    function resizeType(defaultValue) {
        return decorateLeafAttr(defaultValue, key => attr({
            set(value) {
                this.__setAttr(key, value);
                this.__layout.boxChanged || this.__layout.boxChange();
                this.__updateSize();
            }
        }));
    }
    function zoomLayerType() {
        return (target, key) => {
            const privateKey = "_" + key;
            defineKey(target, key, {
                set(value) {
                    if (this.isLeafer) this[privateKey] = value;
                },
                get() {
                    return this.isApp ? this.tree.zoomLayer : this.isLeafer ? this[privateKey] || this : this.leafer && this.leafer.zoomLayer;
                }
            });
        };
    }
    function frameType() {
        return (target, key) => {
            defineKey(target, key, {
                set(_value) {},
                get() {
                    return this;
                }
            });
        };
    }
    function createAttr(defaultValue) {
        return (target, key) => {
            defineKey(target, key, createDescriptor(key, defaultValue));
        };
    }
    function hasTransparent$3(color) {
        if (!color || color.length === 7 || color.length === 4) return false;
        if (color === "transparent") return true;
        const first = color[0];
        if (first === "#") {
            switch (color.length) {
              case 5:
                return color[4] !== "f" && color[4] !== "F";

              case 9:
                return color[7] !== "f" && color[7] !== "F" || color[8] !== "f" && color[8] !== "F";
            }
        } else if (first === "r" || first === "h") {
            if (color[3] === "a") {
                const i = color.lastIndexOf(",");
                if (i > -1) return parseFloat(color.slice(i + 1)) < 1;
            }
        }
        return false;
    }
    const TextConvert = {};
    const ColorConvert = {
        hasTransparent: hasTransparent$3
    };
    const UnitConvert = UnitConvertHelper;
    const PathArrow = {};
    const Paint = {};
    const PaintImage = {};
    const PaintGradient = {};
    const Effect = {};
    const Filter = {
        apply() {
            Plugin.need("filter");
        }
    };
    const Export = {};
    const State = {
        setStyleName() {
            return Plugin.need("state");
        },
        set() {
            return Plugin.need("state");
        }
    };
    const Transition = {
        list: {},
        register(attrName, fn) {
            Transition.list[attrName] = fn;
        },
        get(attrName) {
            return Transition.list[attrName];
        }
    };
    const {parse: parse, objectToCanvasData: objectToCanvasData} = PathConvert;
    const {stintSet: stintSet$3} = DataHelper, {hasTransparent: hasTransparent$2} = ColorConvert;
    const emptyPaint = {
        originPaint: {}
    };
    const debug$2 = Debug.get("UIData");
    class UIData extends LeafData {
        get scale() {
            const {scaleX: scaleX, scaleY: scaleY} = this;
            return scaleX !== scaleY ? {
                x: scaleX,
                y: scaleY
            } : scaleX;
        }
        get __strokeWidth() {
            return this.__getRealStrokeWidth();
        }
        get __maxStrokeWidth() {
            const t = this, strokeWidth = t.__hasStrokeSides || t.strokeWidth;
            return t.__hasMultiStrokeStyle ? Math.max(t.__hasMultiStrokeStyle, strokeWidth) : strokeWidth;
        }
        get __hasMultiPaint() {
            const t = this;
            return t.fill && this.__useStroke || t.__isFills && t.fill.length > 1 || t.__isStrokes && t.stroke.length > 1 || t.__useEffect;
        }
        get __clipAfterFill() {
            const t = this;
            return t.cornerRadius || t.innerShadow || t.__pathInputed;
        }
        get __hasSurface() {
            const t = this;
            return t.fill || t.stroke;
        }
        get __autoWidth() {
            return this._width == null;
        }
        get __autoHeight() {
            return this._height == null;
        }
        get __autoSide() {
            return this._width == null || this._height == null;
        }
        get __autoSize() {
            return this._width == null && this._height == null;
        }
        setVisible(value) {
            this._visible = value;
            const {leafer: leafer} = this.__leaf;
            if (leafer) leafer.watcher.hasVisible = true;
        }
        setWidth(value) {
            if (value < 0) {
                this._width = -value;
                this.__leaf.scaleX *= -1;
                debug$2.warn("width < 0, instead -scaleX ", this);
            } else this._width = value;
        }
        setHeight(value) {
            if (value < 0) {
                this._height = -value;
                this.__leaf.scaleY *= -1;
                debug$2.warn("height < 0, instead -scaleY", this);
            } else this._height = value;
        }
        setFill(value) {
            if (this.__naturalWidth) this.__removeNaturalSize();
            if (isString(value) || !value) {
                stintSet$3(this, "__isTransparentFill", hasTransparent$2(value));
                this.__isFills && this.__removePaint("fill", true);
                this._fill = value;
            } else if (isObject(value)) {
                this.__setPaint("fill", value);
            }
        }
        setStroke(value) {
            if (isString(value) || !value) {
                stintSet$3(this, "__isTransparentStroke", hasTransparent$2(value));
                this.__isStrokes && this.__removePaint("stroke", true);
                this._stroke = value;
            } else if (isObject(value)) {
                this.__setPaint("stroke", value);
            }
        }
        setPath(value) {
            const isStr = isString(value);
            if (isStr || value && isObject(value[0])) {
                this.__setInput("path", value);
                this._path = isStr ? parse(value, this.__useArrow) : objectToCanvasData(value);
            } else {
                if (this.__input) this.__removeInput("path");
                this._path = value;
            }
        }
        setShadow(value) {
            setArray(this, "shadow", value);
        }
        setInnerShadow(value) {
            setArray(this, "innerShadow", value);
        }
        setFilter(value) {
            setArray(this, "filter", value);
        }
        __computePaint() {
            const {fill: fill, stroke: stroke} = this.__input;
            if (fill) Paint.compute("fill", this.__leaf);
            if (stroke) Paint.compute("stroke", this.__leaf);
            this.__needComputePaint = undefined;
        }
        __getRealStrokeWidth(childStyle) {
            let {strokeWidth: strokeWidth, strokeScaleFixed: strokeScaleFixed} = this;
            if (childStyle) {
                if (childStyle.strokeWidth) strokeWidth = childStyle.strokeWidth;
                if (!isUndefined(childStyle.strokeScaleFixed)) strokeScaleFixed = childStyle.strokeScaleFixed;
            }
            if (strokeScaleFixed) {
                const {scaleX: scaleX} = this.__leaf.getRenderScaleData(true, strokeScaleFixed, false);
                if (scaleX !== 1) return strokeWidth * scaleX;
            }
            return strokeWidth;
        }
        __checkComplex() {
            const t = this;
            stintSet$3(t, "__complex", t.__isFills || t.__isStrokes || t.cornerRadius || t.__useEffect);
        }
        __setPaint(attrName, value) {
            this.__setInput(attrName, value);
            const layout = this.__leaf.__layout;
            layout.boxChanged || layout.boxChange();
            if (isArray(value) && !value.length) {
                this.__removePaint(attrName);
            } else {
                if (attrName === "fill") this.__isFills = true, this._fill || (this._fill = emptyPaint); else this.__isStrokes = true, 
                this._stroke || (this._stroke = emptyPaint);
            }
        }
        __removePaint(attrName, removeInput) {
            if (removeInput) this.__removeInput(attrName);
            PaintImage.recycleImage(attrName, this);
            if (attrName === "fill") {
                stintSet$3(this, "__isAlphaPixelFill", undefined);
                this._fill = this.__isFills = undefined;
            } else {
                stintSet$3(this, "__isAlphaPixelStroke", undefined);
                stintSet$3(this, "__hasMultiStrokeStyle", undefined);
                this._stroke = this.__isStrokes = undefined;
            }
        }
    }
    function setArray(data, key, value) {
        data.__setInput(key, value);
        if (isArray(value)) {
            if (value.some(item => item.visible === false)) value = value.filter(item => item.visible !== false);
            value.length || (value = undefined);
        } else value = value && value.visible !== false ? [ value ] : undefined;
        data["_" + key] = value;
    }
    class GroupData extends UIData {}
    class BoxData extends GroupData {
        get __boxStroke() {
            return !this.__pathInputed;
        }
        get __drawAfterFill() {
            const t = this;
            return t.__single || t.__clipAfterFill;
        }
        get __clipAfterFill() {
            const t = this;
            return t.overflow !== "show" && t.__leaf.children.length && (t.__leaf.isOverflow || super.__clipAfterFill);
        }
    }
    class LeaferData extends GroupData {
        __getInputData(names, options) {
            const data = super.__getInputData(names, options);
            canvasSizeAttrs.forEach(key => delete data[key]);
            return data;
        }
    }
    class FrameData extends BoxData {}
    class LineData extends UIData {
        get __usePathBox() {
            return this.points || this.__pathInputed;
        }
    }
    class RectData extends UIData {
        get __boxStroke() {
            return !this.__pathInputed;
        }
    }
    class EllipseData extends UIData {
        get __boxStroke() {
            return !this.__pathInputed;
        }
    }
    class PolygonData extends UIData {
        get __usePathBox() {
            return this.points || this.__pathInputed;
        }
    }
    class StarData extends UIData {}
    class PathData extends UIData {
        get __pathInputed() {
            return 2;
        }
    }
    class PenData extends GroupData {}
    const fontWeightMap = {
        thin: 100,
        "extra-light": 200,
        light: 300,
        normal: 400,
        medium: 500,
        "semi-bold": 600,
        bold: 700,
        "extra-bold": 800,
        black: 900
    };
    class TextData extends UIData {
        get __useNaturalRatio() {
            return false;
        }
        setFontWeight(value) {
            if (isString(value)) {
                this.__setInput("fontWeight", value);
                value = fontWeightMap[value] || 400;
            } else if (this.__input) this.__removeInput("fontWeight");
            this._fontWeight = value;
        }
        setBoxStyle(value) {
            let t = this.__leaf, box = t.__box;
            if (value) {
                const {boxStyle: boxStyle} = this;
                if (box) for (let key in boxStyle) box[key] = undefined; else box = t.__box = UICreator.get("Rect", 0);
                const layout = t.__layout, boxLayout = box.__layout;
                if (!boxStyle) box.parent = t, box.__world = t.__world, boxLayout.boxBounds = layout.boxBounds;
                box.set(value);
                if (boxLayout.strokeChanged) layout.strokeChange();
            } else if (box) {
                t.__box = box.parent = null;
                box.destroy();
            }
            this._boxStyle = value;
        }
        __getInputData(names, options) {
            const data = super.__getInputData(names, options);
            if (data.textEditing) delete data.textEditing;
            return data;
        }
    }
    class ImageData extends RectData {
        get __urlType() {
            return "image";
        }
        setUrl(value) {
            this.__setImageFill(value);
            this._url = value;
        }
        __setImageFill(value) {
            this.fill = value ? {
                type: this.__urlType,
                mode: "stretch",
                url: value
            } : undefined;
        }
        __getData() {
            const data = super.__getData();
            if (data.url) delete data.fill;
            return data;
        }
        __getInputData(names, options) {
            const data = super.__getInputData(names, options);
            if (data.url) delete data.fill;
            return data;
        }
    }
    class CanvasData extends RectData {
        get __isCanvas() {
            return true;
        }
        get __drawAfterFill() {
            return true;
        }
        __getInputData(names, options) {
            const data = super.__getInputData(names, options);
            data.url = this.__leaf.canvas.toDataURL("image/png");
            return data;
        }
    }
    const {max: max$2, add: add$1} = FourNumberHelper;
    const UIBounds = {
        __updateStrokeSpread() {
            let spread = 0, boxSpread = 0;
            const data = this.__, {strokeAlign: strokeAlign, __maxStrokeWidth: strokeWidth} = data, box = this.__box;
            if ((data.stroke || data.hitStroke === "all") && strokeWidth && strokeAlign !== "inside") {
                boxSpread = spread = strokeAlign === "center" ? strokeWidth / 2 : strokeWidth;
                if (!data.__boxStroke || data.__useArrow) {
                    const miterLimitAddWidth = data.__isLinePath ? 0 : (data.strokeJoin === "miter" ? 10 : 1) * spread;
                    const storkeCapAddWidth = data.strokeCap === "none" ? 0 : strokeWidth;
                    spread += Math.max(miterLimitAddWidth, storkeCapAddWidth);
                }
            }
            if (data.__useArrow) spread += strokeWidth * 5;
            if (box) {
                spread = max$2(spread, box.__layout.strokeSpread = box.__updateStrokeSpread());
                boxSpread = Math.max(boxSpread, box.__layout.strokeBoxSpread);
            }
            this.__layout.strokeBoxSpread = boxSpread;
            return spread;
        },
        __updateRenderSpread() {
            let spread = 0;
            const {shadow: shadow, innerShadow: innerShadow, blur: blur, backgroundBlur: backgroundBlur, filter: filter, renderSpread: renderSpread} = this.__, {strokeSpread: strokeSpread} = this.__layout, box = this.__box;
            if (shadow) spread = Effect.getShadowRenderSpread(this, shadow);
            if (blur) spread = max$2(spread, blur);
            if (filter) spread = add$1(spread, Filter.getSpread(filter));
            if (renderSpread) spread = add$1(spread, renderSpread);
            if (strokeSpread) spread = add$1(spread, strokeSpread);
            let shapeSpread = spread;
            if (innerShadow) shapeSpread = max$2(shapeSpread, Effect.getInnerShadowSpread(this, innerShadow));
            if (backgroundBlur) shapeSpread = max$2(shapeSpread, backgroundBlur);
            this.__layout.renderShapeSpread = shapeSpread;
            return box ? max$2(box.__updateRenderSpread(), spread) : spread;
        }
    };
    const {stintSet: stintSet$2} = DataHelper;
    const UIRender = {
        __updateChange() {
            const data = this.__;
            if (data.__useStroke) {
                const useStroke = data.__useStroke = !!(data.stroke && data.strokeWidth);
                stintSet$2(this.__world, "half", useStroke && data.strokeAlign === "center" && data.strokeWidth % 2);
                stintSet$2(data, "__fillAfterStroke", useStroke && data.strokeAlign === "outside" && data.fill && !data.__isTransparentFill);
            }
            if (data.__useEffect) {
                const {shadow: shadow, fill: fill, stroke: stroke} = data, otherEffect = data.innerShadow || data.blur || data.backgroundBlur || data.filter;
                stintSet$2(data, "__isFastShadow", shadow && !otherEffect && shadow.length < 2 && !shadow[0].spread && !Effect.isTransformShadow(shadow[0]) && !(shadow[0].blendMode && shadow[0].blendMode !== "pass-through") && fill && !data.__isTransparentFill && !(isArray(fill) && fill.length > 1) && (this.useFastShadow || !stroke || stroke && data.strokeAlign === "inside"));
                data.__useEffect = !!(shadow || otherEffect);
            }
            data.__checkSingle();
            data.__checkComplex();
        },
        __drawFast(canvas, options) {
            drawFast(this, canvas, options);
        },
        __draw(canvas, options, originCanvas) {
            const data = this.__;
            if (data.__complex) {
                if (data.__needComputePaint) data.__computePaint();
                const {fill: fill, stroke: stroke, __drawAfterFill: __drawAfterFill, __fillAfterStroke: __fillAfterStroke, __isFastShadow: __isFastShadow} = data;
                this.__drawRenderPath(canvas);
                if (data.__useEffect && !__isFastShadow) {
                    const shape = Paint.shape(this, canvas, options);
                    this.__nowWorld = this.__getNowWorld(options);
                    const {shadow: shadow, innerShadow: innerShadow, filter: filter} = data;
                    if (shadow) Effect.shadow(this, canvas, shape);
                    if (__fillAfterStroke) data.__isStrokes ? Paint.strokes(stroke, this, canvas, options) : Paint.stroke(stroke, this, canvas, options);
                    if (fill) data.__isFills ? Paint.fills(fill, this, canvas, options) : Paint.fill(fill, this, canvas, options);
                    if (__drawAfterFill) this.__drawAfterFill(canvas, options);
                    if (innerShadow) Effect.innerShadow(this, canvas, shape);
                    if (stroke && !__fillAfterStroke) data.__isStrokes ? Paint.strokes(stroke, this, canvas, options) : Paint.stroke(stroke, this, canvas, options);
                    if (filter) Filter.apply(filter, this, this.__nowWorld, canvas, originCanvas, shape);
                    if (shape.worldCanvas) shape.worldCanvas.recycle();
                    shape.canvas.recycle();
                } else {
                    if (__fillAfterStroke) data.__isStrokes ? Paint.strokes(stroke, this, canvas, options) : Paint.stroke(stroke, this, canvas, options);
                    if (__isFastShadow) {
                        const shadow = data.shadow[0], {scaleX: scaleX, scaleY: scaleY} = this.getRenderScaleData(true, shadow.scaleFixed);
                        canvas.save(), canvas.setWorldShadow(shadow.x * scaleX, shadow.y * scaleY, shadow.blur * scaleX, ColorConvert.string(shadow.color));
                    }
                    if (fill) data.__isFills ? Paint.fills(fill, this, canvas, options) : Paint.fill(fill, this, canvas, options);
                    if (__isFastShadow) canvas.restore();
                    if (__drawAfterFill) this.__drawAfterFill(canvas, options);
                    if (stroke && !__fillAfterStroke) data.__isStrokes ? Paint.strokes(stroke, this, canvas, options) : Paint.stroke(stroke, this, canvas, options);
                }
            } else {
                if (data.__pathForRender) drawFast(this, canvas, options); else this.__drawFast(canvas, options);
            }
        },
        __drawShape(canvas, options) {
            this.__drawRenderPath(canvas);
            const data = this.__, {fill: fill, stroke: stroke} = data;
            if (fill && !options.ignoreFill) data.__isAlphaPixelFill ? Paint.fills(fill, this, canvas, options) : Paint.fill("#000000", this, canvas, options);
            if (data.__isCanvas) this.__drawAfterFill(canvas, options);
            if (stroke && !options.ignoreStroke) data.__isAlphaPixelStroke ? Paint.strokes(stroke, this, canvas, options) : Paint.stroke("#000000", this, canvas, options);
        },
        __drawAfterFill(canvas, options) {
            if (this.__.__clipAfterFill) {
                canvas.save();
                canvas.clipUI(this);
                this.__drawContent(canvas, options);
                canvas.restore();
            } else this.__drawContent(canvas, options);
        }
    };
    function drawFast(ui, canvas, options) {
        const {fill: fill, stroke: stroke, __drawAfterFill: __drawAfterFill, __fillAfterStroke: __fillAfterStroke} = ui.__;
        ui.__drawRenderPath(canvas);
        if (__fillAfterStroke) Paint.stroke(stroke, ui, canvas, options);
        if (fill) Paint.fill(fill, ui, canvas, options);
        if (__drawAfterFill) ui.__drawAfterFill(canvas, options);
        if (stroke && !__fillAfterStroke) Paint.stroke(stroke, ui, canvas, options);
    }
    const RectRender = {
        __drawFast(canvas, options) {
            let {x: x, y: y, width: width, height: height} = this.__layout.boxBounds;
            const {fill: fill, stroke: stroke, __drawAfterFill: __drawAfterFill} = this.__;
            if (fill) {
                canvas.fillStyle = fill;
                canvas.fillRect(x, y, width, height);
            }
            if (__drawAfterFill) this.__drawAfterFill(canvas, options);
            if (stroke) {
                const {strokeAlign: strokeAlign, __strokeWidth: strokeWidth} = this.__;
                if (!strokeWidth) return;
                canvas.setStroke(stroke, strokeWidth, this.__);
                const half = strokeWidth / 2;
                switch (strokeAlign) {
                  case "center":
                    canvas.strokeRect(0, 0, width, height);
                    break;

                  case "inside":
                    width -= strokeWidth, height -= strokeWidth;
                    if (width < 0 || height < 0) {
                        canvas.save();
                        this.__clip(canvas, options);
                        canvas.strokeRect(x + half, y + half, width, height);
                        canvas.restore();
                    } else canvas.strokeRect(x + half, y + half, width, height);
                    break;

                  case "outside":
                    canvas.strokeRect(x - half, y - half, width + strokeWidth, height + strokeWidth);
                    break;
                }
            }
        }
    };
    var UI_1;
    exports.UI = UI_1 = class UI extends exports.Leaf {
        get app() {
            return this.leafer && this.leafer.app;
        }
        set strokeWidthFixed(value) {
            this.strokeScaleFixed = value;
        }
        get strokeWidthFixed() {
            return this.strokeScaleFixed;
        }
        set scale(value) {
            MathHelper.assignScale(this, value);
        }
        get scale() {
            return this.__.scale;
        }
        get isAutoWidth() {
            const t = this.__;
            return t.__autoWidth || t.autoWidth;
        }
        get isAutoHeight() {
            const t = this.__;
            return t.__autoHeight || t.autoHeight;
        }
        get pen() {
            const {path: path} = this.__;
            pen.set(this.path = path || []);
            if (!path) this.__drawPathByBox(pen);
            return pen;
        }
        set(data, _transition) {
            if (data) Object.assign(this, data);
        }
        get(name) {
            return isString(name) ? this.__.__getInput(name) : this.__.__getInputData(name);
        }
        find(_condition, _options) {
            return Plugin.need("find");
        }
        findTag(tag) {
            return this.find({
                tag: tag
            });
        }
        findOne(_condition, _options) {
            return Plugin.need("find");
        }
        findId(id) {
            return this.findOne({
                id: id
            });
        }
        getPath(curve, pathForRender) {
            this.__layout.update();
            let path = pathForRender ? this.__.__pathForRender : this.__.path;
            if (!path) pen.set(path = []), this.__drawPathByBox(pen, "box", !pathForRender);
            return curve ? PathConvert.toCanvasData(path, true) : path;
        }
        getPathString(curve, pathForRender, floatLength) {
            return PathConvert.stringify(this.getPath(curve, pathForRender), floatLength);
        }
        asPath(curve, pathForRender) {
            this.path = this.getPath(curve, pathForRender);
        }
        load() {
            this.__.__computePaint();
        }
        __onUpdateSize() {
            if (this.__.__input) {
                const data = this.__;
                data.lazy && !this.__inLazyBounds && !Export.running ? data.__needComputePaint = true : data.__computePaint();
            }
        }
        __updatePath() {}
        __updateRenderPath(updateCache) {
            const data = this.__;
            if (data.path) {
                data.__pathForRender = data.cornerRadius || data.path.radius ? PathCorner.smooth(data.path, data.cornerRadius, data.cornerSmoothing) : data.path;
                if (data.__useArrow) PathArrow.addArrows(this, updateCache);
            } else data.__pathForRender && (data.__pathForRender = undefined);
        }
        __drawRenderPath(canvas) {
            const data = this.__;
            canvas.beginPath();
            if (data.__useArrow) PathArrow.updateArrow(this);
            this.__drawPathByData(canvas, data.__pathForRender);
        }
        __drawPath(canvas) {
            const data = this.__;
            canvas.beginPath();
            data.__usePointsMode ? PathDrawer.drawPathByPoints(canvas, data.points, data.closed) : this.__drawPathByData(canvas, data.path, true);
        }
        __drawPathByData(drawer, data, ignoreCornerRadius) {
            data ? PathDrawer.drawPathByData(drawer, data) : this.__drawPathByBox(drawer, "box", ignoreCornerRadius);
        }
        __drawPathByBox(drawer, boundsType = "box", ignoreCornerRadius) {
            const {x: x, y: y, width: width, height: height} = this.__layout[boundsType + "Bounds"];
            if (this.__.cornerRadius && !ignoreCornerRadius) {
                const {cornerRadius: cornerRadius} = this.__;
                drawer.roundRect(x, y, width, height, isNumber(cornerRadius) ? [ cornerRadius ] : cornerRadius);
            } else drawer.rect(x, y, width, height);
            drawer.closePath();
        }
        drawImagePlaceholder(_paint, canvas, renderOptions) {
            Paint.fill(this.__.placeholderColor, this, canvas, renderOptions);
        }
        animate(keyframe, _options, _type, _isTemp) {
            this.set(keyframe);
            return Plugin.need("animate");
        }
        killAnimate(_type, _nextStyle) {}
        export(_filename, _options) {
            return Plugin.need("export");
        }
        syncExport(_filename, _options) {
            return Plugin.need("export");
        }
        clone(data) {
            const json = DataHelper.clone(this.toJSON());
            if (data) Object.assign(json, data);
            return UI_1.one(json);
        }
        static one(data, x, y, width, height) {
            return UICreator.get(data.tag || this.prototype.__tag, data, x, y, width, height);
        }
        static registerUI() {
            registerUI()(this);
        }
        static registerData(data) {
            dataProcessor(data)(this.prototype);
        }
        static setEditConfig(_config) {}
        static setEditOuter(_toolName) {}
        static setEditInner(_editorName) {}
        destroy() {
            this.__.__willDestroy = true;
            this.fill = this.stroke = null;
            if (this.__animate) this.killAnimate();
            super.destroy();
        }
    };
    __decorate([ dataProcessor(UIData) ], exports.UI.prototype, "__", void 0);
    __decorate([ zoomLayerType() ], exports.UI.prototype, "zoomLayer", void 0);
    __decorate([ dataType("") ], exports.UI.prototype, "id", void 0);
    __decorate([ dataType("") ], exports.UI.prototype, "name", void 0);
    __decorate([ dataType("") ], exports.UI.prototype, "className", void 0);
    __decorate([ surfaceType("pass-through") ], exports.UI.prototype, "blendMode", void 0);
    __decorate([ opacityType(1) ], exports.UI.prototype, "opacity", void 0);
    __decorate([ visibleType(true) ], exports.UI.prototype, "visible", void 0);
    __decorate([ surfaceType(false) ], exports.UI.prototype, "locked", void 0);
    __decorate([ dimType(false) ], exports.UI.prototype, "dim", void 0);
    __decorate([ dimType(false) ], exports.UI.prototype, "dimskip", void 0);
    __decorate([ sortType(0) ], exports.UI.prototype, "zIndex", void 0);
    __decorate([ maskType(false) ], exports.UI.prototype, "mask", void 0);
    __decorate([ eraserType(false) ], exports.UI.prototype, "eraser", void 0);
    __decorate([ positionType(0, true) ], exports.UI.prototype, "x", void 0);
    __decorate([ positionType(0, true) ], exports.UI.prototype, "y", void 0);
    __decorate([ boundsType(100, true) ], exports.UI.prototype, "width", void 0);
    __decorate([ boundsType(100, true) ], exports.UI.prototype, "height", void 0);
    __decorate([ scaleType(1, true) ], exports.UI.prototype, "scaleX", void 0);
    __decorate([ scaleType(1, true) ], exports.UI.prototype, "scaleY", void 0);
    __decorate([ rotationType(0, true) ], exports.UI.prototype, "rotation", void 0);
    __decorate([ rotationType(0, true) ], exports.UI.prototype, "skewX", void 0);
    __decorate([ rotationType(0, true) ], exports.UI.prototype, "skewY", void 0);
    __decorate([ positionType(0, true) ], exports.UI.prototype, "offsetX", void 0);
    __decorate([ positionType(0, true) ], exports.UI.prototype, "offsetY", void 0);
    __decorate([ scrollType(0, true) ], exports.UI.prototype, "scrollX", void 0);
    __decorate([ scrollType(0, true) ], exports.UI.prototype, "scrollY", void 0);
    __decorate([ autoLayoutType() ], exports.UI.prototype, "origin", void 0);
    __decorate([ autoLayoutType() ], exports.UI.prototype, "around", void 0);
    __decorate([ dataType(false) ], exports.UI.prototype, "lazy", void 0);
    __decorate([ naturalBoundsType(1) ], exports.UI.prototype, "pixelRatio", void 0);
    __decorate([ affectRenderBoundsType(0) ], exports.UI.prototype, "renderSpread", void 0);
    __decorate([ pathInputType() ], exports.UI.prototype, "path", void 0);
    __decorate([ pathType() ], exports.UI.prototype, "windingRule", void 0);
    __decorate([ pathType(true) ], exports.UI.prototype, "closed", void 0);
    __decorate([ boundsType(0) ], exports.UI.prototype, "padding", void 0);
    __decorate([ boundsType(false) ], exports.UI.prototype, "lockRatio", void 0);
    __decorate([ boundsType() ], exports.UI.prototype, "widthRange", void 0);
    __decorate([ boundsType() ], exports.UI.prototype, "heightRange", void 0);
    __decorate([ dataType(false) ], exports.UI.prototype, "draggable", void 0);
    __decorate([ dataType() ], exports.UI.prototype, "dragBounds", void 0);
    __decorate([ dataType("auto") ], exports.UI.prototype, "dragBoundsType", void 0);
    __decorate([ dataType(false) ], exports.UI.prototype, "editable", void 0);
    __decorate([ hitType(true) ], exports.UI.prototype, "hittable", void 0);
    __decorate([ hitType() ], exports.UI.prototype, "hitThrough", void 0);
    __decorate([ hitType("path") ], exports.UI.prototype, "hitFill", void 0);
    __decorate([ strokeType("path") ], exports.UI.prototype, "hitStroke", void 0);
    __decorate([ hitType(false) ], exports.UI.prototype, "hitBox", void 0);
    __decorate([ hitType(true) ], exports.UI.prototype, "hitChildren", void 0);
    __decorate([ hitType(true) ], exports.UI.prototype, "hitSelf", void 0);
    __decorate([ hitType() ], exports.UI.prototype, "hitRadius", void 0);
    __decorate([ cursorType("") ], exports.UI.prototype, "cursor", void 0);
    __decorate([ surfaceType() ], exports.UI.prototype, "fill", void 0);
    __decorate([ strokeType(undefined, true) ], exports.UI.prototype, "stroke", void 0);
    __decorate([ strokeType("inside") ], exports.UI.prototype, "strokeAlign", void 0);
    __decorate([ strokeType(1, true) ], exports.UI.prototype, "strokeWidth", void 0);
    __decorate([ strokeType(false) ], exports.UI.prototype, "strokeScaleFixed", void 0);
    __decorate([ strokeType("none") ], exports.UI.prototype, "strokeCap", void 0);
    __decorate([ strokeType("miter") ], exports.UI.prototype, "strokeJoin", void 0);
    __decorate([ strokeType() ], exports.UI.prototype, "dashPattern", void 0);
    __decorate([ strokeType(0) ], exports.UI.prototype, "dashOffset", void 0);
    __decorate([ strokeType(10) ], exports.UI.prototype, "miterLimit", void 0);
    __decorate([ pathType(0) ], exports.UI.prototype, "cornerRadius", void 0);
    __decorate([ pathType() ], exports.UI.prototype, "cornerSmoothing", void 0);
    __decorate([ effectType() ], exports.UI.prototype, "shadow", void 0);
    __decorate([ effectType() ], exports.UI.prototype, "innerShadow", void 0);
    __decorate([ effectType() ], exports.UI.prototype, "blur", void 0);
    __decorate([ effectType() ], exports.UI.prototype, "backgroundBlur", void 0);
    __decorate([ effectType() ], exports.UI.prototype, "grayscale", void 0);
    __decorate([ effectType() ], exports.UI.prototype, "filter", void 0);
    __decorate([ surfaceType() ], exports.UI.prototype, "placeholderColor", void 0);
    __decorate([ dataType(100) ], exports.UI.prototype, "placeholderDelay", void 0);
    __decorate([ dataType({}) ], exports.UI.prototype, "data", void 0);
    exports.UI = UI_1 = __decorate([ useModule(UIBounds), useModule(UIRender), rewriteAble() ], exports.UI);
    exports.Group = class Group extends exports.UI {
        get __tag() {
            return "Group";
        }
        get isBranch() {
            return true;
        }
        reset(data) {
            this.__setBranch();
            super.reset(data);
        }
        __setBranch() {
            if (!this.children) this.children = [];
        }
        set(data, transition) {
            if (data) {
                if (data.children) {
                    const {children: children} = data;
                    delete data.children;
                    this.children ? this.clear() : this.__setBranch();
                    super.set(data, transition);
                    children.forEach(child => this.add(child));
                    data.children = children;
                } else super.set(data, transition);
            }
        }
        toJSON(options) {
            const data = super.toJSON(options);
            if (!this.childlessJSON) {
                const children = data.children = [];
                this.children.forEach(child => child.skipJSON || children.push(child.toJSON(options)));
            }
            return data;
        }
        addAt(child, index) {
            this.add(child, index);
        }
        addAfter(child, after) {
            this.add(child, this.children.indexOf(after) + 1);
        }
        addBefore(child, before) {
            this.add(child, this.children.indexOf(before));
        }
    };
    __decorate([ dataProcessor(GroupData) ], exports.Group.prototype, "__", void 0);
    __decorate([ boundsType(0) ], exports.Group.prototype, "width", void 0);
    __decorate([ boundsType(0) ], exports.Group.prototype, "height", void 0);
    exports.Group = __decorate([ useModule(exports.Branch), registerUI() ], exports.Group);
    var Leafer_1;
    const debug$1 = Debug.get("Leafer");
    exports.Leafer = Leafer_1 = class Leafer extends exports.Group {
        get __tag() {
            return "Leafer";
        }
        get isApp() {
            return false;
        }
        get app() {
            return this.parent || this;
        }
        get isLeafer() {
            return true;
        }
        get imageReady() {
            return this.viewReady && Resource.isComplete;
        }
        get layoutLocked() {
            return !this.layouter.running;
        }
        get view() {
            return this.canvas && this.canvas.view;
        }
        get FPS() {
            return this.renderer ? this.renderer.FPS : 60;
        }
        get cursorPoint() {
            return this.interaction && this.interaction.hoverData || {
                x: this.width / 2,
                y: this.height / 2
            };
        }
        get clientBounds() {
            return this.canvas && this.canvas.getClientBounds(true) || getBoundsData();
        }
        constructor(userConfig, data) {
            super(data);
            this.config = {
                start: true,
                hittable: true,
                smooth: true,
                trackChanges: true,
                lazySpeard: 100
            };
            this.leafs = 0;
            this.__eventIds = [];
            this.__controllers = [];
            this.__readyWait = [];
            this.__viewReadyWait = [];
            this.__viewCompletedWait = [];
            this.__nextRenderWait = [];
            this.userConfig = userConfig;
            if (userConfig && (userConfig.view || userConfig.width)) this.init(userConfig);
            Leafer_1.list.add(this);
        }
        init(userConfig, parentApp) {
            if (this.canvas) return;
            let start;
            const {config: config} = this;
            this.__setLeafer(this);
            if (parentApp) {
                this.parentApp = parentApp;
                this.__bindApp(parentApp);
                start = parentApp.running;
            }
            if (userConfig) {
                this.parent = parentApp;
                this.initType(userConfig.type);
                this.parent = undefined;
                DataHelper.assign(config, userConfig);
            }
            const canvas = this.canvas = Creator.canvas(config);
            this.__controllers.push(this.renderer = Creator.renderer(this, canvas, config), this.watcher = Creator.watcher(this, config), this.layouter = Creator.layouter(this, config));
            if (this.isApp) this.__setApp();
            this.__checkAutoLayout();
            if (!parentApp) {
                this.selector = Creator.selector(this);
                this.interaction = Creator.interaction(this, canvas, this.selector, config);
                if (this.interaction) {
                    this.__controllers.unshift(this.interaction);
                    this.hitCanvasManager = Creator.hitCanvasManager();
                }
                this.canvasManager = new CanvasManager;
                start = config.start;
            }
            this.hittable = config.hittable;
            this.fill = config.fill;
            this.canvasManager.add(canvas);
            this.__listenEvents();
            if (start) this.__startTimer = setTimeout(this.start.bind(this));
            WaitHelper.run(this.__initWait);
            this.onInit();
        }
        onInit() {}
        initType(_type) {}
        set(data, transition) {
            this.waitInit(() => {
                super.set(data, transition);
            });
        }
        start() {
            clearTimeout(this.__startTimer);
            if (!this.running && this.canvas) {
                this.running = true;
                this.ready ? this.emitLeafer(LeaferEvent.RESTART) : this.emitLeafer(LeaferEvent.START);
                this.__controllers.forEach(item => item.start());
                if (!this.isApp) this.renderer.render();
            }
        }
        stop() {
            clearTimeout(this.__startTimer);
            if (this.running && this.canvas) {
                this.__controllers.forEach(item => item.stop());
                this.running = false;
                this.emitLeafer(LeaferEvent.STOP);
            }
        }
        unlockLayout(updateLayout = true) {
            this.layouter.start();
            if (updateLayout) this.updateLayout();
        }
        lockLayout(updateLayout = true) {
            if (updateLayout) this.updateLayout();
            this.layouter.stop();
        }
        resize(size) {
            const data = DataHelper.copyAttrs({}, size, canvasSizeAttrs);
            Object.keys(data).forEach(key => this[key] = data[key]);
        }
        forceRender(bounds, sync) {
            const {renderer: renderer} = this;
            if (renderer) {
                renderer.addBlock(bounds ? new Bounds(bounds) : this.canvas.bounds);
                if (this.viewReady) sync ? renderer.render() : renderer.update();
            }
        }
        requestRender(change = false) {
            if (this.renderer) this.renderer.update(change);
        }
        updateCursor(cursor) {
            const i = this.interaction;
            if (i) cursor ? i.setCursor(cursor) : i.updateCursor();
        }
        updateLazyBounds() {
            this.lazyBounds = this.canvas.bounds.clone().spread(this.config.lazySpeard);
        }
        __doResize(size) {
            const {canvas: canvas} = this;
            if (!canvas || canvas.isSameSize(size)) return;
            const old = DataHelper.copyAttrs({}, this.canvas, canvasSizeAttrs);
            canvas.resize(size);
            this.updateLazyBounds();
            this.__onResize(new ResizeEvent(size, old));
        }
        __onResize(event) {
            this.emitEvent(event);
            DataHelper.copyAttrs(this.__, event, canvasSizeAttrs);
            setTimeout(() => {
                if (this.canvasManager) this.canvasManager.clearRecycled();
            }, 0);
        }
        __setApp() {}
        __bindApp(app) {
            this.selector = app.selector;
            this.interaction = app.interaction;
            this.canvasManager = app.canvasManager;
            this.hitCanvasManager = app.hitCanvasManager;
        }
        __setLeafer(leafer) {
            this.leafer = leafer;
            this.__level = 1;
        }
        __checkAutoLayout() {
            const {config: config, parentApp: parentApp} = this;
            if (!parentApp) {
                if (!config.width || !config.height) this.autoLayout = new AutoBounds(config);
                this.canvas.startAutoLayout(this.autoLayout, this.__onResize.bind(this));
            }
        }
        __setAttr(attrName, newValue) {
            if (this.canvas) {
                if (canvasSizeAttrs.includes(attrName)) {
                    this.__changeCanvasSize(attrName, newValue);
                } else if (attrName === "fill") {
                    this.__changeFill(newValue);
                } else if (attrName === "hittable") {
                    if (!this.parent) this.canvas.hittable = newValue;
                } else if (attrName === "zIndex") {
                    this.canvas.zIndex = newValue;
                    setTimeout(() => this.parent && this.parent.__updateSortChildren());
                } else if (attrName === "mode") this.emit(LeaferEvent.UPDATE_MODE, {
                    mode: newValue
                });
            }
            return super.__setAttr(attrName, newValue);
        }
        __getAttr(attrName) {
            if (this.canvas && canvasSizeAttrs.includes(attrName)) return this.canvas[attrName];
            return super.__getAttr(attrName);
        }
        __changeCanvasSize(attrName, newValue) {
            const {config: config, canvas: canvas} = this;
            const data = DataHelper.copyAttrs({}, canvas, canvasSizeAttrs);
            data[attrName] = config[attrName] = newValue;
            config.width && config.height ? canvas.stopAutoLayout() : this.__checkAutoLayout();
            this.__doResize(data);
        }
        __changeFill(newValue) {
            this.config.fill = newValue;
            if (this.canvas.allowBackgroundColor) this.canvas.backgroundColor = newValue; else this.forceRender();
        }
        __onCreated() {
            this.created = true;
        }
        __onReady() {
            this.ready = true;
            this.emitLeafer(LeaferEvent.BEFORE_READY);
            this.emitLeafer(LeaferEvent.READY);
            this.emitLeafer(LeaferEvent.AFTER_READY);
            WaitHelper.run(this.__readyWait);
        }
        __onViewReady() {
            if (this.viewReady) return;
            this.viewReady = true;
            this.emitLeafer(LeaferEvent.VIEW_READY);
            WaitHelper.run(this.__viewReadyWait);
        }
        __onLayoutEnd() {
            const {grow: grow, width: fixedWidth, height: fixedHeight} = this.config;
            if (grow) {
                let {width: width, height: height, pixelRatio: pixelRatio} = this;
                const bounds = grow === "box" ? this.worldBoxBounds : this.__world;
                if (!fixedWidth) width = Math.max(1, bounds.x + bounds.width);
                if (!fixedHeight) height = Math.max(1, bounds.y + bounds.height);
                this.__doResize({
                    width: width,
                    height: height,
                    pixelRatio: pixelRatio
                });
            }
            if (!this.ready) this.__onReady();
        }
        __onNextRender() {
            if (this.viewReady) {
                WaitHelper.run(this.__nextRenderWait);
                const {imageReady: imageReady} = this;
                if (imageReady && !this.viewCompleted) this.__checkViewCompleted();
                if (!imageReady) {
                    this.viewCompleted = false;
                    this.requestRender();
                }
            } else this.requestRender();
        }
        __checkViewCompleted(emit = true) {
            this.nextRender(() => {
                if (this.imageReady) {
                    if (emit) this.emitLeafer(LeaferEvent.VIEW_COMPLETED);
                    WaitHelper.run(this.__viewCompletedWait);
                    this.viewCompleted = true;
                }
            });
        }
        __onWatchData() {
            if (this.watcher.childrenChanged && this.interaction) {
                this.nextRender(() => this.interaction.updateCursor());
            }
        }
        waitInit(item, bind) {
            if (bind) item = item.bind(bind);
            if (!this.__initWait) this.__initWait = [];
            this.canvas ? item() : this.__initWait.push(item);
        }
        waitReady(item, bind) {
            if (bind) item = item.bind(bind);
            this.ready ? item() : this.__readyWait.push(item);
        }
        waitViewReady(item, bind) {
            if (bind) item = item.bind(bind);
            this.viewReady ? item() : this.__viewReadyWait.push(item);
        }
        waitViewCompleted(item, bind) {
            if (bind) item = item.bind(bind);
            this.__viewCompletedWait.push(item);
            if (this.viewCompleted) this.__checkViewCompleted(false); else if (!this.running) this.start();
        }
        nextRender(item, bind, off) {
            if (bind) item = item.bind(bind);
            const list = this.__nextRenderWait;
            if (off) {
                for (let i = 0; i < list.length; i++) {
                    if (list[i] === item) {
                        list.splice(i, 1);
                        break;
                    }
                }
            } else list.push(item);
            this.requestRender();
        }
        zoom(_zoomType, _optionsOrPadding, _scroll, _transition) {
            return Plugin.need("view");
        }
        getValidMove(moveX, moveY, _checkLimit) {
            return {
                x: moveX,
                y: moveY
            };
        }
        getValidScale(changeScale) {
            return changeScale;
        }
        getWorldPointByClient(clientPoint, updateClient) {
            return this.interaction && this.interaction.getLocal(clientPoint, updateClient);
        }
        getPagePointByClient(clientPoint, updateClient) {
            return this.getPagePoint(this.getWorldPointByClient(clientPoint, updateClient));
        }
        getClientPointByWorld(worldPoint) {
            const {x: x, y: y} = this.clientBounds;
            return {
                x: x + worldPoint.x,
                y: y + worldPoint.y
            };
        }
        updateClientBounds() {
            this.canvas && this.canvas.updateClientBounds();
        }
        receiveEvent(_event) {}
        emitLeafer(type) {
            this.emitEvent(new LeaferEvent(type, this));
        }
        __listenEvents() {
            const runId = Run.start("FirstCreate " + this.innerName);
            this.once([ [ LeaferEvent.START, () => Run.end(runId) ], [ LayoutEvent.START, this.updateLazyBounds, this ], [ RenderEvent.START, this.__onCreated, this ], [ RenderEvent.END, this.__onViewReady, this ] ]);
            this.__eventIds.push(this.on_([ [ WatchEvent.DATA, this.__onWatchData, this ], [ LayoutEvent.END, this.__onLayoutEnd, this ], [ RenderEvent.NEXT, this.__onNextRender, this ] ]));
        }
        __removeListenEvents() {
            this.off_(this.__eventIds);
        }
        destroy(sync) {
            const doDestory = () => {
                if (!this.destroyed) {
                    Leafer_1.list.remove(this);
                    try {
                        this.stop();
                        this.emitLeafer(LeaferEvent.END);
                        this.__removeListenEvents();
                        this.__controllers.forEach(item => !(this.parent && item === this.interaction) && item.destroy());
                        this.__controllers.length = 0;
                        if (!this.parent) {
                            if (this.selector) this.selector.destroy();
                            if (this.hitCanvasManager) this.hitCanvasManager.destroy();
                            if (this.canvasManager) this.canvasManager.destroy();
                        }
                        if (this.canvas) this.canvas.destroy();
                        this.config.view = this.parentApp = null;
                        if (this.userConfig) this.userConfig.view = null;
                        super.destroy();
                        setTimeout(() => {
                            ImageManager.clearRecycled();
                        }, 100);
                    } catch (e) {
                        debug$1.error(e);
                    }
                }
            };
            sync ? doDestory() : setTimeout(doDestory);
        }
    };
    exports.Leafer.list = new LeafList;
    __decorate([ dataProcessor(LeaferData) ], exports.Leafer.prototype, "__", void 0);
    __decorate([ boundsType() ], exports.Leafer.prototype, "pixelRatio", void 0);
    __decorate([ dataType("normal") ], exports.Leafer.prototype, "mode", void 0);
    exports.Leafer = Leafer_1 = __decorate([ registerUI() ], exports.Leafer);
    exports.Rect = class Rect extends exports.UI {
        get __tag() {
            return "Rect";
        }
    };
    __decorate([ dataProcessor(RectData) ], exports.Rect.prototype, "__", void 0);
    exports.Rect = __decorate([ useModule(RectRender), rewriteAble(), registerUI() ], exports.Rect);
    const {add: add, includes: includes$1, scroll: scroll} = BoundsHelper;
    const rect$1 = exports.Rect.prototype, group = exports.Group.prototype;
    exports.Box = class Box extends exports.Group {
        get __tag() {
            return "Box";
        }
        get isBranchLeaf() {
            return true;
        }
        get __useSelfBox() {
            return this.pathInputed;
        }
        constructor(data) {
            super(data);
            this.__layout.renderChanged || this.__layout.renderChange();
        }
        __updateStrokeSpread() {
            return 0;
        }
        __updateRectRenderSpread() {
            return 0;
        }
        __updateRenderSpread() {
            return this.__updateRectRenderSpread() || -1;
        }
        __updateRectBoxBounds() {}
        __updateBoxBounds(_secondLayout) {
            if (this.children.length && !this.__useSelfBox) {
                const data = this.__;
                if (data.__autoSide) {
                    if (data.__hasSurface) this.__extraUpdate();
                    super.__updateBoxBounds();
                    const {boxBounds: boxBounds} = this.__layout;
                    if (!data.__autoSize) {
                        if (data.__autoWidth) {
                            boxBounds.width += boxBounds.x, boxBounds.x = 0;
                            boxBounds.height = data.height, boxBounds.y = 0;
                        } else {
                            boxBounds.height += boxBounds.y, boxBounds.y = 0;
                            boxBounds.width = data.width, boxBounds.x = 0;
                        }
                    }
                    this.__updateNaturalSize();
                } else this.__updateRectBoxBounds();
            } else this.__updateRectBoxBounds();
        }
        __updateStrokeBounds() {}
        __updateRenderBounds() {
            let isOverflow, isScrollMode;
            if (this.children.length) {
                const data = this.__, layout = this.__layout, {renderBounds: renderBounds, boxBounds: boxBounds} = layout, {overflow: overflow} = data;
                const childrenRenderBounds = layout.childrenRenderBounds || (layout.childrenRenderBounds = getBoundsData());
                super.__updateRenderBounds(childrenRenderBounds);
                if (isScrollMode = overflow && overflow.includes("scroll")) {
                    add(childrenRenderBounds, boxBounds);
                    scroll(childrenRenderBounds, data);
                }
                this.__updateRectRenderBounds();
                isOverflow = !includes$1(boxBounds, childrenRenderBounds);
                if (isOverflow && overflow === "show") add(renderBounds, childrenRenderBounds);
            } else this.__updateRectRenderBounds();
            DataHelper.stintSet(this, "isOverflow", isOverflow);
            this.__checkScroll(isScrollMode);
        }
        __updateRectRenderBounds() {}
        __checkScroll(_isScrollMode) {}
        __updateRectChange() {}
        __updateChange() {
            super.__updateChange();
            this.__updateRectChange();
        }
        __renderRect(_canvas, _options) {}
        __renderGroup(_canvas, _options) {}
        __render(canvas, options) {
            if (this.__.__drawAfterFill) {
                this.__renderRect(canvas, options);
            } else {
                this.__renderRect(canvas, options);
                if (this.children.length) this.__renderGroup(canvas, options);
            }
            if (this.hasScroller) this.scroller.__render(canvas, options);
        }
        __drawContent(canvas, options) {
            this.__renderGroup(canvas, options);
            if (this.__.__useStroke || this.__.__useEffect) {
                canvas.setWorld(this.__nowWorld);
                this.__drawRenderPath(canvas);
            }
        }
    };
    __decorate([ dataProcessor(BoxData) ], exports.Box.prototype, "__", void 0);
    __decorate([ boundsType(100) ], exports.Box.prototype, "width", void 0);
    __decorate([ boundsType(100) ], exports.Box.prototype, "height", void 0);
    __decorate([ dataType(false) ], exports.Box.prototype, "resizeChildren", void 0);
    __decorate([ affectRenderBoundsType("show") ], exports.Box.prototype, "overflow", void 0);
    __decorate([ rewrite(rect$1.__updateStrokeSpread) ], exports.Box.prototype, "__updateStrokeSpread", null);
    __decorate([ rewrite(rect$1.__updateRenderSpread) ], exports.Box.prototype, "__updateRectRenderSpread", null);
    __decorate([ rewrite(rect$1.__updateBoxBounds) ], exports.Box.prototype, "__updateRectBoxBounds", null);
    __decorate([ rewrite(rect$1.__updateStrokeBounds) ], exports.Box.prototype, "__updateStrokeBounds", null);
    __decorate([ rewrite(rect$1.__updateRenderBounds) ], exports.Box.prototype, "__updateRectRenderBounds", null);
    __decorate([ rewrite(rect$1.__updateChange) ], exports.Box.prototype, "__updateRectChange", null);
    __decorate([ rewrite(rect$1.__render) ], exports.Box.prototype, "__renderRect", null);
    __decorate([ rewrite(group.__render) ], exports.Box.prototype, "__renderGroup", null);
    exports.Box = __decorate([ rewriteAble(), registerUI() ], exports.Box);
    exports.Frame = class Frame extends exports.Box {
        get __tag() {
            return "Frame";
        }
        get isFrame() {
            return true;
        }
    };
    __decorate([ frameType() ], exports.Frame.prototype, "frame", void 0);
    __decorate([ dataProcessor(FrameData) ], exports.Frame.prototype, "__", void 0);
    __decorate([ surfaceType("#FFFFFF") ], exports.Frame.prototype, "fill", void 0);
    __decorate([ affectRenderBoundsType("hide") ], exports.Frame.prototype, "overflow", void 0);
    exports.Frame = __decorate([ registerUI() ], exports.Frame);
    const {moveTo: moveTo$3, closePath: closePath$2, ellipse: ellipse} = PathCommandDataHelper, {tempPoint: tempPoint, set: set$1, rotate: rotate$2} = PointHelper, {abs: abs$3} = Math, tempCenter = {};
    exports.Ellipse = class Ellipse extends exports.UI {
        get __tag() {
            return "Ellipse";
        }
        __updatePath() {
            const data = this.__, {width: width, height: height, innerRadius: innerRadius, startAngle: startAngle, endAngle: endAngle, closed: closed} = data;
            const rx = width / 2, ry = height / 2;
            const path = data.path = [];
            let open, hasAngle, closedAngle;
            if (startAngle || endAngle) hasAngle = true;
            if (hasAngle) closedAngle = abs$3(endAngle - startAngle) === 360;
            if (innerRadius) {
                const drawInnerEllipse = innerRadius < 1 || closed;
                const innerRx = rx * innerRadius, innerRy = ry * innerRadius;
                if (hasAngle) {
                    ellipse(path, rx, ry, rx, ry, 0, startAngle, endAngle);
                    if (drawInnerEllipse) {
                        if (closedAngle) {
                            closePath$2(path);
                            set$1(tempPoint, rx + innerRx, ry), set$1(tempCenter, rx, ry);
                            rotate$2(tempPoint, endAngle, tempCenter, rx, ry);
                            moveTo$3(path, tempPoint.x, tempPoint.y);
                        }
                        ellipse(path, rx, ry, innerRx, innerRy, 0, endAngle, startAngle, true);
                    } else {
                        if (!closedAngle) open = true;
                    }
                } else {
                    ellipse(path, rx, ry, rx, ry);
                    if (drawInnerEllipse) {
                        closePath$2(path);
                        moveTo$3(path, rx + innerRx, ry);
                        ellipse(path, rx, ry, innerRx, innerRy, 0, 360, 0, true);
                    }
                }
            } else {
                if (hasAngle) {
                    if (!closedAngle) {
                        if (!closed) open = true;
                        if (!open) moveTo$3(path, rx, ry);
                    }
                    ellipse(path, rx, ry, rx, ry, 0, startAngle, endAngle);
                } else {
                    ellipse(path, rx, ry, rx, ry);
                }
            }
            if (!open) closePath$2(path);
            if (Platform.ellipseToCurve || data.__useArrow || data.cornerRadius) data.path = this.getPath(true);
        }
    };
    __decorate([ dataProcessor(EllipseData) ], exports.Ellipse.prototype, "__", void 0);
    __decorate([ pathType(0) ], exports.Ellipse.prototype, "innerRadius", void 0);
    __decorate([ pathType(0) ], exports.Ellipse.prototype, "startAngle", void 0);
    __decorate([ pathType(0) ], exports.Ellipse.prototype, "endAngle", void 0);
    exports.Ellipse = __decorate([ registerUI() ], exports.Ellipse);
    const {sin: sin$1, cos: cos$1, PI: PI$1} = Math;
    const {moveTo: moveTo$2, lineTo: lineTo$2, closePath: closePath$1, drawPoints: drawPoints$1} = PathCommandDataHelper;
    exports.Polygon = class Polygon extends exports.UI {
        get __tag() {
            return "Polygon";
        }
        get isPointsMode() {
            return this.points && !this.pathInputed;
        }
        __updatePath() {
            const data = this.__;
            const path = data.path = [];
            if (data.points) {
                drawPoints$1(path, data.points, data.curve, data.closed, data);
            } else {
                const {width: width, height: height, sides: sides, startAngle: startAngle} = data;
                const rx = width / 2, ry = height / 2;
                let startRadian = 0, radian;
                if (startAngle) {
                    startRadian = startAngle * OneRadian;
                    moveTo$2(path, rx + rx * sin$1(startRadian), ry - ry * cos$1(startRadian));
                } else moveTo$2(path, rx, 0);
                for (let i = 1; i < sides; i++) {
                    radian = i * 2 * PI$1 / sides + startRadian;
                    lineTo$2(path, rx + rx * sin$1(radian), ry - ry * cos$1(radian));
                }
                closePath$1(path);
            }
        }
    };
    __decorate([ dataProcessor(PolygonData) ], exports.Polygon.prototype, "__", void 0);
    __decorate([ pathType(3) ], exports.Polygon.prototype, "sides", void 0);
    __decorate([ pathType(0) ], exports.Polygon.prototype, "startAngle", void 0);
    __decorate([ pathType() ], exports.Polygon.prototype, "points", void 0);
    __decorate([ pathType(0) ], exports.Polygon.prototype, "curve", void 0);
    exports.Polygon = __decorate([ rewriteAble(), registerUI() ], exports.Polygon);
    const {sin: sin, cos: cos, PI: PI} = Math;
    const {moveTo: moveTo$1, lineTo: lineTo$1, closePath: closePath} = PathCommandDataHelper;
    exports.Star = class Star extends exports.UI {
        get __tag() {
            return "Star";
        }
        __updatePath() {
            const {width: width, height: height, corners: corners, innerRadius: innerRadius, startAngle: startAngle} = this.__;
            const rx = width / 2, ry = height / 2;
            const path = this.__.path = [];
            let startRadian = 0, radian;
            if (startAngle) {
                startRadian = startAngle * OneRadian;
                moveTo$1(path, rx + rx * sin(startRadian), ry - ry * cos(startRadian));
            } else moveTo$1(path, rx, 0);
            for (let i = 1; i < corners * 2; i++) {
                radian = i * PI / corners + startRadian;
                lineTo$1(path, rx + (i % 2 === 0 ? rx : rx * innerRadius) * sin(radian), ry - (i % 2 === 0 ? ry : ry * innerRadius) * cos(radian));
            }
            closePath(path);
        }
    };
    __decorate([ dataProcessor(StarData) ], exports.Star.prototype, "__", void 0);
    __decorate([ pathType(5) ], exports.Star.prototype, "corners", void 0);
    __decorate([ pathType(.382) ], exports.Star.prototype, "innerRadius", void 0);
    __decorate([ pathType(0) ], exports.Star.prototype, "startAngle", void 0);
    exports.Star = __decorate([ registerUI() ], exports.Star);
    const {moveTo: moveTo, lineTo: lineTo, drawPoints: drawPoints} = PathCommandDataHelper;
    const {rotate: rotate$1, getAngle: getAngle$1, getDistance: getDistance$2, defaultPoint: defaultPoint} = PointHelper;
    exports.Line = class Line extends exports.UI {
        get __tag() {
            return "Line";
        }
        get isPointsMode() {
            return this.points && !this.pathInputed;
        }
        get toPoint() {
            const {width: width, rotation: rotation} = this.__;
            const to = getPointData();
            if (width) to.x = width;
            if (rotation) rotate$1(to, rotation);
            return to;
        }
        set toPoint(value) {
            this.width = getDistance$2(defaultPoint, value);
            this.rotation = getAngle$1(defaultPoint, value);
            if (this.height) this.height = 0;
        }
        __updatePath() {
            const data = this.__;
            const path = data.path = [];
            if (data.points) {
                drawPoints(path, data.points, data.curve, data.closed, data);
            } else {
                moveTo(path, 0, 0);
                lineTo(path, this.width, 0);
            }
        }
    };
    __decorate([ dataProcessor(LineData) ], exports.Line.prototype, "__", void 0);
    __decorate([ affectStrokeBoundsType("center") ], exports.Line.prototype, "strokeAlign", void 0);
    __decorate([ boundsType(0) ], exports.Line.prototype, "height", void 0);
    __decorate([ pathType() ], exports.Line.prototype, "points", void 0);
    __decorate([ pathType(0) ], exports.Line.prototype, "curve", void 0);
    __decorate([ pathType(false) ], exports.Line.prototype, "closed", void 0);
    exports.Line = __decorate([ registerUI() ], exports.Line);
    exports.Image = class Image extends exports.Rect {
        get __tag() {
            return "Image";
        }
        get ready() {
            const {image: image} = this;
            return image && image.ready;
        }
        get image() {
            const {fill: fill} = this.__;
            return isArray(fill) && fill[0].image;
        }
    };
    __decorate([ dataProcessor(ImageData) ], exports.Image.prototype, "__", void 0);
    __decorate([ boundsType("") ], exports.Image.prototype, "url", void 0);
    exports.Image = __decorate([ registerUI() ], exports.Image);
    const MyImage = exports.Image;
    exports.Canvas = class Canvas extends exports.Rect {
        get __tag() {
            return "Canvas";
        }
        get context() {
            return this.canvas.context;
        }
        get ready() {
            return !this.url;
        }
        constructor(data) {
            super(data);
            this.canvas = Creator.canvas(this.__);
            if (data && data.url) this.drawImage(data.url);
        }
        drawImage(url) {
            new LeaferImage({
                url: url
            }).load(image => {
                this.context.drawImage(image.view, 0, 0);
                this.url = undefined;
                this.paint();
                this.emitEvent(new ImageEvent(ImageEvent.LOADED, {
                    image: image
                }));
            });
        }
        draw(ui, offset, scale, rotation) {
            const matrix = new Matrix(ui.worldTransform).invert();
            const m = new Matrix;
            if (offset) m.translate(offset.x, offset.y);
            if (scale) isNumber(scale) ? m.scale(scale) : m.scale(scale.x, scale.y);
            if (rotation) m.rotate(rotation);
            matrix.multiplyParent(m);
            ui.__render(this.canvas, {
                matrix: matrix.withScale()
            });
            this.paint();
        }
        paint() {
            this.forceRender();
        }
        __drawContent(canvas, _options) {
            const {width: width, height: height} = this.__, {view: view} = this.canvas;
            canvas.drawImage(view, 0, 0, view.width, view.height, 0, 0, width, height);
        }
        __updateSize() {
            const {canvas: canvas} = this;
            if (canvas) {
                const {smooth: smooth, safeResize: safeResize} = this.__;
                canvas.resize(this.__, safeResize);
                if (canvas.smooth !== smooth) canvas.smooth = smooth;
            }
        }
        destroy() {
            if (this.canvas) {
                this.canvas.destroy();
                this.canvas = null;
            }
            super.destroy();
        }
    };
    __decorate([ dataProcessor(CanvasData) ], exports.Canvas.prototype, "__", void 0);
    __decorate([ resizeType(100) ], exports.Canvas.prototype, "width", void 0);
    __decorate([ resizeType(100) ], exports.Canvas.prototype, "height", void 0);
    __decorate([ resizeType(1) ], exports.Canvas.prototype, "pixelRatio", void 0);
    __decorate([ resizeType(true) ], exports.Canvas.prototype, "smooth", void 0);
    __decorate([ dataType(false) ], exports.Canvas.prototype, "safeResize", void 0);
    __decorate([ resizeType() ], exports.Canvas.prototype, "contextSettings", void 0);
    exports.Canvas = __decorate([ registerUI() ], exports.Canvas);
    const {copyAndSpread: copyAndSpread$1, includes: includes, setList: setList} = BoundsHelper, {stintSet: stintSet$1} = DataHelper;
    exports.Text = class Text extends exports.UI {
        get __tag() {
            return "Text";
        }
        get textDrawData() {
            this.updateLayout();
            return this.__.__textDrawData;
        }
        __updateTextDrawData() {
            const data = this.__;
            const {lineHeight: lineHeight, letterSpacing: letterSpacing, wordSpacing: wordSpacing, fontFamily: fontFamily, fontSize: fontSize, fontWeight: fontWeight, italic: italic, textCase: textCase, textOverflow: textOverflow, padding: padding, width: width, height: height} = data;
            data.__lineHeight = UnitConvert.number(lineHeight, fontSize);
            data.__letterSpacing = UnitConvert.number(letterSpacing, fontSize);
            data.__wordSpacing = UnitConvert.number(wordSpacing, fontSize);
            data.__baseLine = data.__lineHeight - (data.__lineHeight - fontSize * .7) / 2;
            data.__font = `${italic ? "italic " : ""}${textCase === "small-caps" ? "small-caps " : ""}${fontWeight !== "normal" ? fontWeight + " " : ""}${fontSize || 12}px ${fontFamily || "caption"}`;
            stintSet$1(data, "__padding", padding && MathHelper.fourNumber(padding));
            stintSet$1(data, "__clipText", textOverflow !== "show" && !data.__autoSize);
            stintSet$1(data, "__isCharMode", width || height || data.__letterSpacing || data.__wordSpacing || data.motionText || textCase !== "none");
            data.__textDrawData = TextConvert.getDrawData((data.__isPlacehold = data.placeholder && data.text === "") ? data.placeholder : data.text, this.__);
        }
        __updateBoxBounds() {
            const data = this.__;
            const layout = this.__layout;
            const {fontSize: fontSize, italic: italic, padding: padding, __autoWidth: autoWidth, __autoHeight: autoHeight} = data;
            this.__updateTextDrawData();
            const {bounds: contentBounds} = data.__textDrawData;
            const b = layout.boxBounds;
            layout.contentBounds = contentBounds;
            if (data.__lineHeight < fontSize) layout.renderChanged = true;
            if (autoWidth || autoHeight) {
                b.x = autoWidth ? contentBounds.x : 0;
                b.y = autoHeight ? contentBounds.y : 0;
                b.width = autoWidth ? contentBounds.width : data.width;
                b.height = autoHeight ? contentBounds.height : data.height;
                if (padding) {
                    const [top, right, bottom, left] = data.__padding;
                    if (autoWidth) b.x -= left, b.width += right + left;
                    if (autoHeight) b.y -= top, b.height += bottom + top;
                }
                this.__updateNaturalSize();
            } else super.__updateBoxBounds();
            if (italic) b.width += fontSize * .16;
            DataHelper.stintSet(this, "isOverflow", !includes(b, contentBounds) && !data.motionText);
            if (this.isOverflow) setList(data.__textBoxBounds = {}, [ b, contentBounds ]), layout.renderChanged = true; else data.__textBoxBounds = b;
        }
        __updateRenderSpread() {
            let spread = super.__updateRenderSpread();
            if (!spread) spread = this.isOverflow ? 1 : 0;
            const {__lineHeight: __lineHeight, fontSize: fontSize} = this.__;
            if (__lineHeight < fontSize) spread = FourNumberHelper.max(spread, (fontSize - __lineHeight) / 2);
            return spread;
        }
        __updateRenderBounds() {
            const {renderBounds: renderBounds, renderSpread: renderSpread} = this.__layout;
            copyAndSpread$1(renderBounds, this.__.__textBoxBounds, renderSpread);
            if (this.__box) this.__box.__layout.renderBounds = renderBounds;
        }
        __updateChange() {
            super.__updateChange();
            const box = this.__box;
            if (box) box.__onUpdateSize(), box.__updateChange();
        }
        __drawRenderPath(canvas) {
            canvas.font = this.__.__font;
        }
        __draw(canvas, options, originCanvas) {
            const box = this.__box;
            if (box) box.__nowWorld = this.__nowWorld, box.__draw(canvas, options, originCanvas);
            if (this.textEditing && !options.exporting) return;
            super.__draw(canvas, options, originCanvas);
        }
        __drawShape(canvas, options) {
            if (options.shape) this.__box && this.__box.__drawShape(canvas, options);
            super.__drawShape(canvas, options);
        }
        destroy() {
            if (this.boxStyle) this.boxStyle = null;
            super.destroy();
        }
    };
    __decorate([ dataProcessor(TextData) ], exports.Text.prototype, "__", void 0);
    __decorate([ boundsType(0) ], exports.Text.prototype, "width", void 0);
    __decorate([ boundsType(0) ], exports.Text.prototype, "height", void 0);
    __decorate([ surfaceType() ], exports.Text.prototype, "boxStyle", void 0);
    __decorate([ dataType(false) ], exports.Text.prototype, "resizeFontSize", void 0);
    __decorate([ surfaceType("#000000") ], exports.Text.prototype, "fill", void 0);
    __decorate([ affectStrokeBoundsType("outside") ], exports.Text.prototype, "strokeAlign", void 0);
    __decorate([ hitType("all") ], exports.Text.prototype, "hitFill", void 0);
    __decorate([ boundsType("") ], exports.Text.prototype, "text", void 0);
    __decorate([ boundsType("") ], exports.Text.prototype, "placeholder", void 0);
    __decorate([ boundsType("caption") ], exports.Text.prototype, "fontFamily", void 0);
    __decorate([ boundsType(12) ], exports.Text.prototype, "fontSize", void 0);
    __decorate([ boundsType("normal") ], exports.Text.prototype, "fontWeight", void 0);
    __decorate([ boundsType(false) ], exports.Text.prototype, "italic", void 0);
    __decorate([ boundsType("none") ], exports.Text.prototype, "textCase", void 0);
    __decorate([ boundsType("none") ], exports.Text.prototype, "textDecoration", void 0);
    __decorate([ boundsType(0) ], exports.Text.prototype, "letterSpacing", void 0);
    __decorate([ boundsType(0) ], exports.Text.prototype, "wordSpacing", void 0);
    __decorate([ boundsType({
        type: "percent",
        value: 1.5
    }) ], exports.Text.prototype, "lineHeight", void 0);
    __decorate([ boundsType(0) ], exports.Text.prototype, "paraIndent", void 0);
    __decorate([ boundsType(0) ], exports.Text.prototype, "paraSpacing", void 0);
    __decorate([ boundsType("x") ], exports.Text.prototype, "writingMode", void 0);
    __decorate([ boundsType("left") ], exports.Text.prototype, "textAlign", void 0);
    __decorate([ boundsType("top") ], exports.Text.prototype, "verticalAlign", void 0);
    __decorate([ boundsType(true) ], exports.Text.prototype, "autoSizeAlign", void 0);
    __decorate([ boundsType("normal") ], exports.Text.prototype, "textWrap", void 0);
    __decorate([ boundsType("show") ], exports.Text.prototype, "textOverflow", void 0);
    __decorate([ surfaceType(false) ], exports.Text.prototype, "textEditing", void 0);
    exports.Text = __decorate([ registerUI() ], exports.Text);
    exports.Path = class Path extends exports.UI {
        get __tag() {
            return "Path";
        }
    };
    __decorate([ dataProcessor(PathData) ], exports.Path.prototype, "__", void 0);
    __decorate([ affectStrokeBoundsType("center") ], exports.Path.prototype, "strokeAlign", void 0);
    exports.Path = __decorate([ registerUI() ], exports.Path);
    exports.Pen = class Pen extends exports.Group {
        get __tag() {
            return "Pen";
        }
        setStyle(data) {
            const path = this.pathElement = new exports.Path(data);
            this.pathStyle = data;
            this.__path = path.path || (path.path = []);
            this.add(path);
            return this;
        }
        paint() {
            const {pathElement: pathElement} = this;
            if (!pathElement.__layout.boxChanged) pathElement.forceUpdate("path");
        }
    };
    __decorate([ dataProcessor(PenData) ], exports.Pen.prototype, "__", void 0);
    __decorate([ penPathType() ], exports.Pen.prototype, "path", void 0);
    exports.Pen = __decorate([ useModule(PathCreator, [ "set", "path", "paint" ]), registerUI() ], exports.Pen);
    function penPathType() {
        return (target, key) => {
            defineKey(target, key, {
                get() {
                    return this.__path;
                }
            });
        };
    }
    exports.App = class App extends exports.Leafer {
        get __tag() {
            return "App";
        }
        get isApp() {
            return true;
        }
        constructor(userConfig, data) {
            super(userConfig, data);
        }
        init(userConfig, parentApp) {
            super.init(userConfig, parentApp);
            if (userConfig) {
                const {ground: ground, tree: tree, sky: sky, editor: editor} = userConfig;
                if (ground) this.ground = this.addLeafer(ground);
                if (tree || editor) this.tree = this.addLeafer(tree || {
                    type: userConfig.type || "design"
                });
                if (sky || editor) this.sky = this.addLeafer(sky);
                if (editor) Creator.editor(editor, this);
            }
        }
        __setApp() {
            const {canvas: canvas} = this;
            const {realCanvas: realCanvas, view: view} = this.config;
            if (realCanvas || view === this.canvas.view || !canvas.parentView) this.realCanvas = true; else canvas.unrealCanvas();
            this.leafer = this;
            this.watcher.disable();
            this.layouter.disable();
        }
        __updateLocalBounds() {
            this.forEach(leafer => leafer.updateLayout());
            super.__updateLocalBounds();
        }
        start() {
            super.start();
            this.forEach(leafer => leafer.start());
        }
        stop() {
            this.forEach(leafer => leafer.stop());
            super.stop();
        }
        unlockLayout() {
            super.unlockLayout();
            this.forEach(leafer => leafer.unlockLayout());
        }
        lockLayout() {
            super.lockLayout();
            this.forEach(leafer => leafer.lockLayout());
        }
        forceRender(bounds, sync) {
            this.forEach(leafer => leafer.forceRender(bounds, sync));
        }
        addLeafer(merge) {
            const leafer = new exports.Leafer(merge);
            this.add(leafer);
            return leafer;
        }
        add(leafer, index) {
            if (!leafer.view) {
                if (this.realCanvas && !this.canvas.bounds) {
                    setTimeout(() => this.add(leafer, index), 10);
                    return;
                }
                leafer.init(this.__getChildConfig(leafer.userConfig), this);
            }
            super.add(leafer, index);
            if (!isUndefined(index)) leafer.canvas.childIndex = index;
            this.__listenChildEvents(leafer);
        }
        forEach(fn) {
            this.children.forEach(fn);
        }
        __onCreated() {
            this.created = this.children.every(child => child.created);
        }
        __onReady() {
            if (this.children.every(child => child.ready)) super.__onReady();
        }
        __onViewReady() {
            if (this.children.every(child => child.viewReady)) super.__onViewReady();
        }
        __onChildRenderEnd(e) {
            this.renderer.addBlock(e.renderBounds);
            if (this.viewReady) this.renderer.update();
        }
        __render(canvas, options) {
            if (canvas.context) this.forEach(leafer => options.matrix ? leafer.__render(canvas, options) : canvas.copyWorld(leafer.canvas, options.bounds, undefined, undefined, true));
        }
        __onResize(event) {
            this.forEach(leafer => leafer.resize(event));
            super.__onResize(event);
        }
        updateLayout() {
            this.forEach(leafer => leafer.updateLayout());
        }
        __getChildConfig(userConfig) {
            const config = Object.assign({}, this.config);
            config.hittable = config.realCanvas = undefined;
            if (userConfig) DataHelper.assign(config, userConfig);
            if (this.autoLayout) DataHelper.copyAttrs(config, this, canvasSizeAttrs);
            config.view = this.realCanvas ? undefined : this.view;
            config.fill = undefined;
            return config;
        }
        __listenChildEvents(leafer) {
            leafer.once([ [ LayoutEvent.END, this.__onReady, this ], [ RenderEvent.START, this.__onCreated, this ], [ RenderEvent.END, this.__onViewReady, this ] ]);
            if (this.realCanvas) this.__eventIds.push(leafer.on_(RenderEvent.END, this.__onChildRenderEnd, this));
        }
    };
    exports.App = __decorate([ registerUI() ], exports.App);
    const downKeyMap = {};
    const Keyboard = {
        isHoldSpaceKey() {
            return Keyboard.isHold("Space");
        },
        isHold(code) {
            return downKeyMap[code];
        },
        isHoldKeys(shortcutKeys, e) {
            return e ? shortcutKeys(e) : undefined;
        },
        setDownCode(code) {
            if (!downKeyMap[code]) downKeyMap[code] = true;
        },
        setUpCode(code) {
            downKeyMap[code] = false;
        }
    };
    const PointerButton = {
        LEFT: 1,
        RIGHT: 2,
        MIDDLE: 4,
        defaultLeft(event) {
            if (!event.buttons) event.buttons = 1;
        },
        left(event) {
            return event.buttons === 1;
        },
        right(event) {
            return event.buttons === 2;
        },
        middle(event) {
            return event.buttons === 4;
        }
    };
    class UIEvent extends Event {
        get spaceKey() {
            return Keyboard.isHoldSpaceKey();
        }
        get left() {
            return PointerButton.left(this);
        }
        get right() {
            return PointerButton.right(this);
        }
        get middle() {
            return PointerButton.middle(this);
        }
        constructor(params) {
            super(params.type);
            this.bubbles = true;
            Object.assign(this, params);
        }
        isHoldKeys(shortcutKeys) {
            return Keyboard.isHoldKeys(shortcutKeys, this);
        }
        getBoxPoint(relative) {
            return (relative || this.current).getBoxPoint(this);
        }
        getInnerPoint(relative) {
            return (relative || this.current).getInnerPoint(this);
        }
        getLocalPoint(relative) {
            return (relative || this.current).getLocalPoint(this);
        }
        getPagePoint() {
            return this.current.getPagePoint(this);
        }
        getInner(relative) {
            return this.getInnerPoint(relative);
        }
        getLocal(relative) {
            return this.getLocalPoint(relative);
        }
        getPage() {
            return this.getPagePoint();
        }
        static changeName(oldName, newName) {
            EventCreator.changeName(oldName, newName);
        }
    }
    const {min: min, max: max$1, abs: abs$2} = Math, {float: float, sign: sign} = MathHelper, {minX: minX, maxX: maxX, minY: minY, maxY: maxY} = BoundsHelper;
    const tempContent = new Bounds, tempDragBounds = new Bounds;
    const DragBoundsHelper = {
        limitMove(leaf, move) {
            const {dragBounds: dragBounds, dragBoundsType: dragBoundsType} = leaf;
            if (dragBounds) D.getValidMove(leaf.__localBoxBounds, D.getDragBounds(leaf), dragBoundsType, move, true);
            D.axisMove(leaf, move);
        },
        limitScaleOf(leaf, origin, scale, lockRatio) {
            const {dragBounds: dragBounds, dragBoundsType: dragBoundsType} = leaf;
            if (dragBounds) D.getValidScaleOf(leaf.__localBoxBounds, D.getDragBounds(leaf), dragBoundsType, leaf.getLocalPointByInner(leaf.getInnerPointByBox(origin)), scale, lockRatio, true);
        },
        axisMove(leaf, move) {
            const {draggable: draggable} = leaf;
            if (draggable === "x") move.y = 0;
            if (draggable === "y") move.x = 0;
        },
        getDragBounds(leaf) {
            const {dragBounds: dragBounds} = leaf;
            return dragBounds === "parent" ? leaf.parent.boxBounds : dragBounds;
        },
        isInnerMode(content, dragBounds, dragBoundsType, sideType) {
            return dragBoundsType === "inner" || dragBoundsType === "auto" && float(content[sideType]) > float(dragBounds[sideType]);
        },
        getValidMove(content, dragBounds, dragBoundsType, move, change) {
            const x = content.x + move.x, y = content.y + move.y, right = x + content.width, bottom = y + content.height;
            const boundsRight = dragBounds.x + dragBounds.width, boundsBottom = dragBounds.y + dragBounds.height;
            if (!change) move = Object.assign({}, move);
            if (D.isInnerMode(content, dragBounds, dragBoundsType, "width")) {
                if (x > dragBounds.x) move.x += dragBounds.x - x; else if (right < boundsRight) move.x += boundsRight - right;
            } else {
                if (x < dragBounds.x) move.x += dragBounds.x - x; else if (right > boundsRight) move.x += boundsRight - right;
            }
            if (D.isInnerMode(content, dragBounds, dragBoundsType, "height")) {
                if (y > dragBounds.y) move.y += dragBounds.y - y; else if (bottom < boundsBottom) move.y += boundsBottom - bottom;
            } else {
                if (y < dragBounds.y) move.y += dragBounds.y - y; else if (bottom > boundsBottom) move.y += boundsBottom - bottom;
            }
            move.x = float(move.x);
            move.y = float(move.y);
            return move;
        },
        getValidScaleOf(content, dragBounds, dragBoundsType, origin, scale, lockRatio, change) {
            if (!change) scale = Object.assign({}, scale);
            tempDragBounds.set(dragBounds);
            tempContent.set(content).scaleOf(origin, scale.x, scale.y);
            const originLeftScale = float((origin.x - content.x) / content.width), originRightScale = float(1 - originLeftScale);
            const originTopScale = float((origin.y - content.y) / content.height), originBottomScale = float(1 - originTopScale);
            let correctScaleX = 1, correctScaleY = 1, aScale, bScale, aSize, bSize;
            if (D.isInnerMode(content, dragBounds, dragBoundsType, "width")) {
                if (scale.x < 0) tempContent.scaleOf(origin, correctScaleX = 1 / scale.x, 1);
                aSize = float(tempContent.minX - tempDragBounds.minX);
                bSize = float(tempDragBounds.maxX - tempContent.maxX);
                aScale = originLeftScale && aSize > 0 ? 1 + aSize / (originLeftScale * tempContent.width) : 1;
                bScale = originRightScale && bSize > 0 ? 1 + bSize / (originRightScale * tempContent.width) : 1;
                correctScaleX *= max$1(aScale, bScale);
            } else {
                if (scale.x < 0) {
                    if (float(minX(content) - minX(dragBounds), 2) <= 0 || float(maxX(dragBounds) - maxX(content), 2) <= 0) {
                        tempContent.scaleOf(origin, correctScaleX = 1 / scale.x, 1);
                        if (tempContent.width > 1) {
                            correctScaleX *= 1 / tempContent.width;
                            tempContent.width = 1;
                        }
                    }
                    tempContent.unsign();
                }
                aSize = float(tempDragBounds.minX - tempContent.minX);
                bSize = float(tempContent.maxX - tempDragBounds.maxX);
                aScale = originLeftScale && aSize > 0 ? 1 - aSize / (originLeftScale * tempContent.width) : 1;
                bScale = originRightScale && bSize > 0 ? 1 - bSize / (originRightScale * tempContent.width) : 1;
                correctScaleX *= min(aScale, bScale);
            }
            if (D.isInnerMode(content, dragBounds, dragBoundsType, "height")) {
                if (scale.y < 0) tempContent.scaleOf(origin, 1, correctScaleY = 1 / scale.y);
                aSize = float(tempContent.minY - tempDragBounds.minY);
                bSize = float(tempDragBounds.maxY - tempContent.maxY);
                aScale = originTopScale && aSize > 0 ? 1 + aSize / (originTopScale * tempContent.height) : 1;
                bScale = originBottomScale && bSize > 0 ? 1 + bSize / (originBottomScale * tempContent.height) : 1;
                correctScaleY *= max$1(aScale, bScale);
                if (lockRatio) {
                    aScale = max$1(abs$2(correctScaleX), abs$2(correctScaleY));
                    correctScaleX = sign(correctScaleX) * aScale;
                    correctScaleY = sign(correctScaleY) * aScale;
                }
            } else {
                if (scale.y < 0) {
                    if (float(minY(content) - minY(dragBounds), 2) <= 0 || float(maxY(dragBounds) - maxY(content), 2) <= 0) {
                        tempContent.scaleOf(origin, 1, correctScaleY = 1 / scale.y);
                        if (tempContent.height > 1) {
                            correctScaleY *= 1 / tempContent.height;
                            tempContent.height = 1;
                        }
                    }
                    tempContent.unsign();
                }
                aSize = float(tempDragBounds.minY - tempContent.minY);
                bSize = float(tempContent.maxY - tempDragBounds.maxY);
                aScale = originTopScale && aSize > 0 ? 1 - aSize / (originTopScale * tempContent.height) : 1;
                bScale = originBottomScale && bSize > 0 ? 1 - bSize / (originBottomScale * tempContent.height) : 1;
                correctScaleY *= min(aScale, bScale);
            }
            scale.x *= isFinite(correctScaleX) ? correctScaleX : 1;
            scale.y *= isFinite(correctScaleY) ? correctScaleY : 1;
            return scale;
        }
    };
    const D = DragBoundsHelper;
    exports.PointerEvent = class PointerEvent extends UIEvent {};
    exports.PointerEvent.POINTER = "pointer";
    exports.PointerEvent.BEFORE_DOWN = "pointer.before_down";
    exports.PointerEvent.BEFORE_MOVE = "pointer.before_move";
    exports.PointerEvent.BEFORE_UP = "pointer.before_up";
    exports.PointerEvent.DOWN = "pointer.down";
    exports.PointerEvent.MOVE = "pointer.move";
    exports.PointerEvent.UP = "pointer.up";
    exports.PointerEvent.OVER = "pointer.over";
    exports.PointerEvent.OUT = "pointer.out";
    exports.PointerEvent.ENTER = "pointer.enter";
    exports.PointerEvent.LEAVE = "pointer.leave";
    exports.PointerEvent.TAP = "tap";
    exports.PointerEvent.DOUBLE_TAP = "double_tap";
    exports.PointerEvent.CLICK = "click";
    exports.PointerEvent.DOUBLE_CLICK = "double_click";
    exports.PointerEvent.LONG_PRESS = "long_press";
    exports.PointerEvent.LONG_TAP = "long_tap";
    exports.PointerEvent.MENU = "pointer.menu";
    exports.PointerEvent.MENU_TAP = "pointer.menu_tap";
    exports.PointerEvent = __decorate([ registerUIEvent() ], exports.PointerEvent);
    const MyPointerEvent = exports.PointerEvent;
    const tempMove = {};
    exports.DragEvent = class DragEvent extends exports.PointerEvent {
        static setList(data) {
            this.list = data instanceof LeafList ? data : new LeafList(data);
        }
        static setData(data) {
            this.data = data;
        }
        static getValidMove(leaf, localStart, worldTotal, checkLimit = true) {
            const move = leaf.getLocalPoint(worldTotal, null, true);
            PointHelper.move(move, localStart.x - leaf.x, localStart.y - leaf.y);
            if (checkLimit) this.limitMove(leaf, move);
            DragBoundsHelper.axisMove(leaf, move);
            return move;
        }
        static limitMove(leaf, move) {
            DragBoundsHelper.limitMove(leaf, move);
        }
        getPageMove(total) {
            this.assignMove(total);
            return this.current.getPagePoint(tempMove, null, true);
        }
        getInnerMove(relative, total) {
            if (!relative) relative = this.current;
            this.assignMove(total);
            return relative.getInnerPoint(tempMove, null, true);
        }
        getLocalMove(relative, total) {
            if (!relative) relative = this.current;
            this.assignMove(total);
            return relative.getLocalPoint(tempMove, null, true);
        }
        getPageTotal() {
            return this.getPageMove(true);
        }
        getInnerTotal(relative) {
            return this.getInnerMove(relative, true);
        }
        getLocalTotal(relative) {
            return this.getLocalMove(relative, true);
        }
        getPageBounds() {
            const total = this.getPageTotal(), start = this.getPagePoint(), bounds = {};
            BoundsHelper.set(bounds, start.x - total.x, start.y - total.y, total.x, total.y);
            BoundsHelper.unsign(bounds);
            return bounds;
        }
        assignMove(total) {
            tempMove.x = total ? this.totalX : this.moveX;
            tempMove.y = total ? this.totalY : this.moveY;
        }
    };
    exports.DragEvent.BEFORE_DRAG = "drag.before_drag";
    exports.DragEvent.START = "drag.start";
    exports.DragEvent.DRAG = "drag";
    exports.DragEvent.END = "drag.end";
    exports.DragEvent.OVER = "drag.over";
    exports.DragEvent.OUT = "drag.out";
    exports.DragEvent.ENTER = "drag.enter";
    exports.DragEvent.LEAVE = "drag.leave";
    exports.DragEvent.ANIMATE = "drag.animate";
    exports.DragEvent = __decorate([ registerUIEvent() ], exports.DragEvent);
    const MyDragEvent = exports.DragEvent;
    exports.DropEvent = class DropEvent extends exports.PointerEvent {
        static setList(data) {
            exports.DragEvent.setList(data);
        }
        static setData(data) {
            exports.DragEvent.setData(data);
        }
    };
    exports.DropEvent.DROP = "drop";
    exports.DropEvent = __decorate([ registerUIEvent() ], exports.DropEvent);
    exports.MoveEvent = class MoveEvent extends exports.DragEvent {};
    exports.MoveEvent.BEFORE_MOVE = "move.before_move";
    exports.MoveEvent.START = "move.start";
    exports.MoveEvent.MOVE = "move";
    exports.MoveEvent.DRAG_ANIMATE = "move.drag_animate";
    exports.MoveEvent.END = "move.end";
    exports.MoveEvent.PULL_DOWN = "move.pull_down";
    exports.MoveEvent.REACH_BOTTOM = "move.reach_bottom";
    exports.MoveEvent = __decorate([ registerUIEvent() ], exports.MoveEvent);
    exports.TouchEvent = class TouchEvent extends UIEvent {};
    exports.TouchEvent = __decorate([ registerUIEvent() ], exports.TouchEvent);
    const MyTouchEvent = exports.TouchEvent;
    exports.RotateEvent = class RotateEvent extends exports.PointerEvent {};
    exports.RotateEvent.BEFORE_ROTATE = "rotate.before_rotate";
    exports.RotateEvent.START = "rotate.start";
    exports.RotateEvent.ROTATE = "rotate";
    exports.RotateEvent.END = "rotate.end";
    exports.RotateEvent = __decorate([ registerUIEvent() ], exports.RotateEvent);
    exports.SwipeEvent = class SwipeEvent extends exports.DragEvent {};
    exports.SwipeEvent.SWIPE = "swipe";
    exports.SwipeEvent.LEFT = "swipe.left";
    exports.SwipeEvent.RIGHT = "swipe.right";
    exports.SwipeEvent.UP = "swipe.up";
    exports.SwipeEvent.DOWN = "swipe.down";
    exports.SwipeEvent = __decorate([ registerUIEvent() ], exports.SwipeEvent);
    exports.ZoomEvent = class ZoomEvent extends exports.PointerEvent {};
    exports.ZoomEvent.BEFORE_ZOOM = "zoom.before_zoom";
    exports.ZoomEvent.START = "zoom.start";
    exports.ZoomEvent.ZOOM = "zoom";
    exports.ZoomEvent.END = "zoom.end";
    exports.ZoomEvent = __decorate([ registerUIEvent() ], exports.ZoomEvent);
    exports.KeyEvent = class KeyEvent extends UIEvent {};
    exports.KeyEvent.BEFORE_DOWN = "key.before_down";
    exports.KeyEvent.BEFORE_UP = "key.before_up";
    exports.KeyEvent.DOWN = "key.down";
    exports.KeyEvent.HOLD = "key.hold";
    exports.KeyEvent.UP = "key.up";
    exports.KeyEvent = __decorate([ registerUIEvent() ], exports.KeyEvent);
    const InteractionHelper = {
        getDragEventData(startPoint, lastPoint, event) {
            return Object.assign(Object.assign({}, event), {
                x: event.x,
                y: event.y,
                moveX: event.x - lastPoint.x,
                moveY: event.y - lastPoint.y,
                totalX: event.x - startPoint.x,
                totalY: event.y - startPoint.y
            });
        },
        getDropEventData(event, list, data) {
            return Object.assign(Object.assign({}, event), {
                list: list,
                data: data
            });
        },
        getSwipeDirection(angle) {
            if (angle < -45 && angle > -135) return exports.SwipeEvent.UP; else if (angle > 45 && angle < 135) return exports.SwipeEvent.DOWN; else if (angle <= 45 && angle >= -45) return exports.SwipeEvent.RIGHT; else return exports.SwipeEvent.LEFT;
        },
        getSwipeEventData(startPoint, lastDragData, event) {
            return Object.assign(Object.assign({}, event), {
                moveX: lastDragData.moveX,
                moveY: lastDragData.moveY,
                totalX: event.x - startPoint.x,
                totalY: event.y - startPoint.y,
                type: I.getSwipeDirection(PointHelper.getAngle(startPoint, event))
            });
        },
        getBase(e) {
            const pointerUpButtons = e.button === 1 ? 4 : e.button;
            return {
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                time: Date.now(),
                buttons: isUndefined(e.buttons) ? 1 : e.buttons === 0 ? pointerUpButtons : e.buttons,
                origin: e
            };
        },
        pathHasEventType(path, type) {
            const {list: list} = path;
            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].hasEvent(type)) return true;
            }
            return false;
        },
        filterPathByEventType(path, type) {
            const find = new LeafList;
            const {list: list} = path;
            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].hasEvent(type)) find.add(list[i]);
            }
            return find;
        },
        pathCanDrag(path) {
            return path && path.list.some(item => LeafHelper.draggable(item) || !item.isLeafer && item.hasEvent(exports.DragEvent.DRAG));
        },
        pathHasOutside(path) {
            return path && path.list.some(item => item.isOutside);
        }
    };
    const I = InteractionHelper;
    const emptyList = new LeafList;
    const {getDragEventData: getDragEventData, getDropEventData: getDropEventData, getSwipeEventData: getSwipeEventData} = InteractionHelper;
    class Dragger {
        constructor(interaction) {
            this.dragDataList = [];
            this.interaction = interaction;
        }
        setDragData(data) {
            if (this.animateWait) this.dragEndReal();
            this.downData = this.interaction.downData;
            this.dragData = getDragEventData(data, data, data);
            this.canAnimate = this.canDragOut = true;
        }
        getList(realDraggable, hover) {
            const {proxy: proxy} = this.interaction.selector;
            const hasProxyList = proxy && proxy.list.length, dragList = exports.DragEvent.list || this.draggableList || emptyList;
            return this.dragging && (hasProxyList ? realDraggable ? emptyList : new LeafList(hover ? [ ...proxy.list, ...proxy.dragHoverExclude ] : proxy.list) : dragList);
        }
        checkDrag(data, canDrag) {
            const {interaction: interaction} = this;
            if (this.moving && data.buttons < 1) {
                this.canAnimate = false;
                interaction.pointerCancel();
                return;
            }
            if (!this.moving && canDrag) {
                if (this.moving = interaction.canMove(this.downData) || interaction.isHoldRightKey || interaction.isMobileDragEmpty) {
                    this.dragData.moveType = "drag";
                    interaction.emit(exports.MoveEvent.START, this.dragData);
                }
            }
            if (!this.moving) this.dragStart(data, canDrag);
            this.drag(data);
        }
        dragStart(data, canDrag) {
            if (!this.dragging) {
                this.dragging = canDrag && PointerButton.left(data);
                if (this.dragging) {
                    this.interaction.emit(exports.DragEvent.START, this.dragData);
                    this.getDraggableList(this.dragData.path);
                    this.setDragStartPoints(this.realDraggableList = this.getList(true));
                }
            }
        }
        setDragStartPoints(list) {
            this.dragStartPoints = {};
            list.forEach(leaf => this.dragStartPoints[leaf.innerId] = {
                x: leaf.x,
                y: leaf.y
            });
        }
        getDraggableList(path) {
            let leaf;
            for (let i = 0, len = path.length; i < len; i++) {
                leaf = path.list[i];
                if (LeafHelper.draggable(leaf)) {
                    this.draggableList = new LeafList(leaf);
                    break;
                }
            }
        }
        drag(data) {
            const {interaction: interaction, dragData: dragData, downData: downData} = this;
            const {path: path, throughPath: throughPath} = downData;
            this.dragData = getDragEventData(downData, dragData, data);
            if (throughPath) this.dragData.throughPath = throughPath;
            this.dragData.path = path;
            this.dragDataList.push(this.dragData);
            if (this.moving) {
                data.moving = true;
                this.dragData.moveType = "drag";
                interaction.emit(exports.MoveEvent.BEFORE_MOVE, this.dragData);
                interaction.emit(exports.MoveEvent.MOVE, this.dragData);
            } else if (this.dragging) {
                data.dragging = true;
                this.dragReal();
                interaction.emit(exports.DragEvent.BEFORE_DRAG, this.dragData);
                interaction.emit(exports.DragEvent.DRAG, this.dragData);
            }
        }
        dragReal(isDragEnd) {
            const {interaction: interaction} = this, {running: running} = interaction;
            const list = this.realDraggableList;
            if (list.length && running) {
                const {totalX: totalX, totalY: totalY} = this.dragData, {dragLimitAnimate: dragLimitAnimate} = interaction.p;
                const checkLimitMove = !dragLimitAnimate || !!isDragEnd;
                list.forEach(leaf => {
                    if (leaf.draggable) {
                        const axisDrag = isString(leaf.draggable);
                        const move = exports.DragEvent.getValidMove(leaf, this.dragStartPoints[leaf.innerId], {
                            x: totalX,
                            y: totalY
                        }, checkLimitMove || axisDrag);
                        if (dragLimitAnimate && !axisDrag && isDragEnd) LeafHelper.animateMove(leaf, move, isNumber(dragLimitAnimate) ? dragLimitAnimate : .3, () => leaf.emit(exports.DragEvent.ANIMATE)); else leaf.move(move);
                    }
                });
            }
        }
        dragOverOrOut(data) {
            const {interaction: interaction} = this;
            const {dragOverPath: dragOverPath} = this;
            const {path: path} = data;
            this.dragOverPath = path;
            if (dragOverPath) {
                if (path.indexAt(0) !== dragOverPath.indexAt(0)) {
                    interaction.emit(exports.DragEvent.OUT, data, dragOverPath);
                    interaction.emit(exports.DragEvent.OVER, data, path);
                }
            } else interaction.emit(exports.DragEvent.OVER, data, path);
        }
        dragEnterOrLeave(data) {
            const {interaction: interaction} = this;
            const {dragEnterPath: dragEnterPath} = this;
            const {path: path} = data;
            interaction.emit(exports.DragEvent.LEAVE, data, dragEnterPath, path);
            interaction.emit(exports.DragEvent.ENTER, data, path, dragEnterPath);
            this.dragEnterPath = path;
        }
        dragEnd(data) {
            if (!this.dragging && !this.moving) return;
            setTimeout(() => this.interaction.pointerMove(data));
            if (this.checkDragEndAnimate(data)) return;
            this.dragEndReal(data);
        }
        dragEndReal(data) {
            const {interaction: interaction, downData: downData, dragData: dragData} = this;
            if (!data) data = dragData;
            const {path: path, throughPath: throughPath} = downData;
            const endDragData = getDragEventData(downData, data, data);
            if (throughPath) endDragData.throughPath = throughPath;
            endDragData.path = path;
            if (this.moving) {
                this.moving = false;
                endDragData.moveType = "drag";
                interaction.emit(exports.MoveEvent.END, endDragData);
            }
            if (this.dragging) {
                const dropList = this.getList();
                this.dragging = false;
                if (interaction.p.dragLimitAnimate) this.dragReal(true);
                interaction.emit(exports.DragEvent.END, endDragData);
                this.swipe(data, downData, dragData, endDragData);
                this.drop(data, dropList, this.dragEnterPath);
            }
            this.autoMoveCancel();
            this.dragReset();
            this.animate(null, "off");
        }
        swipe(data, downData, dragData, endDragData) {
            const {interaction: interaction} = this;
            if (PointHelper.getDistance(downData, data) > interaction.config.pointer.swipeDistance) {
                const swipeData = getSwipeEventData(downData, dragData, endDragData);
                this.interaction.emit(swipeData.type, swipeData);
            }
        }
        drop(data, dropList, dragEnterPath) {
            const dropData = getDropEventData(data, dropList, exports.DragEvent.data);
            dropData.path = dragEnterPath;
            this.interaction.emit(exports.DropEvent.DROP, dropData);
            this.interaction.emit(exports.DragEvent.LEAVE, data, dragEnterPath);
        }
        dragReset() {
            exports.DragEvent.list = exports.DragEvent.data = this.draggableList = this.dragData = this.downData = this.dragOverPath = this.dragEnterPath = null;
            this.dragDataList = [];
        }
        checkDragEndAnimate(_data, _speed) {
            return false;
        }
        animate(_func, _off) {}
        stopAnimate() {}
        checkDragOut(_data) {}
        autoMoveOnDragOut(_data) {}
        autoMoveCancel() {}
        destroy() {
            this.dragReset();
        }
    }
    const debug = Debug.get("emit");
    function emit$1(type, data, path, excludePath) {
        if (!path && !data.path) return;
        let leaf;
        data.type = type;
        if (path) data = Object.assign(Object.assign({}, data), {
            path: path
        }); else path = data.path;
        data.target = path.indexAt(0);
        try {
            for (let i = path.length - 1; i > -1; i--) {
                leaf = path.list[i];
                if (emitEvent(leaf, type, data, true, excludePath)) return;
                if (leaf.isApp) emitAppChildren(leaf, type, data, true, excludePath);
            }
            for (let i = 0, len = path.length; i < len; i++) {
                leaf = path.list[i];
                if (leaf.isApp) emitAppChildren(leaf, type, data, false, excludePath);
                if (emitEvent(leaf, type, data, false, excludePath)) return;
            }
        } catch (e) {
            debug.error(e);
        }
    }
    const allowTypes = [ "move", "zoom", "rotate", "key" ];
    function emitAppChildren(leaf, type, data, capture, excludePath) {
        if (allowTypes.some(name => type.startsWith(name)) && leaf.__.hitChildren && !exclude(leaf, excludePath)) {
            let child;
            for (let i = 0, len = leaf.children.length; i < len; i++) {
                child = leaf.children[i];
                if (!data.path.has(child) && child.__.hittable) emitEvent(child, type, data, capture, excludePath);
            }
        }
    }
    function emitEvent(leaf, type, data, capture, excludePath) {
        if (leaf.destroyed) return false;
        if (leaf.__.hitSelf && !exclude(leaf, excludePath)) {
            if (State.updateEventStyle && !capture) State.updateEventStyle(leaf, type);
            if (leaf.hasEvent(type, capture)) {
                data.phase = capture ? 1 : leaf === data.target ? 2 : 3;
                const event = EventCreator.get(type, data);
                leaf.emitEvent(event, capture);
                if (event.isStop) return true;
            }
        }
        return false;
    }
    function exclude(leaf, excludePath) {
        return excludePath && excludePath.has(leaf);
    }
    const config = {
        wheel: {
            zoomSpeed: .5,
            moveSpeed: .5,
            rotateSpeed: .5,
            delta: {
                x: 80 / 4,
                y: 8
            }
        },
        pointer: {
            type: "pointer",
            snap: true,
            hitRadius: 5,
            tapTime: 120,
            longPressTime: 800,
            transformTime: 500,
            hover: true,
            dragHover: true,
            dragDistance: 2,
            swipeDistance: 20
        },
        touch: {
            preventDefault: "auto"
        },
        multiTouch: {},
        move: {
            autoDistance: 2
        },
        zoom: {},
        cursor: true,
        keyEvent: true
    };
    const {pathHasEventType: pathHasEventType, pathCanDrag: pathCanDrag$1, pathHasOutside: pathHasOutside} = InteractionHelper;
    class InteractionBase {
        get dragging() {
            return this.dragger.dragging;
        }
        get transforming() {
            return this.transformer.transforming;
        }
        get moveMode() {
            return this.m.drag === true || this.isHoldSpaceKey || this.isHoldMiddleKey || this.isHoldRightKey && this.dragger.moving || this.isDragEmpty;
        }
        get canHover() {
            return this.p.hover && !this.config.mobile;
        }
        get isDragEmpty() {
            return this.m.dragEmpty && this.isRootPath(this.hoverData) && (!this.downData || this.isRootPath(this.downData));
        }
        get isMobileDragEmpty() {
            return this.m.dragEmpty && !this.canHover && this.downData && this.isTreePath(this.downData);
        }
        get isHoldMiddleKey() {
            return this.m.holdMiddleKey && this.downData && PointerButton.middle(this.downData);
        }
        get isHoldRightKey() {
            return this.m.holdRightKey && this.downData && PointerButton.right(this.downData);
        }
        get isHoldSpaceKey() {
            return this.m.holdSpaceKey && Keyboard.isHoldSpaceKey();
        }
        get m() {
            return this.config.move;
        }
        get p() {
            return this.config.pointer;
        }
        get hitRadius() {
            return this.p.hitRadius;
        }
        constructor(target, canvas, selector, userConfig) {
            this.config = DataHelper.clone(config);
            this.tapCount = 0;
            this.downKeyMap = {};
            this.target = target;
            this.canvas = canvas;
            this.selector = selector;
            this.defaultPath = new LeafList(target);
            this.createTransformer();
            this.dragger = new Dragger(this);
            if (userConfig) this.config = DataHelper.default(userConfig, this.config);
            this.__listenEvents();
        }
        start() {
            this.running = true;
        }
        stop() {
            this.running = false;
        }
        receive(_event) {}
        pointerDown(data, useDefaultPath) {
            if (!data) data = this.hoverData;
            if (!data) return;
            PointerButton.defaultLeft(data);
            this.updateDownData(data);
            this.checkPath(data, useDefaultPath);
            this.downTime = Date.now();
            this.emit(exports.PointerEvent.BEFORE_DOWN, data);
            if (data.path.needUpdate) this.updateDownData(data);
            this.emit(exports.PointerEvent.DOWN, data);
            if (PointerButton.left(data)) {
                this.tapWait();
                this.longPressWait(data);
            }
            this.waitRightTap = PointerButton.right(data);
            this.dragger.setDragData(data);
            if (!this.isHoldRightKey) this.updateCursor(data);
        }
        pointerMove(data) {
            if (!data) data = this.hoverData;
            if (!data) return;
            const {downData: downData} = this;
            if (downData) PointerButton.defaultLeft(data);
            const hit = this.canvas.bounds.hitPoint(data);
            if (hit || downData) {
                this.pointerMoveReal(data);
                if (downData) this.dragger.checkDragOut(data);
            }
        }
        pointerMoveReal(data) {
            this.emit(exports.PointerEvent.BEFORE_MOVE, data, this.defaultPath);
            if (this.downData) {
                const canDrag = PointHelper.getDistance(this.downData, data) > this.p.dragDistance;
                if (canDrag) {
                    this.pointerWaitCancel();
                    this.waitRightTap = false;
                }
                this.dragger.checkDrag(data, canDrag);
            }
            if (!this.dragger.moving) {
                this.updateHoverData(data);
                this.checkPath(data);
                this.emit(exports.PointerEvent.MOVE, data);
                this.pointerHover(data);
                if (this.dragging) {
                    this.dragger.dragOverOrOut(data);
                    this.dragger.dragEnterOrLeave(data);
                }
            }
            this.updateCursor(this.downData || data);
        }
        pointerUp(data) {
            const {downData: downData} = this;
            if (!data) data = downData;
            if (!downData) return;
            PointerButton.defaultLeft(data);
            data.multiTouch = downData.multiTouch;
            this.findPath(data);
            const upData = Object.assign(Object.assign({}, data), {
                path: data.path.clone()
            });
            data.path.addList(downData.path.list);
            this.checkPath(data);
            this.downData = null;
            this.emit(exports.PointerEvent.BEFORE_UP, data);
            this.emit(exports.PointerEvent.UP, data);
            this.touchLeave(data);
            if (!data.isCancel) {
                this.tap(data);
                this.menuTap(data);
            }
            this.dragger.dragEnd(data);
            this.updateCursor(upData);
        }
        pointerCancel() {
            const data = Object.assign({}, this.dragger.dragData);
            data.isCancel = true;
            this.pointerUp(data);
        }
        menu(data) {
            this.findPath(data);
            this.emit(exports.PointerEvent.MENU, data);
            this.waitMenuTap = true;
            if (!this.downData && this.waitRightTap) this.menuTap(data);
        }
        menuTap(data) {
            if (this.waitRightTap && this.waitMenuTap) {
                this.emit(exports.PointerEvent.MENU_TAP, data);
                this.waitRightTap = this.waitMenuTap = false;
            }
        }
        createTransformer() {}
        move(_data) {}
        zoom(_data) {}
        rotate(_data) {}
        transformEnd() {}
        wheel(_data) {}
        multiTouch(_data, _list) {}
        keyDown(data) {
            if (!this.config.keyEvent) return;
            this.emit(exports.KeyEvent.BEFORE_DOWN, data, this.defaultPath);
            const {code: code} = data;
            if (!this.downKeyMap[code]) {
                this.downKeyMap[code] = true;
                Keyboard.setDownCode(code);
                this.emit(exports.KeyEvent.HOLD, data, this.defaultPath);
                if (this.moveMode) {
                    this.cancelHover();
                    this.updateCursor();
                }
            }
            this.emit(exports.KeyEvent.DOWN, data, this.defaultPath);
        }
        keyUp(data) {
            if (!this.config.keyEvent) return;
            this.emit(exports.KeyEvent.BEFORE_UP, data, this.defaultPath);
            const {code: code} = data;
            this.downKeyMap[code] = false;
            Keyboard.setUpCode(code);
            this.emit(exports.KeyEvent.UP, data, this.defaultPath);
            if (this.cursor === "grab") this.updateCursor();
        }
        pointerHover(data) {
            if (this.canHover && !(this.dragging && !this.p.dragHover)) {
                data.path || (data.path = new LeafList);
                this.pointerOverOrOut(data);
                this.pointerEnterOrLeave(data);
            }
        }
        pointerOverOrOut(data) {
            const {path: path} = data;
            const {overPath: overPath} = this;
            this.overPath = path;
            if (overPath) {
                if (path.indexAt(0) !== overPath.indexAt(0)) {
                    this.emit(exports.PointerEvent.OUT, data, overPath);
                    this.emit(exports.PointerEvent.OVER, data, path);
                }
            } else {
                this.emit(exports.PointerEvent.OVER, data, path);
            }
        }
        pointerEnterOrLeave(data) {
            let {path: path} = data;
            if (this.downData && !this.moveMode) {
                path = path.clone();
                this.downData.path.forEach(leaf => path.add(leaf));
            }
            const {enterPath: enterPath} = this;
            this.enterPath = path;
            this.emit(exports.PointerEvent.LEAVE, data, enterPath, path);
            this.emit(exports.PointerEvent.ENTER, data, path, enterPath);
        }
        touchLeave(data) {
            if (data.pointerType === "touch") {
                if (this.enterPath) {
                    this.emit(exports.PointerEvent.LEAVE, data);
                    if (this.dragger.dragging) this.emit(exports.DropEvent.LEAVE, data);
                }
            }
        }
        tap(data) {
            const {pointer: pointer} = this.config;
            const hasLong = this.longTap(data);
            if (!pointer.tapMore && hasLong) return;
            if (!this.waitTap) return;
            if (pointer.tapMore) this.emitTap(data);
            const useTime = Date.now() - this.downTime;
            const hasDouble = [ exports.PointerEvent.DOUBLE_TAP, exports.PointerEvent.DOUBLE_CLICK ].some(type => pathHasEventType(data.path, type));
            if (useTime < pointer.tapTime + 50 && hasDouble) {
                this.tapCount++;
                if (this.tapCount === 2) {
                    this.tapWaitCancel();
                    this.emitDoubleTap(data);
                } else {
                    clearTimeout(this.tapTimer);
                    this.tapTimer = setTimeout(() => {
                        if (!pointer.tapMore) {
                            this.tapWaitCancel();
                            this.emitTap(data);
                        }
                    }, pointer.tapTime);
                }
            } else {
                if (!pointer.tapMore) {
                    this.tapWaitCancel();
                    this.emitTap(data);
                }
            }
        }
        findPath(data, options) {
            const {hitRadius: hitRadius, through: through} = this.p;
            const {bottomList: bottomList, target: target} = this;
            if (!Platform.backgrounder && !data.origin) target && target.updateLayout();
            const find = this.selector.getByPoint(data, hitRadius, Object.assign({
                bottomList: bottomList,
                name: data.type
            }, options || {
                through: through
            }));
            if (find.throughPath) data.throughPath = find.throughPath;
            data.path = find.path;
            return find.path;
        }
        isRootPath(data) {
            return data && data.path.list[0].isLeafer;
        }
        isTreePath(data) {
            const app = this.target.app;
            if (!app || !app.isApp) return false;
            return app.editor && (!data.path.has(app.editor) && data.path.has(app.tree) && !data.target.syncEventer);
        }
        checkPath(data, useDefaultPath) {
            if (useDefaultPath || this.moveMode && !pathHasOutside(data.path)) data.path = this.defaultPath;
        }
        canMove(data) {
            return data && (this.moveMode || this.m.drag === "auto" && !pathCanDrag$1(data.path)) && !pathHasOutside(data.path);
        }
        isDrag(leaf) {
            return this.dragger.getList().has(leaf);
        }
        isPress(leaf) {
            return this.downData && this.downData.path.has(leaf);
        }
        isHover(leaf) {
            return this.enterPath && this.enterPath.has(leaf);
        }
        isFocus(leaf) {
            return this.focusData === leaf;
        }
        cancelHover() {
            const {hoverData: hoverData} = this;
            if (hoverData) {
                hoverData.path = this.defaultPath;
                this.pointerHover(hoverData);
            }
        }
        stopDragAnimate() {
            this.dragger.stopAnimate();
        }
        replaceDownTarget(target) {
            const {downData: downData} = this;
            if (downData && target) {
                const {path: path} = downData;
                path.remove(path.list[0]);
                path.addAt(target, 0);
            }
        }
        updateDownData(data, options, merge) {
            const {downData: downData} = this;
            if (!data && downData) data = downData;
            if (!data) return;
            this.findPath(data, options);
            if (merge && downData) data.path.addList(downData.path.list);
            this.downData = data;
        }
        updateHoverData(data) {
            if (!data) data = this.hoverData;
            if (!data) return;
            this.findPath(data, {
                exclude: this.dragger.getList(false, true),
                name: exports.PointerEvent.MOVE
            });
            this.hoverData = data;
        }
        updateCursor(data) {
            if (!this.config.cursor || !this.canHover) return;
            if (!data) {
                this.updateHoverData();
                data = this.downData || this.hoverData;
            }
            if (this.dragger.moving) {
                return this.setCursor("grabbing");
            } else if (this.canMove(data)) {
                return this.setCursor(this.downData ? "grabbing" : "grab");
            } else if (!data) return;
            let leaf, cursor;
            const {path: path} = data;
            for (let i = 0, len = path.length; i < len; i++) {
                leaf = path.list[i];
                cursor = leaf.syncEventer && leaf.syncEventer.cursor || leaf.cursor;
                if (cursor) break;
            }
            this.setCursor(cursor);
        }
        setCursor(cursor) {
            this.cursor = cursor;
        }
        getLocal(clientPoint, updateClient) {
            const clientBounds = this.canvas.getClientBounds(updateClient);
            const point = {
                x: clientPoint.clientX - clientBounds.x,
                y: clientPoint.clientY - clientBounds.y
            };
            const {bounds: bounds} = this.canvas;
            point.x *= bounds.width / clientBounds.width;
            point.y *= bounds.height / clientBounds.height;
            if (this.p.snap) PointHelper.round(point);
            return point;
        }
        emitTap(data) {
            this.emit(exports.PointerEvent.TAP, data);
            this.emit(exports.PointerEvent.CLICK, data);
        }
        emitDoubleTap(data) {
            this.emit(exports.PointerEvent.DOUBLE_TAP, data);
            this.emit(exports.PointerEvent.DOUBLE_CLICK, data);
        }
        pointerWaitCancel() {
            this.tapWaitCancel();
            this.longPressWaitCancel();
        }
        tapWait() {
            clearTimeout(this.tapTimer);
            this.waitTap = true;
        }
        tapWaitCancel() {
            if (this.waitTap) {
                clearTimeout(this.tapTimer);
                this.waitTap = false;
                this.tapCount = 0;
            }
        }
        longPressWait(data) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = setTimeout(() => {
                this.longPressed = true;
                this.emit(exports.PointerEvent.LONG_PRESS, data);
            }, this.p.longPressTime);
        }
        longTap(data) {
            let hasLong;
            if (this.longPressed) {
                this.emit(exports.PointerEvent.LONG_TAP, data);
                if (pathHasEventType(data.path, exports.PointerEvent.LONG_TAP) || pathHasEventType(data.path, exports.PointerEvent.LONG_PRESS)) hasLong = true;
            }
            this.longPressWaitCancel();
            return hasLong;
        }
        longPressWaitCancel() {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressed = false;
            }
        }
        __onResize() {
            const {dragOut: dragOut} = this.m;
            this.shrinkCanvasBounds = new Bounds(this.canvas.bounds);
            this.shrinkCanvasBounds.spread(-(isNumber(dragOut) ? dragOut : 2));
        }
        __listenEvents() {
            const {target: target} = this;
            this.__eventIds = [ target.on_(ResizeEvent.RESIZE, this.__onResize, this) ];
            target.once(LeaferEvent.READY, () => this.__onResize());
        }
        __removeListenEvents() {
            this.target.off_(this.__eventIds);
            this.__eventIds.length = 0;
        }
        emit(type, data, path, excludePath) {
            if (this.running) emit$1(type, data, path, excludePath);
        }
        destroy() {
            if (this.__eventIds.length) {
                this.stop();
                this.__removeListenEvents();
                this.dragger.destroy();
                if (this.transformer) this.transformer.destroy();
                this.downData = this.overPath = this.enterPath = null;
            }
        }
    }
    class Cursor {
        static set(name, value) {
            this.custom[name] = value;
        }
        static get(name) {
            return this.custom[name];
        }
    }
    Cursor.custom = {};
    class HitCanvasManager extends CanvasManager {
        constructor() {
            super(...arguments);
            this.maxTotal = 1e3;
            this.pathList = new LeafList;
            this.pixelList = new LeafList;
        }
        getPixelType(leaf, config) {
            this.__autoClear();
            this.pixelList.add(leaf);
            return Creator.hitCanvas(config);
        }
        getPathType(leaf) {
            this.__autoClear();
            this.pathList.add(leaf);
            return Creator.hitCanvas();
        }
        clearImageType() {
            this.__clearLeafList(this.pixelList);
        }
        clearPathType() {
            this.__clearLeafList(this.pathList);
        }
        __clearLeafList(leafList) {
            if (leafList.length) {
                leafList.forEach(leaf => {
                    if (leaf.__hitCanvas) {
                        leaf.__hitCanvas.destroy();
                        leaf.__hitCanvas = null;
                    }
                });
                leafList.reset();
            }
        }
        __autoClear() {
            if (this.pathList.length + this.pixelList.length > this.maxTotal) this.clear();
        }
        clear() {
            this.clearPathType();
            this.clearImageType();
        }
    }
    Platform.getSelector = function(leaf) {
        return leaf.leafer ? leaf.leafer.selector : Platform.selector || (Platform.selector = Creator.selector());
    };
    const {toInnerRadiusPointOf: toInnerRadiusPointOf, copyRadiusPoint: copyRadiusPoint} = PointHelper;
    const {hitRadiusPoint: hitRadiusPoint, hitPoint: hitPoint} = BoundsHelper;
    const inner = {}, worldRadiusPoint = {};
    const leaf = exports.Leaf.prototype;
    leaf.hit = function(worldPoint, hitRadius = 0) {
        this.updateLayout();
        copyRadiusPoint(worldRadiusPoint, worldPoint, hitRadius);
        const world = this.__world;
        if (hitRadius ? !hitRadiusPoint(world, worldRadiusPoint) : !hitPoint(world, worldRadiusPoint)) return false;
        return this.isBranch ? Platform.getSelector(this).hitPoint(Object.assign({}, worldRadiusPoint), hitRadius, {
            target: this
        }) : this.__hitWorld(worldRadiusPoint);
    };
    leaf.__hitWorld = function(point, forceHitFill) {
        const data = this.__;
        if (!data.hitSelf) return false;
        const world = this.__world, layout = this.__layout;
        const isSmall = world.width < 10 && world.height < 10;
        if (data.hitRadius) {
            copyRadiusPoint(inner, point, data.hitRadius);
            point = inner;
        }
        toInnerRadiusPointOf(point, world, inner);
        if (data.hitBox || isSmall) {
            if (BoundsHelper.hitRadiusPoint(layout.boxBounds, inner)) return true;
            if (isSmall) return false;
        }
        if (layout.hitCanvasChanged || !this.__hitCanvas) {
            this.__updateHitCanvas();
            if (!layout.boundsChanged) layout.hitCanvasChanged = false;
        }
        return this.__hit(inner, forceHitFill);
    };
    leaf.__hitFill = function(inner) {
        const h = this.__hitCanvas;
        return h && h.hitFill(inner, this.__.windingRule);
    };
    leaf.__hitStroke = function(inner, strokeWidth) {
        const h = this.__hitCanvas;
        return h && h.hitStroke(inner, strokeWidth);
    };
    leaf.__hitPixel = function(inner) {
        const h = this.__hitCanvas;
        return h && h.hitPixel(inner, this.__layout.renderBounds, h.hitScale);
    };
    leaf.__drawHitPath = function(canvas) {
        canvas && this.__drawRenderPath(canvas);
    };
    const matrix = new Matrix;
    const ui$1 = exports.UI.prototype;
    ui$1.__updateHitCanvas = function() {
        if (this.__box) this.__box.__updateHitCanvas();
        const {hitCanvasManager: hitCanvasManager} = this.leafer || this.parent && this.parent.leafer || {};
        if (!hitCanvasManager) return;
        const data = this.__;
        const isHitPixelFill = (data.__isAlphaPixelFill || data.__isCanvas) && data.hitFill === "pixel";
        const isHitPixelStroke = data.__isAlphaPixelStroke && data.hitStroke === "pixel";
        const isHitPixel = isHitPixelFill || isHitPixelStroke;
        if (!this.__hitCanvas) this.__hitCanvas = isHitPixel ? hitCanvasManager.getPixelType(this, {
            contextSettings: {
                willReadFrequently: true
            }
        }) : hitCanvasManager.getPathType(this);
        const h = this.__hitCanvas;
        if (isHitPixel) {
            const {renderBounds: renderBounds} = this.__layout;
            const size = Platform.image.hitCanvasSize;
            const scale = h.hitScale = tempBounds$2.set(0, 0, size, size).getFitMatrix(renderBounds).a;
            const {x: x, y: y, width: width, height: height} = tempBounds$2.set(renderBounds).scale(scale);
            h.resize({
                width: width,
                height: height,
                pixelRatio: 1
            });
            h.clear();
            ImageManager.patternLocked = true;
            this.__renderShape(h, {
                matrix: matrix.setWith(this.__world).scaleWith(1 / scale).invertWith().translate(-x, -y),
                snapshot: true,
                ignoreFill: !isHitPixelFill,
                ignoreStroke: !isHitPixelStroke
            });
            ImageManager.patternLocked = false;
            h.resetTransform();
            data.__isHitPixel = true;
        } else {
            data.__isHitPixel && (data.__isHitPixel = false);
        }
        this.__drawHitPath(h);
        h.setStrokeOptions(data);
    };
    ui$1.__hit = function(inner, forceHitFill) {
        if (this.__box && this.__box.__hit(inner)) return true;
        const data = this.__;
        if (data.__isHitPixel && this.__hitPixel(inner)) return true;
        const {hitFill: hitFill} = data;
        const needHitFillPath = (data.fill || data.__isCanvas) && (hitFill === "path" || hitFill === "pixel" && !(data.__isAlphaPixelFill || data.__isCanvas)) || hitFill === "all" || forceHitFill;
        if (needHitFillPath && this.__hitFill(inner)) return true;
        const {hitStroke: hitStroke, strokeScaleFixed: strokeScaleFixed} = data;
        const strokeWidth = data.__maxStrokeWidth * (strokeScaleFixed ? this.getRenderScaleData(true, strokeScaleFixed, false).scaleX : 1);
        const needHitStrokePath = data.stroke && (hitStroke === "path" || hitStroke === "pixel" && !data.__isAlphaPixelStroke) || hitStroke === "all";
        if (!needHitFillPath && !needHitStrokePath) return false;
        const radiusWidth = inner.radiusX * 2;
        let hitWidth = radiusWidth;
        let {strokeAlign: strokeAlign} = data;
        if (data.motionText) hitWidth += data.fontSize / 2, strokeAlign = "center";
        if (needHitStrokePath) {
            switch (strokeAlign) {
              case "inside":
                hitWidth += strokeWidth * 2;
                if (!needHitFillPath && this.__hitFill(inner) && this.__hitStroke(inner, hitWidth)) return true;
                hitWidth = radiusWidth;
                break;

              case "center":
                hitWidth += strokeWidth;
                break;

              case "outside":
                hitWidth += strokeWidth * 2;
                if (!needHitFillPath) {
                    if (!this.__hitFill(inner) && this.__hitStroke(inner, hitWidth)) return true;
                    hitWidth = radiusWidth;
                }
                break;
            }
        }
        return hitWidth ? this.__hitStroke(inner, hitWidth) : false;
    };
    const ui = exports.UI.prototype, rect = exports.Rect.prototype, box$1 = exports.Box.prototype;
    rect.__updateHitCanvas = box$1.__updateHitCanvas = function() {
        if (this.stroke || this.cornerRadius || (this.fill || this.__.__isCanvas) && this.hitFill === "pixel" || this.hitStroke === "all") ui.__updateHitCanvas.call(this); else if (this.__hitCanvas) this.__hitCanvas = null;
    };
    rect.__hitFill = box$1.__hitFill = function(inner) {
        return this.__hitCanvas ? ui.__hitFill.call(this, inner) : BoundsHelper.hitRadiusPoint(this.__layout.boxBounds, inner);
    };
    exports.Text.prototype.__drawHitPath = function(canvas) {
        const data = this.__, {__lineHeight: __lineHeight, fontSize: fontSize, __baseLine: __baseLine, __letterSpacing: __letterSpacing, __textDrawData: drawData} = data;
        canvas.beginPath();
        if (data.motionText) this.__drawPathByData(canvas, data.__pathForMotionText); else if (__letterSpacing < 0) this.__drawPathByBox(canvas); else drawData.rows.forEach(row => canvas.rect(row.x, row.y - __baseLine, row.width, __lineHeight < fontSize ? fontSize : __lineHeight));
    };
    exports.Group.prototype.pick = function(hitPoint, options) {
        options || (options = emptyData);
        this.updateLayout();
        return Platform.getSelector(this).getByPoint(hitPoint, options.hitRadius || 0, Object.assign(Object.assign({}, options), {
            target: this
        }));
    };
    const canvas = LeaferCanvasBase.prototype;
    canvas.hitFill = function(point, fillRule) {
        return fillRule ? this.context.isPointInPath(point.x, point.y, fillRule) : this.context.isPointInPath(point.x, point.y);
    };
    canvas.hitStroke = function(point, strokeWidth) {
        this.strokeWidth = strokeWidth;
        return this.context.isPointInStroke(point.x, point.y);
    };
    canvas.hitPixel = function(radiusPoint, offset, scale = 1) {
        let {x: x, y: y, radiusX: radiusX, radiusY: radiusY} = radiusPoint;
        if (offset) x -= offset.x, y -= offset.y;
        tempBounds$2.set(x - radiusX, y - radiusY, radiusX * 2, radiusY * 2).scale(scale).ceil();
        const {data: data} = this.context.getImageData(tempBounds$2.x, tempBounds$2.y, tempBounds$2.width || 1, tempBounds$2.height || 1);
        for (let i = 0, len = data.length; i < len; i += 4) {
            if (data[i + 3] > 0) return true;
        }
        return data[3] > 0;
    };
    const PointerEventHelper = {
        convert(e, local) {
            const base = InteractionHelper.getBase(e), {x: x, y: y} = local;
            const data = Object.assign(Object.assign({}, base), {
                x: x,
                y: y,
                width: e.width,
                height: e.height,
                pointerType: e.pointerType,
                pressure: e.pressure
            });
            if (data.pointerType === "pen") {
                data.tangentialPressure = e.tangentialPressure;
                data.tiltX = e.tiltX;
                data.tiltY = e.tiltY;
                data.twist = e.twist;
            }
            return data;
        },
        convertMouse(e, local) {
            const base = InteractionHelper.getBase(e), {x: x, y: y} = local;
            return Object.assign(Object.assign({}, base), {
                x: x,
                y: y,
                width: 1,
                height: 1,
                pointerType: "mouse",
                pressure: .5
            });
        },
        convertTouch(e, local) {
            const touch = PointerEventHelper.getTouch(e);
            const base = InteractionHelper.getBase(e), {x: x, y: y} = local;
            return Object.assign(Object.assign({}, base), {
                x: x,
                y: y,
                width: 1,
                height: 1,
                pointerType: "touch",
                multiTouch: e.touches.length > 1,
                pressure: touch.force
            });
        },
        getTouch(e) {
            return e.targetTouches[0] || e.changedTouches[0];
        }
    };
    const KeyEventHelper = {
        convert(e) {
            const base = InteractionHelper.getBase(e);
            const data = Object.assign(Object.assign({}, base), {
                code: e.code,
                key: e.key
            });
            return data;
        }
    };
    const {pathCanDrag: pathCanDrag} = InteractionHelper;
    class Interaction extends InteractionBase {
        get windowTarget() {
            const {view: view} = this;
            return view && view.ownerDocument || window;
        }
        get notPointer() {
            const {p: p} = this;
            return p.type !== "pointer" || p.touch || this.useMultiTouch;
        }
        get notTouch() {
            const {p: p} = this;
            return p.type === "mouse" || this.usePointer;
        }
        get notMouse() {
            return this.usePointer || this.useTouch;
        }
        __listenEvents() {
            super.__listenEvents();
            const view = this.view = this.canvas.view;
            this.viewEvents = {
                pointerdown: this.onPointerDown,
                mousedown: this.onMouseDown,
                touchstart: this.onTouchStart,
                pointerleave: this.onPointerLeave,
                contextmenu: this.onContextMenu,
                wheel: this.onWheel,
                gesturestart: this.onGesturestart,
                gesturechange: this.onGesturechange,
                gestureend: this.onGestureend
            };
            this.windowEvents = {
                pointermove: this.onPointerMove,
                pointerup: this.onPointerUp,
                pointercancel: this.onPointerCancel,
                mousemove: this.onMouseMove,
                mouseup: this.onMouseUp,
                touchmove: this.onTouchMove,
                touchend: this.onTouchEnd,
                touchcancel: this.onTouchCancel,
                keydown: this.onKeyDown,
                keyup: this.onKeyUp,
                scroll: this.onScroll
            };
            const {viewEvents: viewEvents, windowEvents: windowEvents} = this;
            for (let name in viewEvents) {
                viewEvents[name] = viewEvents[name].bind(this);
                view.addEventListener(name, viewEvents[name]);
            }
            for (let name in windowEvents) {
                windowEvents[name] = windowEvents[name].bind(this);
                this.windowTarget.addEventListener(name, windowEvents[name]);
            }
        }
        __removeListenEvents() {
            super.__removeListenEvents();
            const {viewEvents: viewEvents, windowEvents: windowEvents} = this;
            for (let name in viewEvents) {
                this.view.removeEventListener(name, viewEvents[name]);
                this.viewEvents = {};
            }
            for (let name in windowEvents) {
                this.windowTarget.removeEventListener(name, windowEvents[name]);
                this.windowEvents = {};
            }
        }
        getTouches(touches) {
            const list = [];
            for (let i = 0, len = touches.length; i < len; i++) {
                list.push(touches[i]);
            }
            return list;
        }
        preventDefaultPointer(e) {
            const {pointer: pointer} = this.config;
            if (pointer.preventDefault) e.preventDefault();
        }
        preventDefaultWheel(e) {
            const {wheel: wheel} = this.config;
            if (wheel.preventDefault) e.preventDefault();
        }
        preventWindowPointer(e) {
            if (this.downData || e.target === this.view) return false;
            return this.config.shadowDOM && e.composedPath ? !e.composedPath().includes(this.view) : true;
        }
        onKeyDown(e) {
            this.keyDown(KeyEventHelper.convert(e));
        }
        onKeyUp(e) {
            this.keyUp(KeyEventHelper.convert(e));
        }
        onContextMenu(e) {
            if (this.config.pointer.preventDefaultMenu) e.preventDefault();
            this.menu(PointerEventHelper.convert(e, this.getLocal(e)));
        }
        onScroll() {
            this.canvas.updateClientBounds();
        }
        onPointerDown(e) {
            this.preventDefaultPointer(e);
            if (this.notPointer) return;
            this.usePointer || (this.usePointer = true);
            this.pointerDown(PointerEventHelper.convert(e, this.getLocal(e)));
        }
        onPointerMove(e, isLeave) {
            if (this.notPointer || this.preventWindowPointer(e)) return;
            this.usePointer || (this.usePointer = true);
            const data = PointerEventHelper.convert(e, this.getLocal(e, true));
            isLeave ? this.pointerHover(data) : this.pointerMove(data);
        }
        onPointerLeave(e) {
            this.onPointerMove(e, true);
        }
        onPointerUp(e) {
            if (this.downData) this.preventDefaultPointer(e);
            if (this.notPointer || this.preventWindowPointer(e)) return;
            this.pointerUp(PointerEventHelper.convert(e, this.getLocal(e)));
        }
        onPointerCancel() {
            if (this.useMultiTouch) return;
            this.pointerCancel();
        }
        onMouseDown(e) {
            this.preventDefaultPointer(e);
            if (this.notMouse) return;
            this.pointerDown(PointerEventHelper.convertMouse(e, this.getLocal(e)));
        }
        onMouseMove(e) {
            if (this.notMouse || this.preventWindowPointer(e)) return;
            this.pointerMove(PointerEventHelper.convertMouse(e, this.getLocal(e, true)));
        }
        onMouseUp(e) {
            if (this.downData) this.preventDefaultPointer(e);
            if (this.notMouse || this.preventWindowPointer(e)) return;
            this.pointerUp(PointerEventHelper.convertMouse(e, this.getLocal(e)));
        }
        onMouseCancel() {
            if (this.notMouse) return;
            this.pointerCancel();
        }
        onTouchStart(e) {
            const touch = PointerEventHelper.getTouch(e);
            const local = this.getLocal(touch, true);
            const {preventDefault: preventDefault} = this.config.touch;
            if (preventDefault === true || preventDefault === "auto" && pathCanDrag(this.findPath(local))) e.preventDefault();
            this.multiTouchStart(e);
            if (this.notTouch) return;
            if (this.touchTimer) {
                window.clearTimeout(this.touchTimer);
                this.touchTimer = 0;
            }
            this.useTouch = true;
            this.pointerDown(PointerEventHelper.convertTouch(e, local));
        }
        onTouchMove(e) {
            this.multiTouchMove(e);
            if (this.notTouch || this.preventWindowPointer(e)) return;
            const touch = PointerEventHelper.getTouch(e);
            this.pointerMove(PointerEventHelper.convertTouch(e, this.getLocal(touch)));
        }
        onTouchEnd(e) {
            this.multiTouchEnd();
            if (this.notTouch || this.preventWindowPointer(e)) return;
            if (this.touchTimer) clearTimeout(this.touchTimer);
            this.touchTimer = setTimeout(() => {
                this.useTouch = false;
            }, 500);
            const touch = PointerEventHelper.getTouch(e);
            this.pointerUp(PointerEventHelper.convertTouch(e, this.getLocal(touch)));
        }
        onTouchCancel() {
            if (this.notTouch) return;
            this.pointerCancel();
        }
        multiTouchStart(e) {
            this.useMultiTouch = e.touches.length > 1;
            this.touches = this.useMultiTouch ? this.getTouches(e.touches) : undefined;
            if (this.useMultiTouch) this.pointerCancel();
        }
        multiTouchMove(e) {
            if (!this.useMultiTouch) return;
            if (e.touches.length > 1) {
                const touches = this.getTouches(e.touches);
                const list = this.getKeepTouchList(this.touches, touches);
                if (list.length > 1) {
                    this.multiTouch(InteractionHelper.getBase(e), list);
                    this.touches = touches;
                }
            }
        }
        multiTouchEnd() {
            this.touches = null;
            this.useMultiTouch = false;
            this.transformEnd();
        }
        getKeepTouchList(old, touches) {
            let to;
            const list = [];
            old.forEach(from => {
                to = touches.find(touch => touch.identifier === from.identifier);
                if (to) list.push({
                    from: this.getLocal(from),
                    to: this.getLocal(to)
                });
            });
            return list;
        }
        getLocalTouchs(points) {
            return points.map(point => this.getLocal(point));
        }
        onWheel(e) {
            this.preventDefaultWheel(e);
            this.wheel(Object.assign(Object.assign(Object.assign({}, InteractionHelper.getBase(e)), this.getLocal(e)), {
                deltaX: e.deltaX,
                deltaY: e.deltaY
            }));
        }
        onGesturestart(e) {
            if (this.useMultiTouch) return;
            this.preventDefaultWheel(e);
            this.lastGestureScale = 1;
            this.lastGestureRotation = 0;
        }
        onGesturechange(e) {
            if (this.useMultiTouch) return;
            this.preventDefaultWheel(e);
            const eventBase = InteractionHelper.getBase(e);
            Object.assign(eventBase, this.getLocal(e));
            const scale = e.scale / this.lastGestureScale;
            const rotation = (e.rotation - this.lastGestureRotation) / Math.PI * 180 * (MathHelper.within(this.config.wheel.rotateSpeed, 0, 1) / 4 + .1);
            this.zoom(Object.assign(Object.assign({}, eventBase), {
                scale: scale * scale
            }));
            this.rotate(Object.assign(Object.assign({}, eventBase), {
                rotation: rotation
            }));
            this.lastGestureScale = e.scale;
            this.lastGestureRotation = e.rotation;
        }
        onGestureend(e) {
            if (this.useMultiTouch) return;
            this.preventDefaultWheel(e);
            this.transformEnd();
        }
        setCursor(cursor) {
            super.setCursor(cursor);
            const list = [];
            this.eachCursor(cursor, list);
            if (isObject(list[list.length - 1])) list.push("default");
            this.canvas.view.style.cursor = list.map(item => isObject(item) ? `url(${item.url}) ${item.x || 0} ${item.y || 0}` : item).join(",");
        }
        eachCursor(cursor, list, level = 0) {
            level++;
            if (isArray(cursor)) {
                cursor.forEach(item => this.eachCursor(item, list, level));
            } else {
                const custom = isString(cursor) && Cursor.get(cursor);
                if (custom && level < 2) {
                    this.eachCursor(custom, list, level);
                } else {
                    list.push(cursor);
                }
            }
        }
        destroy() {
            if (this.view) {
                super.destroy();
                this.view = this.touches = null;
            }
        }
    }
    function fill(fill, ui, canvas, renderOptions) {
        canvas.fillStyle = fill;
        fillPathOrText(ui, canvas, renderOptions);
    }
    function fills(fills, ui, canvas, renderOptions) {
        let item, originPaint, countImage;
        for (let i = 0, len = fills.length; i < len; i++) {
            item = fills[i], originPaint = item.originPaint;
            if (item.image) {
                countImage ? countImage++ : countImage = 1;
                if (PaintImage.checkImage(item, !ui.__.__font, ui, canvas, renderOptions)) continue;
                if (!item.style) {
                    if (countImage === 1 && item.image.isPlacehold) ui.drawImagePlaceholder(item, canvas, renderOptions);
                    continue;
                }
            }
            canvas.fillStyle = item.style;
            if (item.transform || originPaint.scaleFixed) {
                canvas.save();
                if (item.transform) canvas.transform(item.transform);
                if (originPaint.scaleFixed) {
                    const {scaleX: scaleX, scaleY: scaleY} = ui.getRenderScaleData(true, originPaint.scaleFixed, false);
                    if (scaleX !== 1) canvas.scale(scaleX, scaleY);
                }
                if (originPaint.blendMode) canvas.blendMode = originPaint.blendMode;
                fillPathOrText(ui, canvas, renderOptions, true);
                canvas.restore();
            } else {
                if (originPaint.blendMode) {
                    canvas.saveBlendMode(originPaint.blendMode);
                    fillPathOrText(ui, canvas, renderOptions);
                    canvas.restoreBlendMode();
                } else fillPathOrText(ui, canvas, renderOptions);
            }
        }
    }
    function fillPathOrText(ui, canvas, renderOptions, complexPaint) {
        ui.__.__font ? Paint.fillText(ui, canvas, renderOptions, complexPaint) : ui.__.windingRule ? canvas.fill(ui.__.windingRule) : canvas.fill();
    }
    function fillText(ui, canvas, renderOptions, complexPaint) {
        const data = ui.__;
        if (data.__isPlacehold && data.placeholderColor) canvas.fillStyle = data.placeholderColor;
        let originCanvas;
        if (complexPaint) {
            originCanvas = canvas;
            canvas = canvas.getSameCanvas(true, true);
            canvas.font = ui.__.__font;
            canvas.fillStyle = "#000";
        }
        if (ui.motionText) {
            Paint.fillMotionText(ui, canvas, renderOptions);
        } else {
            let row;
            const {rows: rows, decorationY: decorationY} = data.__textDrawData;
            for (let i = 0, len = rows.length; i < len; i++) {
                row = rows[i];
                if (row.text) canvas.fillText(row.text, row.x, row.y); else if (row.data) row.data.forEach(charData => {
                    canvas.fillText(charData.char, charData.x, row.y);
                });
            }
            if (decorationY) {
                const {decorationColor: decorationColor, decorationHeight: decorationHeight} = data.__textDrawData;
                if (decorationColor) canvas.fillStyle = decorationColor;
                rows.forEach(row => decorationY.forEach(value => canvas.fillRect(row.x, row.y + value, row.width, decorationHeight)));
            }
        }
        if (complexPaint) {
            canvas.beginPath();
            ui.__drawPathByBox(canvas, "render");
            canvas.fillStyle = originCanvas.fillStyle;
            canvas.setTransform(originCanvas.getTransform());
            canvas.blendMode = "source-in";
            canvas.fill();
            originCanvas.copyWorldByReset(canvas, ui.__nowWorld);
            canvas.recycle(ui.__nowWorld);
        }
    }
    function stroke(stroke, ui, canvas, renderOptions) {
        const data = ui.__;
        if (!data.__strokeWidth) return;
        if (data.__font) {
            Paint.strokeText(stroke, ui, canvas, renderOptions);
        } else if (data.__pathForStroke) {
            Paint.fillStroke(stroke, ui, canvas, renderOptions);
        } else {
            switch (data.strokeAlign) {
              case "center":
                drawCenter$1(stroke, 1, ui, canvas, renderOptions);
                break;

              case "inside":
                drawInside(stroke, ui, canvas, renderOptions);
                break;

              case "outside":
                drawOutside(stroke, ui, canvas, renderOptions);
                break;
            }
        }
    }
    function strokes(strokes, ui, canvas, renderOptions) {
        Paint.stroke(strokes, ui, canvas, renderOptions);
    }
    function drawCenter$1(stroke, strokeWidthScale, ui, canvas, renderOptions) {
        const data = ui.__;
        if (isObject(stroke)) {
            Paint.drawStrokesStyle(stroke, strokeWidthScale, false, ui, canvas, renderOptions);
        } else {
            canvas.setStroke(stroke, data.__strokeWidth * strokeWidthScale, data);
            canvas.stroke();
        }
        if (data.__useArrow) Paint.strokeArrow(stroke, ui, canvas, renderOptions);
    }
    function drawInside(stroke, ui, canvas, renderOptions) {
        canvas.save();
        canvas.clipUI(ui);
        drawCenter$1(stroke, 2, ui, canvas, renderOptions);
        canvas.restore();
    }
    function drawOutside(stroke, ui, canvas, renderOptions) {
        const data = ui.__;
        if (data.__fillAfterStroke) {
            drawCenter$1(stroke, 2, ui, canvas, renderOptions);
        } else {
            const {renderBounds: renderBounds} = ui.__layout;
            const out = canvas.getSameCanvas(true, true);
            ui.__drawRenderPath(out);
            drawCenter$1(stroke, 2, ui, out, renderOptions);
            out.clipUI(data);
            out.clearWorld(renderBounds);
            LeafHelper.copyCanvasByWorld(ui, canvas, out);
            out.recycle(ui.__nowWorld);
        }
    }
    function strokeText(stroke, ui, canvas, renderOptions) {
        switch (ui.__.strokeAlign) {
          case "center":
            drawCenter(stroke, 1, ui, canvas, renderOptions);
            break;

          case "inside":
            drawAlign(stroke, "inside", ui, canvas, renderOptions);
            break;

          case "outside":
            ui.__.__fillAfterStroke ? drawCenter(stroke, 2, ui, canvas, renderOptions) : drawAlign(stroke, "outside", ui, canvas, renderOptions);
            break;
        }
    }
    function drawCenter(stroke, strokeWidthScale, ui, canvas, renderOptions) {
        const data = ui.__;
        if (isObject(stroke)) {
            Paint.drawStrokesStyle(stroke, strokeWidthScale, true, ui, canvas, renderOptions);
        } else {
            canvas.setStroke(stroke, data.__strokeWidth * strokeWidthScale, data);
            Paint.drawTextStroke(ui, canvas, renderOptions);
        }
    }
    function drawAlign(stroke, align, ui, canvas, renderOptions) {
        const out = canvas.getSameCanvas(true, true);
        out.font = ui.__.__font;
        drawCenter(stroke, 2, ui, out, renderOptions);
        out.blendMode = align === "outside" ? "destination-out" : "destination-in";
        Paint.fillText(ui, out, renderOptions);
        out.blendMode = "normal";
        LeafHelper.copyCanvasByWorld(ui, canvas, out);
        out.recycle(ui.__nowWorld);
    }
    function drawTextStroke(ui, canvas, _renderOptions) {
        let row, data = ui.__.__textDrawData;
        const {rows: rows, decorationY: decorationY} = data;
        for (let i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            if (row.text) canvas.strokeText(row.text, row.x, row.y); else if (row.data) row.data.forEach(charData => {
                canvas.strokeText(charData.char, charData.x, row.y);
            });
        }
        if (decorationY) {
            const {decorationHeight: decorationHeight} = data;
            rows.forEach(row => decorationY.forEach(value => canvas.strokeRect(row.x, row.y + value, row.width, decorationHeight)));
        }
    }
    function drawStrokesStyle(strokes, strokeWidthScale, isText, ui, canvas, renderOptions) {
        let item;
        const data = ui.__, {__hasMultiStrokeStyle: __hasMultiStrokeStyle} = data;
        __hasMultiStrokeStyle || canvas.setStroke(undefined, data.__strokeWidth * strokeWidthScale, data);
        for (let i = 0, len = strokes.length; i < len; i++) {
            item = strokes[i];
            if (item.image && PaintImage.checkImage(item, false, ui, canvas, renderOptions)) continue;
            if (item.style) {
                if (__hasMultiStrokeStyle) {
                    const {strokeStyle: strokeStyle} = item;
                    strokeStyle ? canvas.setStroke(item.style, data.__getRealStrokeWidth(strokeStyle) * strokeWidthScale, data, strokeStyle) : canvas.setStroke(item.style, data.__strokeWidth * strokeWidthScale, data);
                } else canvas.strokeStyle = item.style;
                if (item.originPaint.blendMode) {
                    canvas.saveBlendMode(item.originPaint.blendMode);
                    isText ? Paint.drawTextStroke(ui, canvas, renderOptions) : canvas.stroke();
                    canvas.restoreBlendMode();
                } else {
                    isText ? Paint.drawTextStroke(ui, canvas, renderOptions) : canvas.stroke();
                }
            }
        }
    }
    const {getSpread: getSpread, copyAndSpread: copyAndSpread, toOuterOf: toOuterOf, getOuterOf: getOuterOf, getByMove: getByMove, move: move$1, getIntersectData: getIntersectData} = BoundsHelper;
    const tempBounds$1 = {};
    function shape(ui, current, options) {
        const canvas = current.getSameCanvas();
        const currentBounds = current.bounds, nowWorld = ui.__nowWorld, layout = ui.__layout;
        const nowWorldShapeBounds = ui.__nowWorldShapeBounds || (ui.__nowWorldShapeBounds = {});
        toOuterOf(layout.strokeSpread ? (copyAndSpread(tempBounds$1, layout.boxBounds, layout.strokeSpread), 
        tempBounds$1) : layout.boxBounds, nowWorld, nowWorldShapeBounds);
        let bounds, renderBounds, matrix, fitMatrix, shapeBounds, worldCanvas;
        let {scaleX: scaleX, scaleY: scaleY} = ui.getRenderScaleData(true);
        if (currentBounds.includes(nowWorldShapeBounds)) {
            worldCanvas = canvas;
            bounds = shapeBounds = nowWorldShapeBounds;
            renderBounds = nowWorld;
        } else {
            let worldClipBounds;
            if (Platform.fullImageShadow) {
                worldClipBounds = nowWorldShapeBounds;
            } else {
                const spreadBounds = layout.renderShapeSpread ? getSpread(currentBounds, FourNumberHelper.swapAndScale(layout.renderShapeSpread, scaleX, scaleY)) : currentBounds;
                worldClipBounds = getIntersectData(spreadBounds, nowWorldShapeBounds);
            }
            fitMatrix = currentBounds.getFitMatrix(worldClipBounds);
            let {a: fitScaleX, d: fitScaleY} = fitMatrix;
            if (fitMatrix.a < 1) {
                worldCanvas = current.getSameCanvas();
                ui.__renderShape(worldCanvas, options);
                scaleX *= fitScaleX;
                scaleY *= fitScaleY;
            }
            shapeBounds = getOuterOf(nowWorldShapeBounds, fitMatrix);
            bounds = getByMove(shapeBounds, -fitMatrix.e, -fitMatrix.f);
            renderBounds = getOuterOf(nowWorld, fitMatrix);
            move$1(renderBounds, -fitMatrix.e, -fitMatrix.f);
            const userMatrix = options.matrix;
            if (userMatrix) {
                matrix = new Matrix(fitMatrix);
                matrix.multiply(userMatrix);
                fitScaleX *= userMatrix.scaleX;
                fitScaleY *= userMatrix.scaleY;
            } else matrix = fitMatrix;
            matrix.withScale(fitScaleX, fitScaleY);
            options = Object.assign(Object.assign({}, options), {
                matrix: matrix
            });
        }
        ui.__renderShape(canvas, options);
        return {
            canvas: canvas,
            matrix: matrix,
            fitMatrix: fitMatrix,
            bounds: bounds,
            renderBounds: renderBounds,
            worldCanvas: worldCanvas,
            shapeBounds: shapeBounds,
            scaleX: scaleX,
            scaleY: scaleY
        };
    }
    let recycleMap;
    const {stintSet: stintSet} = DataHelper, {hasTransparent: hasTransparent$1} = ColorConvert;
    function compute(attrName, ui) {
        const data = ui.__, leafPaints = [];
        let paints = data.__input[attrName], isAlphaPixel, isTransparent;
        if (!isArray(paints)) paints = [ paints ];
        recycleMap = PaintImage.recycleImage(attrName, data);
        let maxChildStrokeWidth;
        for (let i = 0, len = paints.length, item; i < len; i++) {
            if (item = getLeafPaint(attrName, paints[i], ui)) {
                leafPaints.push(item);
                if (item.strokeStyle) {
                    maxChildStrokeWidth || (maxChildStrokeWidth = 1);
                    if (item.strokeStyle.strokeWidth) maxChildStrokeWidth = Math.max(maxChildStrokeWidth, item.strokeStyle.strokeWidth);
                }
            }
        }
        if (leafPaints.length) {
            data["_" + attrName] = leafPaints;
            if (leafPaints.every(item => item.isTransparent)) {
                if (leafPaints.some(item => item.image)) isAlphaPixel = true;
                isTransparent = true;
            }
            if (attrName === "fill") {
                stintSet(data, "__isAlphaPixelFill", isAlphaPixel);
                stintSet(data, "__isTransparentFill", isTransparent);
            } else {
                stintSet(data, "__isAlphaPixelStroke", isAlphaPixel);
                stintSet(data, "__isTransparentStroke", isTransparent);
                stintSet(data, "__hasMultiStrokeStyle", maxChildStrokeWidth);
            }
        } else {
            data.__removePaint(attrName, false);
            data["_" + attrName] = "";
        }
    }
    function getLeafPaint(attrName, paint, ui) {
        if (!isObject(paint) || paint.visible === false || paint.opacity === 0) return undefined;
        let leafPaint;
        const {boxBounds: boxBounds} = ui.__layout, {type: type} = paint;
        switch (type) {
          case "image":
          case "film":
          case "video":
            if (!paint.url) return undefined;
            leafPaint = PaintImage.image(ui, attrName, paint, boxBounds, !recycleMap || !recycleMap[paint.url]);
            if (type !== "image") PaintImage[type](leafPaint);
            break;

          case "linear":
            leafPaint = PaintGradient.linearGradient(paint, boxBounds);
            break;

          case "radial":
            leafPaint = PaintGradient.radialGradient(paint, boxBounds);
            break;

          case "angular":
            leafPaint = PaintGradient.conicGradient(paint, boxBounds);
            break;

          case "solid":
            const {color: color, opacity: opacity} = paint;
            leafPaint = {
                type: type,
                style: ColorConvert.string(color, opacity)
            };
            break;

          default:
            if (!isUndefined(paint.r)) leafPaint = {
                type: "solid",
                style: ColorConvert.string(paint)
            };
        }
        if (leafPaint) {
            leafPaint.originPaint = paint;
            if (isString(leafPaint.style) && hasTransparent$1(leafPaint.style)) leafPaint.isTransparent = true;
            if (paint.style) {
                if (paint.style.strokeWidth === 0) return undefined;
                leafPaint.strokeStyle = paint.style;
            }
        }
        return leafPaint;
    }
    const PaintModule = {
        compute: compute,
        fill: fill,
        fills: fills,
        fillPathOrText: fillPathOrText,
        fillText: fillText,
        stroke: stroke,
        strokes: strokes,
        strokeText: strokeText,
        drawTextStroke: drawTextStroke,
        drawStrokesStyle: drawStrokesStyle,
        shape: shape
    };
    let cache, box = new Bounds;
    const {isSame: isSame} = BoundsHelper;
    function image(ui, attrName, paint, boxBounds, firstUse) {
        let leafPaint, event;
        const image = ImageManager.get(paint, paint.type);
        if (cache && paint === cache.paint && isSame(boxBounds, cache.boxBounds)) {
            leafPaint = cache.leafPaint;
        } else {
            leafPaint = {
                type: paint.type,
                image: image
            };
            if (image.hasAlphaPixel) leafPaint.isTransparent = true;
            cache = image.use > 1 ? {
                leafPaint: leafPaint,
                paint: paint,
                boxBounds: box.set(boxBounds)
            } : null;
        }
        if (firstUse || image.loading) event = {
            image: image,
            attrName: attrName,
            attrValue: paint
        };
        if (image.ready) {
            checkSizeAndCreateData(ui, attrName, paint, image, leafPaint, boxBounds);
            if (firstUse) {
                onLoad(ui, event);
                onLoadSuccess(ui, event);
            }
        } else if (image.error) {
            if (firstUse) onLoadError(ui, event, image.error);
        } else {
            if (firstUse) {
                ignoreRender(ui, true);
                onLoad(ui, event);
            }
            leafPaint.loadId = image.load(() => {
                ignoreRender(ui, false);
                if (!ui.destroyed) {
                    if (checkSizeAndCreateData(ui, attrName, paint, image, leafPaint, boxBounds)) {
                        if (image.hasAlphaPixel) ui.__layout.hitCanvasChanged = true;
                        ui.forceUpdate("surface");
                    }
                    onLoadSuccess(ui, event);
                }
                leafPaint.loadId = undefined;
            }, error => {
                ignoreRender(ui, false);
                onLoadError(ui, event, error);
                leafPaint.loadId = undefined;
            }, paint.lod && image.getThumbSize(paint.lod));
            if (ui.placeholderColor) {
                if (!ui.placeholderDelay) image.isPlacehold = true; else setTimeout(() => {
                    if (!image.ready) {
                        image.isPlacehold = true;
                        ui.forceUpdate("surface");
                    }
                }, ui.placeholderDelay);
            }
        }
        return leafPaint;
    }
    function checkSizeAndCreateData(ui, attrName, paint, image, leafPaint, boxBounds) {
        let needUpdate = true;
        const data = ui.__;
        if (attrName === "fill" && !data.__naturalWidth) {
            data.__naturalWidth = image.width / data.pixelRatio;
            data.__naturalHeight = image.height / data.pixelRatio;
            if (data.__autoSide) {
                ui.forceUpdate();
                LeafHelper.updateBounds(ui, true);
                ui.__layout.boundsChanged = true;
                if (ui.__proxyData) {
                    ui.setProxyAttr("width", data.width);
                    ui.setProxyAttr("height", data.height);
                }
                needUpdate = false;
            }
        }
        if (paint.mode === "brush") PaintImage.brush(ui, attrName, leafPaint);
        if (!leafPaint.data) {
            PaintImage.createData(leafPaint, image, paint, boxBounds);
            const {transform: transform} = leafPaint.data, {opacity: opacity} = paint;
            const clip = (transform && !transform.onlyScale || data.path || data.cornerRadius) && !leafPaint.brush;
            if (clip || opacity && opacity < 1 || paint.blendMode) leafPaint.complex = clip ? 2 : true;
        }
        if (paint.filter) PaintImage.applyFilter(leafPaint, image, paint.filter, ui);
        return needUpdate;
    }
    function onLoad(ui, event) {
        emit(ui, ImageEvent.LOAD, event);
    }
    function onLoadSuccess(ui, event) {
        emit(ui, ImageEvent.LOADED, event);
    }
    function onLoadError(ui, event, error) {
        event.error = error;
        ui.forceUpdate("surface");
        emit(ui, ImageEvent.ERROR, event);
    }
    function emit(ui, type, data) {
        if (ui.hasEvent(type)) ui.emitEvent(new ImageEvent(type, data));
    }
    function ignoreRender(ui, value) {
        const {leafer: leafer} = ui;
        if (leafer && leafer.viewReady) leafer.renderer.ignore = value;
    }
    const {get: get$3, translate: translate$1} = MatrixHelper;
    const tempBox = new Bounds;
    const tempScaleData = {};
    const tempImage = {};
    function createData(leafPaint, image, paint, box) {
        leafPaint.data = PaintImage.getPatternData(paint, box, image);
    }
    function getPatternData(paint, box, image) {
        if (paint.padding) box = tempBox.set(box).shrink(paint.padding);
        if (paint.mode === "strench") paint.mode = "stretch";
        const {width: width, height: height} = image;
        const {mode: mode, align: align, offset: offset, scale: scale, size: size, rotation: rotation, skew: skew, clipSize: clipSize, repeat: repeat, gap: gap, interlace: interlace} = paint;
        const sameBox = box.width === width && box.height === height;
        const data = {
            mode: mode
        };
        const swapSize = align !== "center" && (rotation || 0) % 180 === 90;
        BoundsHelper.set(tempImage, 0, 0, swapSize ? height : width, swapSize ? width : height);
        let scaleX, scaleY;
        if (!mode || mode === "cover" || mode === "fit") {
            if (!sameBox || rotation) {
                scaleX = scaleY = BoundsHelper.getFitScale(box, tempImage, mode !== "fit");
                BoundsHelper.put(box, image, align, scaleX, false, tempImage);
                BoundsHelper.scale(tempImage, scaleX, scaleY, true);
            }
        } else {
            if (scale || size) {
                MathHelper.getScaleData(scale, size, image, tempScaleData);
                scaleX = tempScaleData.scaleX;
                scaleY = tempScaleData.scaleY;
            }
            if (align || gap || repeat) {
                if (scaleX) BoundsHelper.scale(tempImage, scaleX, scaleY, true);
                if (align) AlignHelper.toPoint(align, tempImage, box, tempImage, true, true);
            }
        }
        if (offset) PointHelper.move(tempImage, offset);
        switch (mode) {
          case "stretch":
            if (!sameBox) {
                scaleX = box.width / width, scaleY = box.height / height;
                PaintImage.stretchMode(data, box, scaleX, scaleY);
            } else if (scaleX) scaleX = scaleY = undefined;
            break;

          case "normal":
          case "clip":
            if (tempImage.x || tempImage.y || scaleX || clipSize || rotation || skew) {
                let clipScaleX, clipScaleY;
                if (clipSize) clipScaleX = box.width / clipSize.width, clipScaleY = box.height / clipSize.height;
                PaintImage.clipMode(data, box, tempImage.x, tempImage.y, scaleX, scaleY, rotation, skew, clipScaleX, clipScaleY);
                if (clipScaleX) scaleX = scaleX ? scaleX * clipScaleX : clipScaleX, scaleY = scaleY ? scaleY * clipScaleY : clipScaleY;
            }
            break;

          case "repeat":
            if (!sameBox || scaleX || rotation || skew) PaintImage.repeatMode(data, box, width, height, tempImage.x, tempImage.y, scaleX, scaleY, rotation, skew, align, paint.freeTransform);

          case "brush":
            if (!repeat) data.repeat = "repeat";
            const count = isObject(repeat);
            if (gap || count) data.gap = getGapData(gap, count && repeat, tempImage.width, tempImage.height, box);
            break;

          case "fit":
          case "cover":
          default:
            if (scaleX) PaintImage.fillOrFitMode(data, box, tempImage.x, tempImage.y, scaleX, scaleY, rotation);
        }
        if (!data.transform && mode !== "brush") {
            if (box.x || box.y) translate$1(data.transform = get$3(), box.x, box.y);
        }
        if (scaleX) {
            data.scaleX = scaleX;
            data.scaleY = scaleY;
        }
        if (repeat) data.repeat = isString(repeat) ? repeat === "x" ? "repeat-x" : "repeat-y" : "repeat";
        if (interlace) data.interlace = isNumber(interlace) || interlace.type === "percent" ? {
            type: "x",
            offset: interlace
        } : interlace;
        return data;
    }
    function getGapData(gap, repeat, width, height, box) {
        let xGap, yGap;
        if (isObject(gap)) xGap = gap.x, yGap = gap.y; else xGap = yGap = gap;
        return {
            x: getGapValue(xGap, width, box.width, repeat && repeat.x),
            y: getGapValue(yGap, height, box.height, repeat && repeat.y)
        };
    }
    function getGapValue(gap, size, totalSize, rows) {
        const auto = isString(gap) || rows;
        const remain = rows ? totalSize - rows * size : totalSize % size;
        const value = auto ? remain / ((rows || Math.floor(totalSize / size)) - 1) : gap;
        return gap === "auto" ? value < 0 ? 0 : value : value;
    }
    let origin = {}, tempMatrix$1 = getMatrixData();
    const {get: get$2, set: set, rotateOfOuter: rotateOfOuter$1, translate: translate, scaleOfOuter: scaleOfOuter$1, multiplyParent: multiplyParent, scale: scaleHelper, rotate: rotate, skew: skewHelper} = MatrixHelper;
    function stretchMode(data, box, scaleX, scaleY) {
        const transform = get$2(), {x: x, y: y} = box;
        if (x || y) translate(transform, x, y); else if (scaleX > 0 && scaleY > 0) transform.onlyScale = true;
        scaleHelper(transform, scaleX, scaleY);
        data.transform = transform;
    }
    function fillOrFitMode(data, box, x, y, scaleX, scaleY, rotation) {
        const transform = get$2();
        translate(transform, box.x + x, box.y + y);
        scaleHelper(transform, scaleX, scaleY);
        if (rotation) rotateOfOuter$1(transform, {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2
        }, rotation);
        data.transform = transform;
    }
    function clipMode(data, box, x, y, scaleX, scaleY, rotation, skew, clipScaleX, clipScaleY) {
        const transform = get$2();
        layout(transform, box, x, y, scaleX, scaleY, rotation, skew);
        if (clipScaleX) {
            if (rotation || skew) {
                set(tempMatrix$1);
                scaleOfOuter$1(tempMatrix$1, box, clipScaleX, clipScaleY);
                multiplyParent(transform, tempMatrix$1);
            } else scaleOfOuter$1(transform, box, clipScaleX, clipScaleY);
        }
        data.transform = transform;
    }
    function repeatMode(data, box, width, height, x, y, scaleX, scaleY, rotation, skew, align, freeTransform) {
        const transform = get$2();
        if (freeTransform) {
            layout(transform, box, x, y, scaleX, scaleY, rotation, skew);
        } else {
            if (rotation) {
                if (align === "center") {
                    rotateOfOuter$1(transform, {
                        x: width / 2,
                        y: height / 2
                    }, rotation);
                } else {
                    rotate(transform, rotation);
                    switch (rotation) {
                      case 90:
                        translate(transform, height, 0);
                        break;

                      case 180:
                        translate(transform, width, height);
                        break;

                      case 270:
                        translate(transform, 0, width);
                        break;
                    }
                }
            }
            origin.x = box.x + x;
            origin.y = box.y + y;
            translate(transform, origin.x, origin.y);
            if (scaleX) scaleOfOuter$1(transform, origin, scaleX, scaleY);
        }
        data.transform = transform;
    }
    function layout(transform, box, x, y, scaleX, scaleY, rotation, skew) {
        if (rotation) rotate(transform, rotation);
        if (skew) skewHelper(transform, skew.x, skew.y);
        if (scaleX) scaleHelper(transform, scaleX, scaleY);
        translate(transform, box.x + x, box.y + y);
    }
    const {get: get$1, scale: scale, copy: copy$1} = MatrixHelper;
    const {getFloorScale: getFloorScale} = MathHelper, {abs: abs$1} = Math;
    function createPatternTask(paint, ui, canvas, renderOptions) {
        if (!paint.patternTask) {
            paint.patternTask = ImageManager.patternTasker.add(() => __awaiter(this, void 0, void 0, function*() {
                PaintImage.createPattern(paint, ui, canvas, renderOptions);
                ui.forceUpdate("surface");
            }), 0, () => {
                paint.patternTask = null;
                return canvas.bounds.hit(ui.__nowWorld);
            });
        }
    }
    function createPattern(paint, ui, canvas, renderOptions) {
        let {scaleX: scaleX, scaleY: scaleY} = PaintImage.getImageRenderScaleData(paint, ui, canvas, renderOptions), id = paint.film ? paint.nowIndex : scaleX + "-" + scaleY;
        if (paint.patternId !== id && !ui.destroyed) {
            if (!(Platform.image.isLarge(paint.image, scaleX, scaleY) && !paint.data.repeat)) {
                const {image: image, brush: brush, data: data} = paint, {transform: transform, gap: gap} = data, fixScale = PaintImage.getPatternFixScale(paint, scaleX, scaleY);
                let imageMatrix, xGap, yGap, {width: width, height: height} = image, {opacity: opacity} = paint.originPaint;
                if (brush || opacity === 1) opacity = undefined;
                if (fixScale) scaleX *= fixScale, scaleY *= fixScale;
                width *= scaleX;
                height *= scaleY;
                if (gap && !brush) {
                    xGap = gap.x * scaleX / abs$1(data.scaleX || 1);
                    yGap = gap.y * scaleY / abs$1(data.scaleY || 1);
                }
                if (transform || scaleX !== 1 || scaleY !== 1) {
                    scaleX *= getFloorScale(width + (xGap || 0));
                    scaleY *= getFloorScale(height + (yGap || 0));
                    imageMatrix = get$1();
                    if (transform) copy$1(imageMatrix, transform);
                    scale(imageMatrix, 1 / scaleX, 1 / scaleY);
                }
                const imageCanvas = image.getCanvas(width, height, opacity, undefined, xGap, yGap, ui.leafer && ui.leafer.config.smooth, data.interlace);
                if (brush) {
                    paint.style = imageCanvas;
                    PaintImage.cacheBrush(paint, ui, canvas, renderOptions);
                } else {
                    paint.style = image.getPattern(imageCanvas, data.repeat || (Platform.origin.noRepeat || "no-repeat"), imageMatrix, paint);
                }
                paint.patternId = id;
            }
        }
    }
    function getPatternFixScale(paint, imageScaleX, imageScaleY) {
        const {image: image} = paint;
        let fixScale, maxSize = Platform.image.maxPatternSize, imageSize = image.width * image.height;
        if (image.isSVG) {
            if (imageScaleX > 1) fixScale = Math.ceil(imageScaleX) / imageScaleX;
        } else {
            if (maxSize > imageSize) maxSize = imageSize;
        }
        if ((imageSize *= imageScaleX * imageScaleY) > maxSize) fixScale = Math.sqrt(maxSize / imageSize);
        return fixScale;
    }
    function checkImage(paint, drawImage, ui, canvas, renderOptions) {
        const {scaleX: scaleX, scaleY: scaleY} = PaintImage.getImageRenderScaleData(paint, ui, canvas, renderOptions), id = paint.film ? paint.nowIndex : scaleX + "-" + scaleY;
        const {image: image, brush: brush, data: data, originPaint: originPaint} = paint, {exporting: exporting, snapshot: snapshot} = renderOptions;
        if (!data || paint.patternId === id && !exporting || snapshot) {
            if (!(brush && paint.style)) return false;
        } else {
            if (drawImage) {
                if (data.repeat) {
                    drawImage = false;
                } else if (!(originPaint.changeful || paint.film || Platform.name === "miniapp" || exporting)) {
                    drawImage = Platform.image.isLarge(image, scaleX, scaleY) || image.width * scaleX > 8096 || image.height * scaleY > 8096;
                }
            }
            if (drawImage) {
                if (ui.__.__isFastShadow) {
                    canvas.fillStyle = paint.style || "#000";
                    canvas.fill();
                }
            } else {
                if (!paint.style || originPaint.sync || exporting) PaintImage.createPattern(paint, ui, canvas, renderOptions); else PaintImage.createPatternTask(paint, ui, canvas, renderOptions);
                if (!(brush && paint.style)) return false;
            }
        }
        PaintImage.drawImage(paint, scaleX, scaleY, ui, canvas, renderOptions);
        return true;
    }
    function drawImage(paint, imageScaleX, imageScaleY, ui, canvas, _renderOptions) {
        const {data: data, image: image, brush: brush, complex: complex} = paint;
        let {width: width, height: height} = image, view = brush || image;
        if (complex) {
            const {blendMode: blendMode, opacity: opacity} = paint.originPaint, {transform: transform} = data;
            canvas.save();
            complex === 2 && canvas.clipUI(ui);
            blendMode && (canvas.blendMode = blendMode);
            opacity && (canvas.opacity *= opacity);
            transform && canvas.transform(transform);
            view.render(canvas, 0, 0, width, height, ui, paint, imageScaleX, imageScaleY);
            canvas.restore();
        } else {
            if (data.scaleX) width *= data.scaleX, height *= data.scaleY;
            view.render(canvas, 0, 0, width, height, ui, paint, imageScaleX, imageScaleY);
        }
    }
    function getImageRenderScaleData(paint, ui, canvas, _renderOptions) {
        const scaleData = ui.getRenderScaleData(true, paint.originPaint.scaleFixed), {data: data} = paint;
        if (paint.brush) PaintImage.addBrushScale(scaleData, paint, ui);
        if (canvas) {
            const {pixelRatio: pixelRatio} = canvas;
            scaleData.scaleX *= pixelRatio;
            scaleData.scaleY *= pixelRatio;
        }
        if (data && data.scaleX) {
            scaleData.scaleX *= Math.abs(data.scaleX);
            scaleData.scaleY *= Math.abs(data.scaleY);
        }
        return scaleData;
    }
    function recycleImage(attrName, data) {
        const paints = data["_" + attrName];
        if (isArray(paints)) {
            let paint, image, recycleMap, input, url;
            const ui = data.__leaf;
            for (let i = 0, len = paints.length; i < len; i++) {
                paint = paints[i];
                image = paint.image;
                url = image && image.url;
                if (url) {
                    if (!recycleMap) recycleMap = {};
                    recycleMap[url] = true;
                    ImageManager.recyclePaint(paint);
                    if (paint.brush) PaintImage.recycleBrush(paint, ui);
                    if (data.__willDestroy && image.parent) PaintImage.recycleFilter(image, ui);
                    if (image.loading) {
                        if (!input) {
                            input = data.__input && data.__input[attrName] || [];
                            if (!isArray(input)) input = [ input ];
                        }
                        image.unload(paints[i].loadId, !input.some(item => item.url === url));
                    }
                }
            }
            return recycleMap;
        }
        return null;
    }
    const PaintImageModule = {
        image: image,
        checkImage: checkImage,
        drawImage: drawImage,
        getImageRenderScaleData: getImageRenderScaleData,
        recycleImage: recycleImage,
        createPatternTask: createPatternTask,
        createPattern: createPattern,
        getPatternFixScale: getPatternFixScale,
        createData: createData,
        getPatternData: getPatternData,
        stretchMode: stretchMode,
        fillOrFitMode: fillOrFitMode,
        clipMode: clipMode,
        repeatMode: repeatMode
    };
    const {toPoint: toPoint$2} = AroundHelper, {hasTransparent: hasTransparent} = ColorConvert;
    const realFrom$2 = {};
    const realTo$2 = {};
    function linearGradient(paint, box) {
        let {from: from, to: to, type: type, opacity: opacity} = paint;
        toPoint$2(from || "top", box, realFrom$2);
        toPoint$2(to || "bottom", box, realTo$2);
        const style = Platform.canvas.createLinearGradient(realFrom$2.x, realFrom$2.y, realTo$2.x, realTo$2.y);
        const data = {
            type: type,
            style: style
        };
        applyStops(data, style, paint.stops, opacity);
        return data;
    }
    function applyStops(data, gradient, stops, opacity) {
        if (stops) {
            let stop, color, offset, isTransparent;
            for (let i = 0, len = stops.length; i < len; i++) {
                stop = stops[i];
                if (isString(stop)) offset = i / (len - 1), color = ColorConvert.string(stop, opacity); else offset = stop.offset, 
                color = ColorConvert.string(stop.color, opacity);
                gradient.addColorStop(offset, color);
                if (!isTransparent && hasTransparent(color)) isTransparent = true;
            }
            if (isTransparent) data.isTransparent = true;
        }
    }
    const {getAngle: getAngle, getDistance: getDistance$1} = PointHelper;
    const {get: get, rotateOfOuter: rotateOfOuter, scaleOfOuter: scaleOfOuter} = MatrixHelper;
    const {toPoint: toPoint$1} = AroundHelper;
    const realFrom$1 = {};
    const realTo$1 = {};
    function radialGradient(paint, box) {
        let {from: from, to: to, type: type, opacity: opacity, stretch: stretch} = paint;
        toPoint$1(from || "center", box, realFrom$1);
        toPoint$1(to || "bottom", box, realTo$1);
        const style = Platform.canvas.createRadialGradient(realFrom$1.x, realFrom$1.y, 0, realFrom$1.x, realFrom$1.y, getDistance$1(realFrom$1, realTo$1));
        const data = {
            type: type,
            style: style
        };
        applyStops(data, style, paint.stops, opacity);
        const transform = getTransform(box, realFrom$1, realTo$1, stretch, true);
        if (transform) data.transform = transform;
        return data;
    }
    function getTransform(box, from, to, stretch, rotate90) {
        let transform;
        const {width: width, height: height} = box;
        if (width !== height || stretch) {
            const angle = getAngle(from, to);
            transform = get();
            if (rotate90) {
                scaleOfOuter(transform, from, width / height * (stretch || 1), 1);
                rotateOfOuter(transform, from, angle + 90);
            } else {
                scaleOfOuter(transform, from, 1, width / height * (stretch || 1));
                rotateOfOuter(transform, from, angle);
            }
        }
        return transform;
    }
    const {getDistance: getDistance} = PointHelper;
    const {toPoint: toPoint} = AroundHelper;
    const realFrom = {};
    const realTo = {};
    function conicGradient(paint, box) {
        let {from: from, to: to, type: type, opacity: opacity, rotation: rotation, stretch: stretch} = paint;
        toPoint(from || "center", box, realFrom);
        toPoint(to || "bottom", box, realTo);
        const style = Platform.conicGradientSupport ? Platform.canvas.createConicGradient(rotation ? rotation * OneRadian : 0, realFrom.x, realFrom.y) : Platform.canvas.createRadialGradient(realFrom.x, realFrom.y, 0, realFrom.x, realFrom.y, getDistance(realFrom, realTo));
        const data = {
            type: type,
            style: style
        };
        applyStops(data, style, paint.stops, opacity);
        const transform = getTransform(box, realFrom, realTo, stretch || 1, Platform.conicGradientRotate90);
        if (transform) data.transform = transform;
        return data;
    }
    const PaintGradientModule = {
        linearGradient: linearGradient,
        radialGradient: radialGradient,
        conicGradient: conicGradient,
        getTransform: getTransform
    };
    const {copy: copy, move: move, toOffsetOutBounds: toOffsetOutBounds$1} = BoundsHelper, {max: max, abs: abs} = Math;
    const tempBounds = {}, tempMatrix = new Matrix;
    const offsetOutBounds$1 = {};
    function shadow(ui, current, shape) {
        let copyBounds, transform;
        const {__nowWorld: nowWorld} = ui;
        const {shadow: shadow} = ui.__;
        const {worldCanvas: worldCanvas, bounds: bounds, renderBounds: renderBounds, shapeBounds: shapeBounds, scaleX: scaleX, scaleY: scaleY} = shape;
        const other = current.getSameCanvas();
        const end = shadow.length - 1;
        toOffsetOutBounds$1(bounds, offsetOutBounds$1, renderBounds);
        shadow.forEach((item, index) => {
            let otherScale = 1;
            if (item.scaleFixed) {
                const sx = Math.abs(nowWorld.scaleX);
                if (sx > 1) otherScale = 1 / sx;
            }
            other.setWorldShadow(offsetOutBounds$1.offsetX + (item.x || 0) * scaleX * otherScale, offsetOutBounds$1.offsetY + (item.y || 0) * scaleY * otherScale, (item.blur || 0) * scaleX * otherScale, ColorConvert.string(item.color));
            transform = Effect.getShadowTransform(ui, other, shape, item, offsetOutBounds$1, otherScale);
            if (transform) other.setTransform(transform);
            drawWorldShadow(other, offsetOutBounds$1, shape);
            if (transform) other.resetTransform();
            copyBounds = renderBounds;
            if (item.box) {
                other.restore();
                other.save();
                if (worldCanvas) {
                    other.copyWorld(other, renderBounds, nowWorld, "copy");
                    copyBounds = nowWorld;
                }
                worldCanvas ? other.copyWorld(worldCanvas, nowWorld, nowWorld, "destination-out") : other.copyWorld(shape.canvas, shapeBounds, bounds, "destination-out");
            }
            LeafHelper.copyCanvasByWorld(ui, current, other, copyBounds, item.blendMode);
            if (end && index < end) other.clearWorld(copyBounds);
        });
        other.recycle(copyBounds);
    }
    function getShadowRenderSpread(_ui, shadow) {
        let top = 0, right = 0, bottom = 0, left = 0, x, y, spread, blur;
        shadow.forEach(item => {
            x = item.x || 0, y = item.y || 0, blur = (item.blur || 0) * 1.5, spread = abs(item.spread || 0);
            top = max(top, spread + blur - y);
            right = max(right, spread + blur + x);
            bottom = max(bottom, spread + blur + y);
            left = max(left, spread + blur - x);
        });
        return top === right && right === bottom && bottom === left ? top : [ top, right, bottom, left ];
    }
    function getShadowTransform(ui, canvas, _shape, shadow, outBounds, otherScale, isInnerShaodw) {
        if (shadow.spread) {
            const spread = shadow.spread * 2 * otherScale * (isInnerShaodw ? -1 : 1), {width: width, height: height} = ui.__layout.strokeBounds;
            tempMatrix.set().scaleOfOuter({
                x: (outBounds.x + outBounds.width / 2) * canvas.pixelRatio,
                y: (outBounds.y + outBounds.height / 2) * canvas.pixelRatio
            }, 1 + spread / width, 1 + spread / height);
            return tempMatrix;
        }
        return undefined;
    }
    function drawWorldShadow(canvas, outBounds, shape) {
        const {shapeBounds: shapeBounds} = shape;
        let from, to;
        if (Platform.fullImageShadow) {
            copy(tempBounds, canvas.bounds);
            move(tempBounds, outBounds.x - shapeBounds.x, outBounds.y - shapeBounds.y);
            from = canvas.bounds, to = tempBounds;
        } else {
            from = shapeBounds, to = outBounds;
        }
        canvas.copyWorld(shape.canvas, from, to);
    }
    const {toOffsetOutBounds: toOffsetOutBounds} = BoundsHelper;
    const offsetOutBounds = {};
    function innerShadow(ui, current, shape) {
        let copyBounds, transform;
        const {__nowWorld: nowWorld} = ui;
        const {innerShadow: innerShadow} = ui.__;
        const {worldCanvas: worldCanvas, bounds: bounds, renderBounds: renderBounds, shapeBounds: shapeBounds, scaleX: scaleX, scaleY: scaleY} = shape;
        const other = current.getSameCanvas();
        const end = innerShadow.length - 1;
        toOffsetOutBounds(bounds, offsetOutBounds, renderBounds);
        innerShadow.forEach((item, index) => {
            let otherScale = 1;
            if (item.scaleFixed) {
                const sx = Math.abs(nowWorld.scaleX);
                if (sx > 1) otherScale = 1 / sx;
            }
            other.save();
            other.setWorldShadow(offsetOutBounds.offsetX + (item.x || 0) * scaleX * otherScale, offsetOutBounds.offsetY + (item.y || 0) * scaleY * otherScale, (item.blur || 0) * scaleX * otherScale);
            transform = Effect.getShadowTransform(ui, other, shape, item, offsetOutBounds, otherScale, true);
            if (transform) other.setTransform(transform);
            drawWorldShadow(other, offsetOutBounds, shape);
            other.restore();
            if (worldCanvas) {
                other.copyWorld(other, renderBounds, nowWorld, "copy");
                other.copyWorld(worldCanvas, nowWorld, nowWorld, "source-out");
                copyBounds = nowWorld;
            } else {
                other.copyWorld(shape.canvas, shapeBounds, bounds, "source-out");
                copyBounds = renderBounds;
            }
            other.fillWorld(copyBounds, ColorConvert.string(item.color), "source-in");
            LeafHelper.copyCanvasByWorld(ui, current, other, copyBounds, item.blendMode);
            if (end && index < end) other.clearWorld(copyBounds);
        });
        other.recycle(copyBounds);
    }
    const getInnerShadowSpread = getShadowRenderSpread;
    function blur(ui, current, origin) {
        const {blur: blur} = ui.__;
        origin.setWorldBlur(blur * ui.__nowWorld.a);
        origin.copyWorldToInner(current, ui.__nowWorld, ui.__layout.renderBounds);
        origin.filter = "none";
    }
    function backgroundBlur(_ui, _current, _shape) {}
    const EffectModule = {
        shadow: shadow,
        innerShadow: innerShadow,
        blur: blur,
        backgroundBlur: backgroundBlur,
        getShadowRenderSpread: getShadowRenderSpread,
        getShadowTransform: getShadowTransform,
        isTransformShadow(_shadow) {
            return undefined;
        },
        getInnerShadowSpread: getInnerShadowSpread
    };
    const {excludeRenderBounds: excludeRenderBounds} = LeafBoundsHelper;
    let usedGrayscaleAlpha;
    exports.Group.prototype.__renderMask = function(canvas, options) {
        let child, maskCanvas, contentCanvas, maskOpacity, currentMask, mask;
        const {children: children} = this;
        for (let i = 0, len = children.length; i < len; i++) {
            child = children[i], mask = child.__.mask;
            if (mask) {
                if (currentMask) {
                    maskEnd(this, currentMask, canvas, contentCanvas, maskCanvas, maskOpacity, undefined, true);
                    maskCanvas = contentCanvas = null;
                }
                if (mask === "clipping" || mask === "clipping-path") excludeRenderBounds(child, options) || child.__render(canvas, options);
                maskOpacity = child.__.opacity;
                usedGrayscaleAlpha = false;
                if (mask === "path" || mask === "clipping-path") {
                    if (maskOpacity < 1) {
                        currentMask = "opacity-path";
                        if (!contentCanvas) contentCanvas = getCanvas(canvas);
                    } else {
                        currentMask = "path";
                        canvas.save();
                    }
                    child.__clip(contentCanvas || canvas, options);
                } else {
                    currentMask = mask === "grayscale" ? "grayscale" : "alpha";
                    if (!maskCanvas) maskCanvas = getCanvas(canvas);
                    if (!contentCanvas) contentCanvas = getCanvas(canvas);
                    child.__render(maskCanvas, options);
                }
                continue;
            }
            const childBlendMode = maskOpacity === 1 && child.__.__blendMode;
            if (childBlendMode) maskEnd(this, currentMask, canvas, contentCanvas, maskCanvas, maskOpacity, undefined, false);
            excludeRenderBounds(child, options) || child.__render(contentCanvas || canvas, options);
            if (childBlendMode) maskEnd(this, currentMask, canvas, contentCanvas, maskCanvas, maskOpacity, childBlendMode, false);
        }
        maskEnd(this, currentMask, canvas, contentCanvas, maskCanvas, maskOpacity, undefined, true);
    };
    function maskEnd(leaf, maskMode, canvas, contentCanvas, maskCanvas, maskOpacity, blendMode, recycle) {
        switch (maskMode) {
          case "grayscale":
            if (!usedGrayscaleAlpha) usedGrayscaleAlpha = true, maskCanvas.useGrayscaleAlpha(leaf.__nowWorld);

          case "alpha":
            usePixelMask(leaf, canvas, contentCanvas, maskCanvas, blendMode, recycle);
            break;

          case "opacity-path":
            copyContent(leaf, canvas, contentCanvas, maskOpacity, blendMode, recycle);
            break;

          case "path":
            if (recycle) canvas.restore();
        }
    }
    function getCanvas(canvas) {
        return canvas.getSameCanvas(false, true);
    }
    function usePixelMask(leaf, canvas, content, mask, blendMode, recycle) {
        const realBounds = leaf.__nowWorld;
        content.resetTransform();
        content.opacity = 1;
        content.useMask(mask, realBounds);
        if (recycle) mask.recycle(realBounds);
        copyContent(leaf, canvas, content, 1, blendMode, recycle);
    }
    function copyContent(leaf, canvas, content, maskOpacity, blendMode, recycle) {
        const realBounds = leaf.__nowWorld;
        canvas.resetTransform();
        canvas.opacity = maskOpacity;
        canvas.copyWorld(content, realBounds, undefined, blendMode);
        recycle ? content.recycle(realBounds) : content.clearWorld(realBounds);
    }
    const money = "¥￥＄€£￡¢￠";
    const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    const langBefore = "《（「〈『〖【〔｛┌＜‘“＝" + money;
    const langAfter = "》）」〉』〗】〕｝┐＞’”！？，、。：；‰";
    const langSymbol = "≮≯≈≠＝…";
    const langBreak$1 = "—／～｜┆·";
    const beforeChar = "{[(<'\"" + langBefore;
    const afterChar = ">)]}%!?,.:;'\"" + langAfter;
    const symbolChar = afterChar + "_#~&*+\\=|" + langSymbol;
    const breakChar = "- " + langBreak$1;
    const cjkRangeList = [ [ 19968, 40959 ], [ 13312, 19903 ], [ 131072, 173791 ], [ 173824, 177983 ], [ 177984, 178207 ], [ 178208, 183983 ], [ 183984, 191471 ], [ 196608, 201551 ], [ 201552, 205743 ], [ 11904, 12031 ], [ 12032, 12255 ], [ 12272, 12287 ], [ 12288, 12351 ], [ 4352, 4607 ], [ 12352, 12447 ], [ 12448, 12543 ], [ 12544, 12591 ], [ 12592, 12687 ], [ 12688, 12703 ], [ 12704, 12735 ], [ 12784, 12799 ], [ 12736, 12783 ], [ 12800, 13055 ], [ 13056, 13311 ], [ 63744, 64255 ], [ 65072, 65103 ], [ 127488, 127743 ], [ 194560, 195103 ] ];
    const cjkReg = new RegExp(cjkRangeList.map(([start, end]) => `[\\u{${start.toString(16)}}-\\u{${end.toString(16)}}]`).join("|"), "u");
    function mapChar(str) {
        const map = {};
        str.split("").forEach(char => map[char] = true);
        return map;
    }
    const letterMap = mapChar(letter);
    const beforeMap = mapChar(beforeChar);
    const afterMap = mapChar(afterChar);
    const symbolMap = mapChar(symbolChar);
    const breakMap = mapChar(breakChar);
    var CharType;
    (function(CharType) {
        CharType[CharType["Letter"] = 0] = "Letter";
        CharType[CharType["Single"] = 1] = "Single";
        CharType[CharType["Before"] = 2] = "Before";
        CharType[CharType["After"] = 3] = "After";
        CharType[CharType["Symbol"] = 4] = "Symbol";
        CharType[CharType["Break"] = 5] = "Break";
    })(CharType || (CharType = {}));
    const {Letter: Letter$1, Single: Single$1, Before: Before$1, After: After$1, Symbol: Symbol$1, Break: Break$1} = CharType;
    function getCharType(char) {
        if (letterMap[char]) {
            return Letter$1;
        } else if (breakMap[char]) {
            return Break$1;
        } else if (beforeMap[char]) {
            return Before$1;
        } else if (afterMap[char]) {
            return After$1;
        } else if (symbolMap[char]) {
            return Symbol$1;
        } else if (cjkReg.test(char)) {
            return Single$1;
        } else {
            return Letter$1;
        }
    }
    const TextRowHelper = {
        trimRight(row) {
            const {words: words} = row;
            let trimRight = 0, len = words.length, char;
            for (let i = len - 1; i > -1; i--) {
                char = words[i].data[0];
                if (char.char === " ") {
                    trimRight++;
                    row.width -= char.width;
                } else {
                    break;
                }
            }
            if (trimRight) words.splice(len - trimRight, trimRight);
        }
    };
    function getTextCase(char, textCase, firstChar) {
        switch (textCase) {
          case "title":
            return firstChar ? char.toUpperCase() : char;

          case "upper":
            return char.toUpperCase();

          case "lower":
            return char.toLowerCase();

          default:
            return char;
        }
    }
    const {trimRight: trimRight} = TextRowHelper;
    const {Letter: Letter, Single: Single, Before: Before, After: After, Symbol: Symbol, Break: Break} = CharType;
    let word, row, wordWidth, rowWidth, realWidth;
    let char, charWidth, startCharSize, charSize, charType, lastCharType, langBreak, afterBreak, paraStart;
    let textDrawData, rows = [], bounds, findMaxWidth;
    function createRows(drawData, content, style) {
        textDrawData = drawData;
        rows = drawData.rows;
        bounds = drawData.bounds;
        findMaxWidth = !bounds.width && !style.autoSizeAlign;
        const {paraIndent: paraIndent, textCase: textCase} = style;
        const {canvas: canvas} = Platform, {width: width} = bounds;
        if (style.__isCharMode) {
            const wrap = style.textWrap !== "none";
            const breakAll = style.textWrap === "break";
            const letterSpacing = style.__letterSpacing;
            const wordSpacing = style.__wordSpacing;
            paraStart = true;
            lastCharType = null;
            startCharSize = charWidth = charSize = wordWidth = rowWidth = 0;
            word = {
                data: []
            }, row = {
                words: []
            };
            content = [ ...content ];
            for (let i = 0, len = content.length; i < len; i++) {
                char = content[i];
                if (char === "\n") {
                    if (wordWidth) addWord();
                    row.paraEnd = true;
                    addRow();
                    paraStart = true;
                } else {
                    charType = getCharType(char);
                    if (charType === Letter && textCase !== "none") char = getTextCase(char, textCase, !wordWidth);
                    charWidth = canvas.measureText(char).width;
                    if (letterSpacing) {
                        if (letterSpacing < 0) charSize = charWidth;
                        charWidth += letterSpacing;
                    }
                    langBreak = charType === Single && (lastCharType === Single || lastCharType === Letter) || lastCharType === Single && charType !== After;
                    afterBreak = (charType === Before || charType === Single) && (lastCharType === Symbol || lastCharType === After);
                    realWidth = paraStart && paraIndent ? width - paraIndent : width;
                    if (wrap && (width && rowWidth + wordWidth + charWidth > realWidth)) {
                        if (breakAll) {
                            if (wordWidth) addWord();
                            if (rowWidth) addRow();
                        } else {
                            if (!afterBreak) afterBreak = charType === Letter && lastCharType == After;
                            if (langBreak || afterBreak || charType === Break || charType === Before || charType === Single || wordWidth + charWidth > realWidth) {
                                if (wordWidth) addWord();
                                if (rowWidth) addRow();
                            } else {
                                if (rowWidth) addRow();
                            }
                        }
                    }
                    if (char === " " && paraStart !== true && rowWidth + wordWidth === 0) ; else {
                        if (charType === Break) {
                            if (char === " " && wordWidth) addWord(wordSpacing);
                            addChar(char, charWidth);
                            addWord();
                        } else if (langBreak || afterBreak) {
                            if (wordWidth) addWord(wordSpacing);
                            addChar(char, charWidth);
                        } else {
                            addChar(char, charWidth);
                        }
                    }
                    lastCharType = charType;
                }
            }
            if (wordWidth) addWord();
            if (rowWidth) addRow();
            rows.length > 0 && (rows[rows.length - 1].paraEnd = true);
        } else {
            content.split("\n").forEach(content => {
                textDrawData.paraNumber++;
                rowWidth = canvas.measureText(content).width;
                rows.push({
                    x: paraIndent || 0,
                    text: content,
                    width: rowWidth,
                    paraStart: true
                });
                if (findMaxWidth) setMaxWidth();
            });
        }
    }
    function addChar(char, width) {
        if (charSize && !startCharSize) startCharSize = charSize;
        word.data.push({
            char: char,
            width: width
        });
        wordWidth += width;
    }
    function addWord(wordSpacing) {
        if (wordSpacing) {
            rowWidth += wordSpacing;
            word.addWidth = wordSpacing;
        }
        rowWidth += wordWidth;
        word.width = wordWidth;
        row.words.push(word);
        word = {
            data: []
        };
        wordWidth = 0;
    }
    function addRow() {
        if (paraStart) {
            textDrawData.paraNumber++;
            row.paraStart = true;
            paraStart = false;
        }
        if (charSize) {
            row.startCharSize = startCharSize;
            row.endCharSize = charSize;
            startCharSize = 0;
        }
        row.width = rowWidth;
        if (bounds.width) trimRight(row); else if (findMaxWidth) setMaxWidth();
        rows.push(row);
        row = {
            words: []
        };
        rowWidth = 0;
    }
    function setMaxWidth() {
        if (rowWidth > (textDrawData.maxWidth || 0)) textDrawData.maxWidth = rowWidth;
    }
    const CharMode = 0;
    const WordMode = 1;
    const TextMode = 2;
    function layoutChar(drawData, style, width, _height) {
        const {rows: rows} = drawData;
        const {textAlign: textAlign, paraIndent: paraIndent} = style;
        const useLetter = style.__letterSpacing || style.motionText;
        const wordSpacing = style.__wordSpacing;
        const justifyLast = width && textAlign.includes("both");
        const justify = justifyLast || width && textAlign.includes("justify");
        const justifyLetter = justify && textAlign.includes("letter");
        let charX, remainingWidth, addWordWidth, addLetterWidth, indentWidth, mode, wordChar, wordsLength, isLastWord, canJustify;
        rows.forEach(row => {
            if (row.words) {
                indentWidth = paraIndent && row.paraStart ? paraIndent : 0, wordsLength = row.words.length;
                if (justify) {
                    canJustify = !row.paraEnd || justifyLast;
                    remainingWidth = width - row.width - indentWidth;
                    if (justifyLetter) addLetterWidth = remainingWidth / (row.words.reduce((total, item) => total + item.data.length, 0) - 1); else addWordWidth = wordsLength > 1 ? remainingWidth / (wordsLength - 1) : 0;
                }
                mode = useLetter || row.isOverflow || justifyLetter ? CharMode : addWordWidth || wordSpacing ? WordMode : TextMode;
                if (row.isOverflow && !useLetter) row.textMode = true;
                if (mode === TextMode) {
                    row.x += indentWidth;
                    toTextChar$1(row);
                } else {
                    row.x += indentWidth;
                    charX = row.x;
                    row.data = [];
                    row.words.forEach((word, index) => {
                        if (mode === WordMode) {
                            wordChar = {
                                char: "",
                                x: charX
                            };
                            charX = toWordChar(word.data, charX, wordChar);
                            if (row.isOverflow || wordChar.char !== " ") row.data.push(wordChar);
                        } else {
                            charX = toChar(word.data, charX, row.data, row.isOverflow, canJustify && addLetterWidth);
                        }
                        if (word.addWidth) charX += word.addWidth;
                        if (canJustify) {
                            isLastWord = index === wordsLength - 1;
                            if (addWordWidth) {
                                if (!isLastWord) charX += addWordWidth, row.width += addWordWidth;
                            } else if (addLetterWidth) {
                                row.width += addLetterWidth * (word.data.length - (isLastWord ? 1 : 0));
                            }
                        }
                    });
                }
                row.words = null;
            }
        });
    }
    function toTextChar$1(row) {
        row.text = "";
        row.words.forEach(word => {
            word.data.forEach(char => {
                row.text += char.char;
            });
        });
    }
    function toWordChar(data, charX, wordChar) {
        data.forEach(char => {
            wordChar.char += char.char;
            charX += char.width;
        });
        return charX;
    }
    function toChar(data, charX, rowData, isOverflow, addLetterWidth) {
        data.forEach(char => {
            if (isOverflow || char.char !== " ") {
                char.x = charX;
                rowData.push(char);
            }
            charX += char.width;
            addLetterWidth && (charX += addLetterWidth);
        });
        return charX;
    }
    function layoutText(drawData, style) {
        const {rows: rows, bounds: bounds} = drawData, countRows = rows.length;
        const {__lineHeight: __lineHeight, __baseLine: __baseLine, __letterSpacing: __letterSpacing, __clipText: __clipText, textAlign: textAlign, verticalAlign: verticalAlign, paraSpacing: paraSpacing, autoSizeAlign: autoSizeAlign} = style;
        let {x: x, y: y, width: width, height: height} = bounds, realHeight = __lineHeight * countRows + (paraSpacing ? paraSpacing * (drawData.paraNumber - 1) : 0);
        let starY = __baseLine;
        if (__clipText && realHeight > height) {
            realHeight = Math.max(style.__autoHeight ? realHeight : height, __lineHeight);
            if (countRows > 1) drawData.overflow = countRows;
        } else if (height || autoSizeAlign) {
            switch (verticalAlign) {
              case "middle":
                y += (height - realHeight) / 2;
                break;

              case "bottom":
                y += height - realHeight;
            }
        }
        starY += y;
        let row, rowX, rowWidth, layoutWidth = width || autoSizeAlign ? width : drawData.maxWidth;
        for (let i = 0, len = countRows; i < len; i++) {
            row = rows[i];
            row.x = x;
            if (row.width < width || row.width > width && !__clipText) {
                switch (textAlign) {
                  case "center":
                    row.x += (layoutWidth - row.width) / 2;
                    break;

                  case "right":
                    row.x += layoutWidth - row.width;
                }
            }
            if (row.paraStart && paraSpacing && i > 0) starY += paraSpacing;
            row.y = starY;
            starY += __lineHeight;
            if (drawData.overflow > i && starY > realHeight) {
                row.isOverflow = true;
                drawData.overflow = i + 1;
            }
            rowX = row.x;
            rowWidth = row.width;
            if (__letterSpacing < 0) {
                if (row.width < 0) {
                    rowWidth = -row.width + style.fontSize + __letterSpacing;
                    rowX -= rowWidth;
                    rowWidth += style.fontSize;
                } else {
                    rowWidth -= __letterSpacing;
                }
            }
            if (rowX < bounds.x) bounds.x = rowX;
            if (rowWidth > bounds.width) bounds.width = rowWidth;
            if (__clipText && width && width < rowWidth) {
                row.isOverflow = true;
                if (!drawData.overflow) drawData.overflow = rows.length;
            }
        }
        bounds.y = y;
        bounds.height = realHeight;
    }
    function clipText(drawData, style, x, width) {
        const {rows: rows, overflow: overflow} = drawData;
        let {textOverflow: textOverflow} = style;
        if (overflow) rows.splice(overflow);
        if (!width) return;
        if (textOverflow && textOverflow !== "show") {
            if (textOverflow === "hide") textOverflow = ""; else if (textOverflow === "ellipsis") textOverflow = "...";
            let char, charRight;
            const ellipsisWidth = textOverflow ? Platform.canvas.measureText(textOverflow).width : 0;
            const right = x + width - ellipsisWidth;
            const list = style.textWrap === "none" ? rows : [ rows[overflow - 1] ];
            list.forEach(row => {
                if (row.isOverflow && row.data) {
                    let end = row.data.length - 1;
                    for (let i = end; i > -1; i--) {
                        char = row.data[i];
                        charRight = char.x + char.width;
                        if (i === end && charRight < right) {
                            break;
                        } else if (charRight < right && char.char !== " " || !i) {
                            row.data.splice(i + 1);
                            row.width -= char.width;
                            break;
                        }
                        row.width -= char.width;
                    }
                    row.width += ellipsisWidth;
                    row.data.push({
                        char: textOverflow,
                        x: charRight
                    });
                    if (row.textMode) toTextChar(row);
                }
            });
        }
    }
    function toTextChar(row) {
        row.text = "";
        row.data.forEach(char => {
            row.text += char.char;
        });
        row.data = null;
    }
    function decorationText(drawData, style) {
        let type, offset = 0;
        const {fontSize: fontSize, textDecoration: textDecoration} = style;
        drawData.decorationHeight = fontSize / 11;
        if (isObject(textDecoration)) {
            type = textDecoration.type;
            if (textDecoration.color) drawData.decorationColor = ColorConvert.string(textDecoration.color);
            if (textDecoration.offset) offset = Math.min(fontSize * .3, Math.max(textDecoration.offset, -fontSize * .15));
        } else type = textDecoration;
        switch (type) {
          case "under":
            drawData.decorationY = [ fontSize * .15 + offset ];
            break;

          case "delete":
            drawData.decorationY = [ -fontSize * .35 ];
            break;

          case "under-delete":
            drawData.decorationY = [ fontSize * .15 + offset, -fontSize * .35 ];
        }
    }
    const {top: top, right: right, bottom: bottom, left: left} = exports.Direction4;
    function getDrawData(content, style) {
        if (!isString(content)) content = String(content);
        let x = 0, y = 0;
        let width = style.__getInput("width") || 0;
        let height = style.__getInput("height") || 0;
        const {__padding: padding} = style;
        if (style.motionText) width = height = 0;
        if (padding) {
            if (width) x = padding[left], width -= padding[right] + padding[left], !width && (width = .01); else if (!style.autoSizeAlign) x = padding[left];
            if (height) y = padding[top], height -= padding[top] + padding[bottom], !height && (height = .01); else if (!style.autoSizeAlign) y = padding[top];
        }
        const drawData = {
            bounds: {
                x: x,
                y: y,
                width: width,
                height: height
            },
            rows: [],
            paraNumber: 0,
            font: Platform.canvas.font = style.__font
        };
        createRows(drawData, content, style);
        if (padding) padAutoText(padding, drawData, style, width, height);
        layoutText(drawData, style);
        if (style.__isCharMode) layoutChar(drawData, style, width);
        if (drawData.overflow) clipText(drawData, style, x, width);
        if (style.textDecoration !== "none") decorationText(drawData, style);
        return drawData;
    }
    function padAutoText(padding, drawData, style, width, height) {
        if (!width && style.autoSizeAlign) {
            switch (style.textAlign) {
              case "left":
                offsetText(drawData, "x", padding[left]);
                break;

              case "right":
                offsetText(drawData, "x", -padding[right]);
            }
        }
        if (!height && style.autoSizeAlign) {
            switch (style.verticalAlign) {
              case "top":
                offsetText(drawData, "y", padding[top]);
                break;

              case "bottom":
                offsetText(drawData, "y", -padding[bottom]);
            }
        }
    }
    function offsetText(drawData, attrName, value) {
        const {bounds: bounds, rows: rows} = drawData;
        bounds[attrName] += value;
        for (let i = 0; i < rows.length; i++) rows[i][attrName] += value;
    }
    const TextConvertModule = {
        getDrawData: getDrawData
    };
    function string(color, opacity) {
        if (!color) return "#000";
        const doOpacity = isNumber(opacity) && opacity < 1;
        if (isString(color)) {
            if (doOpacity && ColorConvert.object) color = ColorConvert.object(color); else return color;
        }
        let a = isUndefined(color.a) ? 1 : color.a;
        if (doOpacity) a *= opacity;
        const rgb = color.r + "," + color.g + "," + color.b;
        return a === 1 ? "rgb(" + rgb + ")" : "rgba(" + rgb + "," + a + ")";
    }
    const ColorConvertModule = {
        string: string
    };
    Object.assign(TextConvert, TextConvertModule);
    Object.assign(ColorConvert, ColorConvertModule);
    Object.assign(Paint, PaintModule);
    Object.assign(PaintImage, PaintImageModule);
    Object.assign(PaintGradient, PaintGradientModule);
    Object.assign(Effect, EffectModule);
    Object.assign(Creator, {
        interaction: (target, canvas, selector, options) => new Interaction(target, canvas, selector, options),
        hitCanvas: (options, manager) => new LeaferCanvas(options, manager),
        hitCanvasManager: () => new HitCanvasManager
    });
    useCanvas();
    exports.AlignHelper = AlignHelper;
    exports.AroundHelper = AroundHelper;
    exports.AutoBounds = AutoBounds;
    exports.BezierHelper = BezierHelper;
    exports.Bounds = Bounds;
    exports.BoundsEvent = BoundsEvent;
    exports.BoundsHelper = BoundsHelper;
    exports.BoxData = BoxData;
    exports.BranchHelper = BranchHelper;
    exports.BranchRender = BranchRender;
    exports.CanvasData = CanvasData;
    exports.CanvasManager = CanvasManager;
    exports.ChildEvent = ChildEvent;
    exports.ColorConvert = ColorConvert;
    exports.Creator = Creator;
    exports.Cursor = Cursor;
    exports.DataHelper = DataHelper;
    exports.Debug = Debug;
    exports.DragBoundsHelper = DragBoundsHelper;
    exports.Dragger = Dragger;
    exports.Effect = Effect;
    exports.EllipseData = EllipseData;
    exports.EllipseHelper = EllipseHelper;
    exports.Event = Event;
    exports.EventCreator = EventCreator;
    exports.Eventer = Eventer;
    exports.Export = Export;
    exports.FileHelper = FileHelper;
    exports.Filter = Filter;
    exports.FourNumberHelper = FourNumberHelper;
    exports.FrameData = FrameData;
    exports.GroupData = GroupData;
    exports.HitCanvasManager = HitCanvasManager;
    exports.ImageData = ImageData;
    exports.ImageEvent = ImageEvent;
    exports.ImageManager = ImageManager;
    exports.IncrementId = IncrementId;
    exports.Interaction = Interaction;
    exports.InteractionBase = InteractionBase;
    exports.InteractionHelper = InteractionHelper;
    exports.Keyboard = Keyboard;
    exports.LayoutEvent = LayoutEvent;
    exports.Layouter = Layouter;
    exports.LayouterHelper = LayouterHelper;
    exports.LeafBounds = LeafBounds;
    exports.LeafBoundsHelper = LeafBoundsHelper;
    exports.LeafData = LeafData;
    exports.LeafDataProxy = LeafDataProxy;
    exports.LeafEventer = LeafEventer;
    exports.LeafHelper = LeafHelper;
    exports.LeafLayout = LeafLayout;
    exports.LeafLevelList = LeafLevelList;
    exports.LeafList = LeafList;
    exports.LeafMatrix = LeafMatrix;
    exports.LeafRender = LeafRender;
    exports.LeaferCanvas = LeaferCanvas;
    exports.LeaferCanvasBase = LeaferCanvasBase;
    exports.LeaferData = LeaferData;
    exports.LeaferEvent = LeaferEvent;
    exports.LeaferFilm = LeaferFilm;
    exports.LeaferImage = LeaferImage;
    exports.LeaferVideo = LeaferVideo;
    exports.LineData = LineData;
    exports.MathHelper = MathHelper;
    exports.Matrix = Matrix;
    exports.MatrixHelper = MatrixHelper;
    exports.MyDragEvent = MyDragEvent;
    exports.MyImage = MyImage;
    exports.MyPointerEvent = MyPointerEvent;
    exports.MyTouchEvent = MyTouchEvent;
    exports.NeedConvertToCanvasCommandMap = NeedConvertToCanvasCommandMap;
    exports.OneRadian = OneRadian;
    exports.PI2 = PI2;
    exports.PI_2 = PI_2;
    exports.Paint = Paint;
    exports.PaintGradient = PaintGradient;
    exports.PaintImage = PaintImage;
    exports.PathArrow = PathArrow;
    exports.PathBounds = PathBounds;
    exports.PathCommandDataHelper = PathCommandDataHelper;
    exports.PathCommandMap = PathCommandMap;
    exports.PathCommandNodeHelper = PathCommandNodeHelper;
    exports.PathConvert = PathConvert;
    exports.PathCorner = PathCorner;
    exports.PathCreator = PathCreator;
    exports.PathData = PathData;
    exports.PathDrawer = PathDrawer;
    exports.PathHelper = PathHelper;
    exports.PathNumberCommandLengthMap = PathNumberCommandLengthMap;
    exports.PathNumberCommandMap = PathNumberCommandMap;
    exports.PenData = PenData;
    exports.Picker = Picker;
    exports.Platform = Platform;
    exports.Plugin = Plugin;
    exports.Point = Point;
    exports.PointHelper = PointHelper;
    exports.PointerButton = PointerButton;
    exports.PolygonData = PolygonData;
    exports.PropertyEvent = PropertyEvent;
    exports.RectData = RectData;
    exports.RectHelper = RectHelper;
    exports.RectRender = RectRender;
    exports.RenderEvent = RenderEvent;
    exports.Renderer = Renderer;
    exports.ResizeEvent = ResizeEvent;
    exports.Resource = Resource;
    exports.Run = Run;
    exports.Selector = Selector;
    exports.StarData = StarData;
    exports.State = State;
    exports.StringNumberMap = StringNumberMap;
    exports.TaskItem = TaskItem;
    exports.TaskProcessor = TaskProcessor;
    exports.TextConvert = TextConvert;
    exports.TextData = TextData;
    exports.Transition = Transition;
    exports.TwoPointBoundsHelper = TwoPointBoundsHelper;
    exports.UIBounds = UIBounds;
    exports.UICreator = UICreator;
    exports.UIData = UIData;
    exports.UIEvent = UIEvent;
    exports.UIRender = UIRender;
    exports.UnitConvert = UnitConvert;
    exports.UnitConvertHelper = UnitConvertHelper;
    exports.WaitHelper = WaitHelper;
    exports.WatchEvent = WatchEvent;
    exports.Watcher = Watcher;
    exports.affectRenderBoundsType = affectRenderBoundsType;
    exports.affectStrokeBoundsType = affectStrokeBoundsType;
    exports.attr = attr;
    exports.autoLayoutType = autoLayoutType;
    exports.boundsType = boundsType;
    exports.canvasPatch = canvasPatch;
    exports.canvasSizeAttrs = canvasSizeAttrs;
    exports.createAttr = createAttr;
    exports.createDescriptor = createDescriptor;
    exports.cursorType = cursorType;
    exports.dataProcessor = dataProcessor;
    exports.dataType = dataType;
    exports.decorateLeafAttr = decorateLeafAttr;
    exports.defineDataProcessor = defineDataProcessor;
    exports.defineKey = defineKey;
    exports.defineLeafAttr = defineLeafAttr;
    exports.dimType = dimType;
    exports.doBoundsType = doBoundsType;
    exports.doStrokeType = doStrokeType;
    exports.doSurfaceType = doSurfaceType;
    exports.effectType = effectType;
    exports.emptyData = emptyData;
    exports.eraserType = eraserType;
    exports.extraPropertyEventMap = extraPropertyEventMap;
    exports.frameType = frameType;
    exports.getBoundsData = getBoundsData;
    exports.getDescriptor = getDescriptor;
    exports.getMatrixData = getMatrixData;
    exports.getPointData = getPointData;
    exports.hitType = hitType;
    exports.isArray = isArray;
    exports.isData = isData;
    exports.isEmptyData = isEmptyData;
    exports.isFinite = isFinite;
    exports.isNull = isNull;
    exports.isNumber = isNumber;
    exports.isObject = isObject;
    exports.isString = isString;
    exports.isTrackChanges = isTrackChanges;
    exports.isUndefined = isUndefined;
    exports.layoutProcessor = layoutProcessor;
    exports.leaferTransformAttrMap = leaferTransformAttrMap;
    exports.maskType = maskType;
    exports.naturalBoundsType = naturalBoundsType;
    exports.opacityType = opacityType;
    exports.path = path;
    exports.pathInputType = pathInputType;
    exports.pathType = pathType;
    exports.pen = pen;
    exports.positionType = positionType;
    exports.registerPointsCurve = registerPointsCurve;
    exports.registerUI = registerUI;
    exports.registerUIEvent = registerUIEvent;
    exports.resizeType = resizeType;
    exports.rewrite = rewrite;
    exports.rewriteAble = rewriteAble;
    exports.rotationType = rotationType;
    exports.scaleType = scaleType;
    exports.scrollType = scrollType;
    exports.sortType = sortType;
    exports.strokeType = strokeType;
    exports.surfaceType = surfaceType;
    exports.tempBounds = tempBounds$2;
    exports.tempMatrix = tempMatrix$2;
    exports.tempPoint = tempPoint$4;
    exports.tryToNumber = tryToNumber;
    exports.useCanvas = useCanvas;
    exports.useModule = useModule;
    exports.version = version;
    exports.visibleType = visibleType;
    exports.zoomLayerType = zoomLayerType;
    return exports;
}({});

function Leafer(opt) {
    return new LeaferUI.Leafer(opt);
}

Object.setPrototypeOf(Leafer, LeaferUI);

Leafer.prototype = LeaferUI.Leafer.prototype;
