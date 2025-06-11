import { RouteWithModels } from '@flumens';
import savedSamples from 'models/collections/samples';
import Branch from './Branch';
import Home from './Home';
import Location from './Location';
import Species from './Species';
import StartNewSurvey from './StartNewSurvey';
import Trunk from './Trunk';
import survey from './config';

const baseURL = `/survey`;

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/location`, Location],

  [`${baseURL}/:smpId/trunk/:treeBranchNumber`, Trunk],
  [`${baseURL}/:smpId/trunk/:treeBranchNumber/part/:treeBranchPart`, Species],

  [`${baseURL}/:smpId/branch/:treeBranchNumber`, Branch],
  [`${baseURL}/:smpId/branch/:treeBranchNumber/part/:treeBranchPart`, Species],
];

export default RouteWithModels.fromArray(savedSamples, routes);
