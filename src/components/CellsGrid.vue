<template>
  <div class="grid-wrapp">
    <template v-if="cells.length && !reverse">
      <div class="grid-btns grid-btns-top">
        <button @click="$emit('changeGrid', 'add row top')" title="Add empty row">🡑</button>
        <button @click="$emit('changeGrid', 'remove row top')" title="Remove empty row">🡓</button>
      </div>
      <div class="grid-btns grid-btns-right">
        <button @click="$emit('changeGrid', 'add column right')" title="Add empty column">🡒</button>
        <button @click="$emit('changeGrid', 'remove column right')" title="Remove empty column">🡐</button>
      </div>
      <div class="grid-btns grid-btns-bottom">
        <button @click="$emit('changeGrid', 'add row bottom')" title="Add empty row">🡓</button>
        <button @click="$emit('changeGrid', 'remove row bottom')" title="Remove empty row">🡑</button>
      </div>
      <div class="grid-btns grid-btns-left">
        <button @click="$emit('changeGrid', 'add column left')" title="Add empty column">🡐</button>
        <button @click="$emit('changeGrid', 'remove column left')" title="Remove empty column">🡒</button>
      </div>
    </template>
    <div
      class="grid"
      :class="reverse ? 'reverse': ''"
      :style="areas"
    >
      <div
        v-for="(cell, index) in cells"
        :key="index"
        class="cell"
        :class="getClassCell(cell)"
        :style="{gridArea: cell.gridArea}"
        :data-grid-area="cell.gridArea"
        draggable="true"
        @dragstart="dragstart($event)"
        @drop="drop($event)"
        @dragenter="dragprevent($event)"
        @dragover="dragprevent($event)"
      >
        <template v-if="!getClassCell(cell).disabled">
          <div 
            class="bus bus-top"
            @click="toggleBus(index, 'top')"
            @contextmenu.prevent="removeBus(index, 'top')"
            :class="setBusClassName(cell, 'top')"
          >
            <template v-if="showМustaches(cell, 'top')">
              <div
                class="mustache mustache-top"
                @click.stop="toggleМustache(index, 'top')"
                :class="setActiveМustache(cell, 'top')"
              >🡑</div>
              <div
                class="mustache mustache-bottom"
                @click.stop="toggleМustache(index, 'bottom')"
                :class="setActiveМustache(cell, 'bottom')"
              >🡓</div>
            </template>
          </div>
          <div
            class="bus bus-right"
            @click="toggleBus(index, 'right')"
            @contextmenu.prevent="removeBus(index, 'right')"
            :class="setBusClassName(cell, 'right')"
          >
            <template v-if="showМustaches(cell, 'right')">
              <div
                class="mustache mustache-left"
                @click.stop="toggleМustache(index, 'left')"
                :class="setActiveМustache(cell, 'left')"
              >🡐</div>
              <div
                class="mustache mustache-right"
                @click.stop="toggleМustache(index, 'right')"
                :class="setActiveМustache(cell, 'right')"
              >🡒</div>
            </template>
          </div>
          <div
            class="bus bus-bottom"
            @click="toggleBus(index, 'bottom')"
            @contextmenu.prevent="removeBus(index, 'bottom')"
            :class="setBusClassName(cell, 'bottom')"
          >
            <template v-if="showМustaches(cell, 'bottom')">
              <div
                class="mustache mustache-top"
                @click.stop="toggleМustache(index, 'top')"
                :class="setActiveМustache(cell, 'top')"
              >🡑</div>
              <div
                class="mustache mustache-bottom"
                @click.stop="toggleМustache(index, 'bottom')"
                :class="setActiveМustache(cell, 'bottom')"
              >🡓</div>
            </template>
          </div>
          <div
            class="bus bus-left"
            @click="toggleBus(index, 'left')"
            @contextmenu.prevent="removeBus(index, 'left')"
            :class="setBusClassName(cell, 'left')"
          >
            <template v-if="showМustaches(cell, 'left')">
              <div
                class="mustache mustache-left"
                @click.stop="toggleМustache(index, 'left')"
                :class="setActiveМustache(cell, 'left')"
              >🡐</div>
              <div
                class="mustache mustache-right"
                @click.stop="toggleМustache(index, 'right')"
                :class="setActiveМustache(cell, 'right')"
              >🡒</div>
            </template>
          </div>
          <div
            class="cell-body"
            :style="{backgroundColor: cell.color}"
            @click="$emit('changeCell', index)"
            @contextmenu.prevent="$emit('clearCell', index)"
          >
            <div
              class="polus"
              :class="setPolus(cell)"
            ></div>
          </div>
        </template>
        <template v-else>
          <div class="cell-body"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue"

