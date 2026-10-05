const NATIVE_VIEW_NAMES = {
  HOST_VIEW: 'MorphletHostView',
  CONTAINER_VIEW: 'MorphletContainerView',
  SWITCH_VIEW: 'MorphletSwitchView',
} as const;

const COMPONENT_NAMES = {
  ROOT: 'Tray.Root',
  TRIGGER: 'Tray.Trigger',
  CLOSE: 'Tray.Close',
  CONTENT: 'Tray.Content',
  HEADER: 'Tray.Header',
  FOOTER: 'Tray.Footer',
  TITLE: 'Tray.Title',
  DESCRIPTION: 'Tray.Description',
  BODY: 'Tray.Body',
  VIEW: 'Tray.View',
  MORPH: 'Tray.Morph',
} as const;

export { NATIVE_VIEW_NAMES, COMPONENT_NAMES };
