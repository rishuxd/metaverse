import { events } from "./Events.js";

export class GameManager {
  constructor() {
    if (GameManager.instance) {
      return GameManager.instance;
    }

    this.isInitialized = false;
    this.scene = null;
    this.canvas = null;
    this.gameLoop = null;
    this.wsConnection = null;
    this.pendingActions = [];

    // Game state
    this.userId = null;
    this.spaceData = null;
    this.assets = new Map();
    this.connectionState = "DISCONNECTED"; // DISCONNECTED, CONNECTING, CONNECTED, JOINING, JOINED
    this.processingUsers = new Set(); // Track users being processed to prevent React dev mode duplicates
    this.messageSequence = []; // Track all WebSocket messages for debugging
    this.userJoinedMessages = new Map(); // Track user-joined messages: userId -> count

    // Initialization promises
    this.initializationPromise = null;
    this.readyCallbacks = [];

    GameManager.instance = this;
  }

  static getInstance() {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  static destroyInstance() {
    if (GameManager.instance) {
      GameManager.instance.destroy();
      GameManager.instance = null;
    }
  }

  /**
   * Initialize the game engine with all required data
   */
  async initialize(canvas, spaceData, assets = {}) {
    if (this.isInitialized) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization(
      canvas,
      spaceData,
      assets,
    );
    return this.initializationPromise;
  }

  async _performInitialization(canvas, spaceData, assets) {
    try {
      this.canvas = canvas;
      this.spaceData = spaceData;
      this.assets = new Map(Object.entries(assets));

      // Set up canvas context
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;

      // Initialize scene, camera, input, etc.
      await this._initializeScene();
      await this._initializeGameLoop();

      this.isInitialized = true;

      // Process any pending actions that were queued before initialization
      await this._processPendingActions();

      // Notify listeners that game is ready
      this._notifyReady();

      // Emit game ready event
      events.emit("GAME_READY", { gameManager: this });

      return this;
    } catch (error) {
      console.error("[GameManager] Initialization failed:", error);
      throw error;
    }
  }

  async _initializeScene() {
    const { GameObject } = await import("./GameObject.js");
    const { Vector2 } = await import("./Vector2.js");
    const { Sprite } = await import("./Sprite.js");
    const { Camera } = await import("./Camera.js");
    const { Input } = await import("./Input.js");
    const { gridCells } = await import("@/game/helpers/grid.js");

    // Create main scene
    this.scene = new GameObject({ position: new Vector2(0, 0) });

    // Set up walls for collision detection
    const { walls } = await import("@/levels/level1.js");
    if (this.spaceData?.map?.walls) {
      walls.set("walls", this.spaceData.map.walls);
    }

    // Initialize camera first to get zoom calculation
    const viewportWidth = this.canvas.width;
    const viewportHeight = this.canvas.height;

    this.camera = new Camera(
      viewportWidth,
      viewportHeight,
      this.spaceData.map.width,
      this.spaceData.map.height,
    );

    // Calculate map dimensions after scaling
    const mapWidthPixels = this.spaceData.map.width * 16;
    const mapHeightPixels = this.spaceData.map.height * 16;

    // Add map sprite if map image is available
    const mapImage = this.assets.get("mapImage");
    if (mapImage && this.spaceData) {
      const mapSprite = new Sprite({
        resource: mapImage,
        frameSize: new Vector2(
          this.spaceData.map.width * 32, // Actual pixel width (tiles × 32px per tile)
          this.spaceData.map.height * 32, // Actual pixel height (tiles × 32px per tile)
        ),
        scale: 0.5, // Scale down to 16px per tile for rendering
        position: new Vector2(0, 0),
      });
      this.scene.addChild(mapSprite);
    }

    // Center the map: offset by half the map size (negative to center)
    this.camera.position = new Vector2(
      -mapWidthPixels / 2,
      -mapHeightPixels / 2,
    );

    this.scene.addChild(this.camera);
    this.scene.input = new Input();

    // Add camera controls
    this._addCameraControls();
  }

  async _initializeGameLoop() {
    const { GameLoop } = await import("./GameLoop.js");

    const update = (delta) => {
      if (this.scene) {
        this.scene.stepEntry(delta, this.scene);
      }
    };

    const render = () => {
      if (this.scene && this.camera && this.canvas) {
        const ctx = this.canvas.getContext("2d");

        // Fill with background color before drawing
        ctx.fillStyle = "#d1fae5";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera transformations
        ctx.save();

        // Ensure image smoothing is disabled for crisp pixels
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        // Apply zoom and camera position
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.translate(this.camera.position.x, this.camera.position.y);

        // Draw the scene at origin
        this.scene.draw(ctx, 0, 0);

        ctx.restore();
      }
    };

    this.gameLoop = new GameLoop(update, render);
    this.gameLoop.start();
  }

  async _processPendingActions() {
    for (const action of this.pendingActions) {
      try {
        await action();
      } catch (error) {
        console.error("[GameManager] Error processing pending action:", error);
      }
    }

    this.pendingActions = [];
  }

  _notifyReady() {
    this.readyCallbacks.forEach((callback) => {
      try {
        callback(this);
      } catch (error) {
        console.error("[GameManager] Error in ready callback:", error);
      }
    });
    this.readyCallbacks = [];
  }

  /**
   * Connect WebSocket and set up message handling (but don't join space yet)
   */
  connectWebSocket(wsConnection) {
    if (this.wsConnection) {
      console.warn(
        "[GameManager] WebSocket already connected, ignoring duplicate connection",
      );
      return;
    }

    this.wsConnection = wsConnection;
    this.connectionState = "CONNECTED";

    if (wsConnection) {
      wsConnection.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      });
    }
  }

  /**
   * Send join message to actually join the space
   */
  joinSpace(spaceId, token) {
    if (this.connectionState !== "CONNECTED") {
      console.warn("[GameManager] Cannot join space - WebSocket not connected");
      return;
    }

    if (!this.wsConnection) {
      console.warn("[GameManager] Cannot join space - no WebSocket connection");
      return;
    }

    this.connectionState = "JOINING";

    this.wsConnection.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceId,
          token,
        },
      }),
    );
  }

  /**
   * Handle WebSocket messages with proper game state management
   */
  async handleWebSocketMessage(message) {
    // If game isn't ready yet, queue the action
    if (!this.isInitialized) {
      this.pendingActions.push(() => this._processWebSocketMessage(message));

      // Handle userId immediately for UI components
      if (message.type === "space-joined") {
        this.userId = message.payload.userId;
        events.emit("USER_ID_SET", message.payload.userId);
      }
      return;
    }

    await this._processWebSocketMessage(message);
  }

  async _processWebSocketMessage(message) {
    if (!this.scene) {
      console.warn(
        "[GameManager] No scene available for message:",
        message.type,
      );
      return;
    }

    switch (message.type) {
      case "space-joined":
        if (this.connectionState === "JOINED") {
          console.warn(
            "[GameManager] Already joined! Ignoring duplicate space-joined message",
          );
          return;
        }
        if (this.userId) {
          console.warn(
            "[GameManager] Already have userId! Ignoring duplicate space-joined message",
          );
          return;
        }

        await this._handleSpaceJoined(message.payload);
        break;
      case "user-joined":
        await this._handleUserJoined(message.payload);
        break;
      case "user-left":
        await this._handleUserLeft(message.payload);
        break;
      case "movement":
        await this._handleMovement(message.payload);
        break;
      case "movement-rejected":
        await this._handleMovementRejected(message.payload);
        break;
      case "chat":
      case "webrtc-offer":
      case "webrtc-answer":
      case "webrtc-ice-candidate":
      case "media-state-update":
        // These messages are handled by other components (Chat, Video)
        // Silently ignore them in GameManager
        break;
      default:
        console.warn("[GameManager] Unknown message type:", message.type);
    }
  }

  async _handleSpaceJoined(payload) {
    const { loadImage } = await import("../helpers/loadImage.js");
    const { Hero } = await import("../objects/Hero/Hero.js");
    const { gridCells } = await import("../helpers/grid.js");

    // Update connection state
    this.connectionState = "JOINED";

    // Set user ID
    this.userId = payload.userId;
    events.emit("USER_ID_SET", payload.userId);

    // Load hero avatar and create hero
    const avatar = await loadImage(
      `${process.env.NEXT_PUBLIC_BASE_URL}${payload.avatarUrl}`,
    );

    const hero = new Hero(
      gridCells(payload.spawn.x),
      gridCells(payload.spawn.y),
      this.wsConnection,
      payload.userId,
      payload.username,
      avatar,
    );

    this.scene.addChild(hero);

    events.emit("HERO_SPAWNED", { hero, userId: payload.userId });

    // Add existing users
    if (payload.users) {
      for (const user of payload.users) {
        await this._createRemoteUser(user);
      }
    }
  }

  async _handleUserJoined(payload) {
    await this._createRemoteUser(payload);
  }

  async _createRemoteUser(userData) {
    // Check if already processing this user (React dev mode protection)
    if (this.processingUsers.has(userData.userId)) {
      return;
    }

    // Mark as processing
    this.processingUsers.add(userData.userId);

    try {
      // Check if user already exists
      const existingUsers = this.scene.children.filter(
        (child) => child.userId === userData.userId,
      );
      if (existingUsers.length > 0) {
        return;
      }

      // Don't create RemoteUser for self
      if (this.userId === userData.userId) {
        return;
      }

      const { loadImage } = await import("../helpers/loadImage.js");
      const { RemoteUser } = await import("../objects/RemoteUser.js");
      const { gridCells } = await import("../helpers/grid.js");

      const avatar = await loadImage(
        `${process.env.NEXT_PUBLIC_BASE_URL}${userData.avatarUrl}`,
      );

      const remoteUser = new RemoteUser(
        gridCells(userData.x),
        gridCells(userData.y),
        userData.userId,
        userData.username,
        avatar,
      );

      this.scene.addChild(remoteUser);
      events.emit("REMOTE_USER_JOINED", { remoteUser, userData });
    } finally {
      // Remove from processing set when done
      this.processingUsers.delete(userData.userId);
    }
  }

  async _handleUserLeft(payload) {
    const remoteUser = this.scene.children.find(
      (child) => child?.userId === payload.userId,
    );

    if (remoteUser) {
      this.scene.removeChild(remoteUser);
      remoteUser.destroy();
      events.emit("REMOTE_USER_LEFT", { userId: payload.userId });
    }
  }

  async _handleMovement(payload) {
    const { gridCells } = await import("../helpers/grid.js");

    const remoteUser = this.scene.children.find(
      (child) => child?.userId === payload.userId,
    );

    if (remoteUser && remoteUser.updatePosition) {
      // Convert grid units to pixels
      const pixelX = gridCells(payload.x);
      const pixelY = gridCells(payload.y);

      remoteUser.updatePosition(pixelX, pixelY);
    } else {
      console.warn(
        "[GameManager] Could not find remote user for movement:",
        payload.userId,
      );
    }
  }

  async _handleMovementRejected(payload) {
    events.emit("MOVEMENT_REJECTED", payload);
  }

  /**
   * Register a callback to be called when the game is ready
   */
  onReady(callback) {
    if (this.isInitialized) {
      callback(this);
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  /**
   * Get the current user ID
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Check if the game is fully initialized
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Resize the game when window size changes
   */
  resize(width, height) {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    if (this.camera) {
      this.camera.canvasWidth = width;
      this.camera.canvasHeight = height;
    }
  }

  /**
   * Reset the GameManager for a new space (keeps instance alive)
   */
  reset() {
    if (this.gameLoop) {
      this.gameLoop.stop();
      this.gameLoop = null;
    }

    if (this.scene) {
      this.scene.destroy();
      this.scene = null;
    }

    if (this.wsConnection) {
      this.wsConnection = null; // Don't close - React component manages this
    }

    this.isInitialized = false;
    this.userId = null;
    this.spaceData = null;
    this.assets.clear();
    this.pendingActions = [];
    this.readyCallbacks = [];
    this.initializationPromise = null;
    this.connectionState = "DISCONNECTED";
    this.processingUsers.clear();
    this.messageSequence = [];
    this.userJoinedMessages.clear();

    events.emit("GAME_RESET");
  }

  /**
   * Clean up resources and destroy singleton
   */
  destroy() {
    this.reset();

    // Remove canvas event listeners if they exist
    if (this.canvas) {
      this.canvas.removeEventListener("wheel", this._wheelHandler);
      this.canvas.removeEventListener("mousedown", this._mouseDownHandler);
      this.canvas.removeEventListener("mousemove", this._mouseMoveHandler);
      this.canvas.removeEventListener("mouseup", this._mouseUpHandler);
      this.canvas.removeEventListener("mouseleave", this._mouseUpHandler);
      this.canvas = null;
    }

    events.emit("GAME_DESTROYED");
  }

  /**
   * Add zoom and pan controls to the camera
   */
  _addCameraControls() {
    if (!this.canvas || !this.camera) return;

    // Store handlers as instance properties for cleanup
    let mouseDownPos = null;
    let hasDragged = false;

    this._wheelHandler = (e) => {
      e.preventDefault();
      const zoomDirection = e.deltaY > 0 ? -1 : 1;
      this.camera.adjustZoom(zoomDirection);
    };

    this._mouseDownHandler = (e) => {
      if (e.button === 0) {
        // Left click
        mouseDownPos = { x: e.clientX, y: e.clientY };
        hasDragged = false;
      }
    };

    this._mouseMoveHandler = (e) => {
      if (mouseDownPos) {
        // Check if user has dragged a minimum distance (to distinguish from click)
        const dx = e.clientX - mouseDownPos.x;
        const dy = e.clientY - mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!hasDragged && distance > 5) {
          // User started dragging
          hasDragged = true;
          this.camera.startPan(mouseDownPos.x, mouseDownPos.y);
          this.canvas.style.cursor = "grabbing";
        }

        if (hasDragged) {
          this.camera.updatePan(e.clientX, e.clientY);
        }
      }
    };

    this._mouseUpHandler = (e) => {
      if (hasDragged && this.camera.isPanning) {
        this.camera.endPan();
        this.canvas.style.cursor = "default";
      }
      mouseDownPos = null;
      hasDragged = false;
    };

    this.canvas.addEventListener("wheel", this._wheelHandler, {
      passive: false,
    });
    this.canvas.addEventListener("mousedown", this._mouseDownHandler);
    this.canvas.addEventListener("mousemove", this._mouseMoveHandler);
    this.canvas.addEventListener("mouseup", this._mouseUpHandler);
    this.canvas.addEventListener("mouseleave", this._mouseUpHandler);
  }

  /**
   * Get current connection state
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Check if ready to join space (WebSocket connected and game initialized)
   */
  isReadyToJoin() {
    return this.isInitialized && this.connectionState === "CONNECTED";
  }
}

// Static property to hold the singleton instance
GameManager.instance = null;
