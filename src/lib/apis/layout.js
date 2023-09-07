import * as proxy from "./proxy.js";

// TODO convert items et al to be {items, rowCount, etc} in one blob
// call this blob: LayoutInterface

export const getRowsCount = (items) => {
  // console.log("[getRowsCount] items:", items)
  // console.log("[getRowsCount] row count: ", Math.max(...items.map(val => val.y + val.h), 1));
  return Promise.resolve(items)
    .then(_items => {
      return Math.max(
        ..._items.map((val) => (val.y || 0) + val.h), 
        1
      )
    })
    .catch(proxy.print.failure_get_rows_count)
}

// --- helper.js

export const findSpace = (item, items, cols) => {
  return Promise.resolve({item, items, cols})
    .then(({item, items, cols}) => 
      getRowsCount(items)
        .then(rowCount => ({item, items, cols, rowCount}))
    )
    .then(proxy.print.status_find_space)
    .then(({item, items, cols, rowCount}) => 
      makeMatrixFromItems(items, rowCount, cols)
        .then(matrix => ({item, items, matrix}))
    )
    .then(({item, items, matrix}) => {
      return findFreeSpaceForItem(matrix, item, items)
    })
    .catch(proxy.print.failure_layout_find_space);

};

export const makeItem = (item) => {
  return Promise.resolve(item)
    .then(_item => ({
      fixed: false,
      resizable: !_item.fixed,
      draggable: !_item.fixed,
      min: {
        w: Math.max(1, (_item.min || {w:1}).w || 1),
        h: Math.max(1, (_item.min || {h:1}).h || 1),
      },
      max: { ..._item.max },
      ...item,
    }))
    .catch(proxy.print.failure_layout_make_item)
}


// --- container.js

export function getContainerHeight(items, yPerPx) {
  return Promise.resolve({items, yPerPx})
    .then(({items, yPerPx}) => getRowsCount(items)
        .then(rows => ({yPerPx, rows})))
    .then(proxy.print.status_get_container_height)
    .then(({yPerPx, rows}) => rows * yPerPx)
    .catch(proxy.print.failure_get_container_height)
}

// --- matrix.js

export const findCloseBlocks = (matrix, curObject) => {
  return Promise.resolve({matrix, curObject})
    .then(proxy.print.status_find_close_blocks_1)
    .then(({matrix, curObject}) => {
      const { h, x, y } = curObject;
      const w = Math.min(matrix[0].length, curObject.w);
      const tempR = matrix.slice(y, y + h);

      const result = tempR.reduce((acc, _r) => {
        console.log("[findCloseBlocks] _r:", _r, x, w, h, y, acc)
        let tempA = _r.slice(x, x + w);
        return [
          ...acc,
          ...tempA
            .map((val) => val && val.id && val.id !== curObject.id && val.id)
            .filter(Boolean),
        ];
      }, []);

      return [...new Set(result)];
    })
    .then(proxy.print.status_find_close_blocks_2)
    .catch(proxy.print.failure_layout_find_close_blocks);
}


export const makeMatrix = (rows, cols) => {
  return Promise.resolve({rows, cols})
    .then(({rows, cols}) => {
      return Array.from({ length: rows }, () => Array.from({ length: cols })); 
    })
    .catch(proxy.print.failure_layout_make_matrix);
}

export const makeMatrixFromItems = (items, _row, _col) => {
  return Promise.resolve({items, _row, _col})
    .then(({items, _col}) => getRowsCount(items)
      .then(rows => makeMatrix(rows, _col))
      .then(matrix => ({items, _col, matrix})))
    .then(({items, _col, matrix}) => {
      for (let value in items) {
        const { x, y, h } = value;
        const w = Math.min(_col, value.w);
    
        for (let j = y; j < y + h; j++) {
          const row = matrix[j];
          for (let k = x; k < x + w; k++) {
            row[k] = value;
          }
        }
      }
      return matrix;
    })
    .catch(proxy.print.failure_layout_make_matrix_fromitems);
}

