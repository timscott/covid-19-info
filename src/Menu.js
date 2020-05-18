
import React from 'react';
import styled from 'styled-components'
import {Link, useLocation} from 'react-router-dom';
import states from './states';

const StateLinksContainer = styled.div``;

const StateLink = styled(Link)`
  margin-right: 20px;
`;
const Menu = () => {
  const query = new URLSearchParams(useLocation().search);
  return (
    <StateLinksContainer>
      {Object.keys(states).map(key => {
        return <StateLink key={key} to={`/${key.toLocaleLowerCase()}?${query.toString()}`}>{states[key].name}</StateLink>
      })}
    </StateLinksContainer>
  )
};

export default Menu;
