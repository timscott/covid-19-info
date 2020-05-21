import React from 'react';
import {LineChart, Line, YAxis, XAxis, ReferenceLine} from 'recharts';
import {DateTime, Duration} from 'luxon';
import styled from 'styled-components';
import states from './states';

const fields = {
  ICUBed: {
    InUse: {
      name: 'ICU Beds In Use'
    }
  },
  ventilator: {
    InUse: {
      name: 'Ventilators In Use'
    }
  }
};

const ChartContainer = styled.div`
  text-align: center;
`;

const MaxDataGridContainer = styled.div`
  /* text-align: left; */
`;

const Chart = ({resource, state, data, totalCapacity, showCapacity}) => {
  const fieldScope = 'InUse'
  const dataKey = `${resource}s${fieldScope}`;
  const yValues = data.map(row => row[dataKey]);
  const maxY = Math.max(...yValues);
  const maxYOn = DateTime.fromISO([...data].reverse().find(row => row[dataKey] === maxY).date);
  const maxYScale = showCapacity ? Math.max(maxY, totalCapacity) : maxY;
  const maxYAgo = maxYOn.diff(DateTime.local());
  const maxYDaysAgo = Math.floor(-maxYAgo.as('days'));
  const formatter = new Intl.NumberFormat('en-US');

  const {reopeningBegan} = states[state];

  return (
    <ChartContainer>
      <h2>{fields[resource][fieldScope].name}</h2>
      <LineChart
        width={700}
        height={700}
        data={data}
        margin={{top: 20, right: 20, bottom: 20, left: 20}}
      >
        {showCapacity &&
          <ReferenceLine
            y={totalCapacity}
            stroke="#aaa"
            strokeWidth={1}
            strokeDasharray="5,3"
            label={({viewBox: {x, y, width, height}, offset}) => {
              return (
                <text x={width/2} y={y} dy={-10} >
                  total capacity ({formatter.format(totalCapacity)})
                </text>
              );
            }}
          />
        }
        {reopeningBegan &&
          <ReferenceLine
            x={reopeningBegan}
            stroke="#aaa"
            strokeWidth={1}
            strokeDasharray="5,3"
            label={({viewBox: {x, y, width, height}, offset}) => {
              return (
                <text x={x} y={y + height/2} style={{writingMode: 'tb'}} dx={20} >
                  reopening begins
                </text>
              );
            }}
          />
        }
        <Line
          dot={false}
          type="monotone"
          dataKey={dataKey}
          stroke="#8884d8"
          strokeWidth={4}
        />
        <YAxis domain={[0, Math.ceil((maxYScale * 1.1)/100) * 100]} />
        <XAxis
          dataKey="date"
          tickFormatter={value => DateTime.fromISO(value).toFormat('M/d')}
        >
        </XAxis>
      </LineChart>
      <MaxDataGridContainer>
        Peak at <strong>{formatter.format(maxY)}</strong> on <strong>{maxYOn.toFormat('M/d')}</strong> ({formatter.format(maxYDaysAgo)} days ago)
      </MaxDataGridContainer>
    </ChartContainer>
  );
};

export default Chart;
