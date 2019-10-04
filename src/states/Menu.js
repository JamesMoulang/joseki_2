import _ from '../joseki/underscore';
import State from '../joseki/State';
import Sprite from '../joseki/Entities/Sprite';
import Group from '../joseki/Entities/Group';
import Vector from '../joseki/Vector';
import Maths from '../joseki/Maths';
import Tweens from '../joseki/Tweens';
import Rect from '../joseki/Entities/Shapes/Rect';

class Menu extends State {
	constructor() {
		super('menu');
	}

	init() {
		super.init();
	}

	enter(game) {
		super.enter(game);
	}

	update() {
		super.update();
		this.game.debug('menu!');
	}

	render() {
		
	}

	exit() {
		super.exit();
	}
}

export default Menu;