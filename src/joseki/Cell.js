class Cell {
	constructor(x, y, position, size) {
		this.x = x;
		this.y = y;
		this.position = position;
		this.size = size;
		this.dwellers = [];
		this.ghosts = [];
	}
}

export default Cell;