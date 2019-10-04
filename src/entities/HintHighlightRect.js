import Maths from '../joseki/Maths';
import Entity from '../joseki/Entity';
import Vector from '../joseki/Vector';
import _ from '../joseki/underscore';

class HintHighlightRect {
	constructor(x, y, width, height, ping=true) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.ping = ping;

		this.pingAlpha1 = 1;
		this.pingAlpha2 = 1;
	}

	update(game) {
		if (this.ping) {
			this.pingAlpha1 = Maths.lerp(this.pingAlpha1, 0, 0.05, 0.01);
			this.pingAlpha2 = Maths.lerp(this.pingAlpha2, 0, 0.03, 0.05);
		}
	}

	render(canvas, game) {
		var x = canvas.topLeft.x + this.x * canvas.scale;
		var y = canvas.topLeft.y + this.y * canvas.scale;
		var width = this.width * canvas.scale;
		var height = this.height * canvas.scale;

		canvas.ctx.clearRect(x, y, width, height);

		if (!this.ping) return;

		canvas.drawRect(this.x, this.y, this.width, this.height, {
			fillAlpha: 0,
			strokeColor: game.textColor,
			strokeAlpha: this.pingAlpha1
		});

		return;

		const mx = this.x + this.width * 0.5;
		const my = this.y + this.height * 0.5;

		const r = (1 - this.pingAlpha2) * 0.05 * this.width;

		canvas.drawRect(
			mx - (this.width + r) * 0.5,
			my - (this.height + r) * 0.5,
			this.width + r,
			this.height + r,
			{
				fillAlpha: 0,
				strokeColor: game.textColor,
				strokeAlpha: this.pingAlpha2
			}
		);
	}
}

export default HintHighlightRect;