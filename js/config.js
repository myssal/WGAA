export const DATA_REPO = "myssal/PGR_Data";
export const ASSET_REPO = "myssal/PGR-Assets";
export const BRANCH = "master";

export let currentRegion = "en";
export let groups = [];
export let details = [];

// Utility to update data references (avoids circular imports)
export function setData(newGroups, newDetails) {
  groups = newGroups;
  details = newDetails;
}
