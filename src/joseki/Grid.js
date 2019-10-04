import Cell from './Cell';
import Vector from './Vector';
import _ from './underscore';

class Grid {
	constructor(x, y, size) {
		this.position = new Vector(x, y);
		this.size = size;
		this.cells = {};
	}

	each(callback) {
		_.each(this.cells, (column) => {
			_.each(column, (cell) => {
				callback(cell);
			});
		});
	}

	getCell(x, y) {
		if (!this.cells[x]) {
			this.cells[x] = {};
		}

		if (!this.cells[x][y]) {
			this.cells[x][y] = new Cell(
				x,
				y,
				this.position.add(new Vector(x*this.size, y*this.size)),
				this.size
			);
		}

		return this.cells[x][y];
	}

	getCellFromWorldPosition(pos) {
		const toPos = pos.minus(this.position);
		return this.getCell(
			Math.floor(toPos.x / this.size),
			Math.floor(toPos.y / this.size)
		);
	}
}

export default Grid;