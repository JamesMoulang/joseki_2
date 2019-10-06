import Cell from './Cell';
import Vector from './Vector';
import _ from './underscore';
import Maths from './Maths';

class Grid {
	constructor(x, y, size) {
		this.position = new Vector(x, y);
		this.size = size;
		this.cells = {};
	}

	populate(w, h) {
		for (var x = 0; x < w; x++) {
			for (var y = 0; y < h; y++) {
				this.getCell(x, y);
			}
		}
	}

	each(callback) {
		_.each(this.cells, (column) => {
			_.each(column, (cell) => {
				callback(cell);
			});
		});
	}

	getCell(x, y, exists=true) {
		if (!this.cells[x]) {
			this.cells[x] = {};
		}

		if (!this.cells[x][y]) {
			if (!exists) return null;

			this.cells[x][y] = new Cell(
				x,
				y,
				this.position.add(new Vector(x*this.size, y*this.size)),
				this.size
			);
		}

		return this.cells[x][y];
	}

	getCellFromWorldPosition(pos, exists=true) {
		const toPos = pos.minus(this.position);
		return this.getCell(
			Math.floor(toPos.x / this.size),
			Math.floor(toPos.y / this.size),
			exists
		);
	}

	forEachDwellersFromWorldPosition(pos, radius, callback) {
		const min_x = Math.floor((pos.x - radius) / this.size);
		const min_y = Math.floor((pos.y - radius) / this.size);
		const max_x = Math.ceil((pos.x + radius) / this.size);
		const max_y = Math.ceil((pos.y + radius) / this.size);

		for (var x = min_x; x <= max_x; x++) {
			for (var y = min_y; y <= max_y; y++) {
				const cell = this.getCell(x, y, false);
				if (cell) {
					cell.render = true;
					_.each(cell.dwellers, (dweller) => {
						const dist = dweller.position.distance(pos);
						if (dist <= radius) callback(dweller, dist);
					});
				}
			}
		}
	}
}

export default Grid;