export default {
  props: {
    index: Number,
    cells: Array,
    reverse: Boolean,
    areas: String,
    // grid: Array
  },
  emits: ['changeCell', 'clearCell', 'toggleBus', 'changeGrid', 'dropCell', 'toggleМustache', 'removeBus'],
  setup(props, { emit }) {
    const getClassCell = (cell) => {
      const classObject = {}
      if(cell.gridArea.indexOf('e') !== -1){
        classObject.disabled = true
      }
      if(cell.polus){
        classObject.active = true
      }
      return classObject
    }
    const setPolus = (cell) => {
      if(!cell.polus) return '';
      if(!props.reverse) return cell.polus === '-' ? 'minus' : 'plus';
      return cell.polus === '-' ? 'plus' : 'minus';
    }
    const setBusClassName = (cell, bus) => {
      const type = props.reverse ? 'reverse': 'normal';
      const positions = cell.busbars[type].positions;
      const className = [];
      if(positions.includes(bus)) className.push('active');
      if(positions.includes(`${bus}-close`)) className.push(`${bus}-close`);
      if(positions.includes(`${bus}-close-alt`)) className.push(`${bus}-close-alt`);
      return className;
    }
    const showМustaches = (cell, bus) => {
      const type = props.reverse ? 'reverse': 'normal';
      const positions = cell.busbars[type].positions;
      return positions.includes(bus) ? true : false
    }
    const setActiveМustache = (cell, mustache) => {
      const type = props.reverse ? 'reverse': 'normal';
      return cell.busbars[type].mustaches.includes(mustache) ? 'active' : '';
    }
    const dragCell = ref(null)
    const dragstart = event => {
      event.dataTransfer.dropEffect = 'move';
      dragCell.value = event.target;
    }
    const dragprevent = event => {
      event.preventDefault();
    }
    const drop = event => {
      event.stopPropagation()
      const dropCell = event.currentTarget
      if(dropCell === dragCell.value) return
      const eventData = {
        dragCellArea: dragCell.value.dataset.gridArea,
        dropCellArea: dropCell.dataset.gridArea
      }
      emit('dropCell', eventData)
    }
    const toggleBus = (index, position) => {
      const eventData = {
        index: index,
        position: position,
        reverse: props.reverse
      }
      emit('toggleBus', eventData)
    }
    const removeBus = (index, position) => {
      const eventData = {
        index: index,
        position: position,
        reverse: props.reverse
      }
      emit('removeBus', eventData)
    }
    const toggleМustache = (index, mustache) => {
      const eventData = {
        index: index,
        mustache: mustache,
        reverse: props.reverse
      }
      emit('toggleBus', eventData)
    }
    return {
      getClassCell,
      setPolus,
      setBusClassName,
      dragstart,
      dragprevent,
      drop,
      toggleBus,
      setActiveМustache,
      toggleМustache,
      removeBus,
      showМustaches
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.grid-wrapp{
  position:relative;
  padding:50px;
  &:last-child{
    margin-bottom:0;
  }
}
.grid{
  display:grid;
  // grid-template-columns:repeat(15, 60px);
  // grid-template-rows:repeat(5, 60px);
  &.reverse{
    transform:rotateX(180deg);
    margin:-50px 0 -20px;
  }
}
.grid-btns{
  position:absolute;
  display:flex;
  justify-content:center;
  align-items:center;
  button{
    border:0;
    margin:2px;
    font-size:1.25rem;
    line-height:1;
  }
}
.grid-btns-top,
.grid-btns-bottom{
  height:40px;
  left:0;
  right:0;
}
.grid-btns-right,
.grid-btns-left{
  width:40px;
  top:0;
  bottom:0;
  flex-direction:column;
}
.grid-btns-top{
  top:0;
}
.grid-btns-bottom{
  bottom:0;
}
.grid-btns-right{
  right:0;
}
.grid-btns-left{
  left:0;
}
.cell{
  padding:7px;
  display:flex;
  flex-direction:column;
  position:relative;
  width:60px;
  height:60px;
  z-index:1;
  user-select:none;
  &.disabled{
    z-index:0;
    .cell-body{
      background-color:#f0f0f0;
      border:0;
      cursor:default;
      border-radius:0;
      &:before{
        display:none;
      }
    }
  }
}
.cell-body{
  border:solid 1px #ccc;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  flex:auto;
  border-radius:50%;
  &:before{
    content:'';
    position:absolute;
    left:3px;
    right:3px;
    top:3px;
    bottom:3px;
    border:solid 1px #f0f0f0;
  }
}
.bus{
  position:absolute;
  cursor:pointer;
  z-index:1;
  &:hover{
    background-color:#ccc;
    .mustache{
      display:block;
    }
  }
  &:before{
    content:'';
    position:absolute;
    background-color:red;
    opacity:0;
    z-index:2;
  }
  &.active{
    &:before{
      opacity:1;
    }
  }
}
.bus-top,
.bus-bottom{
  left:0;
  right:0;
  height:14px;
  &:before{
    top:50%;
    left:-1px;
    right:-1px;
    height:4px;
    margin-top:-2px;
  }
}
.bus-left,
.bus-right{
  top:0;
  bottom:0;
  width:14px;
  &:before{
    left:50%;
    top:-1px;
    bottom:-1px;
    width:4px;
    margin-left:-2px;
  }
}
.bus-top{
  top:-7px;
  &.top-close{
    &:before{
      right:calc(50% - 1px);
    }
  }
  &.top-close-alt{
    &:before{
      left:calc(50% - 1px);
    }
  }
}
.bus-right{
  right:-7px;
  &.right-close{
    &:before{
      bottom:calc(50% - 1px);
    }
  }
  &.right-close-alt{
    &:before{
      top:calc(50% - 1px);
    }
  }
}
.bus-bottom{
  bottom:-7px;
  &.bottom-close{
    &:before{
      right:calc(50% - 1px);
    }
  }
  &.bottom-close-alt{
    &:before{
      left:calc(50% - 1px);
    }
  }
}
.bus-left{
  left:-7px;
  &.left-close{
    &:before{
      bottom:calc(50% - 1px);
    }
  }
  &.left-close-alt{
    &:before{
      top:calc(50% - 1px);
    }
  }
}
.polus{
  width:20px;
  height:20px;
  background-color:#fff;
  font-weight:700;
  border-radius:50%;
  position:relative;
  opacity:0;
  z-index:66;
  &:before,
  &:after{
    content:'';
    position:absolute;
    left:50%;
    top:50%;
    width:16px;
    height:4px;
    margin:-2px 0 0 -8px;
    background-color:currentColor;
  }
  &.plus{
    color:red;
    opacity:1;
    &:after{
      transform:rotate(90deg);
    }
  }
  &.minus{
    color:black;
    opacity:1;
  }
}
.mustache{
  position:absolute;
  width:20px;
  height:20px;
  background-color:#fff;
  display:none;
  &:before{
    content:'';
    position:absolute;
    display:none;
    background-color:red;
    border:solid 1px #fff;
  }
  &.active{
    display:block;
    background:none;
    border-radius:0;
    font-size:0;
    &:before{
      display:block;
    }
  }
}
.mustache-top,
.mustache-bottom{
  left:50%;
  margin-left:-10px;
  &:before{
    width:4px;
    left:50%;
    margin-left:-2px;
    height:21px;
  }
}
.mustache-top{
  bottom:100%;
  margin-bottom:-7px;
  border-radius:10px 10px 0 0;
  &:before{
    bottom:0;
  }
}
.mustache-bottom{
  top:100%;
  margin-top:-7px;
  border-radius:0 0 10px 10px;
  &:before{
    top:0;
  }
}
.mustache-left,
.mustache-right{
  top:50%;
  margin-top:-10px;
  &:before{
    height:4px;
    top:50%;
    margin-top:-2px;
    width:21px;
  }
}
.mustache-left{
  right:100%;
  margin-right:-7px;
  border-radius:10px 0 0 10px;
  &:before{
    right:0;
  }
}
.mustache-right{
  left:100%;
  margin-left:-7px;
  border-radius:0 10px 10px 0;
  &:before{
    left:0;
  }
}
</style>
