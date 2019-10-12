import Maths from '../joseki/Maths';
import Entity from '../joseki/Entity';
import Vector from '../joseki/Vector';

class WrapRipple extends Entity {
	constructor(main, canvas, cell, direction) {
		super(main.game, canvas);
		this.cell = cell;
		this.alpha = 0.25;
		this.direction = direction;
		this.canvas = this.game.getCanvas(canvas);

		this.game.groups.foreground.push(this);
	}

	update() {
		this.alpha = Maths.lerp(this.alpha, 0, 0.1);
		if (this.alpha < 0.01) this.destroy();
	}

	render() {
		let p0, p1;

		if (!this.cell) return;

		switch(this.direction) {
			case 'down':
				p0 = new Vector(this.cell.position.x, this.cell.position.y);
				p1 = new Vector(this.cell.position.x + this.cell.size, this.cell.position.y);
				break;
			case 'up':
				p0 = new Vector(this.cell.position.x, this.cell.position.y + this.cell.size);
				p1 = new Vector(this.cell.position.x + this.cell.size, this.cell.position.y + this.cell.size);
				break;
			case 'left':
				p0 = new Vector(this.cell.position.x, this.cell.position.y);
				p1 = new Vector(this.cell.position.x, this.cell.position.y + this.cell.size);
				break;
			case 'right':
				p0 = new Vector(this.cell.position.x + this.cell.size, this.cell.position.y);
				p1 = new Vector(this.cell.position.x + this.cell.size, this.cell.position.y + this.cell.size);
				break;
			default:
		}

		this.canvas.drawLine(p0.x, p0.y, p1.x, p1.y, this.game.textColor, this.alpha, 2);

		// this.canvas.drawRect(
		// 	this.cell.position.x,
		// 	this.cell.position.y,
		// 	this.cell.size,
		// 	this.cell.size,
		// 	{
		// 		strokeAlpha: this.alpha,
		// 		fillAlpha: 0,
		// 		strokeColor: this.game.textColor,
		// 		fillColor: this.game.textColor,
		// 	}
		// );
	}
}

export default WrapRipple;