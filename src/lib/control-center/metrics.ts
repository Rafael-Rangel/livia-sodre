import { buildControlCenterMock } from "@/data/control-center-mock";

/**
 * Control Center always serves curated mock clinic data
 * so the dashboard looks full in demos (no empty live state).
 */
export function buildControlCenterPayload() {
  return buildControlCenterMock();
}

export type ControlCenterPayload = ReturnType<typeof buildControlCenterPayload>;
