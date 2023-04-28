<template>
  <div class="timeline">
    <h3 class="text-center">{{title}}</h3>
    <div class="user-list">
      <div v-for="item in users" :key="item.from+item.to" class="flex user-item">
        <i class="user-label">{{ item.user }}</i>
        <div class="user-info">
          <div :style="{flexBasis: getPercent('',item.from)}" />
          <div :style="{flexBasis: getPercent(item.from,item.to)}" :class="getStatusColor(item.status)" :aria-label="getTipContent(item)" data-balloon-pos="up" data-balloon-break />
        </div>
      </div>
      <div class="flex summary">
        <i class="label" />
        <div class="flex summary-box">
          <div v-for="item in summary" :key="item.from+item.to" :style="{flexBasis: getPercent(item.from,item.to)}" :class="['free','used'][item.type]" />
        </div>
      </div>
    </div>
    <div class="time-x">
      <ul class="time-calibration">
        <li />
        <li v-for="i in 15" :key="i" class="calibration" />
        <li />
      </ul>
      <ul class="time-label">
        <li v-for="i in 16" :key="i">{{ i - 1 + 8 }}时</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Item } from '../api/list'

export default defineComponent({
  name: 'TimeLine',
  props: {
    title: String,
    users: Array as PropType<Item[]>
  },
  computed: {
    summary () {
      const arr = this.summaryRange([...this.users || []])
      type ListItem = {from: string;to: string;type: 0|1}
      const list: ListItem[] = []
      const currentDate = arr[0][0].replace(/^(\d{4}([-/]\d{1,2}){2}).*$/, '$1')
      for (let i = 0; i < arr.length; i++) {
        if (i === 0) {
          const from = currentDate + ' 08:00'
          const to = arr[i][0]
          if (from !== to) {
            list.push({ from, to, type: 0 })
          }
        } else {
          const from = arr[i - 1][1]
          const to = arr[i][0]
          if (from !== to) {
            list.push({ from, to, type: 0 })
          }
        }
        list.push({ from: arr[i][0], to: arr[i][1], type: 1 })
        if (i === arr.length - 1) {
          const from = arr[i][1]
          const to = currentDate + ' 23:00'
          if (from !== to) {
            list.push({ from, to, type: 0 })
          }
        }
      }
      return list
    }
  },
  methods: {
    getStatusColor (i: number) {
      return `status-${['pending', 'success', 'cancel'][i]}`
    },
    getPercent (from: string, to: string) {
      const start = from || to.replace(/\d+:\d+(:\d+)?$/, '08:00:00')
      const p = (new Date(to).getTime() - new Date(start).getTime()) / (15 * 3600 * 1000)
      return `${p * 100}%`
    },
    getTipContent (data: Item) {
      return `${data.title}\n时间：${[data.from, data.to].join(' 至 ')}\n申请人：${data.user}\n状态：${data.approvalStatus}`
    },
    // 时间区间合并
    summaryRange (arr: Item[]) {
      // 正序
      arr.sort((x, y) => new Date(x.from).getTime() > new Date(y.from).getTime() ? 1 : -1)

      const list: [string, string][] = []

      for (let i = 0; i < arr.length; i++) {
        const { from, to } = arr[i]
        if (list.length === 0) {
          list.push([from, to])
          continue
        }

        const _from = new Date(from).getTime()
        const _to = new Date(to).getTime()
        const prevTo = list[list.length - 1][1]
        const _prevTo = new Date(prevTo).getTime()
        if (_from <= _prevTo) {
          if (_to > _prevTo) {
            list[list.length - 1][1] = to
          }
        } else if (_from > _prevTo) {
          list.push([from, to])
        }
      }
      return list
    }
  }
})
</script>

<style lang="scss" scoped>
@media screen and (max-width:780px) {
  .time-x {
    .time-label li:nth-child(2n) {
      visibility: hidden;
    }
  }
}
.time-x {
  margin-left: 4rem;
  ul {
    padding: 0;
    margin: 0;
    display: flex;
    li {
      list-style: none;
      border: 0px #666 solid;
    }
  }
  .time-calibration li {
    flex-basis: 6.25%;
    height: 4px;
    &:first-child,
    &:last-child {
      flex-basis: 3.125%;
    }
    &:first-child {
      border-right-width: 1px;
    }
    &:last-child {
      border-left-width: 1px;
    }
  }
  .time-label li {
    flex-basis: 6.25%;
    text-align: center;
  }
  .calibration {
    border-width: 0 1px;
  }
}

$height: 20px;
$labelWidth: 4rem;
.user-list {
  margin: 0 3.125%;
  .user-item {
    margin: 1px 0;
  }
  .user-label {
    width: $labelWidth;
    height: $height;
    line-height: $height;
    text-align: right;
  }
  .user-info {
    display: flex;
    flex-grow: 1;
    height: $height;
    line-height: $height;
    color: #eee;
  }
}

.status-success {
  background-color: #8bb788;
}
.status-pending {
  background-color: #d6b5a9;
}
.status-cancel {
  background-color: #888;
}

.summary {
  .label {
    width: $labelWidth;
  }
  height: 4px;
  .used {
    background: #52a04d;
  }
  .free {
    background: #ccc;
  }
  .summary-box {
    flex-grow: 1;
  }
}
</style>
