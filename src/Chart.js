import React from 'react';
import {LineChart, Line, YAxis, XAxis, ReferenceLine} from 'recharts';
import {DateTime} from 'luxon';
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

const Title = styled.h2`
  text-align: center;
`;

const ChartContainer = styled.div`

`;

const MaxDataGridContainer = styled.div`
  text-align: center;
`;

const Footnotes = styled.div`
  margin-top: 20px;
  margin-left: 10px;
  align-self: left;
`;

const Chart = ({resource, state, data, totalCapacity, showCapacity, lastUpdated}) => {
  const fieldScope = 'InUse'
  const dataKey = `${resource}s${fieldScope}`;
  const yValues = data.map(row => row[dataKey]);
  const maxY = Math.max(...yValues);
  const maxYOn = DateTime.fromISO([...data].reverse().find(row => row[dataKey] === maxY).date);
  const maxYScale = showCapacity ? Math.max(maxY, totalCapacity) : maxY;
  const maxYAgo = maxYOn.diff(DateTime.local());
  const maxYDaysAgo = Math.floor(-maxYAgo.as('days'));

  const formatter = (options = {}) => new Intl.NumberFormat('en-US', options);

  const {reopeningBegan} = states[state];

  return (
    <ChartContainer>
      <Title>{fields[resource][fieldScope].name} ‡</Title>
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
                  total capacity ({formatter().format(totalCapacity)})
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
                  reopening begins *
                </text>
              );
            }}
          />
        }
        {lastUpdated &&
          <ReferenceLine
            x={lastUpdated.toFormat('yyyy-MM-dd')}
            stroke="#02a4d3"
            strokeWidth={1}
            strokeDasharray="5,3"
            label={({viewBox: {x, y, width, height}, offset}) => {
              return (
                <text x={x} y={y + height/2} style={{writingMode: 'tb'}} dx={20} >
                  last updated ***
                </text>
              );
            }}
          />
        }
        <ReferenceLine
          x="2020-05-26"
          stroke="#aaa"
          strokeWidth={1}
          strokeDasharray="5,3"
          label={({viewBox: {x, y, width, height}, offset}) => {
            return (
              <text x={x} y={y + height/2} style={{writingMode: 'tb'}} dx={20} >
                protests begin **
              </text>
            );
          }}
        />
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
        Peak at <strong>{formatter().format(maxY)}</strong> on <strong>{maxYOn.toFormat('M/d')}</strong> ({formatter().format(maxYDaysAgo)} days ago, {formatter({style: 'percent', maximumFractionDigits: 0}).format(maxY/totalCapacity)} capacity)
      </MaxDataGridContainer>
      <Footnotes>
        <div>‡ source: <a href="https://covidactnow.org/" target="blank">COVID ActNow</a></div>
        <div>* source: <a href="https://www.nytimes.com/interactive/2020/us/states-reopen-map-coronavirus.html" target="blank">The New York Times</a></div>
        <div>** source <a href="https://en.wikipedia.org/wiki/George_Floyd_protests" target="blank">Wikipedia</a></div>
        <div>*** values after this date are projected</div>
      </Footnotes>
    </ChartContainer>
  );
};

export default Chart;
