import { Scene } from "@classes/Scene";
import { SceneKey } from "./Scene.keys";
import { TextureManager } from "@classes/TextureManager";

export class SceneManager {
    private scenes: Partial<Record<SceneKey, Scene>> = {};
    private _currentScene: Scene | null = null;
    private isCurrentSceneLoaded = false;
    private textureManager: TextureManager;

    constructor(initialScene: Scene, textureManager: TextureManager) {
        this.addScene(initialScene);
        this.loadScene(initialScene.key);
        this.textureManager = textureManager;
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
    loadScene(sceneKey: SceneKey, onLoad?: (scene: Scene) => void) {
        const scene = this.scenes[sceneKey];

        if (!scene) throw new Error("Scene not found.");

        scene.load(onLoad);
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
}
