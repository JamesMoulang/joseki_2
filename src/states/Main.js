import _ from '../joseki/underscore';
import Vector from '../joseki/Vector';
import Maths from '../joseki/Maths';
import State from '../joseki/State';
import Grid from '../joseki/Grid';

import Mote from '../entities/Mote';
import Star from '../entities/Star';

class Main extends State {
	constructor() {
		super('main');
		this.mouseSnapDistance = 32;

		this.selection1 = null;
		this.selection2 = null;
	}

	init() {
		super.init();
	}

	createStar(position, c1, c2) {
		const star = new Star(this, 'game', position, c1, c2);
		this.addDweller(star);
	}

	enter(game) {
		super.enter(game);
		this.game.green = '#7FB069';
		this.game.brown = '#726E60';
		this.canvas = this.game.getCanvas('game');
		this.grid = new Grid(0, 0, 32);
		this.grid.populate(this.game.width / this.grid.size, this.game.height / this.grid.size);
		this.grid.each((cell) => {
			cell.water = 0;
			cell.waterMod = 0;
		});
		this.dwellers = [];
		this.populate();
	}

	populate() {
		_.loop(128, () => {
			var x = Math.random() * this.game.width;
			var y = Math.random() * this.game.height;

			const mote = new Mote(this, 'game', new Vector(x, y));
			this.addDweller(mote);
		});
	}

	addDweller(dweller) {
		this.dwellers.push(dweller);
		this.game.groups.foreground.push(dweller);
	}

	removeDweller(dweller) {
		this.dwellers = _.without(this.dwellers, dweller);
		if (dweller.cell) dweller.cell.dwellers = _.without(dweller.cell.dwellers, dweller);
		dweller.destroy();
	}

	update() {
		super.update();
		_.each(this.dwellers, (dweller) => {
			dweller.highlighted = false;
		});

		let closest = null;
		let closest_dist = 0;
		this.grid.forEachDwellersFromWorldPosition(this.game.mousePos, 256, (dweller, dist) => {
			if (closest == null || dist <= closest_dist && !dweller.selected && dweller.selectable) {
				closest = dweller;
				closest_dist = dist;
			}
		});

		if (closest) {
			if (closest_dist < this.mouseSnapDistance) {
				closest.highlighted = true;

				if (this.game.mouseclicked) {
					closest.selected = true;
					if (this.selection1) {
						this.selection2 = closest;
						this.formConnection(this.selection1, closest);
					} else {
						this.selection1 = closest;
						// closest.megaHighlighted = true;
					}
				}
			}
		} else if (this.game.mouseclicked) {
			if (this.selection1) {
				this.selection1.highlighted = false;
				this.selection1.selected = false;
				this.selection1 = null;
			}
		}

		this.grid.each((cell) => {
			if (cell.water > 1) {
				const count = cell.water - 1;
				_.loop(count, () => {
					console.log("spreading water.");
					const dir = _.pick([
						new Vector(0, 1),
						new Vector(0, -1),
						new Vector(-1, 0),
						new Vector(1, 0),
						// new Vector(1, 1),
						// new Vector(1, -1),
						// new Vector(-1, 1),
						// new Vector(-1, -1)
					]);

					let x = Maths.wrap(cell.x + dir.x, 0, this.game.width / this.grid.size);
					let y = Maths.wrap(cell.y + dir.y, 0, this.game.height / this.grid.size);

					console.log(cell.x, cell.y, x, y);

					cell.waterMod--;
					this.grid.getCell(x, y).waterMod++;
				});
			}
		});

		this.grid.each((cell) => {
			if (cell.waterMod != 0) {
				console.log("modding by", cell.waterMod, cell.x, cell.y);
				cell.water += cell.waterMod;
				console.log(cell);
			}
			cell.waterMod = 0;
		});
	}

	formConnection(s1, s2) {
		console.log("forming a connection", s1, s2);
		s1.connect(s2);
		this.selection1.highlighted = false;
		this.selection2.highlighted = false;
		this.selection1 = null;
		this.selection2 = null;
	}

	render() {
		this.renderGrid();

		this.canvas.drawRect(
			0,
			0,
			this.game.width,
			this.game.height,
			{
				strokeAlpha: 0,
				fillAlpha: 0,
				strokeColor: this.game.textColor,
				fillColor: this.game.textColor,
			}
		);
	}

	renderGrid() {
		// Pre render.
		this.grid.each((cell) => {
			if (cell.water != 0) {
				this.canvas.drawRect(
					cell.position.x,
					cell.position.y,
					cell.size,
					cell.size,
					{
						strokeAlpha: 0,
						fillAlpha: 0.2 + Maths.clamp(cell.water / 3) * 0.4,
						fillColor: this.game.altHighlightColor,
					}
				);
			}
		});

		this.grid.each((cell) => {
			// if (!cell.render) return;
			this.canvas.drawRect(
				cell.position.x,
				cell.position.y,
				cell.size,
				cell.size,
				{
					strokeAlpha: 0.05,
					fillAlpha: 0,
					strokeColor: this.game.textColor,
					fillColor: this.game.textColor,
				}
			);

			cell.render = false;
		});
	}

	exit() {
		super.exit();
	}
}

export default Main;