export const makeMatrixFromItemsIgnore = (
  items,
  ignoreList,
  _row, // = getRowsCount(items)
  _col
) => {
  return Promise.resolve({items, ignoreList, _row, _col})
    .then(({items, ignoreList, _row, _col}) => getRowsCount(items)
      .then(rows => makeMatrix(rows, _col))
      .then(matrix => ({items, ignoreList, _col, matrix})))
    .then(proxy.print.status_makeMatrix)
    .then(({items, _col, ignoreList, matrix}) => {
      for (let value in items) {
        const { x, y, h, id } = value;
        const w = Math.min(_col, value.w || 100);
    
        if (ignoreList.indexOf(id) === -1) {
          for (var j = y; j < y + h; j++) {
            const row = matrix[j];
            if (row) {
              for (var k = x; k < x + w; k++) {
                row[k] = value;
              }
              console.log("[makeMatrixFromItems][row]:", row, i, j, '-', y, h, '-', x, w, '-', value, items);
            }
          }
        }
      }
      return matrix;
    })
    .catch(proxy.print.failure_layout_make_matrix_fromitems_ignore)
  
}

export const findItemsById = (closeBlocks, items) => {
  return Promise.resolve({closeBlocks, items})
    .then(({closeBlocks, items}) => items.filter((value) => {
      return closeBlocks.indexOf(value.id) !== -1
    }))
    .catch(proxy.print.failure_layout_finditems_by_id);
}


// -- other.js

export const debounce = (fn, ms = 0) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};


export const getColumnFromBreakpoints = (breakpoints, windowWidth, cols) => {
  return Promise.resolve({breakpoints, windowWidth, cols})
    .then(proxy.print.status_get_column_from_breakpoints)
    .then(({breakpoints, windowWidth, cols}) => {
      let found = false, tempCols = cols;
      if (breakpoints) {
        for (var i = breakpoints.length - 1; i >= 0; i--) {
          const [resolution, cols] = breakpoints[i];
    
          if (windowWidth <= resolution) {
            found = true;
            tempCols = cols;
            break;
          }
        }
      }
      if (!found) return cols;
    
      return tempCols;
    })
    .catch(proxy.print.failure_layout_get_column_from_breakpoints)

};

// -- item.js

export const filterStatics = (items) => {
  return items.filter((value) => !value.static);
}

export const responsiveItems = (items, cols) => {
  return Promise.resolve({items, cols})
    .then(({items, cols}) => items.map((val) => {
      const breakpoint = val.breakpoints[cols];
      if (breakpoint) {
        return { ...val, ...breakpoint };
      }
      return val;
    }))
    .then(Promise.all)
    .catch(proxy.print.failure_layout_responsive_items)
}

export const getItemById = (id, items) => {
  return Promise.resolve({id, items})
    .then(({id, items}) => {
      const index = items.findIndex((value) => value.id === id);
      return {
        index,
        item: items[index],
      }
    })
    .catch(proxy.print.failure_layout_get_item_by_id);
}

export const findFreeSpaceForItem = (matrix, item, items) => {
  console.log("[findFreeSpaceForItem] matrix:", matrix);

  return Promise.resolve({matrix, item, items})
    .then(({matrix, item, items}) => 
      getRowsCount(items)
        .then(rows => ({matrix, item, rows})))
    .then(({matrix, item, rows}) => {
      const cols = matrix[0].length;
      const w = Math.min(cols, item.w);
      let xNtime = cols - w;
        
      for (var i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        for (var j = 0; j < xNtime + 1; j++) {
          const sliceA = row.slice(j, j + w);
          const empty = sliceA.every((val) => val === undefined);
          if (empty) {
            const isEmpty = matrix
              .slice(i, i + item.h)
              .every((a) => a.slice(j, j + w).every((n) => n === undefined));
    
            if (isEmpty) {
              console.log("[findFreeSpaceForItem] IS EMPTY:", matrix);
              return { y: i, x: j }; // return found space
            }
          }
        }
      }
      // else
      return {
        y: rows,
        x: 0,
      };
    })
    .catch(proxy.print.failure_find_free_space_for_item);
}

const assignPosition = (item, position, value) => {
  return Promise.resolve({item, position, value})
    .then(({item, position, value}) => {
      return value.id === item.id ? { ...item, ...position } : value;
    })
    .catch(proxy.print.failure_layout_assign_position)
}

