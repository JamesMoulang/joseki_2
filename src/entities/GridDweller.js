import Entity from '../joseki/Entity';

class GridDweller extends Entity {
	constructor(main, canvas, position) {
		super(main.game, canvas);
		this.position = position;
		this.main = main;
		this.grid = main.grid;
		this.canvas = this.game.getCanvas(canvas);

		this.cell = this.grid.getCellFromWorldPosition(this.position);
	}

	update() {
		const cell = this.grid.getCellFromWorldPosition(this.position);
		if (cell != this.cell) {
			this.cell = cell;
		}
	}
}

export default GridDweller;