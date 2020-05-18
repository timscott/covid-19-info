
import React from 'react';
import styled from 'styled-components'
import {Link, useLocation} from 'react-router-dom';
import states from './states';

const StateLinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

const StateLink = styled(Link)`
  text-decoration: none;
  color: #333;
  display: flex;
  margin: 0 5px 5px;
  padding: 6px 8px;
  border: solid 1px #aaa;
  background-color: #ddd;
  border-radius: 4px;
   transition: 0.4s;
  &:hover {
    background-color: #bbb;
  }
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
