import { useEffect, useRef } from 'react';
import bb from 'billboard.js';
import 'billboard.js/dist/billboard.css';
import 'd3';
import Sample from 'common/models/sample';
import { getBranchNAQI, getLIS, getTrunkNAQI } from 'Survey/utils';
import './styles.scss';

const getPollutionMessage = function (naqi: number) {
  console.log(naqi);

  if (naqi > 1.25)
    return (
      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
        Very Nitrogen polluted
      </span>
    );
  if (naqi > 0.86)
    return (
      <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10">
        Nitrogen polluted
      </span>
    );
  if (naqi > 0.5)
    return (
      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
        At risk
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
      Clean
    </span>
  );
};

type Props = { sample: Sample };

const Results = ({ sample }: Props) => {
  const ref = useRef<any>();

  const trunkLIS: any = getLIS('trunk', sample);
  const branchLIS: any = getLIS('branch', sample);

  const trunkNAQI = getTrunkNAQI(trunkLIS);
  const branchNAQI = getBranchNAQI(branchLIS);

  const hasTrunkResults = Number.isFinite(trunkLIS);
  const hasBranchResults = Number.isFinite(branchLIS);

  const addGraph = () => {
    if (!ref.current) return;

    const trunkScore = [
      ['x3', trunkNAQI],
      ['trunk', trunkLIS],
    ];

    const branchScore = [
      ['x4', branchNAQI],
      ['branch', branchLIS],
    ];

    bb.generate({
      data: {
        xs: {
          trunkLine: 'x1',
          branchLine: 'x2',
          trunk: 'x3',
          branch: 'x4',
        },
        columns: [
          ['x1', 0, 2],
          ['trunkLine', 3.7, -3],

          ['x2', 0, 1.6],
          ['branchLine', 3.4, -3],
          ...trunkScore,
          ...branchScore,
        ],
        type: 'line',
        colors: {
          trunk: 'black',
          trunkLine: 'black',
          branch: 'purple',
          branchLine: 'purple',
        },
        names: {
          trunk: null,
          trunkLine: 'Trunk',
          branch: null,
          branchLine: 'Branch',
        },
      },
      axis: {
        x: {
          label: { text: 'NAQI', position: 'outer-right' },
          min: 0,
          max: 2,
          tick: { count: 5 },
          padding: { right: 0.1 },
        },
        y: {
          inner: true,
          label: { text: 'LIS', position: 'inner-top' },
          max: 2.7,
          min: -2.7,
          tick: { stepSize: 1 },
          padding: { top: 10, bottom: 0 },
        },
      },
      grid: {
        y: {
          show: true,
        },
      },
      point: {
        r: 8,
        pattern: [
          "<polygon points='0 0'></polygon>",
          "<polygon points='0 0'></polygon>",
          'circle',
          'circle',
        ],
      },
      regions: [
        {
          axis: 'x',
          end: 0.5,
          class: 'regionClean',
          label: {
            x: 20,
            y: 180,
            text: 'Clean',
            color: 'gray',
          },
        } as any,
        {
          axis: 'x',
          start: 0.5,
          end: 0.85,
          class: 'regionAtRisk',
          label: {
            x: 10,
            y: 180,
            text: 'At risk',
            color: 'gray',
          },
        },
        {
          axis: 'x',
          start: 0.85,
          end: 1.25,
          class: 'regionPolluted',
          label: {
            x: 10,
            y: 40,
            text: 'Polluted',
            color: 'gray',
          },
        },
        {
          axis: 'x',
          start: 1.25,
          class: 'regionVeryPolluted',
          label: {
            x: 20,
            y: 40,
            text: 'Very Polluted',
            color: 'gray',
          },
        },
      ],
      line: {
        classes: ['trunk-line', 'branch-line'],
      },
      legend: {
        padding: 40,
        item: {
          onclick: () => null,
        },
      },
      padding: { left: 20, right: 0 },
      bindto: ref.current,
    });
  };
  useEffect(addGraph, [ref, trunkLIS, branchLIS]);

  return (
    <div className="m-2 divide-y rounded-md bg-white p-1">
      {hasTrunkResults && (
        <div className="p-3">
          <div className="mb-2 font-semibold">
            Trunk: {getPollutionMessage(trunkNAQI)}
          </div>
          <div>Nitrogen Air Quality Index (NAQI): {trunkNAQI.toFixed(1)}</div>
          <div>Lichen indicator score (LIS): {trunkLIS.toFixed(1)}</div>
        </div>
      )}

      {hasBranchResults && (
        <div className="p-3">
          <div className="mb-2 font-semibold">
            Branch: {getPollutionMessage(branchNAQI)}
          </div>
          <div>Nitrogen Air Quality Index (NAQI): {branchNAQI.toFixed(1)}</div>
          <div>Lichen indicator score (LIS): {branchLIS.toFixed(1)}</div>
        </div>
      )}

      <div>
        <div ref={ref} className="mx-1 my-3" />
        <div className="p-3">
          <p>
            The lines on this graph indicate mean values for the LIS taken from
            a UK wide survey.
          </p>
          <p className="mt-2">
            The LIS NAQI relationship for branches should be read from the
            broken line and for trunks from the solid line.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="mb-2 font-bold">Sites that are designated as:</div>
        <div>
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
            Clean
          </span>{' '}
          have an NAQI between 0 and 0.5
        </div>
        <div>
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
            At risk
          </span>{' '}
          NAQI {'>'} 0.5-0.85
        </div>
        <div>
          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10">
            Nitrogen polluted
          </span>{' '}
          NAQI 0.86-1.25
        </div>
        <div>
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
            Very Nitrogen polluted
          </span>{' '}
          NAQI {'>'} 1.25
        </div>

        <div className="mt-3">See Guide for further guidance.</div>
      </div>
    </div>
  );
};

export default Results;
