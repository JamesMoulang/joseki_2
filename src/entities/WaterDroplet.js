import Entity from '../joseki/Entity';

class WaterDroplet extends Entity {
	constructor(main, canvas, startPosition, targetEntity) {
		super(main.game, canvas);
		this.main = main;
		this.position = startPosition;
		this.targetEntity = targetEntity;
		this.tint = this.game.altHighlightColor;
		this.size = 16;
	}

	update() {
		this.position = this.position.lerp(this.targetEntity.position, 0.2);
		if (this.position.distance(this.targetEntity.position) < 4) {
			this.destroy();
		}
	}

	render() {
		this.canvas.sprite(
			this.position,
			'dot_white',
			{
				width: this.size,
				height: this.size,
				tintCache: true,
				tint: this.tint,
			}
		);
	}
}

export default WaterDroplet;