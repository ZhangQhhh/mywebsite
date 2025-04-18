# MarkShow 组件说明文档

## 组件介绍

MarkShow 是一个用于展示 Markdown 内容的 Vue 组件，基于 mavon-editor 实现。它提供了一个简洁的卡片式界面，可以显示 Markdown 格式的文本内容，并支持标题和时间的显示控制。

## 功能特点

- 纯预览模式，不支持编辑
- 支持显示/隐藏标题和创建时间
- 支持自定义预览选项
- 代码高亮显示
- 响应式设计，适应不同屏幕尺寸

## 属性说明

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| content | String | '' | Markdown 内容 |
| title | String | '' | 文章标题 |
| createdAt | String | 当前时间 | 创建时间 |
| showTitle | Boolean | true | 是否显示标题 |
| showTime | Boolean | true | 是否显示时间 |
| customPreviewOption | Object | {} | 自定义预览选项 |

## 使用示例

### 基本使用

```vue
<template>
  <div>
    <MarkShow 
      content="# Hello World\n这是一个 Markdown 示例" 
      title="示例文章" 
    />
  </div>
</template>

<script>
import MarkShow from '@/components/MarkShow.vue';

export default {
  components: {
    MarkShow
  }
}
</script>
```

### 隐藏标题和时间

```vue
<template>
  <div>
    <MarkShow 
      content="# Hello World\n这是一个 Markdown 示例" 
      :showTitle="false"
      :showTime="false"
    />
  </div>
</template>
```

### 自定义预览选项

```vue
<template>
  <div>
    <MarkShow 
      content="# Hello World\n这是一个 Markdown 示例" 
      title="示例文章" 
      :customPreviewOption="{ navigation: false }"
    />
  </div>
</template>
```

## 预览选项说明

组件内部默认的预览选项：

```javascript
previewOption: {
  readmodel: true,  // 沉浸式阅读
  navigation: true,  // 导航目录
  ...this.customPreviewOption  // 合并自定义选项
}
```

您可以通过 `customPreviewOption` 属性覆盖默认选项。

## 注意事项

1. 该组件依赖于 mavon-editor，确保已安装此依赖：
   ```bash
   npm install mavon-editor --save
   ```

2. 在主入口文件中全局注册 mavon-editor：
   ```javascript
   import Vue from 'vue'
   import mavonEditor from 'mavon-editor'
   import 'mavon-editor/dist/css/index.css'
   
   Vue.use(mavonEditor)
   ```

3. 组件样式设置了最小高度为 200px，可以通过覆盖 `.mavon-editor` 类来自定义高度。

4. 预览字体大小默认为 16px，可以通过覆盖 `.preview-editor` 类来自定义字体大小。

## 样式定制

您可以通过以下方式覆盖组件默认样式：

```vue
<style scoped>
/* 覆盖预览区域字体大小 */
.preview-editor >>> .v-note-panel .v-note-show .v-show-content {
  font-size: 18px;
}

/* 覆盖编辑器最小高度 */
.mavon-editor {
  min-height: 300px;
}
</style>
```

## 相关链接

- [mavon-editor 官方文档](https://github.com/hinesboy/mavonEditor)