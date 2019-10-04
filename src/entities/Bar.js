import Entity from '../joseki/Entity';
import Maths from '../joseki/Maths';
import _ from '../joseki/underscore';
import Vector from '../joseki/Vector';
import Rainbow from '../joseki/Entities/Rainbow';
import SpriteString from './SpriteString';

class Bar extends Entity {
	constructor(main, canvas, radius, length) {
		super(main.game, canvas);
		this.radius = radius;
		this.length = length;
		this.startAlpha = this.alphaTarget = 0;
		this.alphaT = 0;

		this.startValue = this.valueTarget = 0;
		this.valueT = 0;
		this.levelPoint = 0.75;

		this.rainbow = new Rainbow();

		this.combo = 10;
		this.comboCounter = new SpriteString(
			main,
			canvas,
			new Vector(main.game.width - 192 + this.radius * 2 + 16, (main.game.height * 0.5 - length * (0.5 - (1 - this.levelPoint) * 0.5))),
			this.getComboText(),
			{
				letterHeight: (128 * 0.5),
				letterPadding: 3,
				maxSize: 128 * 0.75 * this.writeScale,
				direction: 'LEFT',
				textAlignment: 'END',
				characterConversion: 'LETTER',
			}
		);
		main.game.entities.push(this.comboCounter);
		this.comboCounter.alpha = 0;
	}

	getComboText() {
		return Math.floor(this.combo).toString();
	}

	setAlphaTarget(target) {
		this.startAlpha = this.getAlpha();
		this.alphaT = 0;
		this.alphaTarget = target;
	}

	getAlpha() {
		return Maths.lerp(this.startAlpha, this.alphaTarget, this.alphaT);
	}

	setValueTarget(target) {
		this.startValue = this.getValue();
		this.valueT = 0;
		this.valueTarget = target;
	}

	getValue() {
		return Maths.lerp(this.startValue, this.valueTarget, this.valueT);
	}

	changeCombo(v, limit) {
		this.combo = Maths.clamp(this.combo + v, 0, limit);
	}

	update() {
		this.rainbow.update(this.game.delta);

		this.comboCounter.tint = this.game.textColor;

		if (this.showingCombo) {
			this.comboCounter.alpha = Maths.lerp(this.comboCounter.alpha, 1, 0.1) * this.getAlpha();
			this.comboCounter.updateText(this.getComboText());
		} else {
			this.comboCounter.alpha = Maths.lerp(this.comboCounter.alpha, 0, 0.1) * this.getAlpha();
		}

		this.alphaT = Maths.moveTowards(this.alphaT, 1, this.game.delta);
		this.valueT = Maths.moveTowards(this.valueT, 1, this.game.delta);
	}

	render() {
		const canvas = this.game.getCanvas('game');
		let start = new Vector(this.game.width - 192 + this.radius, this.game.height * 0.5 + this.length * 0.5);
		const direction = new Vector(0, -1);
		const total = this.length;
		let t = 0;
		const v = Maths.clamp(this.getValue() / 0.99, 0, 1);

		const color = v >= this.levelPoint ? this.rainbow.color : this.game.textColor;

		while (t < total) {
			canvas.sprite(
				start,
				'stripes',
				{
					tint: this.game.textColor,
					tintCache: true,
					alpha: 1,
					width: this.radius - 1,
					height: this.radius
				}
			);

			start = start.add(direction.times(this.radius));
			t += this.radius;
		}

		const value = Maths.lerp(0.0075, 1, v);

		canvas.fillRect(
			start.x - this.radius * 0.5,
			(this.game.height * 0.5 + this.length * 0.5) + this.radius * 0.5,
			this.radius,
			-(total+1) * value,
			color,
			1
		);

		if (v >= this.levelPoint) {
			canvas.fillRect(
				start.x - this.radius * 0.5,
				(this.game.height * 0.5 + this.length * 0.5) + this.radius * 0.5,
				this.radius,
				-total * this.levelPoint,
				this.game.textColor,
				1
			);
		}

		const margin = 4;
		const topValue = (total + margin * 2) * (1 - this.levelPoint) - margin * 0.5;
		const bottomValue = (total + margin * 2) * (this.levelPoint) - margin * 0.5;

		canvas.fillRect(
			start.x - (this.radius * 0.5 + margin),
			start.y + this.radius * 0.5 - margin * 2 + topValue,
			this.radius + margin * 2,
			margin * 3,
			this.game.backColor
		);

		if (this.levelPoint != 1) {
			canvas.drawRect(
				start.x - (this.radius * 0.5 + margin),
				start.y + this.radius * 0.5 - margin,
				this.radius + margin * 2,
				topValue,
				{
					fillAlpha: 0,
					strokeColor: this.game.textColor,
					strokeAlpha: this.getAlpha(),
					strokeWidth: 2
				}
			);
		}
		
		canvas.drawRect(
			start.x - (this.radius * 0.5 + margin),
			start.y + this.radius * 0.5 - margin + topValue + margin,
			this.radius + margin * 2,
			bottomValue,
			{
				fillAlpha: 0,
				strokeColor: this.game.textColor,
				strokeAlpha: 1,
				strokeWidth: 2
			}
		);

		const b = 8;

		canvas.fillRect(
			start.x - (this.radius * 0.5 + b),
			(this.game.height * 0.5 + this.length * 0.5) + this.radius * 0.5 + b,
			this.radius + b * 2,
			-(total + b * 2),
			this.game.backColor,
			1 - this.getAlpha()
		);
	}

	destroy() {
		this.comboCounter.destroy();
		super.destroy();
	}
}

export default Bar;