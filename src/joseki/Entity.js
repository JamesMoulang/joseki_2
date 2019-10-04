import uid from 'uid';
import _ from 'underscore';
import Vector from './Vector';

class Entity {
	constructor(game, canvas = 'game', position = new Vector()) {
		this.game = game;
		this.canvas = game.getCanvas(canvas);
		this.position = position;
		this.alive = true;
		this.active = true;
		this.id = uid();
	}

	destroy() {
		this.alive = false;
	}

	_update() {
		if (this.alive && this.active) {
			this.update();
		}
	}

	update() {

	}

	_render() {
		if (this.alive && this.active && !this.canvas.paused) {
			this.render();
		}
	}

	render() {

	}

	_postRender() {
		if (this.alive && this.active) {
			this.postRender();
		}
	}

	postRender() {
		
	}
}

export default Entity;