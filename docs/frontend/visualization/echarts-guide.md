# ECharts 数据可视化指南

> ECharts 图表库完全指南 | 更新时间：2025-02

## 目录

- [ECharts 基础](#echarts-基础)
- [基础图表](#基础图表)
- [高级图表](#高级图表)
- [交互功能](#交互功能)
- [主题定制](#主题定制)
- [性能优化](#性能优化)
- [实战案例](#实战案例)

---

## ECharts 基础

### 1. ECharts 简介

ECharts 是百度开源的数据可视化库，支持丰富的图表类型。

```bash
# 安装
npm install echarts
```

```typescript
import * as echarts from 'echarts';

// 基础使用
const chartDom = document.getElementById('chart')!;
const myChart = echarts.init(chartDom);

const option = {
  title: {
    text: 'ECharts 入门示例'
  },
  tooltip: {},
  xAxis: {
    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
  },
  yAxis: {},
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
};

myChart.setOption(option);

// 响应式
window.addEventListener('resize', () => {
  myChart.resize();
});
```

### 2. 配置项结构

```typescript
interface EChartsOption {
  title?: TitleOption;           // 标题
  legend?: LegendOption;         // 图例
  tooltip?: TooltipOption;       // 提示框
  grid?: GridOption;             // 网格
  xAxis?: XAXisOption;           // X 轴
  yAxis?: YAxisOption;           // Y 轴
  series?: SeriesOption[];       // 系列
  dataZoom?: DataZoomOption[];   // 数据区域缩放
  visualMap?: VisualMapOption;   // 视觉映射
  toolbox?: ToolboxOption;       // 工具栏
  color?: string[];              // 调色盘
}
```

---

## 基础图表

### 1. 柱状图

```typescript
const barOption = {
  title: {
    text: '销售数据统计',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['2022', '2023', '2024'],
    top: 30
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '2022',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110],
      itemStyle: {
        color: '#3498db'
      }
    },
    {
      name: '2023',
      type: 'bar',
      data: [150, 230, 180, 100, 90, 130],
      itemStyle: {
        color: '#2ecc71'
      }
    },
    {
      name: '2024',
      type: 'bar',
      data: [180, 260, 210, 120, 110, 150],
      itemStyle: {
        color: '#e74c3c'
      }
    }
  ]
};

myChart.setOption(barOption);
```

### 2. 折线图

```typescript
const lineOption = {
  title: {
    text: '温度变化趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['最高气温', '最低气温']
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value} °C'
    }
  },
  series: [
    {
      name: '最高气温',
      type: 'line',
      data: [11, 11, 15, 13, 12, 13, 10],
      smooth: true,
      itemStyle: {
        color: '#e74c3c'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(231, 76, 60, 0.5)' },
          { offset: 1, color: 'rgba(231, 76, 60, 0.1)' }
        ])
      }
    },
    {
      name: '最低气温',
      type: 'line',
      data: [1, -2, 2, 5, 3, 2, 0],
      smooth: true,
      itemStyle: {
        color: '#3498db'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(52, 152, 219, 0.5)' },
          { offset: 1, color: 'rgba(52, 152, 219, 0.1)' }
        ])
      }
    }
  ]
};

myChart.setOption(lineOption);
```

### 3. 饼图

```typescript
const pieOption = {
  title: {
    text: '访问来源',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '访问来源',
      type: 'pie',
      radius: ['40%', '70%'],  // 环形图
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: '搜索引擎' },
        { value: 735, name: '直接访问' },
        { value: 580, name: '邮件营销' },
        { value: 484, name: '联盟广告' },
        { value: 300, name: '视频广告' }
      ]
    }
  ]
};

myChart.setOption(pieOption);
```

### 4. 散点图

```typescript
const scatterOption = {
  title: {
    text: '身高体重分布'
  },
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      return `身高: ${params.value[0]}cm<br/>体重: ${params.value[1]}kg`;
    }
  },
  xAxis: {
    name: '身高(cm)',
    nameLocation: 'middle',
    nameGap: 30
  },
  yAxis: {
    name: '体重(kg)',
    nameLocation: 'middle',
    nameGap: 40
  },
  series: [
    {
      type: 'scatter',
      symbolSize: 10,
      data: [
        [161.2, 51.6], [167.5, 59.0], [159.5, 49.2],
        [157.0, 63.0], [155.8, 53.6], [170.0, 59.0],
        [159.1, 47.6], [166.0, 69.8], [176.2, 66.8],
        [160.2, 75.2], [172.5, 55.2], [170.9, 54.2]
      ],
      itemStyle: {
        color: '#3498db'
      }
    }
  ]
};

myChart.setOption(scatterOption);
```

---

## 高级图表

### 1. 雷达图

```typescript
const radarOption = {
  title: {
    text: '能力评估'
  },
  tooltip: {},
  legend: {
    data: ['预算分配', '实际开销']
  },
  radar: {
    indicator: [
      { name: '销售', max: 6500 },
      { name: '管理', max: 16000 },
      { name: '信息技术', max: 30000 },
      { name: '客服', max: 38000 },
      { name: '研发', max: 52000 },
      { name: '市场', max: 25000 }
    ]
  },
  series: [
    {
      name: '预算 vs 开销',
      type: 'radar',
      data: [
        {
          value: [4200, 3000, 20000, 35000, 50000, 18000],
          name: '预算分配',
          areaStyle: {
            color: 'rgba(52, 152, 219, 0.3)'
          }
        },
        {
          value: [5000, 14000, 28000, 26000, 42000, 21000],
          name: '实际开销',
          areaStyle: {
            color: 'rgba(231, 76, 60, 0.3)'
          }
        }
      ]
    }
  ]
};

myChart.setOption(radarOption);
```

### 2. K线图

```typescript
const candlestickOption = {
  title: {
    text: '股票K线图'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05']
  },
  yAxis: {
    scale: true
  },
  series: [
    {
      type: 'candlestick',
      data: [
        [20, 34, 10, 38],  // [开盘, 收盘, 最低, 最高]
        [40, 35, 30, 50],
        [31, 38, 33, 44],
        [38, 15, 5, 42],
        [14, 37, 5, 42]
      ],
      itemStyle: {
        color: '#e74c3c',      // 阳线颜色
        color0: '#2ecc71',     // 阴线颜色
        borderColor: '#e74c3c',
        borderColor0: '#2ecc71'
      }
    }
  ]
};

myChart.setOption(candlestickOption);
```

### 3. 热力图

```typescript
const heatmapOption = {
  title: {
    text: '每周活跃时间分布'
  },
  tooltip: {
    position: 'top',
    formatter: (params: any) => {
      return `${params.value[0]}时 ${params.value[1]}: ${params.value[2]}人`;
    }
  },
  grid: {
    height: '50%',
    top: '10%'
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    splitArea: {
      show: true
    }
  },
  yAxis: {
    type: 'category',
    data: ['0-6', '6-12', '12-18', '18-24'],
    splitArea: {
      show: true
    }
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '15%',
    inRange: {
      color: ['#50a3ba', '#eac736', '#d94e5d']
    }
  },
  series: [
    {
      name: '活跃人数',
      type: 'heatmap',
      data: [
        [0, 0, 5], [0, 1, 10], [0, 2, 20], [0, 3, 15],
        [1, 0, 8], [1, 1, 15], [1, 2, 25], [1, 3, 18],
        // ... 更多数据
      ],
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
};

myChart.setOption(heatmapOption);
```

### 4. 关系图

```typescript
const graphOption = {
  title: {
    text: '人物关系图'
  },
  tooltip: {},
  series: [
    {
      type: 'graph',
      layout: 'force',
      symbolSize: 50,
      roam: true,
      label: {
        show: true
      },
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [4, 10],
      data: [
        { name: '节点1', x: 300, y: 300 },
        { name: '节点2', x: 800, y: 300 },
        { name: '节点3', x: 550, y: 100 },
        { name: '节点4', x: 550, y: 500 }
      ],
      links: [
        { source: '节点1', target: '节点2' },
        { source: '节点2', target: '节点3' },
        { source: '节点3', target: '节点4' },
        { source: '节点4', target: '节点1' }
      ],
      lineStyle: {
        opacity: 0.9,
        width: 2,
        curveness: 0
      },
      force: {
        repulsion: 2500,
        edgeLength: [10, 50]
      }
    }
  ]
};

myChart.setOption(graphOption);
```

---

## 交互功能

### 1. 数据区域缩放

```typescript
const dataZoomOption = {
  title: {
    text: '数据区域缩放'
  },
  tooltip: {
    trigger: 'axis'
  },
  dataZoom: [
    {
      type: 'slider',    // 滑动条型
      start: 0,
      end: 50
    },
    {
      type: 'inside',    // 内置型（鼠标滚轮）
      start: 0,
      end: 50
    }
  ],
  xAxis: {
    type: 'category',
    data: Array.from({ length: 100 }, (_, i) => `Day ${i + 1}`)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'line',
      data: Array.from({ length: 100 }, () => Math.random() * 100)
    }
  ]
};

myChart.setOption(dataZoomOption);
```

### 2. 工具栏

```typescript
const toolboxOption = {
  title: {
    text: '工具栏示例'
  },
  toolbox: {
    feature: {
      dataZoom: {
        yAxisIndex: 'none'
      },
      dataView: {
        readOnly: false
      },
      magicType: {
        type: ['line', 'bar']
      },
      restore: {},
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110]
    }
  ]
};

myChart.setOption(toolboxOption);
```

### 3. 事件监听

```typescript
// 点击事件
myChart.on('click', (params) => {
  console.log('点击了:', params.name, params.value);
});

// 鼠标悬停
myChart.on('mouseover', (params) => {
  console.log('悬停:', params.name);
});

// 图例选择
myChart.on('legendselectchanged', (params) => {
  console.log('图例选择:', params.selected);
});

// 数据区域缩放
myChart.on('datazoom', (params) => {
  console.log('缩放:', params);
});

// 自定义事件
myChart.dispatchAction({
  type: 'highlight',
  seriesIndex: 0,
  dataIndex: 0
});
```

---

## 主题定制

### 1. 使用内置主题

```typescript
// 深色主题
const darkChart = echarts.init(chartDom, 'dark');

// 自定义主题
echarts.registerTheme('custom', {
  color: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'],
  backgroundColor: '#1a1a1a',
  textStyle: {
    color: '#ffffff'
  },
  title: {
    textStyle: {
      color: '#ffffff'
    }
  },
  legend: {
    textStyle: {
      color: '#ffffff'
    }
  }
});

const customChart = echarts.init(chartDom, 'custom');
```

### 2. 动态主题切换

```typescript
class ThemeManager {
  private chart: echarts.ECharts;
  private currentTheme: string = 'light';

  constructor(dom: HTMLElement) {
    this.chart = echarts.init(dom);
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    
    // 销毁旧实例
    this.chart.dispose();
    
    // 创建新实例
    this.chart = echarts.init(
      this.chart.getDom() as HTMLElement,
      theme
    );
    
    // 重新设置配置
    this.chart.setOption(this.getOption());
  }

  private getOption() {
    return {
      // ... 配置项
    };
  }
}
```

---

## 性能优化

### 1. 大数据量优化

```typescript
// 使用 dataZoom 只渲染可见区域
const largeDataOption = {
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 10  // 只显示 10%
    }
  ],
  xAxis: {
    type: 'category',
    data: Array.from({ length: 10000 }, (_, i) => i)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'line',
      data: Array.from({ length: 10000 }, () => Math.random() * 100),
      large: true,           // 开启大数据量优化
      largeThreshold: 2000   // 阈值
    }
  ]
};

// 使用采样
const samplingOption = {
  series: [
    {
      type: 'line',
      sampling: 'lttb',  // 采样算法：lttb, average, max, min
      data: largeData
    }
  ]
};
```

### 2. 按需加载

```typescript
// 只引入需要的组件
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  CanvasRenderer
]);
```

### 3. 渐进式渲染

```typescript
const progressiveOption = {
  series: [
    {
      type: 'scatter',
      progressive: 1000,           // 每次渲染 1000 个点
      progressiveThreshold: 3000,  // 超过 3000 个点启用渐进式渲染
      data: largeScatterData
    }
  ]
};
```

---

## 实战案例

### 1. 实时数据监控

```typescript
class RealtimeMonitor {
  private chart: echarts.ECharts;
  private data: number[] = [];
  private maxDataLength: number = 50;

  constructor(dom: HTMLElement) {
    this.chart = echarts.init(dom);
    this.initChart();
    this.startUpdate();
  }

  private initChart() {
    const option = {
      title: {
        text: '实时数据监控'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%']
      },
      series: [
        {
          name: '数据',
          type: 'line',
          smooth: true,
          symbol: 'none',
          areaStyle: {},
          data: []
        }
      ]
    };

    this.chart.setOption(option);
  }

  private startUpdate() {
    setInterval(() => {
      this.addData(Math.random() * 100);
    }, 1000);
  }

  private addData(value: number) {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    this.data.push(value);

    if (this.data.length > this.maxDataLength) {
      this.data.shift();
    }

    this.chart.setOption({
      xAxis: {
        data: Array.from({ length: this.data.length }, (_, i) => i)
      },
      series: [
        {
          data: this.data
        }
      ]
    });
  }
}

// 使用
const monitor = new RealtimeMonitor(document.getElementById('monitor')!);
```

### 2. 数据大屏

```typescript
class DataScreen {
  private charts: Map<string, echarts.ECharts> = new Map();

  constructor() {
    this.initCharts();
    this.startAutoRefresh();
  }

  private initCharts() {
    // 销售趋势
    this.createChart('sales-trend', this.getSalesTrendOption());
    
    // 地区分布
    this.createChart('region-distribution', this.getRegionOption());
    
    // 产品占比
    this.createChart('product-ratio', this.getProductRatioOption());
    
    // 实时数据
    this.createChart('realtime-data', this.getRealtimeOption());
  }

  private createChart(id: string, option: any) {
    const dom = document.getElementById(id);
    if (!dom) return;

    const chart = echarts.init(dom);
    chart.setOption(option);
    this.charts.set(id, chart);
  }

  private getSalesTrendOption() {
    return {
      title: {
        text: '销售趋势',
        textStyle: {
          color: '#fff',
          fontSize: 20
        }
      },
      backgroundColor: 'transparent',
      grid: {
        left: '10%',
        right: '10%',
        top: '20%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      series: [
        {
          type: 'line',
          data: [120, 200, 150, 80, 70, 110],
          smooth: true,
          itemStyle: {
            color: '#00d4ff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 212, 255, 0.5)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.1)' }
            ])
          }
        }
      ]
    };
  }

  private startAutoRefresh() {
    setInterval(() => {
      this.refreshData();
    }, 5000);
  }

  private refreshData() {
    // 刷新所有图表数据
    this.charts.forEach((chart, id) => {
      // 更新数据逻辑
    });
  }

  resize() {
    this.charts.forEach(chart => chart.resize());
  }
}

// 使用
const dataScreen = new DataScreen();

window.addEventListener('resize', () => {
  dataScreen.resize();
});
```

---

## 面试要点

### 常见问题

**Q1：ECharts 的核心概念？**

1. Option（配置项）：图表的所有配置
2. Series（系列）：数据和图表类型
3. Component（组件）：标题、图例、坐标轴等
4. Coordinate（坐标系）：直角坐标系、极坐标系等

**Q2：如何优化 ECharts 性能？**

1. 按需加载：只引入需要的组件
2. 大数据优化：使用 large、sampling
3. 渐进式渲染：progressive
4. 数据区域缩放：只渲染可见区域
5. 合理使用动画：减少不必要的动画

**Q3：ECharts vs D3.js？**

| 特性 | ECharts | D3.js |
|------|---------|-------|
| 学习曲线 | 简单 | 陡峭 |
| 配置方式 | 声明式 | 命令式 |
| 图表类型 | 丰富 | 需自己实现 |
| 定制性 | 中等 | 极高 |
| 适用场景 | 快速开发 | 高度定制 |

---

## 参考资料

### 官方资源

- [ECharts 官网](https://echarts.apache.org/zh/index.html)
- [ECharts 文档](https://echarts.apache.org/zh/option.html)
- [ECharts 示例](https://echarts.apache.org/examples/zh/index.html)

### 学习资源

- [ECharts 教程](https://www.runoob.com/echarts/echarts-tutorial.html)
- [ECharts 社区](https://github.com/apache/echarts)

### 工具库

- [echarts-for-react](https://github.com/hustcc/echarts-for-react) - React 封装
- [vue-echarts](https://github.com/ecomfe/vue-echarts) - Vue 封装
- [echarts-gl](https://github.com/ecomfe/echarts-gl) - 3D 扩展

