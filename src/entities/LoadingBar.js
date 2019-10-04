import Entity from '../joseki/Entity';
import Maths from '../joseki/Maths';
import _ from '../joseki/underscore';
import Vector from '../joseki/Vector';
import Rainbow from '../joseki/Entities/Rainbow';

class LoadingBar extends Entity {
	constructor(main, canvas, radius, padding, position, length, getValue, add=true) {
		super(main.game, canvas);
		this.position = position;
		if (add) main.game.entities.push(this);
		this.value = 0;
		this.length = length;
		this.lengthTarget = length;
		this.radius = radius;
		this.padding = padding;
		this.getValue = getValue;
		this.drawBothThreshold = 0.1;
		this.rainbow = new Rainbow();
		this.speed = 1;
		this.instant = false;
		this.x = this.position.x + this.lengthTarget * 0.5;
	}

	update() {
		this.length = Maths.lerp(this.length, this.lengthTarget, 0.15);
		this.position.x = this.x - this.length * 0.5;

		if (this.instant) {
			this.value = this.getValue();
		} else {
			this.value = Maths.towardsValue(this.value, this.speed * this.game.delta, this.getValue());
		}
		this.rainbow.update(this.game.delta);
	}

	render() {
		const left = this.position;
		const right = this.position.add(new Vector(this.length, 0));

		const tint = this.tint || this.game.textColor;

		if (this.drawBack) {
			// Draw the left circle
			this.canvas.drawCircle(
				left,
				this.radius + this.backPadding,
				this.game.backColor,
				undefined,
				1,
				0
			);

			// Draw the sides
			this.canvas.fillRect(
				left.x,
				left.y - (this.radius + this.backPadding),
				right.x - left.x,
				(this.radius + this.backPadding) * 2,
				this.game.backColor,
				1
			);

			// Draw the right circle
			this.canvas.drawCircle(
				right,
				this.radius + this.backPadding,
				this.game.backColor,
				undefined,
				1,
				0
			);
		}

		// Draw the left arc
		this.canvas.drawCircle(
			left,
			this.radius,
			undefined,
			tint,
			0,
			1,
			-Math.PI * 0.5,
			-Math.PI * 1.5,
			true,
			4
		);
		// Draw the sides
		this.canvas.drawLine(
			left.x,
			left.y - this.radius,
			right.x,
			right.y - this.radius,
			tint,
			1,
			4
		);

		this.canvas.drawLine(
			left.x,
			left.y + this.radius,
			right.x,
			right.y + this.radius,
			tint,
			1,
			4
		);
		// Draw the right arc
		this.canvas.drawCircle(
			right,
			this.radius,
			undefined,
			tint,
			0,
			1,
			-Math.PI * 0.5,
			-Math.PI * 1.5,
			false,
			4
		);
		// Draw the first circle\
		// const barColor = this.value == 1 ? this.rainbow.color : tint;
		const barColor = tint;
		const r = this.value < this.drawBothThreshold ? (this.value / this.drawBothThreshold) : 1;
		this.canvas.drawCircle(
			left,
			(this.radius - this.padding) * r,
			barColor,
			undefined,
			1,
			0
		);
		if (this.value >= this.drawBothThreshold) {
			// Draw the last circle
			const rightCirclePos = Vector.Lerp(
				left,
				right,
				(this.value - this.drawBothThreshold) / (1 - this.drawBothThreshold)
			);

			this.canvas.drawCircle(
				rightCirclePos,
				this.radius - this.padding,
				barColor,
				undefined,
				1,
				0
			);
			// Draw the inbetween
			this.canvas.fillRect(
				left.x,
				left.y - (this.radius - this.padding),
				rightCirclePos.x - left.x,
				(this.radius - this.padding) * 2,
				barColor
			);
		}
	}
}

export default LoadingBar;