import { makeMatrixFromItems } from "./matrix.js";
import { findFreeSpaceForItem, normalize, adjust } from "./item.js";
import { getRowsCount } from "./other.js";

function makeItem(item) {
  const { min = { w: 1, h: 1 }, max } = item;
  return {
    fixed: false,
    resizable: !item.fixed,
    draggable: !item.fixed,
    min: {
      w: Math.max(1, min.w),
      h: Math.max(1, min.h),
    },
    max: { ...max },
    ...item,
  };
}

export const findSpace = (item, items, cols) => {
  // console.log("[findSpace] item:", item);
  // console.log("[findSpace] items:", items);
  // console.log("[findSpace] cols:", cols);

  let matrix = makeMatrixFromItems(items, getRowsCount(items), cols);
  let position = findFreeSpaceForItem(matrix, item, items);
  return position;
};

export default { normalize, adjust, makeItem, findSpace };
