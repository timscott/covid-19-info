import React from 'react';
import styled, {createGlobalStyle} from 'styled-components'
import Locale from './Locale';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Menu from './Menu';

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
  return (
    <Container>
      <GlobalStyle />
      <Router>
        <Menu />
        <Switch>
          <Route path="/:state">
            <Locale />
          </Route>
        </Switch>
      </Router>
    </Container>
  );
}

export default App;
