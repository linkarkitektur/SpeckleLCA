import { useSpeckleStore, } from '@/stores/speckle'
import { Viewer } from '@speckle/viewer'

/**
 * Represents a class for interacting with the viewer.
 */
class ViewerInteraction {
  public viewerInstance: Viewer | null = null

  constructor() {
    const speckleStore = useSpeckleStore()
    const viewer = speckleStore.viewer
    this.viewerInstance = viewer as Viewer

    if (this.viewerInstance != null) {
      console.log('Viewer instance:', this.viewerInstance)
    }
  }

  /**
  * Returns the viewer instance or null.
  * @returns { Viewer | null }
  */
  checkViewerState(): void {
    if (this.viewerInstance === null) {
      console.log('Viewer instance not set.')
    } else {
      console.log('Viewer instance:', this.viewerInstance)
    }
  }
}

export default ViewerInteraction