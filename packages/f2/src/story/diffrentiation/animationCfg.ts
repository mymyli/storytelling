import { isArray, isFunction } from '@antv/util';
import { deepClone, findOperator, getFactorsToOperate, isExpression } from '../util';
import { AnimationCycle } from '../../canvas/animation/interface';
import timeFunctions from './timeFunctions';

//#region types
type FieldOpt = {
  field: string;
  start?: any;
  base?: number;
  unit?: number;
  f?: Function;
};
type FieldsOpt = FieldOpt[];

type TimeCfg = {
  field: string;
  times: { [k: string]: number };
};
type TimeCfgArray = TimeCfg[];
//#endregion

function registerTimeFunction(key: string, f: Function) {
  if (timeFunctions[key]) {
    throw new Error(`${key} already exists, try another name`);
  }
  timeFunctions[key] = f;
}

function _getTimesOfField(data: any[], xField, fieldOpt: FieldOpt) {
  const { field, start, base, unit, f } = fieldOpt;

  let isX = false;
  if (!isExpression(field)) isX = field === xField;

  let timeFunc: Function = timeFunctions['order'];
  if (typeof f === 'string') {
    timeFunc = timeFunctions[f];
  } else if (isFunction(f)) {
    timeFunc = f;
  }

  return timeFunc(data, field, isX, start, base, unit);
}

// 得到某个排序字段的差异化动画配置
function _assembleTimeCfgOfField(data, xField, fieldOpt) {
  const { field } = fieldOpt;
  const times = _getTimesOfField(data, xField, fieldOpt);

  return {
    field,
    times,
  };
}

// 得到所有排序字段的差异化动画配置
function _assembleTimeCfgs(data, xField, fieldsOpt: FieldsOpt): TimeCfgArray {
  let cfgs = [];
  fieldsOpt.forEach((fieldOpt) => {
    cfgs.push(_assembleTimeCfgOfField(data, xField, fieldOpt));
  });

  return cfgs;
}

// 根据用户设置得到Animation
function assembleAnimation(data, xField, animationOpt) {
  if (!data || !data.length) throw new Error('"data" required when process user option');
  if (!xField) throw new Error('"xField" required by time configuration but get null');

  const animation = deepClone(animationOpt);
  Object.keys(animationOpt).map((key) => {
    const cfg = animationOpt[key];
    if (isArray(cfg)) {
      if (key === 'delay' || key === 'duration') {
        animation[key] = _assembleTimeCfgs(data, xField, cfg);
      }
    }
  });

  return animation;
}

// 入口api
function generateAnimation(userOpt) {
  return (originData, xField) => {
    return assembleAnimation(originData, xField, userOpt);
  };
}

// jsx element从delay或duration中读取自身的时间配置
function _getTimeOfJSXElement(cfgs, item) {
  let time = 0;

  if (typeof cfgs === 'number') {
    time = cfgs;
    return time;
  }

  cfgs.forEach((cfg) => {
    const { field, times } = cfg;

    let key;

    if (isExpression(field)) {
      const factors = getFactorsToOperate(field, findOperator(field));
      const { origin } = item;
      if (origin) {
        key = eval(origin[factors[0]] + factors[2] + origin[factors[1]]);
      } else {
        key = eval(item[factors[0]] + factors[2] + item[factors[1]]);
      }
    } else {
      if (typeof item === 'string') {
        key = item;
      } else {
        const { origin } = item;
        if (origin) {
          key = origin[field];
        } else {
          key = item[field];
        }
      }
    }

    time += times[key];
  });

  return time;
}

// jsx element读取 animation 配置形成自身的Animation
function _getAnimationOfJSXElement(animation, item) {
  const _animation = deepClone(animation);

  //@ts-ignore
  const { delay, duration } = _animation;
  if (delay) {
    _animation['delay'] = _getTimeOfJSXElement(delay, item);
  }
  if (duration) {
    _animation['duration'] = _getTimeOfJSXElement(duration, item);
  }

  return _animation;
}

// jsx element读取 animation cycle 配置形成自身的AnimationCycle
function getAnimationCycleOfJSXElement(animationCycle, item): AnimationCycle {
  let _animationCycle = {};
  if (animationCycle) {
    _animationCycle = deepClone(animationCycle);
    Object.keys(animationCycle).map((step) => {
      let animation = animationCycle[step];
      _animationCycle[step] = _getAnimationOfJSXElement(animation, item);
    });
  }
  return _animationCycle;
}

export {
  registerTimeFunction,
  generateAnimation,
  assembleAnimation,
  getAnimationCycleOfJSXElement,
};
