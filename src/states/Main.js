import _ from '../joseki/underscore';
import Vector from '../joseki/Vector';
import Maths from '../joseki/Maths';
import State from '../joseki/State';
import Grid from '../joseki/Grid';

import Mote from '../entities/Mote';

class Main extends State {
	constructor() {
		super('main');
	}

	init() {
		super.init();
	}

	enter(game) {
		super.enter(game);
		this.canvas = this.game.getCanvas('game');
		this.grid = new Grid(0, 0, 64);
		this.grid.populate(this.game.width / this.grid.size, this.game.height / this.grid.size);
		this.populate();
	}

	populate() {
		_.loop(128, () => {
			var x = Math.random() * this.game.width;
			var y = Math.random() * this.game.height;

			const mote = new Mote(this, 'game', new Vector(x, y));
			this.game.addEntity(mote);
		});
	}

	update() {
		super.update();
	}

	render() {
		this.renderGrid();
	}

	renderGrid() {
		this.grid.each((cell) => {
			this.canvas.drawRect(
				cell.position.x,
				cell.position.y,
				cell.size,
				cell.size,
				{
					strokeAlpha: 0.1,
					fillAlpha: 0,
					strokeColor: this.game.textColor,
					fillColor: this.game.textColor,
				}
			);
		});
	}

	exit() {
		super.exit();
	}
}

export default Main;
