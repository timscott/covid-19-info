/* global fetch */
import React, {useState, useEffect} from 'react';
import styled from 'styled-components'
import {LineChart, Line, YAxis, XAxis, Label, ReferenceLine} from 'recharts';
import {DateTime} from 'luxon';
import {Link, useParams, useLocation, useHistory} from 'react-router-dom';
import states from './states';

const fields = {
  ICUBeds: {
    InUse: {
      name: 'ICU Beds In Use'
    }
  }
};

const StateLinksContainer = styled.div``;

const StateLink = styled(Link)`
  margin-right: 20px;
`;

const SettingsContainer = styled.div`
  margin-top: 20px;
`;

const Container = styled.div`
  margin-top: 20px;
`;

const Loading = () => {
  return <Container>Loading...</Container>
};
const Error = ({error}) => {
  return <Container>{error}</Container>
}

const Chart = ({showCapacity}) => {
  const {state: stateParam} = useParams();
  const state = stateParam.toUpperCase();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    setError();
    setLoading(true);
    fetch(`https://data.covidactnow.org/snapshot/296/us/states/${state}.NO_INTERVENTION.timeseries.json`)
    .then(response => {
      return response.json();
    })
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(err => {
      setError(`Failed to fetch data for ${states[state].name} (${state})`);
      setLoading(false);
    });
  }, [state]);

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <Error error={error} />;
  }

  const timeSeries = data.timeseries
  .filter(({date}) => {
    return DateTime.fromISO(date) <= DateTime.local();
  });

  const fieldName = 'ICUBeds';
  const fieldScope = 'InUse'
  const dataKey = `${fieldName}${fieldScope}`;

  const yValues = timeSeries.map(row => row[dataKey]);
  if (showCapacity) {
    yValues.push(data.actuals.ICUBeds.totalCapacity);
  }
  const maxY = Math.max(...yValues);

  const {reopeningBegan} = states[state];

  return (
    <div>
      <h2>{fields[fieldName][fieldScope].name} - {states[state].name}</h2>
      <LineChart
        width={600}
        height={600}
        data={timeSeries}
        margin={{top: 20, right: 20, bottom: 100, left: 20}}
      >
        {showCapacity &&
          <ReferenceLine
            y={data.actuals.ICUBeds.totalCapacity}
            stroke="#aaa"
            strokeWidth={1}
            strokeDasharray="5,3"
            label={({viewBox: {x, y, width, height}, offset}) => {
              return (
                <text x={width/2} y={y} dy={-10} >
                  total capacity
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
        <YAxis domain={[0, Math.round((maxY * 1.1)/100) * 100]} />
        <XAxis
          dataKey="date"
          tickFormatter={value => DateTime.fromISO(value).toFormat('M/d')}
        >
          <Label value="Date" position="bottom" offset={20} />
        </XAxis>
      </LineChart>
    </div>
  );
};

const ChartContainer = () => {
  const query = new URLSearchParams(useLocation().search);
  const showCapacity = query.get('showCapacity') === '1';
  const history = useHistory();

  const setShowCapacity = evt => {
    query.set('showCapacity', evt.currentTarget.checked ? 1 : 0);
    history.push({
      search: query.toString()
    })
  };

  return (
    <>
      <StateLinksContainer>
        {Object.keys(states).map(key => {
          return <StateLink key={key} to={`/${key.toLowerCase()}?${query.toString()}`}>{states[key].name}</StateLink>
        })}
      </StateLinksContainer>
      <SettingsContainer>
        <label>
          <input
            type="checkbox"
            checked={showCapacity}
            onChange={setShowCapacity}
          />
          show total capacity
        </label>
      </SettingsContainer>
      <Chart showCapacity={showCapacity} />
    </>
  );
};

export default ChartContainer;
