<template>
  <div class="page">
    <h1 class="title">18650 Constructor</h1>
    <section class="settings">
      <div class="settings-btns">
        <button @click="saveAsJSON()">Save As JSON</button>
        <label class="file-label">
          <input
            type="file"
            accept="application/json, .json"
            @change="importFromJSON($event)"
          >
          <span>Import from JSON file</span>
        </label>
        <button @click="getDemoData()">Get Demo Data</button>
        <a href="https://github.com/imhvost/18650-constructor" target="_blanh">Github</a>
      </div>
      <div class="battery">
        <h2 class="title">Battery</h2>
        <div class="battery-inputs">
          <label>
            <input
              type="number"
              v-model="battery.s"
              placeholder="Successively"
            >
            <span>s</span>
          </label>
          <label>
            <input
              type="number"
              v-model="battery.p"
              placeholder="Parallel"
            >
            <span>p</span>
          </label>
        </div>
        <button @click="createGrid()">Create New grid</button>
      </div>
      <div class="colors">
        <h2 class="title">Elements Colors</h2>
        <ul class="colors-list">
          <li
            v-for="(colorItem, index) in colors"
            :key="index"
            :class="current.color === colorItem.color ? 'active' : ''"
          >
            <a
              href="#"
              :style="{backgroundColor: colorItem.color}"
              @click.prevent="changeCurrent('color', colorItem.color)"
              :class="colorItem.count === 0 ? 'disabled' : ''"
            >
              <b>№{{index + 1}}</b>
              <span>{{colorItem.count}}</span>
            </a>
          </li>
        </ul>
        <button
          class="change-colors-btn"
          @click="changeColors()">Change colors</button>
      </div>
      <div class="instruction">
        <h2 class="title">Instruction</h2>
        <div class="instruction-item">
          <div class="cell">
            <div class="cell-body">
              <div class="polus"></div>
            </div>
          </div>
          <div class="instruction-item-desc">
            <p class="instruction-item-title">Cell:</p>
            <p><b>Left click</b> - select / change polus</p>
            <p><b>Right click</b> - remove</p>
            <p><b>Drag and drop</b> - reposition</p>
          </div>
        </div>
        <div class="instruction-item">
          <div class="cell active">
            <div class="bus bus-right"></div>
            <div class="cell-body">
                <div class="polus plus"></div>
            </div>
          </div>
          <div class="instruction-item-desc">
            <p class="instruction-item-title">Bus:</p>
            <p><b>Left click</b> - select / close</p>
            <p><b>Right click</b> - remove</p>
          </div>
        </div>
        <div class="instruction-item">
          <div class="cell active">
            <div class="bus bus-right active">
              <div class="mustache mustache-left">🡐</div>
              <div class="mustache mustache-right">🡒</div>
            </div>
            <div class="cell-body">
                <div class="polus plus"></div>
            </div>
          </div>
          <div class="instruction-item-desc">
            <p class="instruction-item-title">Mustache:</p>
            <p><b>Left click</b> - add / remove</p>
          </div>
        </div>
      </div>
    </section>
    <div class="grids">
      <section class="grids-section">
        <h2 class="title">Back Side</h2>
        <cells-grid
          :areas="buildGridStyle()"
          :cells="cells"
          :reverse="true"
          @changeCell="changeCell"
          @clearCell="clearCell"
          @toggleBus="toggleBus"
          @removeBus="removeBus"
          @changeGrid="changeGrid"
          @dropCell="dropCell"
        >
        </cells-grid>
      </section>
      <section class="grids-section">
        <h2 class="title">Front Side</h2>
        <cells-grid
          :areas="buildGridStyle()"
          :cells="cells"
          @changeCell="changeCell"
          @clearCell="clearCell"
          @toggleBus="toggleBus"
          @removeBus="removeBus"
          @changeGrid="changeGrid"
          @dropCell="dropCell"
        >
        </cells-grid>
      </section>
    </div>
  </div>
</template>

<script>
import { ref } from "vue"
import CellsGrid from './components/CellsGrid.vue'

