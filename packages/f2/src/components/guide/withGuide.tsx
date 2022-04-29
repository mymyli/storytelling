import { jsx } from '../../jsx';
import Component from '../../base/component';
import { isString, isNil, isFunction } from '@antv/util';
import { Ref } from '../../types';
import Chart from '../../chart';
import { renderShape } from '../../base/diff';
import { deepClone } from '../../story/util';

function isInBBox(bbox, point) {
  const { minX, maxX, minY, maxY } = bbox;
  const { x, y } = point;
  return minX <= x && maxX >= x && minY <= y && maxY >= y;
}

export default (View) => {
  return class Guide extends Component {
    chart: Chart;
    triggerRef: Ref;

    constructor(props) {
      super(props);
      // 创建ref
      this.triggerRef = {};
      this.state = {};
    }

    willMount() {
      super.willMount();
      this.getGuideBBox();
    }

    didMount() {
      const { context, props } = this;
      const { canvas } = context;
      const { onClick } = props;

      canvas.on('click', (ev) => {
        const { points } = ev;
        const shape = this.triggerRef.current;
        if (!shape || shape.isDestroyed()) return;
        const bbox = shape.getBBox();
        if (isInBBox(bbox, points[0])) {
          ev.shape = shape;
          onClick && onClick(ev);
        }
      });
    }

    getGuideBBox() {
      const shape = renderShape(this, this.render(), false);
      const { x, y, width, height } = shape.get('attrs');
      // getBBox 没有包含 padding 所以这里手动计算 bbox
      const bbox = {
        minX: x,
        minY: y,
        maxX: x + width,
        maxY: y + height,
        width,
        height,
      };
      this.setState({
        guideBBox: bbox,
      });
      shape.destroy();
    }

    // 解析record里的模板字符串，如min、max、50%...
    parseReplaceStr(value, scale) {
      const replaceMap = {
        min: 0,
        max: 1,
        median: 0.5,
      };

      // 传入的是 min、max、median 的
      if (!isNil(replaceMap[value])) {
        return replaceMap[value];
      }

      // 传入的是 xx%
      if (isString(value) && value.indexOf('%') != -1 && !isNaN(Number(value.slice(0, -1)))) {
        const rateValue = Number(value.slice(0, -1));
        const percent = rateValue / 100;
        return percent;
      }

      return scale.scale(value);
    }

    parsePoint(record) {
      const { props } = this;
      const { chart, coord } = props;
      const xScale = chart.getXScales()[0];
      // 只取第一个yScale
      const yScale = chart.getYScales()[0];

      // 解析 record 为归一化后的坐标
      const x = this.parseReplaceStr(record[xScale.field], xScale);
      const y = this.parseReplaceStr(record[yScale.field], yScale);

      return coord.convertPoint({ x, y });
    }

    convertPoints(records) {
      return records.map((record) => this.parsePoint(record));
    }

    getGuideTheme() {
      const { context } = this;
      const { theme } = context;
      return theme.guide;
    }

    // 根据传入组件的 animation 计算获得AnimationCycle
    getAnimationCycle(animationCycle) {
      if (!animationCycle) {
        return;
      }

      const { props } = this;
      const { chart, data: originData } = props;
      const xScale = chart.getXScales()[0];
      const { field: xField } = xScale;

      const _animationCycle = deepClone(animationCycle);
      Object.keys(animationCycle).map((step) => {
        const animation = _animationCycle[step];
        if (isFunction(animation)) {
          _animationCycle[step] = animation()(originData, xField as string);
        }
      });
      return _animationCycle;
    }

    render() {
      const { props, context } = this;
      const { coord, records = [], animation, chart } = props;

      const { width, height } = context;
      const points = this.convertPoints(records);
      const theme = this.getGuideTheme();
      const { guideWidth, guideHeight, guideBBox } = this.state;

      //#region time Cfg
      const origin = records[0];
      const animationCycle = this.getAnimationCycle(animation);
      //#endregion

      return (
        <View
          triggerRef={this.triggerRef}
          points={points}
          theme={theme}
          coord={coord}
          {...props}
          canvasWidth={width}
          canvasHeight={height}
          guideWidth={guideWidth}
          guideHeight={guideHeight}
          guideBBox={guideBBox}
          animation={animationCycle}
        />
      );
    }
  };
};
