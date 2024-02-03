# Overall Todo List

The purpose of this to do list is to keep track of all the tasks that need to be completed for the project. To keep track of the most important tasks, it is broken down into three categories: high, medium, and low priority. Each task is tracked as a checkbox item using GitHub's markdown.

## High Priority

- [x] Implement the Viewer using the new API
- [x] Add toolbar functionality:

  - [x] Implement "Change Camera" UI element.
    - [x] Implement corresponding functionality.
  - [x] Implement "Select All" UI element.
    - [ ] Implement corresponding functionality.
  - [x] Implement "Zoom Extents" UI element.
    - [x] Implement corresponding functionality.

- [x] Add functionality to the store to handle the viewer state.
  - [x] Add a field to hold the current selection.
  - [ ] Add a field to hold the current camera state.
  - [ ] Add a field to hold the current geometry data.
  - [ ] Add a field to hold the current flags data.
  - [ ] Add the necessary actions to handle these fields.
  - [ ] Add the necessary getters.

## Medium Priority

- [ ] Grouping of geometry types:

  - [ ] Separate geometry types into different groups.
  - [ ] Add groups to the sidebar.
  - [ ] Add functionality to colour groups.

- [x] Add hotkeys & UI elements:

  - [x] Selection:
    - [x] `Left click` for selection.
    - [x] `Shift + left click` for multi-selection.
  - [x] Navigation:
    - [x] `WASD` for movement.
    - [x] `Right click` to drag.
    - [x] `Right drag` to orbit.
    - [x] `Scroll` to zoom.

- [x] Add optional flags as properties to each component.
- [x] Integrate well with the slideover elements etc.

## Low Priority

- [ ] Gradient support:

  - [ ] Add a gradient mode to the viewer.
  - [ ] Add color and threshold settings for gradients.

- [x] Zoom to selected geometry on double-click.
- [x] Data table overlay. (Implemented as info cards.)
- [ ] Plan tool.
