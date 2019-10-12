import _ from '../joseki/underscore';
import Entity from '../joseki/Entity';
import Maths from '../joseki/Maths';
import Vector from '../joseki/Vector';

class GridDweller extends Entity {
	constructor(main, canvas, position) {
		super(main.game, canvas);
		this.position = position;
		this.main = main;
		this.grid = main.grid;
		this.canvas = this.game.getCanvas(canvas);

		this.selectable = true;
		this.energy = 1;

		this.cell = this.grid.getCellFromWorldPosition(this.position);
		this.cell.dwellers.push(this);

		this.connections = [];
		this.subscribers = [];

		this.size = 16;
	}

	tickSubscribe(count, func) {
		this.subscribers.push({
			counter: count,
			count: count,
			callback: func,
		});
	}

	tick() {
		_.each(this.subscribers, (sub) => {
			sub.counter--;
			if (sub.counter <= 0) {
				sub.counter += sub.count;
				sub.callback();
			}
		});
	}

	connect(s2) {
		if (this.connections.indexOf(s2) == -1) {
			this.connections.push(s2);
		}
	}

	disconnect(s2) {
		this.connections = _.without(this.connections, s2);
	}

	update() {
		this.lastCell = this.cell;

		const cell = this.grid.getCellFromWorldPosition(this.position, false);
		if (cell != this.cell) {
			if (this.cell) this.cell.dwellers = _.without(this.cell.dwellers, this);
			this.cell = cell;
			if (this.cell) {
				this.cell.dwellers.push(this);
			}
		}
	}

	draw() {

	}

	render() {
		this.draw(new Vector(0, 0));
		if (this.position.x + this.size > this.game.width) this.draw(new Vector(-this.game.width, 0));
		if (this.position.x - this.size < 0) this.draw(new Vector(this.game.width, 0));
		if (this.position.y + this.size > this.game.height) this.draw(new Vector(0, -this.game.height));
		if (this.position.y - this.size < 0) this.draw(new Vector(0, this.game.height));

		_.each(this.connections, (s2) => {
			const alpha = Maths.remap(s2.position.distance(this.position), 0.2, 1, 512, 128);
			this.canvas.drawLine(this.position.x, this.position.y, s2.position.x, s2.position.y, this.tint || this.game.textColor, alpha, 2);
		});
	}
}

export default GridDweller;