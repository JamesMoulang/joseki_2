import GreenMote from './GreenMote';
import Vector from '../joseki/Vector';

class BlueMote extends GreenMote {
	constructor(main, canvas, position) {
		super(main, canvas, position);
		this.token = 'BLUE';
		this.tint = this.game.altHighlightColor;
		this.velocity = Vector.Random().times(1);
	}

	render() {
		super.render();
	}
}

export default BlueMote;