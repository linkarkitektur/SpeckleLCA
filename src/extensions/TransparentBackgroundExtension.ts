import { Extension, IViewer, UpdateFlags } from '@speckle/viewer'

// TODO: Add custom viewmode this is not doing anything now
export class TransparentBackgroundExtension extends Extension {
  constructor(viewer: IViewer, config?: any) {
    super(viewer, config)
  }

  load() {
    // Use type assertions to access internal renderer and scene.
    const internalRenderer = this.viewer.getRenderer() as any
    if (internalRenderer.renderer) {
      internalRenderer.renderer.setClearColor(0x000000, 0) // transparent clear color
    }
    if (internalRenderer.scene) {
      internalRenderer.scene.background = null
    }
    // Traverse the scene to update any line objects.
    internalRenderer.scene.traverse((child: any) => {
      if (child.isLine && child.material) {
        child.material.linewidth = 2
      }
    })
    // Request a render update.
    this.viewer.requestRender(UpdateFlags.RENDER_RESET)
    return Promise.resolve()
  }

  unload() {
    return Promise.resolve()
  }
}
