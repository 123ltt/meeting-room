<script lang="ts">
import { defineComponent, h } from 'vue'
import TimeLine from './components/TimeLine.vue'
import listApi, { Item } from './api/list'

export default defineComponent({
  name: 'App',
  components: {
    TimeLine
  },
  data () {
    return {
      loading: true,
      msg: '暂无数据',
      groups: [] as {roomname: string;users: Item[]}[]
    }
  },
  created () {
    this.getData(this.getTodayDate())
  },
  render () {
    const vnodes = [h('h1', { class: 'text-center' }, '会议室申请记录')]
    if (this.groups.length > 0) {
      return vnodes.concat(this.groups.map(item => h(TimeLine, {
        class: 'timeline',
        title: item.roomname,
        users: item.users
      })))
    } else {
      return vnodes.concat(h('div', { class: 'no-data' }, this.loading ? '正在获取数据中...' : this.msg))
    }
  },
  methods: {
    getTodayDate () {
      const d = new Date()
      return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-')
    },
    getData (date: string) {
      this.loading = true
      listApi(date).then(res => {
        if (res.status) {
          const groups: { [key: string]: Item[] } = {}
          res.data.forEach(item => {
            if (groups[item.roomname]) {
              groups[item.roomname].push(item)
            } else {
              groups[item.roomname] = [item]
            }
          })
          this.groups = Object.entries(groups)
            .map(([roomname, users]) => {
              return {
                roomname,
                users: users.sort((x, y) => new Date(x.from).getTime() > new Date(y.from).getTime() ? -1 : 1)
              }
            })
            .sort((x, y) => x.roomname.localeCompare(y.roomname))
        } else {
          this.msg = res.info
        }
      }).catch(err => {
        this.msg = '获取数据失败 ' + err.message
      }).finally(() => {
        this.loading = false
      })
    }
  }
})
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  font-size: 12px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.timeline {
  margin-bottom: 6rem;
}
.no-data {
  text-align: center;
  margin: 2rem auto;
}
.flex {
  display: flex;
}
.text-center {
  text-align: center;
}
</style>
