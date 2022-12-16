import React from 'react';
import {render} from 'react-dom';
import App from './containers/app';
import './style.less';
import './example.less';

render(
  <App />,
  document.getElementById('app')
);
