import Entity from '../Entity';
import Vector from '../Vector';

import _ from 'underscore';

class Group extends Entity {
	constructor(
		game, 
		canvas, 
		key,
		reverse = true
	) {
		super(game, canvas, new Vector(0, 0));
		this.key = key;
		this.reverse = reverse;
		this.entities = [];
	}

	forEach(callback) {
		_.each(this.entities, callback);
	}

	count() {
		return this.entities.length;
	}

	push(entity) {
		entity.group = this;
		this.entities.push(entity);
		return entity;
	}

	remove(entity) {
		this.entities = _.without(this.entities, entity);
	}

	update() {
		super.update();
		// Sort entities by key.
		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i].alive) {
				this.entities[i].update();
			} else {
				this.entities.splice(i, 1);
			}
		}

		this.entities = _.sortBy(this.entities, (entity) => {
			return entity[this.key] * (this.reverse ? -1 : 1);
		});
	}

	render() {
		for (let i = 0; i < this.entities.length; i++) {
			this.entities[i].render();
		}
	}

	postRender() {
		for (let i = 0; i < this.entities.length; i++) {
			this.entities[i].postRender();
		}
	}
}

export default Group;