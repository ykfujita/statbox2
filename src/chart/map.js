import storeBase from "../store/store-base";
import * as GeoPref from './geo-pref'
import * as Common from './common'
const eventkey = {};
// ---------------------------------------------------------------------------------------------
export default function (val, parentDiv) {
  const prefOrCity = parentDiv.split('-')[parentDiv.split('-').length - 1];
  const palentDiv = d3.select(parentDiv);
  const isEStat = val.estat === true;
  if(palentDiv.style('display') === 'none') return;
  let dataset;
  let statName;
  let unit;
  if (isEStat) {
    const target = val.statData[val.statData.length - 1];
    const allPrefData = target.data;
    dataset = target.data2;
    statName = val.statName;
    unit = allPrefData[0]['@unit'];
  } else {
    dataset = val.statData.data;
    statName = val.statData.title;
    unit = val.statData.unit;
  }
  const tooltip = d3.select('.d3-tooltip');
  // 大元のSVG領域の大きさを設定-------------------------------------------------------------
  const width = palentDiv.node().getBoundingClientRect().width;
  const height = palentDiv.node().getBoundingClientRect().height
    - palentDiv.select('.chart-div-handle').node().getBoundingClientRect().height;
  const defaultWidth = 300;
  const multi = width / defaultWidth < 1.5 ? width / defaultWidth : 1.5;
  //トランジションフラグ----------------------------------------------------------------------------
  const transitionFlg = storeBase.state.statList.transition;
  // データ等を作るクラス-------------------------------------------------------------------------
  class DataCreate {
    constructor (dataset) {
      this.dataset = dataset;
      this.colorScale = null;
      this.maxLeft = null;
      this.legendDataSet = null;
      this.prefCode = null;
    }
    create () {
      if (prefOrCity === 'pref') this.dataset.shift();
      // ソートして順位をつける-------------------------------------------------------------------
      this.dataset.sort((a, b) => {
        if (a.data > b.data) return -1;
        if (a.data < b.data) return 1;
        return 0;
      });
      this.dataset.forEach((v, i) => v['leftTop'] = i + 1);
      this.dataset.sort((a, b) => {
        if (a.citycode < b.citycode) return -1;
        if (a.citycode > b.citycode) return 1;
        return 0;
      });
      this.maxLeft = d3.max(this.dataset, d => d.data);
      const minLeft = d3.min(this.dataset, d => d.data);
      this.colorScale = d3.scaleLinear()
      .domain([minLeft, this.maxLeft])
      .range(['white', 'red']);
      const value = this.maxLeft / 5;
      this.legendDataSet = [];
      for (let i = 0; i < 5; i++) {
        this.legendDataSet.push({
          color: this.colorScale(value * (5 - i)),
          value: value * (5 - i)
        })
      }
      const data0 = String(this.dataset[0].citycode).substr(0, 2);
      const data1 = String(this.dataset[1].citycode).substr(0, 2);
      this.prefCode = data0 !== data1 ? '00' : data0
    }
  }
  //---------------------------------------------------------------------------------------------
  const dc = new DataCreate(JSON.parse(JSON.stringify(dataset)));
  dc.create();
  const json = GeoPref['pref' + dc.prefCode];
  // projectionを定義----------------------------------------------------------------------
  let projection;
  if (dc.prefCode === '00') {
    projection = d3.geoMercator()
    .center([138.141, 38.219])
    .translate([width / 2, height / 2]) // svgの中心
    .scale(2.5 * (width < height ? width : height));
  } else if ((dc.prefCode === '13')) {
    projection = d3.geoMercator()
    .center([139.360, 35.6941])
    .translate([width / 2, height / 2]) // svgの中心
    .scale(50 * (width < height ? width : height));
  } else {
    projection = d3.geoMercator()
    .fitExtent([[20, 20], [width - 10, height - 20]], json)
  }
  // pathを定義
  const path = d3.geoPath(projection);
  // SVG領域作成---------------------------------------------------------------------------
  palentDiv.select('.chart-svg').remove();
  palentDiv.style('background', '#d0d0d0');
  const svg = palentDiv.select('.resizers').append('svg')
  .attr('width', width)
  .attr('height', height)
  .classed("chart-svg", true);
  // -------------------------------------------------------------------------------------------
  const g = svg.append('g')
  .selectAll('path')
  .data(json.features)
  .enter();
  const p = g.append('path')
  .attr('d', path)
  .attr('stroke', 'gray')
  .attr('stroke-width', '0.3px')
  .attr('fill', 'rgba(255,255,255,0.1)');
  // ツールチップ--------------------------------------------------------------------------------
  p
  .on('mouseover', function(d) {
    const result = dataset.find(el => Number(el.citycode) === Number(d.properties.citycode));
    if (result) {
      tooltip
      .style('visibility', 'visible')
      .html(`${result.cityname}<br>${result.data}${unit}`);
      d3.select(this).attr('stroke', 'black');
    }
  })
  .on('mousemove', () => {
    tooltip
    .style('top', (d3.event.pageY - 45) + 'px')
    .style('left', (d3.event.pageX + 20) + 'px');
  })
  .on('mouseout', function () {
    tooltip.style('visibility', 'hidden');
    d3.select(this)
    .attr('stroke', 'gray');
  });
  //--------------------------------------------------------------------------------------------
  if (transitionFlg) {
    p
    .transition()
    .delay((d, i) => i * 10)
    .attr("fill", d => {
      if (d.properties.citycode) {
        const result = dataset.find(value => Number(value.citycode) === Number(d.properties.citycode));
        return result ? dc.colorScale(result.data) : 'rgba(0,0,0,0)'
      }
        return 'rgba(0,0,0,0)'

    });
  } else {
    p
    .attr("fill", d => {
      if (d.properties.citycode) {
        const result = dataset.find(value => Number(value.citycode) === Number(d.properties.citycode));
        return result ? dc.colorScale(result.data) : 'rgba(0,0,0,0)'
      }
        return 'rgba(0,0,0,0)'

    });
  }
  // 凡例---------------------------------------------------------------------------------------
  const g2 = svg.append('g')
  .attr('transform', 'translate(' + (5) + ',' + (30 * multi) + ')')
  .selectAll('rect')
  .data(dc.legendDataSet)
  .enter();
  const rect = g2.append('rect')
  .attr('transform', (d, i) => 'translate(0,' + (20 * i * multi) + ')')
  .attr('width', 20 * multi)
  .attr('height', 20 * multi)
  .attr('stroke', 'black')
  .attr('stroke-width', '0.3px')
  .attr('fill', 'rgba(255,255,255,0.1)');
  if (transitionFlg) {
    rect.transition()
    .delay((d, i) => i * 100)
    .attr('fill', d => d.color);
  } else {
    rect.attr('fill', d => d.color);
  }
  const legendText = g2.append('text')
  .attr('font-size', 10 * multi + 'px')
  .attr('transform', (d, i) => 'translate(' + (22 * multi) + ',' + (10 * multi + 20 * i * multi) + ')')
  .text(d => Math.floor(d.value).toLocaleString() + ' ' + unit);
  // 表名---------------------------------------------------------------------------------------
  svg.append('g')
  .attr('font-size', 12 * multi + 'px')
  .attr('transform', () => 'translate(5,' + (12 * multi + 5) + ')')
  .attr('class', 'no-print')
  .append('text')
  .text(statName);
  // ズーム--------------------------------------------------------------------------------------
  const zoom =
    d3.zoom()
    .on('zoom', () => svg.selectAll('path').attr("transform", d3.event.transform));
  svg.call(zoom);
  // -------------------------------------------------------------------------------------------
  const rangeInput = e => {
    const value = Number(e.target.value);
    const dc = new DataCreate(JSON.parse(JSON.stringify(val.statData[value].data2)));
    dc.create();
    p
    .attr("fill", d => {
      if (d.properties.citycode) {
        const result = dataset.find(value => Number(value.citycode) === Number(d.properties.citycode));
        return result ? dc.colorScale(result.data) : 'rgba(0,0,0,0)'
      }
        return 'rgba(0,0,0,0)'

    });
    rect
    .data(dc.legendDataSet)
    .attr('fill', d => d.color);
    legendText
    .data(dc.legendDataSet)
    .text(d => Math.floor(d.value).toLocaleString() + ' ' + unit);
  };
  //--------------------------------------------------------------------------------------------
  if (isEStat) {
    const type = ie ? 'change' : 'input';
    Common.eventAddRemove.removeListener(eventkey[prefOrCity]);
    eventkey[prefOrCity] = Common.eventAddRemove.addListener(document.querySelector('#year-range-' + prefOrCity + ' .year-range'), type, (() => {
      return e => rangeInput(e)
    })(1), false);
  }
}
