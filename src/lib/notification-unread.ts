export const NOTIFICATIONS_UPDATED_EVENT = 'bikeexchange:notifications-updated'

export function emitNotificationsUpdated() {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT))
}
