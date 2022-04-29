import { deepMix, sortBy } from '@antv/util';
import { init, getFieldValues } from '../util';

/* 参数标准
 * data 原数据集
 * field 作为排序依据的字段
 * isX 排序字段是否为x轴字段
 * start 排序起始值
 * base 时间起始值
 * unit 时间差
 */

/**
 * 将数据根据指定字段的值排序，据此顺序决定数据的时间配置，时间配置成等差数列
 */
function getTimesByOrderOfValues_Linear(
  data: any[],
  field: string,
  isX: boolean,
  start?: any,
  base?: number,
  unit?: number
) {
  let { times, _unit, _base, fieldValues, startIndex } = init(unit, base);

  if (isX) {
    fieldValues = getFieldValues(data, field);
  } else {
    let _data = deepMix([], data); // 直接sortBy会改变原数据，导致图形位置变化
    const sortedData = sortBy(_data, field);
    fieldValues = getFieldValues(sortedData, field);
  }

  if (start) {
    startIndex = fieldValues.indexOf(start);
    if (startIndex < 0) {
      throw new Error('"start" value not found');
    }
  }

  for (let i = 0, len = fieldValues.length; i < len; i++) {
    const value = fieldValues[i];
    times[value] = Math.abs((i - startIndex) * _unit) + _base;
  }

  return times;
}

/**
 * 根据数据在指定字段的值获取时间配置
 */
function getTimesByValues(
  data: any[],
  field: string,
  isX: boolean,
  start?: any,
  base?: number,
  unit?: number
) {
  let { times, _unit, _base, fieldValues } = init(unit, base);

  fieldValues = getFieldValues(data, field);
  for (let i = 0, len = fieldValues.length; i < len; i++) {
    const value = fieldValues[i];
    times[value] = value * _unit + _base;
  }
  return times;
}

const functions = {
  order: getTimesByOrderOfValues_Linear,
  value: getTimesByValues,
};

export default functions;
