import { Scene } from "@classes/Scene";
import { SceneKey } from "./Scene.keys";
import { arrayFindAndDelete } from "@utils/arrayFindAndDelete";

export class SceneManager {
    private scenes: Partial<Record<SceneKey, Scene>> = {};
    private loadingScenes: SceneKey[] = [];
    private _currentScene: Scene | null = null;

    constructor(initialScene?: Scene) {
        if (!initialScene) return;
        this.addScene(initialScene);
        this.loadScene(initialScene.key);
    }

    /**
     * Get whether or not the current scene is loading, returns `false` if current scene is `null`.
     */
    isCurrentSceneLoading() {
        return !!this._currentScene?.isLoading;
    }

    /**
     * Get whether or not the current scene is loaded, returns `false` if current scene is `null`.
     */
    isCurrentSceneLoaded() {
        return !!this._currentScene?.isLoaded;
    }

    get currentSceneKey() {
        return this._currentScene?.key;
    }

    private get currentScene() {
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
    loadScene(sceneKey: SceneKey, onLoad?: (scene: Scene) => void) {
        const scene = this.scenes[sceneKey];

        console.log("Loading scene", scene);
        if (!scene) throw new Error("Scene not found.");
        if (this.loadingScenes.includes(sceneKey))
            throw new Error("Scene already loading.");

        const handleLoad = (scene: Scene) => {
            arrayFindAndDelete(scene.key, this.loadingScenes);
            if (onLoad) onLoad(scene);
        };

        this.loadingScenes.push(sceneKey);
        scene.load(handleLoad);
    }

    /**
     * Loads the current scene if it is not loaded already.
     * Does nothing if there is no current scene.
     */
    loadCurrentScene(onLoad?: (scene: Scene) => void) {
        if (!this.currentScene) return;

        this.loadScene(this.currentScene?.key, onLoad);
    }

    /**
     * Loads a scene asynchronously and sets it as current once loading completes.
     * An optional callback can also be provided for once the scene finishes loading.
     */
    loadAndSetCurrentScene(
        sceneKey: SceneKey,
        onLoad?: (scene: Scene) => void
    ) {
        return this.loadScene(sceneKey, (scene) => {
            if (onLoad) onLoad(scene);

            this.currentScene = scene;
        });
    }

    renderCurrentScene() {
        if (!!this.currentScene && this.isCurrentSceneLoaded()) {
            this.currentScene.renderScene();
        }
    }
}
