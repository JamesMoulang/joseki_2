import GreenMote from './GreenMote';
import Vector from '../joseki/Vector';

class BrownMote extends GreenMote {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.token = 'BROWN';
		this.tint = this.game.brown;
		this.velocity = Vector.Random().times(1);
		this.brownian.force = 0.0001;
	}

	render() {
		super.render();
	}
}

export default BrownMote;