export default {
  name: 'App',
  components: {
    CellsGrid
  },
  setup() {
    // localStorage.clear();
    const storage = localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : {};
    const updateStorage = () => {
      const data = {
        cells: cells.value,
        colors: colors.value,
        battery: battery.value,
        grid: grid.value,
        current: current.value
      }
      localStorage.setItem('data', JSON.stringify(data))
    }
    const grid = ref(storage.grid ? storage.grid : [])
    const cells = ref(storage.cells ? storage.cells : []);
    const battery = ref(storage.battery ? storage.battery : {
      s: 13,
      p: 5
    })
    const createGrid = (cols = Number(battery.value.s), rows = Number(battery.value.p)) => {
      const accumulators = cols * rows;
      if(!accumulators) return
      const areas = [];
      let row = [];
      for(let s = 0, count = 1; s < accumulators; s++){
        row.push(`c-${s + 1}`);
        if(count === cols){
          count = 1;
          areas.push(row);
          row = [];
        }else{
          count++;
        }
      }
      // console.log(areas)
      grid.value = areas;
      colors.value.forEach(colorItem => colorItem.count = rows)
      current.value.colorCount = rows
      creatCells()
    }
    const getCell = (gridArea) => {
      return {
        color: '',
        index: '',
        polus: '',
        busbars: {
          normal: {
            positions: [],
            mustaches: []
          },
          reverse: {
            positions: [],
            mustaches: []
          }
        },
        gridArea: gridArea
      }
    }
    const creatCells = () => {
      cells.value = [];
      grid.value.forEach(column => {
        column.forEach(area => {
          cells.value.push(getCell(area))
        })
      })
      updateStorage()
    }
    const buildGridStyle = () => {
      if(!grid.value.length) return '';
      const columns = [];
      grid.value.forEach(column => {
        columns.push(column.join(' '))
      })
      let areas = 'grid-template-areas:\'';
      areas += columns.join('\' \'');
      areas += '\';';
      // console.log(areas)
      return areas;
    }
    const changeGrid = params => {
      const [action, type, side] = params.split(' ');
      if(action === 'add'){
        let lastIndex = getLastEmptyCell();
        if(type === 'row'){
          const row = [];
          for(let i = 0; i < grid.value[0].length; i++){
            lastIndex++;
            const area = `e-${lastIndex}`;
            row.push(area);
            cells.value.push(getCell(area))
          }
          if(side === 'top'){
            grid.value.unshift(row);
          }
          if(side === 'bottom'){
            grid.value.push(row);
          }
        }
        if(type === 'column'){
          const column = [];
          for(let i = 0; i < grid.value.length; i++){
            lastIndex++;
            const area = `e-${lastIndex}`;
            column.push(area);
            cells.value.push(getCell(area))
          }
          if(side === 'right'){
            grid.value.forEach((cell, index) => {
              grid.value[index].push(column[index]);
            })
          }
          if(side === 'left'){
            grid.value.forEach((cell, index) => {
              grid.value[index].unshift(column[index]);
            })
          }
        }
      }
      if(action === 'remove'){
        const isRemoving = cells => {
          let isRemoving = true;
          cells.forEach(cell => {
            if(cell.indexOf('c') !== -1) isRemoving = false;
          })
          return isRemoving
        }
        if(type === 'row'){
          let removingRow = [];
          if(side === 'top'){
            grid.value.forEach(row => {
              if(isRemoving(row) && !removingRow.length) removingRow = [...row]
            })
          }
          if(side === 'bottom'){
            grid.value.reduceRight((previousValue, row) => {
              if(isRemoving(row) && !removingRow.length) removingRow = [...row]
            }, grid.value.length)
          }
          if(removingRow.length){
            const filterCells = cells.value.filter(cell => !removingRow.includes(cell.gridArea));
            cells.value = filterCells
            grid.value.forEach((row, rowIndex) => {
              const filterRow = row.filter(cell => !removingRow.includes(cell))
              if(!filterRow.length){
                grid.value.splice(rowIndex, 1)
              }
            })
          }
        }
        if(type === 'column'){
          let removingCells = [];
          const transpose = a => {
            return Object.keys(a[0]).map(function(c) {
              return a.map(function(r) { return r[c]; });
            });
          }
          const transposeGrid = transpose(grid.value)
          // console.log(grid.value, transposeGrid)
          if(side === 'left'){
            transposeGrid.forEach(cells => {
              if(isRemoving(cells) && !removingCells.length) removingCells = [...cells]
            })
          }
          if(side === 'right'){
            transposeGrid.reduceRight((previousValue, cells) => {
              if(isRemoving(cells) && !removingCells.length) removingCells = [...cells]
            }, transposeGrid.length)
          }
          if(removingCells.length){
            const filterCells = cells.value.filter(cell => !removingCells.includes(cell.gridArea));
            cells.value = filterCells
            grid.value.forEach((row) => {
              row.reduceRight(function(acc, item, index, object) {
                if (removingCells.includes(item)) {
                  object.splice(index, 1);
                }
              }, []);
            })
          }
        }
      }
      updateStorage()
    }
    const getLastEmptyCell = () => {
      let max = 0;
      const cells = grid.value.flat()
      cells.forEach(cell => {
        const area = cell.split('-');
        if(area[0] !== 'e') return;
        if(Number(area[1]) > max) max = Number(area[1]);
      })
      return max;
    }
    const dropCell = eventData => {
      const {dragCellArea, dropCellArea} = eventData
      grid.value.forEach((row, rowIndex) => {
        row.forEach((cell, index) => {
          if(cell === dragCellArea){
            grid.value[rowIndex][index] = dropCellArea
          }
          if(cell === dropCellArea){
            grid.value[rowIndex][index] = dragCellArea
          }
        })
      })
      const dragCell = JSON.parse(JSON.stringify(cells.value.find(obj => obj.gridArea === dragCellArea)))
      const dragCellIndex = cells.value.findIndex(obj => obj.gridArea === dragCellArea)
      const dropCell = JSON.parse(JSON.stringify(cells.value.find(obj => obj.gridArea === dropCellArea)))
      const dropCellIndex = cells.value.findIndex(obj => obj.gridArea === dropCellArea)
      cells.value[dragCellIndex] = dropCell
      cells.value[dropCellIndex] = dragCell
      updateStorage()
    }

    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
    const colorsArray = storage.colors ? storage.colors : [];
    if(!colorsArray.length){
      for(let i = 0; i < Number(battery.value.s); i++){
        colorsArray.push({
          count: Number(battery.value.p),
          color: getRandomColor()
        })
      }
    }
    const colors = ref(colorsArray)

    const current = ref({
      color: colors.value[0].color,
      colorCount: colors.value[0].count,
      polus: '-'
    });
    const changeCurrent = (name, value) => {
      current.value[name] = value;
    }
    
    const changeColors = () => {
      const currentColor = current.value.color
      colors.value.forEach((item, index) => {
        const colorNew = getRandomColor();
        if(currentColor === item.color) current.value.color = colorNew;
        cells.value.forEach(cell => {
          if(cell.color === item.color) cell.color = colorNew;
        })
        colors.value[index].color = colorNew;
      })
      updateStorage();
    }

    const changeCell = (index) => {
      const polus = cells.value[index].polus;
      if(polus){
        cells.value[index].polus = polus === '-' ? '+' : '-';
      }else{
        cells.value[index].polus = current.value.polus;
        current.value.colorCount--;
        const colorItem = colors.value.find(item => item.color === current.value.color);
        const colorItemIndex = colors.value.findIndex(item => item.color === current.value.color);
        cells.value[index].index = colorItemIndex
        colorItem.count--;
        const currentColorCount = current.value.colorCount;
        cells.value[index].color = current.value.color;
        if(currentColorCount === 0) {
          const nextActiveColor = colors.value.find(item => item.count !== 0);
          current.value.color = nextActiveColor.color
          current.value.polus = current.value.polus === '+' ? '-' : '+';
          current.value.colorCount = nextActiveColor.count
        }
      }
      updateStorage();
    }
    const clearCell = (index) => {
      const color = cells.value[index].color;
      const colorItem = colors.value.find(item => item.color === color);
      colorItem.count++;
      current.value.color = colorItem.color
      current.value.colorCount = colorItem.count
      cells.value[index].color = '';
      cells.value[index].polus = '';
      cells.value[index].index = '';
      updateStorage();
    }

    const toggleBus = (eventData) => {
      const type = eventData.reverse ? 'reverse': 'normal';
      const {index, position, mustache} = eventData
      const positions = cells.value[index].busbars[type].positions;
      const mustaches = cells.value[index].busbars[type].mustaches;
      if(position){
        if(positions.includes(position)){
          if(positions.includes(`${position}-close-alt`)){
            const positionIndex = positions.indexOf(`${position}-close-alt`);
            if(positionIndex !== -1){
              positions.splice(positionIndex, 1);
            }
          }else if(positions.includes(`${position}-close`)){
            const positionIndex = positions.indexOf(`${position}-close`);
            if(positionIndex !== -1){
              positions.splice(positionIndex, 1);
            }
            positions.push(`${position}-close-alt`);
          }else{
            positions.push(`${position}-close`);
          }
          
        }else{
          positions.push(position);
        }
      }
      if(mustache){
        if(mustaches.includes(mustache)){
          const mustacheIndex = mustaches.indexOf(mustache);
          if(mustacheIndex !== -1){
            mustaches.splice(mustacheIndex, 1);
          }
        }else{
          mustaches.push(mustache);
        }
      }
      updateStorage();
    }
    const removeBus = (eventData) => {
      const type = eventData.reverse ? 'reverse': 'normal';
      const {index, position} = eventData
      const positions = cells.value[index].busbars[type].positions;
      const positionNames = [position, `${position}-close`, `${position}-close-alt`]
      positionNames.forEach(positionName => {
        const positionIndex = positions.indexOf(positionName);
        if(positionIndex !== -1){
          positions.splice(positionIndex, 1);
          cells.value[index].busbars[type].mustaches = []
        }
      })
      updateStorage();
    }

    const saveAsJSON = () => {
      const a = document.createElement('a')
      console.log(localStorage.getItem('data'))
      const file = new Blob([localStorage.getItem('data')], {type: 'application/json'})
      a.href = URL.createObjectURL(file)
      a.download = Date.now() + '.json'
      a.click()
    }
    const importFromJSON = (event) => {
      const files = event.target.files
      if(!files) return
      const file = files[0]
      if(file.name.split('.')[1] !== 'json'){
        alert('Not correct file')
        return
      }
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = event => {
        let data
        try{
          data = JSON.parse(event.target.result)
        }catch(e){
          alert('Not correct file')
          return
        }
        if(data.cells && Array.isArray(data.cells)){
          cells.value = data.cells
        }
        if(data.colors && Array.isArray(data.colors)){
          colors.value = data.colors
        }
        if(data.battery && typeof data.battery === 'object' && data.battery !== null){
          battery.value = data.battery
        }
        if(data.grid && Array.isArray(data.grid)){
          grid.value = data.grid
        }
        if(data.current && typeof data.current === 'object' && data.current !== null){
          current.value = data.current
        }
        updateStorage()
      }
    }
    const getDemoData = (file = '1.json') => {
      async function postData() {
        const response = await fetch(`https://18650-constructor.imhvost.top/${file}`, {
          mode: 'cors',
          cache: 'no-cache'
        })
        return await response.json()
      }
      postData()
        .then((data) => {
           cells.value = data.cells
           colors.value = data.colors
           battery.value = data.battery
           grid.value = data.grid
           current.value = data.current
           updateStorage()
        })
    }
    const urlParams = new URLSearchParams(window.location.search);
    const demo = urlParams.get('demo');
    if(demo === '1') getDemoData();
    if(demo === '2') getDemoData('2.json');

    return {
      cells,
      colors,
      current,
      changeCurrent,
      changeCell,
      clearCell,
      toggleBus,
      changeColors,
      battery,
      createGrid,
      buildGridStyle,
      changeGrid,
      dropCell,
      removeBus,
      saveAsJSON,
      importFromJSON,
      getDemoData
    }
  }
}
</script>

