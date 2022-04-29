import { jsx } from '../../../jsx';
import { deepMix, isFunction } from '@antv/util';
import { getAnimationCycleOfJSXElement } from '../../../story';

export default (props) => {
  const { coord, records, animation } = props;
  const { center, startAngle, endAngle, radius } = coord;
  return (
    <group>
      {records.map((record) => {
        const { key, children } = record;
        return (
          <group key={key}>
            {children.map((item) => {
              const { key, xMin, xMax, yMin, yMax, color, shape } = item;

              //#region 处理接收的animation
              const animationCycle = getAnimationCycleOfJSXElement(animation, item);
              //#endregion

              return (
                <sector
                  key={key}
                  attrs={{
                    x: center.x,
                    y: center.y,
                    fill: color,
                    startAngle: xMin,
                    endAngle: xMax,
                    r0: yMin,
                    r: yMax,
                    ...shape,
                  }}
                  animation={deepMix(
                    {
                      update: {
                        easing: 'linear',
                        duration: 450,
                        property: ['x', 'y', 'startAngle', 'endAngle', 'r0', 'r'],
                      },
                    },
                    animationCycle
                  )}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
};
