import Entity from '../joseki/Entity';

class TrailDust extends Entity {
	constructor(main, position, size, tint) {
		super(main.game, 'game', position);
		main.game.groups.background.push(this);
		this.size = size;
		this.tint = tint;
		this.position = position;
		this.alpha = 0.5;
	}

	reset(position, size, tint) {
		this.alpha = 0.5;
		this.position = position;
		this.size = size;
		this.tint = tint;
		this.active = true;
	}

	update() {
		super.update();
		if (!this.active) return;
		this.alpha -= this.game.delta * 0.01;
		if (this.alpha <= 0) this.active = false;
	}

	render() {
		if (!this.active) return;
		this.canvas.sprite(
			this.position,
			'dot_white',
			{
				width: this.size,
				height: this.size,
				tint: this.tint,
				// tintCache: true,
				alpha: this.alpha,
			}
		);
	}
}

export default TrailDust;