<style lang="less">
body{
  min-width:1024px;
  overflow-x:auto;
}
*{
  box-sizing:border-box;
  margin:0;
  padding:0;
  &:before,
  &:after{
    box-sizing:border-box;
  }
}
button{
  cursor:pointer;
  padding:5px;
  height:30px;
  user-select:none;
  border:solid 1px #ccc;
  background-color:#f0f0f0;
  font:inherit;
}
input{
  display:block;
  border:solid 1px #ccc;
  height:40px;
  padding:0 10px;
}
#app {
  font-family:'Calibri', 'Arial Narrow', Arial, sans-serif;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  text-align:center;
  color:#181818;
  padding:30px 15px;
}
.title{
  text-align:center;
  margin-bottom:15px;
  font-weight:700;
}
h1{
  font-size:24px;
}
h2{
  font-size:18px;
}
.page{
  // max-width:1200px;
  margin:0 auto;
}
.settings{
  display:flex;
  justify-content:center;
  padding-bottom:30px;
  border-bottom:dashed 2px;
  margin-bottom:30px;
}
.settings-btns{
  width:130px;
  display:flex;
  flex-direction:column;
  &>*:not(:last-child){
    margin-bottom:15px;
  }
}
.battery{
  display:flex;
  align-items:center;
  flex-direction:column;
  min-width:1px;
  margin:0 30px;
  align-self:flex-start;
  button{
    color:red;
    font-weight:700;
  }
}
.battery-inputs{
  display:flex;
  margin-bottom:20px;
  label{
    margin-right:30px;
    display:flex;
    align-items:center;
    input{
      margin-right:10px;
      width:100px;
    }
    &:last-child{
      margin-right:0;
    }
  }
}
.colors{
  flex:none;
  width:200px;
  display:flex;
  flex-direction:column;
}
.colors-list{
  display:flex;
  flex-wrap:wrap;
  list-style:none;
  margin:-1px;
  li{
    width:25%;
    padding:1px;
    &.active{
      a{
        transform:scale(.8);
        span{
          font-weight:700;
          color:red;
          font-size:14px;
        }
        &.disabled{
          transform:none;
        }
      }
    }
  }
  a{
    display:block;
    padding-top:100%;
    position:relative;
    color:inherit;
    font-size:12px;
    span{
      position:absolute;
      right:1px;
      bottom:1px;
      width:16px;
      height:16px;
      border-radius:50% 0 0 0;
      background-color:rgba(255,255,255,.6);
      display:flex;
      flex-direction:column;
      align-items:center;
    }
    b{
      position:absolute;
      left:1px;
      top:1px;
      width:32px;
      height:16px;
      border-radius:0 0 50% 0;
      background-color:#fff;
      display:flex;
      flex-direction:column;
      align-items:center;
    }
    &.disabled{
      opacity:.2;
      pointer-events:none;
    }
  }
}
.change-colors-btn{
  margin:20px auto 0;
}
.instruction{
  margin-left:30px;
  width:300px;
  text-align:left;
}
.instruction-item{
  display:flex;
  align-items:flex-start;
  margin-bottom:10px;
  &:last-child{
    margin-bottom:0;
  }
  .cell{
    flex:none;
    margin-right:20px;
    pointer-events:none;
  }
  .active .cell-body{
    background-color:rgb(18, 227, 162)
  }
  .bus{
    background-color:#ccc;
  }
  .mustache{
    display:block;
    text-align:center;
  }
}
.instruction-item-desc{
  flex:auto;
  min-width:1px;
  font-size:13px;
}
// .grids{
//   display:flex;
//   flex-direction:column;
//   align-items:center;
// }
.file-label{
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  align-items:center;
  cursor:pointer;
  padding:5px;
  height:30px;
  position:relative;
  overflow:hidden;
  border:solid 1px #ccc;
  background-color:#f0f0f0;
  input{
    font-size:0;
    cursor:pointer;
    position:absolute;
    right:0;
    bottom:0;
    width:100%;
    height:100%;
    padding:0;
    border:0;
    &::-webkit-file-upload-button{
      display:none;
    }
  }
}
</style>
