/** @jsx jsx */
import { jsx, Canvas, Chart, Interval, Axis, TextGuide } from '@antv/f2';
import { generateAnimation } from '@antv/f2';

const data = [
  { name: 'London', 月份: 'Jan.', 月均降雨量: 18.9 },
  { name: 'London', 月份: 'Feb.', 月均降雨量: 28.8 },
  { name: 'London', 月份: 'Mar.', 月均降雨量: 39.3 },
  { name: 'London', 月份: 'Apr.', 月均降雨量: 81.4 },
  { name: 'London', 月份: 'May.', 月均降雨量: 47 },
  { name: 'London', 月份: 'Jun.', 月均降雨量: 20.3 },
  { name: 'London', 月份: 'Jul.', 月均降雨量: 24 },
  { name: 'London', 月份: 'Aug.', 月均降雨量: 35.6 },
  { name: 'Berlin', 月份: 'Jan.', 月均降雨量: 12.4 },
  { name: 'Berlin', 月份: 'Feb.', 月均降雨量: 23.2 },
  { name: 'Berlin', 月份: 'Mar.', 月均降雨量: 34.5 },
  { name: 'Berlin', 月份: 'Apr.', 月均降雨量: 99.7 },
  { name: 'Berlin', 月份: 'May.', 月均降雨量: 52.6 },
  { name: 'Berlin', 月份: 'Jun.', 月均降雨量: 35.5 },
  { name: 'Berlin', 月份: 'Jul.', 月均降雨量: 37.4 },
  { name: 'Berlin', 月份: 'Aug.', 月均降雨量: 42.4 },
];

const context = document.getElementById('container').getContext('2d');

const delay = [
  { field: '月份', unit: 2500 },
  { field: 'name', start: 'London', unit: 1000 },
];
const duration = 1000;

const { clientHeight } = context.canvas;
const offset = 20;
const height = clientHeight - offset; // 文字标注起始高度

const cfgInterval = {
  delay,
  duration,
  easing: 'linear',
};
const cfgGuide = {
  delay,
  duration,
  property: ['y', 'fillOpacity', ['text', 1]],
  start: {
    text: 0,
    y: height,
    fillOpacity: 0.1,
  },
  end: {
    fillOpacity: 1,
  },
};

const { props } = (
  <Canvas context={context} pixelRatio={window.devicePixelRatio}>
    <Chart data={data}>
      <Axis field="月份" />
      <Axis field="月均降雨量" />
      <Interval
        x="月份"
        y="月均降雨量"
        color="name"
        adjust={{
          type: 'dodge',
          marginRatio: 0.05, // 设置分组间柱子的间距
        }}
        animation={{
          appear: () => generateAnimation(cfgInterval),
        }}
      />
      {data.map((item) => {
        return (
          <TextGuide
            records={[item]}
            onClick={(ev) => {
              console.log('ev: ', ev.points);
            }}
            content={item['月均降雨量']}
            attrs={{
              fill: '#000',
              fontSize: '24px',
            }}
            offsetY={-10}
            offsetX={-10}
            animation={{
              update: () => generateAnimation(cfgGuide),
            }}
          />
        );
      })}
    </Chart>
  </Canvas>
);

const chart = new Canvas(props);
chart.render();
