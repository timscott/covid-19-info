/* global fetch */
import React, {useState, useEffect} from 'react';
import styled from 'styled-components'
import {DateTime} from 'luxon';
import {useParams, useLocation, useHistory} from 'react-router-dom';
import states from './states';
import Chart from './Chart';

const {
  REACT_APP_API_VERSION: API_VERSION = '668'
} = process.env;

const SettingsContainer = styled.div`
  margin-top: 20px;
`;

const Container = styled.div`
  margin-top: 20px;
`;

const ChartsContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Loading = () => {
  return <Container>Loading...</Container>
};
const Error = ({error}) => {
  return <Container>{error}</Container>
}

const Locale = () => {
  const query = new URLSearchParams(useLocation().search);
  const showCapacity = query.get('showCapacity') === '1';
  const history = useHistory();

  const {state} = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    setError();
    setLoading(true);
    fetch(`https://data.covidactnow.org/snapshot/${API_VERSION}/us/states/${state.toUpperCase()}.OBSERVED_INTERVENTION.timeseries.json`)
    .then(response => {
      return response.json();
    })
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(err => {
      setError(`Failed to fetch data for ${states[state].name} (${state.toUpperCase()})`);
      setLoading(false);
    });
  }, [state]);

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <Error error={error} />;
  }

  const setShowCapacity = evt => {
    query.set('showCapacity', evt.currentTarget.checked ? 1 : 0);
    history.push({
      search: query.toString()
    })
  };

  const lastUpdated = DateTime.fromISO(data.lastUpdatedDate);
  const timeSeries = data.timeseries
  .filter(({date}) => {
    return DateTime.fromISO(date) <= DateTime.local(); // lastUpdated;
  });

  // const timeSeriesForecast = data.timeseries
  // .filter(({date}) => {
  //   const d = DateTime.fromISO(date);
  //   return d > lastUpdated && d <= DateTime.local();
  // });

  return (
    <>
      <h1>{states[state].name}</h1>
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
      <ChartsContainer>
        <Chart
          state={state}
          resource="ICUBed"
          data={timeSeries}
          totalCapacity={data.actuals.ICUBeds.capacity}
          lastUpdated={lastUpdated}
          showCapacity={showCapacity}
        />
        <Chart
          state={state}
          resource="ventilator"
          data={timeSeries}
          totalCapacity={timeSeries[0].ventilatorCapacity}
          lastUpdated={lastUpdated}
          showCapacity={showCapacity}
        />
      </ChartsContainer>
    </>
  );
};

export default Locale;
