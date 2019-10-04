import _ from 'underscore';

class Maths {
	static GoldenRatio() {
		return 1.61803398875;
	}

	static deg2Rad(deg) {
		return deg * (Math.PI / 180);
	}

	static rad2Deg(rad) {
		return rad / (Math.PI / 180);
	}

	static clamp(value, min, max) {
		if (value < min) {
			return min;
		} else if (value > max) {
			return max;
		} else {
			return value;
		}
	}

	static towardsValue(value, amount, target) {
		if (value > target) {
			if (value - amount < target) {
				return target;
			} else {
				return value - amount;
			}
		} else if (value < target) {
			if (value + amount > target) {
				return target;
			} else {
				return value + amount;
			}
		} else {
			return value;
		}
	}

	static moveTowards(value, target, amount) {
		return Maths.towardsValue(value, amount, target);
	}

	static toZero(value, amount) {
		return Maths.towardsValue(value, amount, 0);
	}

	static remap(value, min_out, max_out, min_in=0, max_in=1) {
		const t = Maths.inverseLerp(value, min_in, max_in);
		return Maths.lerp(min_out, max_out, t);
	}

	static lerp(value, target, amount, clamp=0) {
		var total = target - value;
		if (Math.abs(total) < clamp) {
			return target;
		} else {
			return value + total * amount;
		}
	}

	static randomRange(min, max) {
		return min + Math.random() * (max - min);
	}

	static inverseLerp(value, start, end) {
		if (start == end) {
			if (value <= start) {
				return 0;
			} else {
				return 1;
			}
		} else {
			return Maths.clamp((value - start) / (end - start), 0, 1);
		}
	}

	static lerpInLerpOut(t) {
		const x = 2 * (t - 0.5);
		return Math.pow(Math.cos(Math.PI * x * 0.5), 0.5);
	}

	static lerpInLerpOut2(t) {
		const x = 2 * (t - 0.5);
		return 1 - Math.pow(Math.abs(x), 0.5);
	}

	static lerpInLerpOutVariable(t, i, o) {
		const x = 2 * (t - 0.5);
		return 1 - Math.pow(Math.abs(x), x < 0 ? i : o);
	}

	static lerpInLerpOutRange(t=0, i=1, o=1, f=0.5) {
		let x;
		if (t <= f) {
			x = Maths.remap(t, 1, 0, 0, f);
		} else {
			x = Maths.remap(t, 0, 1, f, 1);
		}

		return 1 - Math.pow(Math.abs(x), x < f ? i : o);
	}

	static accelerateIn(min, max, _t) {
		const t = 1 - Maths.clamp(_t, 0, 1);
		return Maths.lerp(
			min,
			max,
			1 - Math.pow(Math.abs(Math.sin(Math.PI * t * 0.5)), 0.5)
		);
	}

	static colorLerp(a, b, amount) {
		return Maths.lerpColor(a, b, amount);
	}

	static lerpColor(a, b, amount) { 
	    var ah = parseInt(a.replace(/#/g, ''), 16),
	        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
	        bh = parseInt(b.replace(/#/g, ''), 16),
	        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
	        rr = ar + amount * (br - ar),
	        rg = ag + amount * (bg - ag),
	        rb = ab + amount * (bb - ab);

	    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
	}
}

export default Maths;