const replaceItem = (item, cachedItem, value) => {
  return Promise.resolve({item, cachedItem, value})
    .then(({item, cachedItem, value}) => {
      return value.id === item.id ? cachedItem : value;
    })
    .catch(proxy.print.failure_layout_replace_item);
}

export const moveItem = (item, items, cols, originalItem) => {
  return Promise.resolve({item, items, cols, originalItem})
    .then(({item, items, cols, originalItem}) => {
      let matrix = getRowsCount(items)
        .then(rows => makeMatrixFromItemsIgnore(items, [item.id], rows, cols))
        .then(proxy.print.status_make_matrix_1)
        .catch(proxy.print.failure_move_item_1);

      const closeBlocks = Promise.resolve(matrix)
        .then(_matrix => findCloseBlocks(_matrix, item))
        .then(proxy.print.status_close_blocks_1)
        .catch(proxy.print.failure_move_item_2);
      
      const closeObj = Promise.resolve(closeBlocks)
        .then(_closeBlocks => findItemsById(_closeBlocks, items))
        .catch(proxy.print.failure_move_item_3);
        
      const fixed = Promise.resolve(closeObj)
        .then(_closeObj => _closeObj.find((value) => value.fixed))
        .then(fixed => {
          return fixed && originalItem
          ? items.map(replaceItem.bind(null, item, originalItem)) 
          : []
        })
        .catch(proxy.print.failure_move_item_4);
      
      if (fixed) return fixed;

      matrix = getRowsCount(items)
        .then(rows => makeMatrixFromItemsIgnore(items, closeBlocks, rows, cols))
        .then(proxy.print.status_make_matrix_2)
        .catch(proxy.print.failure_move_item_1);

      // closeObj.forEach((item) => {
      //   let position = findFreeSpaceForItem(matrix, item, tempItems);
      //   exclude.push(item.id);
    
      //   if (position) {
      //     tempItems = tempItems.map(assignPosition.bind(null, item, position));
      //     let getIgnoreItems = _closeBlocks.filter(
      //       (value) => exclude.indexOf(value) === -1
      //     );
    
      //     matrix = makeMatrixFromItemsIgnore(
      //       tempItems,
      //       getIgnoreItems,
      //       getRowsCount(tempItems),
      //       cols
      //     );
      //   }
      // });
      _items = items;
      return closeObj.reduce((promiseChain, item) => {
        return promiseChain
          .then(proxy.print.status_move_item_1)
          .then(() => findFreeSpaceForItem(matrix, item, _items))
          .then(position => {
            exclude.push(item.id);
      
            if (position) {
              _items = _items.map(assignPosition.bind(null, item, position));
              let getIgnoreItems = _closeBlocks.filter(
                (value) => exclude.indexOf(value) === -1
              );
      
              return getRowsCount(_items)
                .then(rowCount => makeMatrixFromItemsIgnore(
                  _items,
                  getIgnoreItems,
                  rowCount,
                  cols
                ))
                .then(newMatrix => {
                  matrix = newMatrix;
                });
            }
          });
      }, Promise.resolve());
    })
    .catch(proxy.print.failure_make_matrix_2);
}

// export function normalize(items, col) {
//   return Promise.resolve({items, col})
//     .then(({items, col}) => {
//       let result = items.slice();

//       result.forEach((value) => {
//         if (!value.static) {
//           result = moveItem(value, result, col, { ...value });
//         }
//       });
//       return result;
//     })
//     .catch(proxy.print.failure_normalize);
// }

// export function adjust(items, col) {
//   return Promise.resolve({items, col})
//     .then(({items, col}) => ({
//       items, col,
//       rows: getRowsCount(items)
//     }))
//     .then(({items, col, rows}) => ({
//       items, col, rows,
//       matrix: makeMatrix(rows, col)
//     }))
//     .then(({items, col, rows, matrix}) => {
//       let res = [];

//       items.forEach((item) => {
//         let position = findFreeSpaceForItem(matrix, item, items);

//         res.push({ ...item, ...position });

//         matrix = makeMatrixFromItems(res, rows, col);
//       });

//       return res;
//     })
//     .catch(proxy.print.failure_adjust);
// }
