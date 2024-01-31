import { Route } from 'react-router-dom';
import About from './About';
import ChemicalTesting from './ChemicalTesting';
import Credits from './Credits';

export default [
  <Route path="/info/about" key="/info/about" exact component={About} />,
  <Route path="/info/credits" key="/info/credits" exact component={Credits} />,
  <Route
    path="/info/chemical-testing"
    key="/info/credits"
    exact
    component={ChemicalTesting}
  />,
];
