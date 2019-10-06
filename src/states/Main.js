import _ from '../joseki/underscore';
import Vector from '../joseki/Vector';
import Maths from '../joseki/Maths';
import State from '../joseki/State';
import Grid from '../joseki/Grid';

import Mote from '../entities/Mote';
import BrownMote from '../entities/BrownMote';
import Star from '../entities/Star';
import Plant from '../entities/Plant';
import Sun from '../entities/Sun';

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
		this.game.brown = '#A499BE';
		this.canvas = this.game.getCanvas('game');
		this.grid = new Grid(0, 0, 32);
		this.grid.populate(this.game.width / this.grid.size, this.game.height / this.grid.size);
		this.grid.each((cell) => {
			cell.water = 0;
			cell.waterMod = 0;
		});
		this.dwellers = [];
		this.populate();

		this.tickTimer = 0;
		this.tickTime = 50;

		this.soundCooldowns = {};
	}

	// play a sound (but not too frequently...)
	playSound(sound, layer, cooldown, vol) {
		if (!this.soundCooldowns[layer]) {
			this.soundCooldowns[layer] = {};
		}

		if (!this.soundCooldowns[layer].hasOwnProperty(sound)) {
			const audio = this.game.audioManager.addAudio(sound, layer)
			audio.howl._volume = vol;
			audio.playOnce();
			this.soundCooldowns[layer][sound] = cooldown;
		} else {
			if (this.soundCooldowns[layer][sound] <= 0) {
				const audio = this.game.audioManager.addAudio(sound, layer)
				audio.howl._volume = vol;
				audio.playOnce();
				this.soundCooldowns[layer][sound] = cooldown;
			}
		}
	}

	updateSoundCooldowns() {
		_.each(this.soundCooldowns, (layer, k1) => {
			_.each(layer, (sound, k2) => {
				this.soundCooldowns[k1][k2] -= this.game.delta;
				if (this.soundCooldowns[k1][k2] < 0) this.soundCooldowns[k1][k2] = 0;
			});
		});
	}

	populate() {
		_.loop(128, () => {
			var x = Math.random() * this.game.width;
			var y = Math.random() * this.game.height;

			if (Math.random() > 1) {
				_.loop(4, () => {
					x = Math.random() * this.game.width;
					y = Math.random() * this.game.height;

					const mote = new BrownMote(this, 'game', new Vector(x, y));
					this.addDweller(mote);
					mote.velocity = new Vector(0, 0);
				});
			} else {
				const mote = new Mote(this, 'game', new Vector(x, y));
				this.addDweller(mote);
			}
		});
	}

	addDweller(dweller) {
		this.dwellers.push(dweller);
		this.game.groups.foreground.push(dweller);
		return dweller;
	}

	removeDweller(dweller) {
		this.dwellers = _.without(this.dwellers, dweller);
		if (dweller.cell) dweller.cell.dwellers = _.without(dweller.cell.dwellers, dweller);
		dweller.destroy();
	}

	createPlant(position) {
		const plant = new Plant(this, 'game', position);
		this.dwellers.push(plant);
		this.game.groups.background.push(plant);
	}

	createSun(position) {
		const sun = new Sun(this, 'game', position);
		this.dwellers.push(sun);
		this.game.groups.background.push(sun);
	}

	update() {
		super.update();

		this.updateSoundCooldowns();

		this.tickTimer += this.game.delta;
		while (this.tickTimer > this.tickTime) {
			this.tickTimer -= this.tickTime;
			_.each(this.dwellers, (dweller) => {
				dweller.tick();
			});
		}

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

		if (closest && closest_dist < this.mouseSnapDistance) {
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
				this.canvas.sprite(
					cell.position.add(new Vector(cell.size * 0.5, cell.size * 0.5)),
					'dot',
					{
						width: cell.size * 0.9,
						height: cell.size * 0.9,
						tintCache: true,
						tint: this.game.altHighlightColor
					}
				);
			}
		});

		return;

		this.grid.each((cell) => {
			// if (!cell.render) return;
			// if (cell.dwellers.length != 0) return;
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
