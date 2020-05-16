/* global fetch */
import React, {useState, useEffect} from 'react';
import styled, {createGlobalStyle} from 'styled-components'
import {LineChart, Line, YAxis, XAxis, Label, ReferenceLine} from 'recharts';
import {DateTime} from 'luxon';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
      "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const Container = styled.div`
  margin: 20px;
`;

const App = () => {
  const [data, setData] = useState()

  useEffect(() => {
    fetch('https://data.covidactnow.org/snapshot/296/us/states/GA.NO_INTERVENTION.timeseries.json')
    .then(response => {
      return response.json();
    })
    .then(data => {
      const historical = data.timeseries
      .filter(({date}) => {
        return DateTime.fromISO(date) <= DateTime.local();
      });
      setData(historical);
    });
  }, []);

  if (!data) {
    return 'Loading...'
  }

  return (
    <Container>
      <GlobalStyle />
      <div>
        <h2>ICU Beds Used - Georgia</h2>
        <LineChart
          width={1000}
          height={1000}
          data={data}
          margin={{top: 20, right: 20, bottom: 100, left: 20}}
        >
          <ReferenceLine
            x="2020-04-24"
            stroke="#aaa"
            strokeWidth={2}
            label={({viewBox: {x, y, width, height}, offset}) => {
              return (
                <text x={x} y={y + height/2} style={{writingMode: 'tb'}} dx={20} >
                  reopening begins
                </text>
              );
            }}
          />
          <Line
            dot={false}
            type="monotone"
            dataKey="ICUBedsInUse"
            stroke="#8884d8"
            strokeWidth={4}
          />
          <YAxis domain={[0, 300]} />
          <XAxis
            dataKey="date"
            tickMargin="10"
            tickFormatter={value => DateTime.fromISO(value).toFormat('M/d')}
          >
            <Label value="Date" position="bottom" offset={20} />
          </XAxis>
        </LineChart>
      </div>
    </Container>
  );
}

export default App;
