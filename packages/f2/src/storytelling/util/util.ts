import { valuesOfKey, isArray, pick } from '@antv/util';
import { DEFAULT_BASE, DEFAULT_UNIT, OPERATORS } from '../constant';

function deepClone(obj) {
  var objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === 'object') {
          objClone[key] = deepClone(obj[key]);
        } else {
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}

function pickAttrs(element, attrNames: string[]) {
  if (!isArray(element)) {
    return pick(element, attrNames);
  }

  let origin = [];
  element.forEach((e, i) => {
    origin.push(pick(e, attrNames));
  });
  return origin;
}

function init(unit, base) {
  return {
    times: {},
    _unit: unit ? unit : DEFAULT_UNIT,
    _base: base ? base : DEFAULT_BASE,
    fieldValues: [],
    startIndex: 0,
  };
}

function isExpression(str) {
  return OPERATORS.test(str);
}

function findOperator(str) {
  let o = null;
  const index = str.search(OPERATORS);
  if (index > 0) {
    o = str[index];
  }

  return o;
}

function getFactorsToOperate(str, operator) {
  const arr = str.split(operator);
  arr.push(operator);
  return arr;
}

/**
 * 数据字段间运算
 * @param data 数据集
 * @param factors [field1, field2, operator]
 */
function getValuesOfOperation(data, factors) {
  let values = [];
  const field_1 = factors[0];
  const field_2 = factors[1];
  const operator = factors[2];
  data.forEach((record) => {
    values.push(eval(record[field_1] + operator + record[field_2]));
  });
  return Array.from(new Set(values));
}

function getFieldValues(data: any[], field: string) {
  if (isExpression(field)) {
    const factors = getFactorsToOperate(field, findOperator(field));
    return getValuesOfOperation(data, factors);
  }

  return valuesOfKey(data, field);
}

export {
  deepClone,
  pickAttrs,
  getFieldValues,
  init,
  isExpression,
  findOperator,
  getFactorsToOperate,
};
