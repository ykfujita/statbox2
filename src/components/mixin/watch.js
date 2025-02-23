// ミックスイン。watchが長くなるのでミックスインで外に出した。
import Bubble from '../../chart/bubble'
import Bar from '../../chart/bar'
import Map from '../../chart/map'
import Pie from '../../chart/pie'
import Tree from '../../chart/tree'
import Scatter from '../../chart/scatter'
import ScatterEstat from '../../chart/scatter-estat'
import Histogram from '../../chart/histogram'
import Time from '../../chart/time'
import Maps77 from '../../chart/maps77'
import Rank from '../../chart/rank'
import Time2 from '../../chart/time2'
export default {
  name: 'watch',
  computed: {
    s_chartDivLoading () { return this.$store.state.base.chartDivLoading },
    c_centerDivStyle () { return this.centerDivStyle },
    s_leftStat () { return this.$store.state.statList.leftStat },
    s_rightStat () { return this.$store.state.statList.rightStat },
    s_leftStatTime () { return this.$store.state.statList.leftStatTime },
    s_leftStatTimePref () { return this.$store.state.statList.leftStatTimePref },
    // s_rightStatTimePref () { return this.$store.state.statList.rightStatTimePref },
    s_leftStatTimeCity () { return this.$store.state.statList.leftStatTimeCity },
    s_leftStatEstatPref () { return this.$store.state.statList.leftStatEstatPref },
    s_rightStatEstatPref () { return this.$store.state.statList.rightStatEstatPref },
    s_leftStatEstatCity () { return this.$store.state.statList.leftStatEstatCity },
    s_rightStatEstatCity () { return this.$store.state.statList.rightStatEstatCity },
  },
  watch: {
    // 宮崎県市町村用-------------------------------------------------------------------------
    s_leftStat: {
      handler: function(val) {
        // bubble.jsだけにスライダーの詳細を設定するコードが書かれている。
        // 並びはなんでもいい。
        Bubble(val, '#left-bubble-miyazaki-city');
        Bar(val, '#left-bar-miyazaki-city');
        Rank(val, '#left-rank-miyazaki-city');
        Map(val, '#left-map-miyazaki-city');
        Pie(val, '#left-pie-miyazaki-city');
        Tree(val, '#left-tree-miyazaki-city');
        Histogram(val, '#left-histogram-miyazaki-city');
        Scatter(this.s_leftStat, this.s_rightStat);
      },
      deep: true,
    },
    // 宮崎県散布図用-------------------------------------------------------------------------
    s_rightStat: {
      handler: function() {
        Scatter(this.s_leftStat, this.s_rightStat);
      },
      deep: true,
    },
    // 全国都道府県用。散布図も---------------------------------------------------------------
    s_leftStatEstatPref: {
      handler: function (val) {
        Bubble(val, '#left-bubble-pref');
        Bar(val, '#left-bar-pref');
        Rank(val, '#left-rank-pref');
        Map(val, '#left-map-pref');
        Maps77(val, '#left-map77-pref');
        Pie(val, '#left-pie-pref');
        Tree(val, '#left-tree-pref');
        Histogram(val, '#left-histogram-pref');
        Time2(val, '#left-time-pref');
        ScatterEstat(this.s_leftStatEstatPref, this.s_rightStatEstatPref, 'pref', '#left-scatterPref');
      },
      deep: true,
    },
    // 全国都道府県散布図用------------------------------------------------------------------
    s_rightStatEstatPref: {
      handler: function () {
        ScatterEstat(this.s_leftStatEstatPref, this.s_rightStatEstatPref, 'pref', '#left-scatterPref');
      },
      deep: true,
    },
    // 全国市町村用。散布図も-----------------------------------------------------------------
    s_leftStatEstatCity: {
      handler: function (val) {
        Bubble(val, '#left-bubble-city');
        Bar(val, '#left-bar-city');
        Rank(val, '#left-rank-city');
        Map(val, '#left-map-city');
        Pie(val, '#left-pie-city');
        Histogram(val, '#left-histogram-city');
        Time2(val, '#left-time-city');
        ScatterEstat(this.s_leftStatEstatCity, this.s_rightStatEstatCity, 'city', '#left-scatterCity');
      },
      deep: true,
    },
    // 全国市町村散布図用--------------------------------------------------------------------
    s_rightStatEstatCity: {
      handler: function () {
        ScatterEstat(this.s_leftStatEstatCity, this.s_rightStatEstatCity, 'city', '#left-scatterCity');
      },
      deep: true,
    },
    // 時系列。宮崎県用------------------------------------------------------------------------
    s_leftStatTime: {
      handler: function(val) {
        Time(val, '#left-time');
      },
      deep: true,
    },
    // 時系列。全国都道府県用-----------------------------------------------------------------
    s_leftStatTimePref: {
      handler: function(val) {
        Time(val, '#left-timePref');
      },
      deep: true,
    },
    // 時系列。全国市町村用-------------------------------------------------------------------
    s_leftStatTimeCity: {
      handler: function(val) {
        Time(val, '#left-timeCity');
      },
      deep: true,
    },
  },

}
