import howler from 'howler';
const Howl = howler.Howl;

class AudioObject {
	constructor(game, key, options) {
		this.game = game;
		this.key = key;
		console.log(this.game.audioCache, key);
		this.howl = new Howl(Object.assign(options, {src: [this.game.audioCache[key]._src]}));
		this.volume = 1;
		this.fading = false;
	}

	play() {
		this.howl.play();
	}

	// Play and immediately get removed from the layer.
	playOnce() {
		this.howl.play();
		this.howl.on('end', () => {
			this.playedOnce = true;
		});
	}

	pause() {
		this.howl.pause();
	}

	stop() {
		this.howl.stop();
	}

	setVolume(volume) {
		this.howl.volume(this.volume * volume);
	}

	update() {

	}
}

export default AudioObject;