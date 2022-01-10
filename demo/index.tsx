import * as React from 'react';
import { render } from 'react-dom';
import { RedocStandalone } from '../src';

render(
  <RedocStandalone
    specUrl="openapi.yaml"
    options={{ scrollYOffset: 'nav', untrustedSpec: true }}
  />,
  document.getElementById('container'),
);
