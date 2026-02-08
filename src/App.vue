<script setup>
import {computed, onMounted, reactive, ref} from "vue";

const isExcavating = ref(false)
const carShow = ref(false)
const carInfo = reactive(
    {
      left: 0,
      top: 0,
      infoOffset: 10,
      progress: 0,
    }
)

const carStyle = computed(() => {
  return {
    left: carInfo.left + carInfo.infoOffset + 'px',
    top: carInfo.top + +carInfo.infoOffset + 'px'
  }
})

onMounted(() => {
  // 监听挖掘结束
  window.addEventListener('start-excavating-end', _ => {
    isExcavating.value = false
  })

  window.addEventListener('show-html', ev => {
    if (!ev.detail && !ev.detail.target) {
      return
    }

    switch (ev.detail.target) {
      default:
        break;
      case 'car':
        showCar(ev.detail)
        break
    }
  })
})

// car ui 控制
const onCloseCar = () => {
  carShow.value = false
}
const showCar = (data) => {
  carShow.value = true
  carInfo.progross = data.value
  carInfo.left = data.x
  carInfo.top = data.y
  console.log(data, 'data...')
  carInfo.progress = data.value
}


// 控制挖掘动画开启
const onStartExcavate = () => {
  isExcavating.value = !isExcavating.value
  threeInterface.startExcavating(isExcavating.value)
}

// 控制静态隧道是否显示
const onHideOrShowTunnel = () => {
  threeInterface.defaultTunnelControlVisible()
}

// 挖掘机控制显示
const onHideOrShowCar = () => {
  threeInterface.carControlVisible()
}

// 隧道进度控制显示
const onHideOrShowTunnelProgress = () => {
  threeInterface.tunnelProgressControlVisible()
}

</script>

<template>
  <div class="control_panel">
    <h3>控制面板</h3>
    <div class="panel">
      <div class="tit">
        场景控制
      </div>
      <div class="control_area">
        <button @click="onStartExcavate">
          {{ isExcavating ? '停止挖掘' : '开始挖掘' }}
        </button>
      </div>

    </div>

    <div class="panel">

      <div class="tit">
        物体控制
      </div>
      <div class="control_area">
        <button @click="onHideOrShowTunnel">
          显示/隐藏默认隧道
        </button>

        <button @click="onHideOrShowCar">
          显示/隐藏 挖掘机
        </button>

        <button @click="onHideOrShowTunnelProgress">
          显示/隐藏 挖掘进度
        </button>
      </div>


    </div>
  </div>

  <!--  挖掘机进度-->
  <div class="car_info_box"
       :style="carStyle"
       v-show="carShow">
    <div class="tit">挖掘机信息</div>
    <div class="close" @click="onCloseCar">关闭</div>
    <div class="p_item">
      <div class="name">挖掘机进度</div>
      <div class="value">
        {{ carInfo.progress }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin flexStyle($align:'center', $justContent:'space-around') {
  display: flex;
  align-items: $align;
  justify-content: $justContent;
}

// 控制面板
.control_panel {
  position: fixed;
  left: 2px;
  top: 2px;
  width: 300px;
  padding: 15px;
  background-color: rgb(44, 43, 43);
  border-radius: 5px;
  box-shadow: 0 5px 1px 0 #1a1a1a;
  font-size: 12px;

  .control_area {
    @include flexStyle;
    gap: 5px;
  }
}

// 挖掘机面板
.car_info_box {
  position: absolute;
  padding: 15px;
  background-color: rgb(44, 43, 43);
  border-radius: 5px;
  font-size: 12px;
  min-width: 200px;

  .close {
    position: absolute;
    right: 5px;
    top: 5px;
    z-index: 9;
    cursor: pointer;
  }

  .tit {
    text-align: center;
  }

  .p_item {
    margin-bottom: 5px;
    @include flexStyle();
    gap: 5px;
  }
}
</style>

