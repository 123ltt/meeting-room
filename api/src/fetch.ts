import request from 'request'
import cheerio from 'cheerio'
import { EventEmitter } from 'events'
import login from './login'

interface ItemData {
  title: string;
  roomname: string;
  from: string;
  to: string;
  user: string;
  approvalStatus: string;
  status: number;
  approvalTime: string;
}

let cookie: string | null = ''

const customEvent = new EventEmitter()
const store = new Map<string, { time: number, data: ItemData[] }>()
const fetching = new Map<string, boolean>()

setInterval(() => {
  store.forEach(({ time }, key) => {
    if (Date.now() - time > 5000) {
      store.delete(key)
    }
  })
}, 5000)

async function fetchList(date: string): Promise<ItemData[]> {
  if (cookie === '') {
    try {
      cookie = await login()
    } catch (err) {
      return Promise.reject(err)
    }
  }
  return new Promise((resolve, reject) => {
    request({
      url: 'http://202.104.114.238:8081/oa/oa_room_admin.php',
      qs: {
        page_size: 100,
        start_day: date + ' 00:00:00',
        end_day: date + ' 23:59:59'
      },
      headers: {
        Cookie: cookie
      }
    }, async (err, res, body) => {
      if (err) return reject(err)

      // 未登录，则先登录再获取数据
      if (/^<script.+\/login_new.php.+<\/script>$/.test(body)) {
        try {
          cookie = await login()
          resolve(await fetchList(date))
        } catch (err) {
          reject(err)
        }
        return
      }
      const list: ItemData[] = []
      const $ = cheerio.load(body)
      $('table.list tr').each(function (this: any, index) {
        if (index > 0) {
          const tds = $(this).children()
          const title = tds.eq(2).text().trim()
          const roomname = tds.eq(3).text().trim()
          const [from, to] = tds.eq(4).text().match(/(\d+-){2}\d+\s\d+:\d+/g) || []
          const user = tds.eq(5).text().trim()
          const approvalStatus = tds.eq(7).text().trim()
          const approvalTime = tds.eq(8).text().trim()
          list.push({
            title,
            roomname,
            from, to,
            user,
            approvalStatus,
            status: ['待审批', '已审批', '取消'].indexOf(approvalStatus),
            approvalTime
          })
        }
      })
      resolve(list)
    })
  })
}

export default async (date: string): Promise<ItemData[]> => {
  if (!date) {
    return Promise.reject('参数date不能为空')
  } else if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)) {
    return Promise.reject(new Error('参数date格式错误'))
  }

  // 取缓存数据
  const d = store.get(date)
  if (d) return d.data

  // 正在获取数据中，等待
  if (fetching.get(date)) {
    return new Promise(resolve => {
      customEvent.once(date + ':' + Math.random(), () => {
        const d = store.get(date)
        resolve(d ? d.data : [])
      })
    })
  }

  // 获取数据
  fetching.set(date, true)

  try {
    const list = await fetchList(date)

    fetching.set(date, false)
    store.set(date, { time: Date.now(), data: list })
    customEvent.eventNames().forEach(eventName => {
      if (typeof eventName === 'string' && eventName.indexOf(date + ':') === 0) {
        customEvent.emit(eventName)
      }
    })

    return list
  } catch (err) {
    fetching.clear()
    return Promise.reject(err)
  }
}
