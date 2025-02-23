import * as Common from './common'
const eventkey = {};
// ---------------------------------------------------------------------------------------------
export default function (val, parentDiv) {
  const prefOrCity = parentDiv.split('-')[parentDiv.split('-').length - 1 ];
  const palentDiv = d3.select(parentDiv);
  const isEStat = val.estat === true;
  if (palentDiv.style('display') === 'none') return;
  let dataset;
  let statName;
  let unit;
  if (isEStat) {
    const target = val.statData[val.statData.length - 1];
    dataset = target.data2;
    statName = val.statName;
    unit = target.data[0]['@unit'];
  } else {
    dataset = val.statData.data;
    statName = val.statData.title;
    unit = val.statData.unit;
  }
  // 大元のSVG領域の大きさを設定-------------------------------------------------------------
  const width = palentDiv.node().getBoundingClientRect().width;
  const height = palentDiv.node().getBoundingClientRect().height
    - palentDiv.select('.chart-div-handle').node().getBoundingClientRect().height;
  const defaultWidth = 300;
  const multi = width / defaultWidth < 5 ? width / defaultWidth : 5;
  // データ等を作るクラス-------------------------------------------------------------------------
  class DataCreate {
    constructor(dataset) {
      this.dataset = dataset;
      this.dataset2 = null;
      this.colorScale = null;
      this.maxLeft = null;
    }
    create() {
      // ソートして順位をつける-------------------------------------------------------------------
      if (prefOrCity === 'pref') this.dataset.shift();
      this.dataset.sort((a, b) => {
        if (a.data > b.data) return -1;
        if (a.data < b.data) return 1;
        return 0;
      });
      this.dataset.forEach((v, i) => v['leftTop'] = i + 1);
      this.dataset2 = JSON.parse(JSON.stringify(this.dataset));
      this.dataset2.sort((a, b) => {
        if (a.data < b.data) return -1;
        if (a.data > b.data) return 1;
        return 0;
      });
      this.maxLeft = d3.max(this.dataset, d => d.data);
      const minLeft = d3.min(this.dataset, d => d.data);
      this.colorScale = d3.scaleLinear()
      .domain([minLeft, this.maxLeft])
      .range(['white', 'red']);
    }
  }
  //--------------------------------------------------------------------------------------------
  const dc = new DataCreate(JSON.parse(JSON.stringify(dataset)));
  dc.create();
  // SVG領域作成-----------------------------------------------------------------------------
  palentDiv.select('.chart-svg').remove();
  palentDiv.select('#rank-container-div').remove();
  palentDiv.style('background', '#d0d0d0');
  const containerDiv = palentDiv.select('.resizers').append('div')
  .attr('id', 'rank-container-div')
  .style('height', (height - 20 * multi) + 'px')
  .style('overflow', 'auto');
  const svg = containerDiv.append('svg')
  .attr('width', width - 25)
  .attr('height', dc.dataset.length * 15 * multi + 40)
  .classed("chart-svg", true);
  //--------------------------------------------------------------------------------------------
  const g = svg.append('g')
  .attr('transform', 'translate(' + (10 * multi) + ',' + (10 * multi + 15) + ')')
  .selectAll('rect')
  .data(dc.dataset)
  .enter();
  // 横棒(上位)--------------------------------------------------------------------------------
  const rectG1 = g.append('g')
  .append('rect')
  .attr('width', 130 * multi)
  .attr('height', 15 * multi)
  .attr('transform', (d, i) => 'translate(' + (0) + ',' + (15 * i * multi) + ')')
  .attr('fill', d => dc.colorScale(d.data))
  .attr('stroke', 'black')
  .attr('stroke-width', 0.2);
  // テキスト------------------------------------------------------------------------------------
  const text1_1 = g.append('g')
  .append('text')
  .attr('transform', (d, i) => 'translate(' + (0) + ',' + (12 * multi + 15 * i * multi) + ')')
  .attr('text-anchor', 'start')
  .attr('font-size', 12 * multi + 'px')
  .text(d => d.leftTop + ' ' + d.cityname )
  .attr('fill', d => {
    const rgb = d3.rgb(dc.colorScale(d.data));
    const cY = 0.3 * rgb.r + 0.6 * rgb.g + 0.1 * rgb.b;
    return cY > 150 ? 'black' : 'white';
  });
  const text1_2 = g.append('g')
  .append('text')
  .attr('transform', (d, i) => 'translate(' + (130 * multi) + ',' + (12 * multi + 15 * i * multi) + ')')
  .attr('text-anchor', 'end')
  .attr('font-size', 12 * multi + 'px')
  .text(d => d.data.toLocaleString())
  .attr('fill', d => {
    const rgb = d3.rgb(dc.colorScale(d.data));
    const cY = 0.3 * rgb.r + 0.6 * rgb.g + 0.1 * rgb.b;
    return cY > 150 ? 'black' : 'white';
  });
  //--------------------------------------------------------------------------------------------
  const g2 = svg.append('g')
  .attr('transform', 'translate(' + (10 * multi + 135 * multi) + ',' + (10 * multi + 15) + ')')
  .selectAll('rect')
  .data(dc.dataset2)
  .enter();
  // 横棒(下位)--------------------------------------------------------------------------------
  const rectG2 = g2.append('g')
  .append('rect')
  .attr('width', 130 * multi)
  .attr('height', 15 * multi)
  .attr('transform', (d, i) => 'translate(0,' + (15 * i * multi) + ')')
  .attr('fill', d => dc.colorScale(d.data))
  .attr('stroke', 'black')
  .attr('stroke-width', 0.2);
  // テキスト------------------------------------------------------------------------------------
  const text2_1 = g2.append('g')
  .append('text')
  .attr('transform', (d, i) => 'translate(0,' + (12 * multi + 15 * i * multi) + ')')
  .attr('text-anchor', 'start')
  .attr('font-size', 12 * multi + 'px')
  .text(d => d.leftTop + ' ' + d.cityname)
  .attr('fill', d => {
    const rgb = d3.rgb(dc.colorScale(d.data));
    const cY = 0.3 * rgb.r + 0.6 * rgb.g + 0.1 * rgb.b;
    return cY > 150 ? 'black' : 'white';
  });
  const text2_2 = g2.append('g')
  .append('text')
  .attr('transform', (d, i) => 'translate(' + (130 * multi) + ',' + (12 * multi + 15 * i * multi) + ')')
  .attr('text-anchor', 'end')
  .attr('font-size', 12 * multi + 'px')
  .text(d => d.data.toLocaleString())
  .attr('fill', d => {
    const rgb = d3.rgb(dc.colorScale(d.data));
    const cY = 0.3 * rgb.r + 0.6 * rgb.g + 0.1 * rgb.b;
    return cY > 150 ? 'black' : 'white';
  });
  // 表名-------------------------------------------------------------------------------------
  svg.append('g')
  .attr('font-size', (12 * multi) + 'px')
  .attr('transform', () => 'translate(5,' + (12 * multi + 5) + ')')
  .attr('class', 'no-print')
  .append('text')
  .text(statName + '　単位：' + unit);
  //--------------------------------------------------------------------------------------------
  const rangeInput = e => {
    const value = Number(e.target.value);
    const dc = new DataCreate(JSON.parse(JSON.stringify(val.statData[value].data2)));
    dc.create();
    rectG1
    .data(dc.dataset, d => d.citycode)
    .transition()
    .duration(200)
    .attr('fill', d => dc.colorScale(d.data))
    .attr('transform', (d, i) => {
      return 'translate(0,' + (12 * multi + 15 * (i - 1) * multi) + ')'
    });
    text1_1
    .data(dc.dataset, d => d.citycode)
    .transition()
    .duration(200)
    .attr('transform', (d, i) => 'translate(0,' + (12 * multi + 15 * i * multi) + ')')
    .text(d => d.leftTop + ' ' + d.cityname)
    .attr('fill', d => {
      const rgb = d3.rgb(dc.colorScale(d.data));
      const cY = 0.3 * rgb.r + 0.6 * rgb.g + 0.1 * rgb.b;
      return cY > 150 ? 'black' : 'white';
    });
    text1_2
    .data(dc.dataset, d => d.citycode)
    .transition()
    .duration(200)
    .attr('transform', (d, i) => 'translate(' + (130 * multi) + ',' + (12 * multi + 15 * i * multi) + ')')
    .text(d => d.data.toLocaleString())
    .attr('fill', d => {
      const rgb = d3.rgb(dc.colorScale(d.data));
      const cY = 0.3 * rgb.r + 0.6 * rgb.g + 0.1 * rgb.b;
      return cY > 150 ? 'black' : 'white';
    });
    //-------------------------------------------------------------------------------------------
    rectG2
    .data(dc.dataset2, d => d.citycode)
    .transition()
    .duration(200)
    .attr('fill', d => dc.colorScale(d.data))
    .attr('transform', (d, i) => 'translate(' + (0) + ',' + (12 * multi + 15 * (i - 1) * multi) + ')');
    text2_1
    .data(dc.dataset2, d => d.citycode)
    .transition()
    .duration(200)
    .attr('transform', (d, i) => 'translate(' + (0) + ',' + (12 * multi + 15 * i * multi) + ')')
    .text(d => d.leftTop + ' ' + d.cityname)
    .attr('fill', d => {
      const rgb = d3.rgb(dc.colorScale(d.data));
      const cY = 0.3 * rgb.r + 0.6 * rgb.g + 0.1 * rgb.b;
      return cY > 150 ? 'black' : 'white';
    });
    text2_2
    .data(dc.dataset2, d => d.citycode)
    .transition()
    .duration(200)
    .attr('transform', (d, i) => 'translate(' + (130 * multi) + ',' + (12 * multi + 15 * i * multi) + ')')
    .text(d => d.data.toLocaleString())
    .attr('fill', d => {
      const rgb = d3.rgb(dc.colorScale(d.data));
      const cY = 0.3 * rgb.r + 0.6 * rgb.g + 0.1 * rgb.b;
      return cY > 150 ? 'black' : 'white';
    });
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
