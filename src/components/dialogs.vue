<template>
  <el-dialog
    title="保存"
    :visible.sync="s_dialogVisible"
    width="320px"
    center
  >
    <div class="dialog-div">
      <p>画像保存。形式を選択してください。</p>
      <el-button
        class="svg-btn"
        type="primary"
        @click="saveSvg"
      >
        SVG形式
      </el-button>
      <el-button
        class="png-btn"
        type="primary"
        @click="savePng"
      >
        PNG形式
      </el-button>
    </div>
    <div class="dialog-div">
      <P>CSVをダウンロードします。</P>
      <el-button
        id="csv-btn"
        type="primary"
        @click="csvDownload"
      >
        ダウンロード
      </el-button>
    </div>
    <!--<span slot="footer" class="dialog-footer">-->
    <!--</span>-->
  </el-dialog>
</template>

<script>
  import d3SaveSvg from 'd3-save-svg'
  import Encoding from 'encoding-japanese'
  import Papa from 'papaparse'
  import pngSave from '../otherjs/pngsave'
  export default {
    name: "Dialogs",
    props: {
      statType: {type: String, default: ''}
    },
    computed: {
      s_dialogVisible: {
        get() { return this.$store.state.base.dialog.visible },
        set(value) { this.$store.commit('base/dialogVisibleChange', {visible: value}) }
      },
    },
    methods: {
      saveSvg () {
        const target = this.$store.state.base.dialog.target;
        const svg = d3.select('#left-' + target).select('svg');
        const config = {
          filename: target,
        };
        d3SaveSvg.save(svg.node(), config);
      },
      savePng () {
        const target = this.$store.state.base.dialog.target;
        const svg = d3.select('#left-' + target).select('svg');
        const width = svg.style('width').replace('px', '');
        const height = svg.style('height').replace('px', '');
        const statName = target;
        svg.selectAll('.no-print').attr('display', 'none');
        pngSave(svg, width, height, statName);
        svg.selectAll('.no-print').attr('display', 'block');
        this.dialogVisible = false
      },
      csvDownload () {
        const csvCreate = csvData => {
          // configの初期値
          const config = {
            delimiter: ',', // 区切り文字
            header: true, // キーをヘッダーとして扱う
            newline: '\r\n', // 改行
          };
          // 区切り文字へ変換
          const delimiterString = Papa.unparse(csvData, config);
          // blobUrlへの変換
          const strArray = Encoding.stringToCode(delimiterString);
          const convertedArray = Encoding.convert(strArray, 'SJIS', 'UNICODE');
          const UintArray = new Uint8Array(convertedArray);
          const blobUrl = new Blob([UintArray], {type: 'text/csv'});
          const blob = blobUrl;
          const aTag = document.createElement('a');
          const fileName = 'data.csv';
          aTag.download = fileName;
          // 各ブラウザに合わせ、CSVをダウンロード
          if (window.navigator.msSaveBlob) {
            // for IE
            window.navigator.msSaveBlob(blob, aTag.download);
          } else if (window.URL && window.URL.createObjectURL) {
            // for Firefox
            aTag.href = window.URL.createObjectURL(blob);
            document.body.appendChild(aTag);
            aTag.click();
            document.body.removeChild(aTag);
          } else if (window.webkitURL && window.webkitURL.createObject) {
            // for Chrome
            aTag.href = (window.URL || window.webkitURL).createObjectURL(blob);
            aTag.click();
          } else {
            // for Safari
            window.open(
              `data:type/csv;base64,${window.Base64.encode(this.state.content)}`,
              '_blank'
            );
          }
        };
        // ---------------------------------------------------------------------------------------
        const csvData = [];
        if (this.statType === 'miyazakiCity') {
          const statData = this.$store.state.statList.leftStat.statData.data;
          statData.forEach(value => {
            csvData.push({
              citycode: value.citycode,
              cityname: value.cityname,
              data: value.data
            })
          });
          csvCreate(csvData);
        } else if (this.statType === 'pref' || this.statType === 'city') {
          const statData = this.statType === 'pref' ? this.$store.state.statList.leftStatEstatPref.statData : this.$store.state.statList.leftStatEstatCity.statData;
          statData.forEach(value => {
            value.data2.forEach(value2 => {
              csvData.push({
                year: value2.time.substr(0, 4),
                citycode: value2.citycode,
                cityname: value2.cityname,
                data: value2.data
              })
            })
          });
          csvCreate(csvData)
        } else if (this.statType === 'time' || this.statType === 'timePref' || this.statType === 'timeCity') {
          let statData;
          if (this.statType === 'time') {
            statData = this.$store.state.statList.leftStatTime.statData;
          } else if (this.statType === 'timePref') {
            statData = this.$store.state.statList.leftStatTimePref.statData;
          } else if (this.statType === 'timeCity') {
            statData = this.$store.state.statList.leftStatTimeCity.statData;
          }
          statData.forEach(value => {
            value.data.forEach(value2 => {
                if (value2.data) {
                  csvData.push({
                    year: value2.year,
                    data: value2.data
                  })
                }
            })
          });
          csvCreate(csvData)
        } else {
          alert('未作成です。')
        }
      },
    }
  }
</script>
