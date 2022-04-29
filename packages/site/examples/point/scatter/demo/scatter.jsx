/** @jsx jsx */
import { jsx, Canvas, Chart, Point, Axis } from '@antv/f2';
import { generateAnimation } from '@antv/f2';

fetch('https://gw.alipayobjects.com/os/antfincdn/6HodecuhvM/scatter.json')
  .then((res) => res.json())
  .then((data) => {
    const context = document.getElementById('container').getContext('2d');

    const cfg = {
      delay: [{ field: 'weight+height', unit: 50 }],
      property: ['fillOpacity'],
      start: {
        fillOpacity: 0,
      },
    };

    const { props } = (
      <Canvas context={context} pixelRatio={window.devicePixelRatio}>
        <Chart
          data={data}
          coord={{}}
          scale={{
            height: {
              tickCount: 5,
            },
            weight: {
              tickCount: 5,
            },
          }}
        >
          <Axis field="height" />
          <Axis field="weight" />
          <Point
            x="height"
            y="weight"
            color="gender"
            style={{ fillOpacity: 0.8 }}
            animation={{
              appear: () => generateAnimation(cfg),
            }}
          />
        </Chart>
      </Canvas>
    );

    const chart = new Canvas(props);
    chart.render();
  });
