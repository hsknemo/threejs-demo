<script setup>
import {defineProps, computed, ref, watch} from "vue";
import MaterialSymbolsAdsClick from "@/components/icon/MaterialSymbolsAdsClick.vue";
const props = defineProps({
  menuList: {
    type: Array,
    default: () => [],
  },
  tit: {
    type: String,
    default: "显示控制",
  },
});

const filterText = ref("");
const treeRef = ref()

watch(filterText, (val) => {
  treeRef.value.filter(val)
})

const defaultProps = {
  children: 'children',
  label: 'name',
}

const filterNode = (value, data, node) => {
  if (!value) return true
  return data.name.includes(value)
};

const emits = defineEmits(["menu-click", "refresh-mesh-click"]);

const onMeshCanClick = (item) => {
    item.canClick = !item.canClick;
    emits("refresh-mesh-click", item);
};

const onTreeCheckChange = (data, checked, indeterminate) => {
  data.checkStatus = checked;
  emits("menu-click", data);
};

const threeSceneMenu = computed(() => props.menuList);

const toggleUI = (item) => {
  item.isOpen = !item.isOpen;
};
const onChangeScene = (item, menuType) => {
  if (item.children && menuType === "parent") {
    toggleUI(item);
    return;
  }
  emits("menu-click", item, menuType);
};

</script>
<template>
  <div class="scene_control">
    <div class="tit">{{ tit }}</div>

    <div class="control_area">
      <el-input
          class="search"
          size="small"
          v-model="filterText"
          placeholder="搜索图层树"
      />
      <el-tree
          @check-change="onTreeCheckChange"
          ref="treeRef"
          size="small"
          style="max-width: 600px"
          :data="threeSceneMenu"
          show-checkbox
          default-expand-all
          node-key="id"
          highlight-current
          :props="defaultProps"
          :filter-node-method="filterNode"
      />
    </div>
<!--    <div class="control_area">-->
<!--      <div v-for="(item, index) in threeSceneMenu" :key="index">-->
<!--        <section class="tit_area">-->
<!--          <div-->
<!--            class="checkbox_area"-->
<!--            @click.stop="onChangeScene(item, 'parent')"-->
<!--          >-->
<!--            <el-checkbox v-if="!item.children" v-model="item.checkStatus">-->
<!--            </el-checkbox>-->
<!--            {{ item.name }}-->
<!--          </div>-->

<!--          <MaterialSymbolsAdsClick-->
<!--            @click.stop="onMeshCanClick(item)"-->
<!--            :class="{-->
<!--              canClick: item.canClick,-->
<!--            }"-->
<!--          />-->
<!--        </section>-->

<!--        <div class="control_ui">-->
<!--          <template   v-for="(ui, index) in item.controlUI" :key="index">-->
<!--               <component-->
<!--            v-if="ui.props"-->
<!--            :is="ui.componentName"-->
<!--            v-bind="ui.props"-->
<!--            v-model="ui.props.modelValue"-->
<!--            @change="-->
<!--              (value, ...params) => {-->
<!--                ui.props.modelValue = value;-->
<!--                if (ui.events?.change) {-->
<!--                  ui.events.change(value, ...params);-->
<!--                }-->
<!--              }-->
<!--            "-->
<!--            v-on="{ ...ui.events, change: undefined }"-->
<!--          ></component>-->

<!--          <component-->
<!--            v-else-->
<!--            v-for="(ui, index) in item.controlUI"-->
<!--            :key="index"-->
<!--            :is="ui.componentName"-->
<!--            v-bind="ui.props"-->
<!--            v-on="{ ...ui.events, change: undefined }"-->
<!--          ></component>-->
<!--          </template>-->
<!--         -->
<!--        </div>-->

<!--        <div v-if="item.isOpen" class="child_area">-->
<!--          <ul-->
<!--            v-for="(child, index) in item.children"-->
<!--            :key="index"-->
<!--            @click.stop="onChangeScene(item, 'child')"-->
<!--          >-->
<!--            <li>-->
<!--              <el-checkbox :label="child.name" v-model="child.checkStatus">-->
<!--              </el-checkbox>-->
<!--            </li>-->
<!--          </ul>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

  </div>
</template>

<style lang="scss">
@mixin flexStyle($align: "center", $justContent: "space-around") {
  display: flex;
  align-items: $align;
  justify-content: $justContent;
}
:root {
  --scene-text-color: #fff;
  --scene-tit-bg-color: rgb(108, 109, 111);
  --scene-menu-child-bg-color: rgb(68, 67, 67);
}
.scene_control {
  position: fixed;
  left: 2px;
  top: 2px;
  width: 300px;
  background-color: rgb(44, 43, 43);

  .tit {
    background-color: var(--scene-tit-bg-color);
    color: var(--scene-text-color);
    padding: 5px;
    font-size: 14px;
  }

  .control_area {
    padding: 5px 10px;
    // 匹配el-*样式
    [class^="el-"] {
      background-color: unset !important;
      font-size: 12px;
      color: var(--scene-text-color);
    }
    .search {
      margin-bottom: 5px;
    }
    .tit_area {
      @include flexStyle(center);
      gap: 10px;
      svg {
        filter: brightness(0.5);
        &.canClick {
          filter: brightness(1.5);
        }
      }
    }
    .checkbox_area {
      @include flexStyle(center);
      gap: 5px;
    }
    .el-checkbox__label,
    .checkbox_area {
      font-size: 12px;
      color: var(--scene-text-color);
    }
  }

  .child_area {
    padding-left: 5px;
    ul {
      list-style: none;
      margin: 5px;
      padding-left: 5px;
      background-color: var(--scene-menu-child-bg-color);
    }
    li {
      cursor: pointer;
    }
  }
}
</style>
