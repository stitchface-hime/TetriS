import { Scene } from "@classes/Scene";
import { SceneKey } from "./Scene.keys";

export class SceneManager {
    private scenes: Partial<Record<SceneKey, Scene>> = {};
    private _currentScene: Scene | null = null;
    private isCurrentSceneLoaded = false;

    constructor(initialScene: Scene) {
        this.addScene(initialScene);
        this.loadScene(initialScene.key);
    }

    get currentScene() {
        return this._currentScene;
    }

    private set currentScene(scene: Scene | null) {
        this._currentScene = scene;
    }

    /**
     * Adds a scene to the scene manager, but does not load it.
     */
    addScene(scene: Scene) {
        this.scenes[scene.key] = scene;
    }

    /**
     * Adds multiple scenes to the scene manager, but does not load them.
     */
    addScenes(scenes: Scene[]) {
        scenes.forEach((scene) => {
            this.addScene(scene);
        });
    }

    isSceneLoaded(key: SceneKey) {
        const scene = this.scenes[key];
        return scene && scene.isLoaded;
    }

    /**
     * Loads a scene asynchronously and optionally makes a callback once loaded.
     */
    async loadScene(sceneKey: SceneKey, onLoad?: (scene: Scene) => void) {
        const scene = this.scenes[sceneKey];

        if (!scene) return Promise.reject("Scene not found");

        return scene.load().then(() => {
            if (onLoad) onLoad(scene);
        });
    }

    /**
     * Loads a scene asynchronous and sets it as current once loading completes.
     * An optional callback can also be provided for once the scene finishes loading.
     */
    async loadAndSetCurrentScene(sceneKey: SceneKey, onLoad?: (scene: Scene) => void) {
        return this.loadScene(sceneKey, (scene) => {
            if (onLoad) onLoad(scene);

            this.currentScene = scene;
        });
    }
}
